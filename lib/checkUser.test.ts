import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Plan } from "@/types/plans";

type Row = Record<string, unknown>;

type EmailVerification = "verified" | "unverified" | null;

type ClerkEmail = {
  id: string;
  emailAddress: string;
  verification: { status: string } | null;
};

const state = vi.hoisted(() => ({
  clerkUser: null as null | {
    id: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string;
    primaryEmailAddressId: string | null;
    emailAddresses: ClerkEmail[];
  },
  plan: "free" as string,
  users: [] as Row[],
}));

vi.mock("@clerk/nextjs/server", () => ({
  currentUser: async () => state.clerkUser,
  auth: async () => ({
    userId: state.clerkUser?.id ?? null,
    has: ({ plan }: { plan: string }) => plan === state.plan,
  }),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw Object.assign(new Error(`NEXT_REDIRECT ${url}`), { redirectTo: url });
  },
}));

vi.mock("@/lib/prisma", () => {
  const matches = (row: Row, where: Row) =>
    Object.entries(where).every(([key, value]) => row[key] === value);

  // Mirrors the @unique constraints on User in prisma/schema.prisma.
  const assertUnique = (candidate: Row, self?: Row) => {
    for (const field of ["clerkId", "email"]) {
      if (
        state.users.some(
          (u) => u !== self && u[field] === candidate[field],
        )
      ) {
        throw Object.assign(
          new Error(`Unique constraint failed on the fields: (\`${field}\`)`),
          { code: "P2002" },
        );
      }
    }
  };

  return {
    db: {
      user: {
        findUnique: async ({ where }: { where: Row }) =>
          state.users.find((u) => matches(u, where)) ?? null,
        create: async ({ data }: { data: Row }) => {
          const row = { id: `db_${state.users.length + 1}`, ...data };
          assertUnique(row);
          state.users.push(row);
          return row;
        },
        update: async ({ where, data }: { where: Row; data: Row }) => {
          const user = state.users.find((u) => matches(u, where));
          if (!user) {
            throw Object.assign(new Error("Record to update not found"), {
              code: "P2025",
            });
          }
          assertUnique({ ...user, ...data }, user);
          Object.assign(user, data);
          return user;
        },
      },
    },
  };
});

const { checkUser } = await import("./checkUser");
const { getWorkspaceUser } = await import("@/actions/workspace");

const EXISTING_EMAIL = "sahil@example.com";

// A row created while the app used the development Clerk instance.
function seedDevUser(overrides: Row = {}) {
  const row = {
    id: "db_existing",
    clerkId: "user_dev_old",
    email: EXISTING_EMAIL,
    credits: 7,
    plan: "free",
    ...overrides,
  };
  state.users.push(row);
  return row;
}

function signInAs(
  clerkId: string,
  email: string | null,
  verification: EmailVerification = "verified",
) {
  state.clerkUser = {
    id: clerkId,
    firstName: "Test",
    lastName: "User",
    imageUrl: "https://img.example/avatar.png",
    primaryEmailAddressId: email ? "idn_1" : null,
    emailAddresses: email
      ? [
          {
            id: "idn_1",
            emailAddress: email,
            verification: verification ? { status: verification } : null,
          },
        ]
      : [],
  };
}

function setPlan(plan: Plan) {
  state.plan = plan;
}

beforeEach(() => {
  state.users = [];
  state.clerkUser = null;
  state.plan = "free";
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("checkUser", () => {
  it("creates a row for a brand-new user", async () => {
    signInAs("user_prod_new", "new@example.com");

    const user = await checkUser();

    expect(user).toMatchObject({ clerkId: "user_prod_new", credits: 10 });
    expect(state.users).toHaveLength(1);
  });

  it("relinks the existing row when the same verified email arrives with a new Clerk ID", async () => {
    seedDevUser();
    signInAs("user_prod_new", EXISTING_EMAIL);

    const user = await checkUser();

    expect(user).toMatchObject({
      id: "db_existing",
      clerkId: "user_prod_new",
      credits: 7,
    });
    expect(state.users).toHaveLength(1);
  });

  it("applies a plan change once after relinking", async () => {
    seedDevUser();
    signInAs("user_prod_new", EXISTING_EMAIL);
    setPlan("pro");

    const user = await checkUser();

    expect(user).toMatchObject({
      id: "db_existing",
      clerkId: "user_prod_new",
      plan: "pro",
      credits: 157,
    });
  });

  it("does not take over an existing row when the email is not verified", async () => {
    seedDevUser();
    signInAs("user_attacker", EXISTING_EMAIL, "unverified");

    const user = await checkUser();

    expect(user).toBeNull();
    expect(state.users[0]).toMatchObject({ clerkId: "user_dev_old" });
  });

  it("returns null without creating a row when the Clerk user has no email", async () => {
    signInAs("user_phone_only", null);

    const user = await checkUser();

    expect(user).toBeNull();
    expect(state.users).toHaveLength(0);
  });
});

describe("getWorkspaceUser", () => {
  it("lets a relinked user open the workspace on a direct first visit", async () => {
    // No checkUser() call first: the layout's <Header /> and the page render
    // concurrently, so the page cannot rely on the header having relinked.
    seedDevUser();
    signInAs("user_prod_new", EXISTING_EMAIL);

    const workspaceUser = await getWorkspaceUser();

    expect(workspaceUser).toEqual({
      id: "db_existing",
      credits: 7,
      plan: "free",
    });
  });

  it("fails loudly instead of silently redirecting home when the account can't be linked", async () => {
    seedDevUser();
    signInAs("user_prod_new", EXISTING_EMAIL, "unverified");

    await expect(getWorkspaceUser()).rejects.toThrow(
      /could not load your account/i,
    );
  });

  it("fails loudly when the Clerk user has no email", async () => {
    signInAs("user_phone_only", null);

    await expect(getWorkspaceUser()).rejects.toThrow(
      /could not load your account/i,
    );
  });

  it("still redirects signed-out visitors home", async () => {
    await expect(getWorkspaceUser()).rejects.toMatchObject({
      redirectTo: "/",
    });
  });
});
