import { CREDIT_COST_PER_GENERATION } from "@/lib/constants";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { FileData } from "@/types/workspace";
import { NextRequest } from "next/server";
import { Agent, createTool } from "@cline/sdk";
import { z } from "zod";

export async function POST(request: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { workspaceId, userId, messages, fileData } = body as {
    workspaceId: string | null;
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

      //TOOL 1: updating files
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
        async execute(input: unknown, _context: unknown) {
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
        async execute(input: unknown, _context: unknown) {
          const { summary } = input as { summary: string };
          finalSummary = summary;
          return `Improvements complete: ${summary}`;
        },
      });
      const fileContext = Object.entries(fileData.files)
        .map(([path, { code }]) => `//${path}\n${code}`)
        .join("\n\n---\n\n");

      const agent = new Agent({
        providerId: "gemini",
        modelId: "gemini-2.5-flash",
        apiKey: process.env.GEMINI_API_KEY!,
        maxIterations: 8,
        systemPrompt: `You are an expert React developer improving a live browser preview app.The app uses React (functional components), Tailwind CSS for styling, and runs in Sandpack.
        You CANNOT use TypeScript, CSS modules, or real npm install — only what's already available.
        Available packages: react, react-dom, tailwindcss (CDN), lucide-react, recharts, react-router-dom, framer-motion, date-fns, zod, react-hook-form.

        Here are the current files:

        ${fileContext}

          WORKFLOW:
        1. Understand what the user wants improved.
        2. Identify which files need to change.
        3. Call update_file for each file that needs changes (always include the COMPLETE file, not just the diff).
         4. Once all files are updated, call done_improving with a short summary.

        RULES:
         - Always write complete file contents — never partial snippets.
         - Keep all existing functionality unless asked to remove it.
         - The entry point is always /App.js with a default export.
         - All imports must reference files you've updated or packages in the available list above.`,
        tools: [updateFileTool, doneImprovingTool],
        toolPolicies: {
          update_file: { autoApprove: true },
          done_improving: { autoApprove: true },
        },
      });
    },
  });
  return new Response(stream, {
    headers: {
      "content-Type": "text/event-stream",
      "cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export const runtime = "nodejs";
export const maxDuration = 300;
`~`;
function sseEvent(
  arg0: string,
  arg1: { path: any; code: any; reason: any },
): string {
  throw new Error("Function not implemented.");
}

// function createTool(arg0: {
//   name: string;
//   description: string;
//   inputSchema: z.ZodObject<
//     { path: z.ZodString; code: z.ZodString; reason: z.ZodString },
//     "strip",
//     z.ZodTypeAny,
//     { path: string; code: string; reason: string },
//     { path: string; code: string; reason: string }
//   >;
//   execute({
//     path,
//     code,
//     reason,
//   }: {
//     path: any;
//     code: any;
//     reason: any;
//   }): Promise<string>;
// }) {
//   throw new Error("Function not implemented.");
// }
