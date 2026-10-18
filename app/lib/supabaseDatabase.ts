import { randomUUID } from "node:crypto";
import { sisters, type Sister } from "../data/sisters.ts";
import { WishConflictError } from "./databaseErrors.ts";

export async function openSupabaseWishDatabase(url: string, key: string, request: typeof fetch = fetch) {
  const rpc = async <T>(name: string, args: Record<string, unknown> = {}): Promise<T> => {
    const headers: Record<string, string> = { apikey: key, "Content-Type": "application/json" };
    if (key.startsWith("eyJ")) headers.Authorization = `Bearer ${key}`;
    const response = await request(`${url.replace(/\/$/, "")}/rest/v1/rpc/${name}`, {
      method: "POST", headers, body: JSON.stringify(args), cache: "no-store", signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      if (error.code === "P0001") throw new WishConflictError("Tên người nhận không khớp với link này.");
      throw new Error(`Supabase database request failed (${response.status}); check database migration and server credentials.`);
    }
    return response.status === 204 ? undefined as T : await response.json() as T;
  };
  await rpc("thuong_sync_profiles", { profiles: sisters.map(({ slug, name, handle, photo, emoji, traits }) => ({ slug, name, handle, photo, emoji, traits })) });
  return {
    list: () => rpc<Sister[]>("thuong_list_recipients"),
    allWishes: () => rpc<Sister[]>("thuong_all_wishes"),
    async find(slug: string) { return (await rpc<Sister[]>("thuong_list_recipients")).find((person) => person.slug === slug) ?? null; },
    create(input: Pick<Sister, "name" | "wish" | "appreciation"> & { slug?: string }) {
      return rpc<{ recipient: Sister; created: boolean }>("thuong_save_wish", {
        p_slug: input.slug ?? `nguoi-thuong-${randomUUID()}`, p_name: input.name.trim(), p_wish: input.wish.trim(), p_closing: input.appreciation.trim(),
      });
    },
    close() { /* HTTP requests do not hold a database connection. */ },
  };
}
