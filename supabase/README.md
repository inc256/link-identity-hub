# Supabase setup

This app stores each profile and its template blocks, contact details, links,
QR settings, and related data in one `public.identity_links` row. The migration
creates that table and three RPC functions; it does not create any auth flow.

1. Open the SQL Editor for the Supabase project that will host Cytic Link.
2. Run `migrations/20261013133000_create_identity_links.sql`.
3. Set the app's local `.env` values:

   ```dotenv
   VITE_SUPABASE_URL=https://skdjvphgczemfksypzwo.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_ANON_OR_PUBLISHABLE_KEY
   ```

The anon/publishable key is intended for browser use. Do not put a `service_role`
key in the frontend or commit local environment files.

Anonymous users can create and publicly read profiles only through the migration's
RPC functions. Direct table access is revoked. Each new profile gets a random
edit key; the database stores only its SHA-256 hash. Users must keep the key to
authorize future editing because the app does not require an account.
