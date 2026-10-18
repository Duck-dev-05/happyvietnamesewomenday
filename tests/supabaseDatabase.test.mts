import { test } from "node:test";
import assert from "node:assert/strict";
import { openSupabaseWishDatabase } from "../app/lib/supabaseDatabase.ts";
import { getWishStore } from "../app/lib/wishStore.ts";
import { WishConflictError } from "../app/lib/databaseErrors.ts";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { sisters } from "../app/data/sisters.ts";

test("Supabase SQL supports multiple wishes, retries, rollback, and denies direct anonymous access", async () => {
  const pg = new PGlite();
  try {
    await pg.exec("CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;");
    const sql = readFileSync(new URL("../supabase/migrations/202610180001_wishes.sql", import.meta.url), "utf8");
    await pg.exec(sql);
    await pg.exec(sql); // Migration can safely be applied twice.
    await pg.exec("SET ROLE service_role");
    await pg.query("SELECT public.thuong_sync_profiles($1::jsonb)", [JSON.stringify(sisters)]);
    const save = (text: string, name = sisters[0].name) => pg.query<{ value: { created: boolean; recipient: { wishId: number } } }>(
      "SELECT public.thuong_save_wish($1,$2,$3,$4) AS value", [sisters[0].slug, name, text, ""]);
    const first = (await save("Lời chúc đầu tiên 💌")).rows[0].value;
    assert.equal(first.created, true);
    assert.equal((await save("Lời chúc đầu tiên 💌")).rows[0].value.created, false);
    const second = (await save("Lời chúc thứ hai")).rows[0].value;
    assert.notEqual(second.recipient.wishId, first.recipient.wishId);
    await assert.rejects(save("Không ghi đè", "Sai tên"));
    await assert.rejects(save("x".repeat(1501)));
    const wishes = await pg.query<{ value: unknown[] }>("SELECT public.thuong_all_wishes() AS value");
    assert.equal(wishes.rows[0].value.length, 2);
    const profiles = await pg.query<{ value: unknown[] }>("SELECT public.thuong_list_recipients() AS value");
    assert.equal(profiles.rows[0].value.length, 6);
    await pg.exec("RESET ROLE; SET ROLE anon");
    await assert.rejects(pg.query("SELECT * FROM public.thuong_wishes"));
    await assert.rejects(pg.query("SELECT public.thuong_all_wishes()"));
  } finally { await pg.close(); }
});

test("Supabase adapter sends server-only credentials and preserves RPC results", async () => {
  const calls: string[] = [];
  const fakeRequest: typeof fetch = async (url, options) => {
    assert.equal(new Headers(options?.headers).get("apikey"), "sb_secret_test");
    assert.equal(new Headers(options?.headers).get("Authorization"), null);
    assert.equal(options?.cache, "no-store");
    calls.push(String(url));
    if (String(url).endsWith("thuong_sync_profiles")) return new Response(null, { status: 204 });
    if (String(url).endsWith("thuong_save_wish")) {
      const input = JSON.parse(String(options?.body));
      assert.equal(input.p_wish, "Chúc bạn bình an");
      return Response.json({ created: true, recipient: { slug: input.p_slug, name: input.p_name, wish: input.p_wish, wishId: 42 } });
    }
    return Response.json([]);
  };
  const db = await openSupabaseWishDatabase("https://project.supabase.co", "sb_secret_test", fakeRequest);
  assert.deepEqual(await db.list(), []);
  assert.deepEqual(await db.allWishes(), []);
  const saved = await db.create({ slug: "tra", name: "Trà", wish: " Chúc bạn bình an ", appreciation: "" });
  assert.equal(saved.recipient.wishId, 42);
  assert.equal(calls.length, 4);
});

test("Supabase errors never return the server secret and name conflicts stay actionable", async () => {
  let calls = 0;
  const fakeRequest: typeof fetch = async () => {
    if (++calls === 1) return new Response(null, { status: 204 });
    return Response.json({ code: "P0001", message: "database details" }, { status: 400 });
  };
  const db = await openSupabaseWishDatabase("https://project.supabase.co", "sb_secret_private", fakeRequest);
  await assert.rejects(db.create({ name: "Trà", wish: "Hello", appreciation: "" }), WishConflictError);
});

test("Vercel fails explicitly without Supabase configuration", async () => {
  const names = ["VERCEL", "SUPABASE_URL", "SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY"];
  const before = names.map((key) => process.env[key]);
  try {
    names.forEach((key) => delete process.env[key]);
    process.env.VERCEL = "1";
    await assert.rejects(getWishStore(), /Persistent database missing/);
  } finally {
    names.forEach((key, index) => { if (before[index] === undefined) delete process.env[key]; else process.env[key] = before[index]; });
  }
});
