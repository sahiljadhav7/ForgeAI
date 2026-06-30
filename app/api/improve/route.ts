import { CREDIT_COST_PER_GENERATION } from "@/lib/constants";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { FileData } from "@/types/workspace";
import { NextRequest } from "next/server";
import z from "zod/v3";

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
          "update or rewrite a file in the React sandbox, Call once per file you need to change",
        inputSchema: z.object({
          path: z
            .string()
            .describe("File path exactly as it appears, eg. /App.js"),
          code: z.string().describe("Complete new contents of the file"),
          reason: z
            .string()
            .describe("One sentence explaining waht you changed and why"),
        }),
        async execute({ path, code, reason }) {
          patchedFiles[path] = { code };
          enqueue(sseEvent("file_patch", { path, code, reason }));
          return `Updated ${path}: ${reason}`;
        },
      });

      //Tool 2: done improving

      const doneImprovingTool = createTool({
        name: "done_improving",
        description: "Call this when you have finished making all improvements",
        inputSchema: z.object({
          summary: z
            .string()
            .describe(
              "A short friendly summary of all the improvements you made(2-4 sentences)",
            ),
        }),
        lifecycle: { completeRun: true },
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

function createTool(arg0: {
  name: string;
  description: string;
  inputSchema: z.ZodObject<
    { path: z.ZodString; code: z.ZodString; reason: z.ZodString },
    "strip",
    z.ZodTypeAny,
    { path: string; code: string; reason: string },
    { path: string; code: string; reason: string }
  >;
  execute({
    path,
    code,
    reason,
  }: {
    path: any;
    code: any;
    reason: any;
  }): Promise<string>;
}) {
  throw new Error("Function not implemented.");
}
