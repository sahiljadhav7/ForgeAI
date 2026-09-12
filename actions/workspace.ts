import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";
import { WorkspaceData, WorkspaceUser } from "@/types/workspace";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function getWorkspaceUser(): Promise<WorkspaceUser> {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/");

  // Go through checkUser so a first visit creates or relinks the row itself
  // rather than depending on <Header /> having done it.
  const user = await checkUser();
  if (!user) {
    throw new Error(
      "Could not load your account. See the checkUser error in the server logs.",
    );
  }
  return { id: user.id, credits: user.credits, plan: user.plan };
}

export async function getWorkspaceById(
  workspaceId: string,
  userId: string,
): Promise<WorkspaceData> {
  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId, userId },
    select: { id: true, title: true, messages: true, fileData: true },
  });
  if (!workspace) redirect("/");
  return workspace;
}
