import type { Sister } from "@/app/data/sisters";

export function personalWishUrl(sister: Sister) {
  const url = new URL(window.location.pathname, window.location.origin);
  url.searchParams.set("to", sister.slug);
  if (sister.wishId) url.searchParams.set("wishId", String(sister.wishId));
  // Old embedded links stay portable even if they have not been imported.
  const legacy = new URLSearchParams(window.location.search).get("wish");
  if (legacy) {
    try { if (JSON.parse(legacy)?.slug === sister.slug) url.searchParams.set("wish", legacy); } catch { /* Ignore malformed legacy links. */ }
  }
  return url.toString();
}

export function personalWishMessage(sister: Sister) {
  return `💌 Lời chúc 20/10 gửi ${sister.name}:\n\n${sister.wish}\n\n💛 ${sister.appreciation}\n\nMở món quà dành riêng cho bạn:\n${personalWishUrl(sister)}`;
}

export async function copyWishText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    const previousFocus = document.activeElement as HTMLElement | null;
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.readOnly = true;
    textarea.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
    // Keep the fallback inside an open dialog so its focus trap can still work.
    (document.querySelector(".member-dialog") ?? document.body).appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    try {
      if (!document.execCommand("copy")) throw new Error("Clipboard unavailable");
    } finally {
      textarea.remove();
      previousFocus?.focus();
    }
  }
}
