import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";
import { CREDIT_COST_PER_GENERATION } from "@/lib/constants";

type Row = Record<string, unknown>;

const state = vi.hoisted(() => ({
  signedInClerkId: null as string | null,
  users: [] as Row[],
  workspaces: [] as Row[],
  agentRuns: 0,
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: async () => ({ userId: state.signedInClerkId }),
}));

vi.mock("@/lib/prisma", () => {
  const matches = (row: Row, where: Row) =>
    Object.entries(where).every(([key, value]) => row[key] === value);

  const notFound = () =>
    Object.assign(new Error("Record to update not found"), { code: "P2025" });

  return {
    db: {
      user: {
        findUnique: async ({ where }: { where: Row }) =>
          state.users.find((u) => matches(u, where)) ?? null,
        update: async ({
          where,
          data,
        }: {
          where: Row;
          data: { credits: { decrement: number } };
        }) => {
          const user = state.users.find((u) => matches(u, where));
          if (!user) throw notFound();
          user.credits = (user.credits as number) - data.credits.decrement;
          return user;
        },
      },
      workspace: {
        findFirst: async ({ where }: { where: Row }) =>
          state.workspaces.find((w) => matches(w, where)) ?? null,
        update: async ({ where, data }: { where: Row; data: Row }) => {
          const workspace = state.workspaces.find((w) => matches(w, where));
          if (!workspace) throw notFound();
          Object.assign(workspace, data);
          return workspace;
        },
      },
    },
  };
});

vi.mock("@cline/sdk", () => ({
  createTool: (config: unknown) => config,
  Agent: class {
    constructor(
      private config: {
        tools: { name: string; execute: (input: unknown) => Promise<string> }[];
      },
    ) {}
    subscribe() {}
    async run() {
      state.agentRuns++;
      const tool = (name: string) =>
        this.config.tools.find((t) => t.name === name)!;
      await tool("update_file").execute({
        path: "/App.js",
        code: "export default () => 'improved';",
        reason: "improved",
      });
      await tool("done_improving").execute({ summary: "Made it better" });
      return { status: "completed", outputText: "Made it better" };
    }
  },
}));

const { POST } = await import("./route");

const originalFileData = {
  files: { "/App.js": { code: "export default () => 'original';" } },
  dependencies: {},
  title: "Demo",
};

function improveRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/improve", {
    method: "POST",
    body: JSON.stringify({
      userRequest: "make it better",
      fileData: originalFileData,
      ...body,
    }),
  }) as unknown as NextRequest;
}

function sseEvents(text: string) {
  return text
    .split("\n\n")
    .filter((chunk) => chunk.startsWith("data: "))
    .map((chunk) => JSON.parse(chunk.slice("data: ".length)));
}

const userById = (id: string) => state.users.find((u) => u.id === id)!;
const workspaceById = (id: string) =>
  state.workspaces.find((w) => w.id === id)!;

describe("POST /api/improve", () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = "test-key";
    state.agentRuns = 0;
    state.signedInClerkId = "clerk_alice";
    state.users = [
      { id: "user_alice", clerkId: "clerk_alice", plan: "pro", credits: 20 },
      { id: "user_bob", clerkId: "clerk_bob", plan: "pro", credits: 20 },
    ];
    state.workspaces = [
      { id: "ws_alice", userId: "user_alice", fileData: originalFileData },
      { id: "ws_bob", userId: "user_bob", fileData: originalFileData },
    ];
  });

  it("charges and saves for the signed-in user, ignoring a userId sent in the body", async () => {
    const res = await POST(
      improveRequest({ workspaceId: "ws_alice", userId: "user_bob" }),
    );
    const events = sseEvents(await res.text());

    expect(events.at(-1)).toMatchObject({
      type: "done",
      creditsRemaining: 20 - CREDIT_COST_PER_GENERATION,
    });
    expect(userById("user_alice").credits).toBe(20 - CREDIT_COST_PER_GENERATION);
    expect(userById("user_bob").credits).toBe(20);
    expect(workspaceById("ws_alice").fileData).toMatchObject({
      files: { "/App.js": { code: "export default () => 'improved';" } },
    });
  });

  it("rejects improving another user's workspace before running the agent or charging credits", async () => {
    const res = await POST(
      improveRequest({ workspaceId: "ws_bob", userId: "user_bob" }),
    );

    expect(res.status).toBe(404);
    expect(state.agentRuns).toBe(0);
    expect(userById("user_alice").credits).toBe(20);
    expect(userById("user_bob").credits).toBe(20);
    expect(workspaceById("ws_bob").fileData).toBe(originalFileData);
  });
});
