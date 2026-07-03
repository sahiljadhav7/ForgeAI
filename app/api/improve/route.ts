import { CREDIT_COST_PER_GENERATION } from "@/lib/constants";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { FileData } from "@/types/workspace";
import { NextRequest } from "next/server";
import { Agent, createTool } from "@cline/sdk";
import { z } from "zod";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableImproveError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const err = error as Error & { status?: number; code?: number };
  if (err.status === 429 || err.status === 500 || err.status === 503) {
    return true;
  }
  if (err.code === 429 || err.code === 500 || err.code === 503) {
    return true;
  }

  return /model stream failed|unavailable|overloaded|high demand|temporar|timeout|deadline|429|500|503/i.test(
    error.message,
  );
}

function getImproveModels() {
  return [
    process.env.GEMINI_MODEL,
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
  ].filter((model, index, models): model is string => {
    return Boolean(model) && models.indexOf(model) === index;
  });
}

function buildSystemPrompt(fileContext: string) {
  return `You are an expert React developer improving a live browser preview app. The app uses React (functional components), Tailwind CSS for styling, and runs in Sandpack.
You CANNOT use TypeScript, CSS modules, or real npm install - only what's already available.
Available packages: react, react-dom, tailwindcss (CDN), lucide-react, recharts, react-router-dom, framer-motion, date-fns, zod, react-hook-form.

Here are the current files:

${fileContext}

WORKFLOW:
1. Understand what the user wants improved.
2. Identify which files need to change.
3. Call update_file for each file that needs changes (always include the complete file, not just the diff).
4. Once all files are updated, call done_improving with a short summary.

RULES:
- Always write complete file contents - never partial snippets.
- Keep all existing functionality unless asked to remove it.
- The entry point is always /App.js with a default export.
- All imports must reference files you've updated or packages in the available list above.`;
}

export async function POST(request: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { workspaceId, userId, userRequest, fileData } = body as {
    workspaceId: string;
    userId: string;
    userRequest: string;
    fileData: FileData;
    messages: string;
  };

  const user = await db.user.findUnique({
    where: { clerkId },
    select: { id: true, credits: true, plan: true },
  });

  if (!user)
    return Response.json({ message: "user not found" }, { status: 404 });
  if (user.plan !== "pro") {
    return Response.json({ message: "Upgrade required" }, { status: 403 });
  }
  if (user.credits < CREDIT_COST_PER_GENERATION) {
    return Response.json({ message: "Insufficient credits" }, { status: 402 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (chunk: string) =>
        controller.enqueue(encoder.encode(chunk));

      const patchedFiles: Record<string, { code: string }> = {
        ...fileData.files,
      };
      let finalSummary = "";

      const updateFileTool = createTool({
        name: "update_file",
        description:
          "update or rewrite a file in the React sandbox, call once per file you need to change",
        inputSchema: z.object({
          path: z
            .string()
            .describe("File path exactly as it appears, eg. /App.js"),
          code: z.string().describe("Complete new contents of the file"),
          reason: z
            .string()
            .describe("One sentence explaining what you changed and why"),
        }) as z.ZodType<{ path: string; code: string; reason: string }>,
        async execute(input: unknown) {
          const { path, code, reason } = input as {
            path: string;
            code: string;
            reason: string;
          };
          patchedFiles[path] = { code };
          enqueue(sseEvent("file_patch", { path, code, reason }));
          return `Updated ${path}: ${reason}`;
        },
      });

      const doneImprovingTool = createTool({
        name: "done_improving",
        description: "Call this when you have finished making all improvements",
        inputSchema: z.object({
          summary: z
            .string()
            .describe(
              "A short friendly summary of all the improvements you made (2-4 sentences)",
            ),
        }) as z.ZodType<{ summary: string }>,
        async execute(input: unknown) {
          const { summary } = input as { summary: string };
          finalSummary = summary;
          return `Improvements complete: ${summary}`;
        },
      });

      const fileContext = Object.entries(fileData.files)
        .map(([path, { code }]) => `//${path}\n${code}`)
        .join("\n\n---\n\n");

      try {
        if (!process.env.GEMINI_API_KEY) {
          throw new Error("GEMINI_API_KEY is not configured");
        }

        const modelsToTry = getImproveModels();
        const maxRetriesPerModel = 2;
        let result: Awaited<ReturnType<Agent["run"]>> | null = null;
        let lastError: unknown;

        outer: for (const modelId of modelsToTry) {
          for (let attempt = 1; attempt <= maxRetriesPerModel; attempt++) {
            const agent = new Agent({
              providerId: "gemini",
              modelId,
              apiKey: process.env.GEMINI_API_KEY,
              maxIterations: 8,
              systemPrompt: buildSystemPrompt(fileContext),
              tools: [updateFileTool, doneImprovingTool],
              toolPolicies: {
                update_file: { autoApprove: true },
                done_improving: { autoApprove: true },
              },
            });

            agent.subscribe((event) => {
              if (event.type !== "tool-started") return;

              const name = event.toolCall?.toolName;
              if (name === "update_file") {
                const path =
                  (event.toolCall?.input as { path?: string })?.path ??
                  "a file";
                enqueue(
                  sseEvent("thinking", { text: `\nUpdating \`${path}\`...` }),
                );
              } else if (name === "done_improving") {
                enqueue(
                  sseEvent("thinking", { text: `\nFinalizing improvements...` }),
                );
              }
            });

            enqueue(
              sseEvent("status", {
                message:
                  attempt === 1
                    ? `Improving with ${modelId}...`
                    : `Retrying ${modelId} (${attempt}/${maxRetriesPerModel})...`,
              }),
            );

            try {
              const candidate = await agent.run(userRequest);

              if (candidate.status === "failed") {
                throw candidate.error ?? new Error("Agent run failed");
              }

              result = candidate;
              break outer;
            } catch (error) {
              lastError = error;

              if (!isRetryableImproveError(error)) {
                enqueue(
                  sseEvent("status", {
                    message: `${modelId} failed, trying fallback model...`,
                  }),
                );
                break;
              }

              if (attempt < maxRetriesPerModel) {
                await sleep(1200 * attempt);
              } else {
                enqueue(
                  sseEvent("status", {
                    message: `${modelId} is still unavailable, trying fallback model...`,
                  }),
                );
              }
            }
          }
        }

        if (!result) {
          throw (
            lastError ??
            new Error("Unable to complete the improvement request right now")
          );
        }

        const newFileData: FileData = {
          files: patchedFiles,
          dependencies: fileData.dependencies,
          title: fileData.title,
        };

        await db.workspace.update({
          where: { id: workspaceId, userId },
          data: { fileData: newFileData as never },
        });

        await db.user.update({
          where: { id: userId },
          data: { credits: { decrement: CREDIT_COST_PER_GENERATION } },
        });

        const updatedUser = await db.user.findUnique({
          where: { id: userId },
          select: { credits: true },
        });

        enqueue(
          sseEvent("done", {
            fileData: newFileData,
            summary: finalSummary || result.outputText,
            creditsRemaining:
              updatedUser?.credits ?? user.credits - CREDIT_COST_PER_GENERATION,
          }),
        );
      } catch (error) {
        console.error("[improve] Error:", error);
        enqueue(
          sseEvent("error", {
            message:
              error instanceof Error ? error.message : "Something went wrong",
          }),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export const runtime = "nodejs";
export const maxDuration = 300;

function sseEvent(type: string, payload: unknown): string {
  return `data: ${JSON.stringify({ type, ...(payload as object) })}\n\n`;
}
