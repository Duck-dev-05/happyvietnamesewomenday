import { sharedWish } from "@/app/data/sharedWish";
export async function GET() { return Response.json({ recipients: [sharedWish], wishes: [sharedWish] }); }
export async function POST() { return Response.json({ error: "Trang này chỉ hiển thị lời chúc của chủ trang." }, { status: 405, headers: { Allow: "GET" } }); }
