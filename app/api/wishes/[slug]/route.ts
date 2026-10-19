import { sharedWish } from "@/app/data/sharedWish";
export async function GET() { return Response.json({ recipient: sharedWish }); }
