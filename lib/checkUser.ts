import { cache } from "react";
import { currentUser, auth } from "@clerk/nextjs/server";
import { Plan } from "@/types/plans";
import { db } from "./prisma";
import { PLANS } from "./constants";

type ClerkUser = NonNullable<Awaited<ReturnType<typeof currentUser>>>;
type ClerkEmail = ClerkUser["emailAddresses"][number];

const getCurrentPlan = async (): Promise<Plan> => {
  const { has } = await auth();
  if (has({ plan: "pro" })) return "pro";
  if (has({ plan: "starter" })) return "starter";
  return "free";
};

const getPrimaryEmail = (user: ClerkUser): ClerkEmail | undefined =>
  user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId) ??
  user.emailAddresses[0];

const isVerified = (email: ClerkEmail) =>
  email.verification?.status === "verified";

// The same person can arrive with a new Clerk ID (e.g. after moving from the
// development to the production Clerk instance). Relink their row by email
// instead of creating a duplicate, which the unique email constraint rejects.
const relinkByEmail = async (clerkId: string, email: ClerkEmail) => {
  const userWithSameEmail = await db.user.findUnique({
    where: { email: email.emailAddress },
  });
  if (!userWithSameEmail) return null;

  if (!isVerified(email)) {
    throw new Error("refusing to relink user row to an unverified email");
  }
  return db.user.update({
    where: { id: userWithSameEmail.id },
    data: { clerkId },
  });
};

// Wrapped in cache() so <Header /> and the workspace page share one run per
// request instead of racing each other to create, relink, or credit the row.
export const checkUser = cache(async () => {
  const user = await currentUser();
  if (!user) return null;
  try {
    const primaryEmail = getPrimaryEmail(user);
    if (!primaryEmail) {
      throw new Error("Clerk user has no email address");
    }

    const currentPlan = await getCurrentPlan();

    const existing =
      (await db.user.findUnique({ where: { clerkId: user.id } })) ??
      (await relinkByEmail(user.id, primaryEmail));

    if (existing) {
      if (existing.plan !== currentPlan) {
        return await db.user.update({
          where: { clerkId: user.id },
          data: {
            plan: currentPlan,
            credits: existing.credits + PLANS[currentPlan].credits,
          },
        });
      }
      return existing;
    }

    return await db.user.create({
      data: {
        clerkId: user.id,
        name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
        email: primaryEmail.emailAddress,
        imageUrl: user.imageUrl ?? "",
        credits: PLANS.free.credits,
        plan: "free",
      },
    });
  } catch (error) {
    console.error("checkUser error:", error);
    return null;
  }
});
