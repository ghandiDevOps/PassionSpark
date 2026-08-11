-- Lecture publique des sessions publiées uniquement, pour anon (visiteurs) et
-- authenticated (Realtime spot-counter). Table sensible (bookings, users,
-- coach_profiles, payouts, ...) : aucune policy ajoutée ici, RLS reste
-- deny-by-default pour anon/authenticated. L'app utilise Clerk (pas Supabase
-- Auth) : le rôle Prisma ("postgres", rolbypassrls=true) contourne RLS pour
-- tous les accès serveur légitimes, donc ceci n'affecte que l'accès direct
-- PostgREST/Realtime avec la clé anon.
--
-- Appliquée en prod via Supabase MCP le 2026-08-11 (migration "add_sessions_public_read_policy").
-- Ce fichier garde la base reproductible (npx prisma migrate reset / nouvel environnement).
CREATE POLICY "sessions_public_read_published"
  ON public.sessions
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');
