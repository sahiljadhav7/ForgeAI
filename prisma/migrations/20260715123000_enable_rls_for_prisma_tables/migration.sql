-- Enable row-level security for Prisma-managed tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Workspace" ENABLE ROW LEVEL SECURITY;

-- Deny anonymous and authenticated clients by default so only privileged backend roles can access data
CREATE POLICY "user_deny_all_for_anon" ON "User"
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY "user_deny_all_for_authenticated" ON "User"
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "workspace_deny_all_for_anon" ON "Workspace"
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY "workspace_deny_all_for_authenticated" ON "Workspace"
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);
