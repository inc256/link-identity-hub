# Supabase setup

This app stores each profile and its template blocks, contact details, links,
QR settings, and related data in one `public.identity_links` row. The migration
creates that table and three RPC functions; it does not create any auth flow.

1. Open the SQL Editor for the Supabase project that will host Cytic Link.
2. Run `migrations/20261013133000_create_identity_links.sql`.
3. Run `migrations/20261018170000_link_identity_photos.sql` to create the private
   `link_identity_photos` bucket and its upload/read policies.
4. Set the app's local `.env` values:

   ```dotenv
   VITE_SUPABASE_URL=https://skdjvphgczemfksypzwo.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_ANON_OR_PUBLISHABLE_KEY
   ```

For Vercel, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the
project's Environment Variables for each environment you deploy (Production,
Preview, and Development as needed), then redeploy. Use the URL and anon key
from the same Supabase project.

The anon/publishable key is intended for browser use. Do not put a `service_role`
key in the frontend or commit local environment files.

Anonymous users can create and publicly read profiles only through the migration's
RPC functions. Direct table access is revoked. Each new profile gets a random
edit key; the database stores only its SHA-256 hash. Users must keep the key to
authorize future editing because the app does not require an account.

Profile photos and gallery photos are stored in the `link_identity_photos`
Supabase Storage bucket. The bucket permits JPG, PNG, and WebP files up to 5 MB
each; uploads are namespaced by profile username. Photos are served through the
app's public media route. No `identity_links` table change is required because
the existing `profile_data` JSON already stores profile image and gallery paths.
