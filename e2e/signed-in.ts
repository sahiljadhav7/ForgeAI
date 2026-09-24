// The signed-in smoke tests sign in, and signing in syncs the user row to
// the server's database. The only database configured so far is production,
// so they're opt-in and local only. Run them against a non-production
// database with the Clerk dev keys and a Clerk dev test user exported:
//
//   set -a && . ./.env.local && set +a
//   DATABASE_URL=<non-production> E2E_SIGNED_IN=1 \
//   E2E_CLERK_USER_USERNAME=<test user> E2E_CLERK_USER_PASSWORD=<password> \
//   npm run test:e2e -- --grep @signed-in
//
// (`npm run build` first; an exported DATABASE_URL beats the .env files.)
export const signedInOptIn =
  process.env.E2E_SIGNED_IN === "1" &&
  !process.env.CI &&
  !!process.env.E2E_CLERK_USER_USERNAME &&
  !!process.env.E2E_CLERK_USER_PASSWORD;
