import type { Sister } from "@/app/data/sisters";

export const WISH_STORAGE_KEY = "thuong-personal-wishes-v1";

export function parseRecipient(value: unknown): Sister | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.name !== "string" || !record.name.trim() || record.name.length > 100 ||
      typeof record.wish !== "string" || !record.wish.trim() || record.wish.length > 1500 ||
      typeof record.appreciation !== "string" || record.appreciation.length > 500 ||
      typeof record.slug !== "string" || !/^[a-z0-9-]{1,100}$/.test(record.slug) ||
      typeof record.id !== "number" || !Number.isSafeInteger(record.id)) return null;
  return { id: record.id, slug: record.slug, name: record.name.trim(), wish: record.wish.trim(), appreciation: record.appreciation.trim(), handle: "", photo: "", emoji: "💌", traits: [] };
}

export function readSavedRecipients(): Sister[] {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(WISH_STORAGE_KEY) ?? "[]");
    if (!Array.isArray(data)) return [];
    return data.map(parseRecipient).filter((recipient): recipient is Sister => recipient !== null);
  } catch { return []; }
}

export function recipientFromLink(): Sister | null {
  const raw = new URLSearchParams(window.location.search).get("wish");
  if (!raw || raw.length > 10000) return null;
  try { return parseRecipient(JSON.parse(raw)); } catch { return null; }
}
