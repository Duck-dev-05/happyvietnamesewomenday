# Save wishes to Supabase on Vercel

1. Open your Supabase project → SQL Editor. Run the complete file `supabase/migrations/202610180001_wishes.sql` once. It creates app-specific tables and transactional functions without changing unrelated tables.
2. In Vercel → Project Settings → Environment Variables, add:
   - `SUPABASE_URL`: your project URL, e.g. `https://your-project.supabase.co`.
   - `SUPABASE_SECRET_KEY`: your server secret key (`sb_secret_...`). Alternatively set `SUPABASE_SERVICE_ROLE_KEY` for a legacy service_role JWT. Do not use an anon/publishable key, and never prefix the secret with `NEXT_PUBLIC_`.
3. Redeploy using Node.js 24. The server syncs the six recipient profiles on its first request; no sample wishes are inserted.
4. Submit a wish and refresh the website. In Supabase Table Editor, check `thuong_recipients` and `thuong_wishes`. Each saved wish has a row; one person can receive many wishes. Identical retries return the existing row.

For local use, copy `.env.example` to `.env.local`, enter the two settings privately, then run `npm run db:init` and `npm run dev`. Without credentials, local development continues using SQLite. Vercel refuses that local-file fallback.

The secret stays in server routes. Row Level Security is enabled with no direct anon/authenticated table access; the RPC functions are restricted to service_role. Your Next.js API continues to expose the public wish list and accept submissions.

The SQL function commits before Save reports success. Lists refresh from the shared database; data persists across Vercel redeployments when the same Supabase project remains configured.

Running the SQL and adding credentials are required: this code alone cannot access your existing Supabase account. Live writes remain unverified until setup is completed. No remote changes have been made by this task.

Existing SQLite wishes are not uploaded automatically. Back up and transfer existing submissions separately if needed. The local backup scripts manage SQLite only; use Supabase backup/export features for the hosted database. Use a separate project for Vercel Preview deployments if previews should not write to production data.
