import { openSupabaseWishDatabase } from "./supabaseDatabase.ts";

let hosted: ReturnType<typeof openSupabaseWishDatabase> | undefined;
export async function getWishStore() {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SECRET_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (url || key) {
    if (!url || !key || !/^https:\/\//.test(url) || key.startsWith("sb_publishable_")) throw new Error("Configure SUPABASE_URL and a server-only Supabase secret/service_role key.");
    hosted ??= openSupabaseWishDatabase(url, key).catch((error) => { hosted = undefined; throw error; });
    return hosted;
  }
  if (process.env.VERCEL) throw new Error("Persistent database missing: configure SUPABASE_URL and SUPABASE_SECRET_KEY on Vercel.");
  const { getWishDatabase } = await import("./database.ts");
  return getWishDatabase();
}
