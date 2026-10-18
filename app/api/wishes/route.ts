import { connection } from "next/server";
import { getWishStore } from "@/app/lib/wishStore";
import { WishConflictError } from "@/app/lib/databaseErrors";

export async function GET() {
  await connection();
  try {
    const database = await getWishStore();
    return Response.json({ recipients: await database.list(), wishes: await database.allWishes() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Could not read wishes", error);
    return Response.json({ error: "Chưa tải được lời chúc. Vui lòng thử lại." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ error: "Yêu cầu không hợp lệ." }, { status: 403 });
  if (!request.headers.get("content-type")?.includes("application/json")) return Response.json({ error: "Cần gửi dữ liệu JSON." }, { status: 415 });
  // Enforce a byte limit even when Content-Length is missing or inaccurate.
  const reader = request.body?.getReader();
  if (!reader) return Response.json({ error: "Thiếu nội dung lời chúc." }, { status: 400 });
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 16000) { await reader.cancel(); return Response.json({ error: "Nội dung quá dài." }, { status: 413 }); }
    chunks.push(value);
  }
  let input: unknown;
  try { input = JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { return Response.json({ error: "Dữ liệu JSON không hợp lệ." }, { status: 400 }); }
  if (!input || typeof input !== "object") return Response.json({ error: "Thiếu nội dung lời chúc." }, { status: 400 });
  const value = input as Record<string, unknown>;
  if (typeof value.name !== "string" || !value.name.trim() || value.name.length > 100 ||
      typeof value.wish !== "string" || !value.wish.trim() || value.wish.length > 1500 ||
      typeof value.appreciation !== "string" || value.appreciation.length > 500 ||
      (value.slug !== undefined && (typeof value.slug !== "string" || !/^[a-z0-9-]{1,100}$/.test(value.slug)))) {
    return Response.json({ error: "Kiểm tra tên (tối đa 100 ký tự), lời chúc (1500) và lời nhắn (500) nhé." }, { status: 400 });
  }
  try {
    const database = await getWishStore();
    const result = await database.create({ name: value.name, wish: value.wish, appreciation: value.appreciation, slug: value.slug as string | undefined });
    return Response.json(result, { status: result.created ? 201 : 200 });
  } catch (error) {
    if (error instanceof WishConflictError) return Response.json({ error: error.message }, { status: 409 });
    console.error("Could not save wish", error);
    return Response.json({ error: "Chưa lưu được lời chúc. Nội dung của bạn vẫn được giữ lại để thử lần nữa." }, { status: 503 });
  }
}
