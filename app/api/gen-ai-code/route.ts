import { CREDIT_COST_PER_GENERATION } from "@/lib/constants";
import { db } from "@/lib/prisma";
import { FileData, Message } from "@/types/workspace";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";

function trimHistory(messages: Message[]): Message[] {
  if (messages.length <= 10) return messages;
  return [messages[0], ...messages.slice(-8)];
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function buildContents(messages: Message[], fileData: FileData | null) {
  const trimmed = trimHistory(messages);

  return trimmed.map((msg, idx) => {
    if (msg.role === "user") {
      const parts: object[] = [];
      let text = msg.content;

      if (msg.imageUrl) {
        text = `[The user has attached an image. Use this URL directly in the generated app where relevant (as image src, background-image, etc,): ${msg.imageUrl}\n\n${text} ]`;
      }

      const isLast = idx === trimmed.length - 1;
      if (!isLast && fileData) {
        text +=
          "\n\n current project files for context:\n" +
          JSON.stringify(fileData, null, 2);
      }

      parts.push({ text });
      return { role: msg.role, parts };
    }

    return { role: msg.role, parts: [{ text: msg.content }] };
  });
}

export async function POST(request: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { workspaceId, userId, messages, fileData } = body as {
    workpaceId: string | null;
    userId: string;
    messages: Message[];
    fileData: FileData | null;
  };

  if (!messages?.length) {
    return Response.json({ message: "No message provided" }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { id: userId, clerkId },
    select: { id: true, credits: true },
  });

  if (!user)
    return Response.json({ message: "user not found" }, { status: 404 });
  if (user.credits < CREDIT_COST_PER_GENERATION) {
    return Response.json({ message: "Insufficent credits" }, { status: 402 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (chunk: string) =>
        controller.enqueue(encoder.encode(chunk));

      try {
        const contents = buildContents(messages, fileData);

        const geminiStream = await ai.models.generateContentStream({});
      } catch (error) {}
    },
  });
}
