import { clerkSetup } from "@clerk/testing/playwright";
import { signedInOptIn } from "./signed-in";

// Fetches a Clerk testing token for the opted-in signed-in smoke tests.
// Signed-out runs, including CI, skip it.
export default async function globalSetup() {
  if (signedInOptIn) await clerkSetup();
}
