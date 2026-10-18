import { getWishStore } from "@/app/lib/wishStore";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  if (!/^[a-z0-9-]{1,100}$/.test(slug)) return Response.json({ error: "Link không hợp lệ." }, { status: 400 });
  try {
    const database = await getWishStore();
    const recipient = await database.find(slug);
    return recipient
      ? Response.json({ recipient }, { headers: { "Cache-Control": "no-store" } })
      : Response.json({ error: "Không tìm thấy lời chúc này." }, { status: 404 });
  } catch (error) {
    console.error("Could not read personal wish", error);
    return Response.json({ error: "Chưa tải được lời chúc. Vui lòng thử lại." }, { status: 503 });
  }
}
