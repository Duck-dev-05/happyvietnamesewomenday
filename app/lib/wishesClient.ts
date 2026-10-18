import type { Sister } from "@/app/data/sisters";

export async function saveRecipient(recipient: Sister): Promise<Sister> {
  const response = await fetch("/api/wishes", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: recipient.name, wish: recipient.wish, appreciation: recipient.appreciation, slug: recipient.slug }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Chưa lưu được lời chúc. Vui lòng thử lại.");
  return data.recipient as Sister;
}
