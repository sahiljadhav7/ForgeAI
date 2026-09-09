-- Prisma records migration metadata here. It is in the PostgREST-exposed public
-- schema, so enable RLS to prevent browser roles from reading it.
--
-- The database owner / Prisma migration role continues to bypass RLS; no policy
-- is needed for the anon or authenticated roles.
ALTER TABLE public."_prisma_migrations" ENABLE ROW LEVEL SECURITY;
