"use client";

import { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import { downloadPostcard } from "@/app/lib/downloadPostcard";
import type { Sister } from "@/app/data/sisters";
import { copyWishText, personalWishMessage, personalWishUrl } from "@/app/lib/shareWish";

interface MemberModalProps {
  sister: Sister | null;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export default function MemberModal({ sister, onClose, onToast }: MemberModalProps) {
  const [showShare, setShowShare] = useState(false);
  const [exporting, setExporting] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sister) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    dialog?.focus();
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !dialog) return;
      const controls = Array.from(dialog.querySelectorAll<HTMLElement>('button, a[href], [tabindex="0"]')).filter((element) => !element.closest('[inert]'));
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", trapFocus);
    return () => {
      document.removeEventListener("keydown", trapFocus);
      previousFocus?.focus();
    };
  }, [sister]);

  useEffect(() => {
    if (sister) {
      document.body.style.overflow = "hidden";
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleEsc);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleEsc);
      };
    }
  }, [sister, onClose]);

  if (!sister) return null;
  const pageUrl = typeof window === "undefined" ? "" : personalWishUrl(sister);

  const firstName = sister.name.split(" ").slice(-1)[0];
  const shareText = typeof window === "undefined" ? "" : personalWishMessage(sister);
  const encodedUrl = encodeURIComponent(pageUrl);
  const encodedText = encodeURIComponent(shareText);

  const copyToClipboard = async (text: string, message: string) => {
    try {
      await copyWishText(text);
      onToast(message);
    } catch {
      setShowShare(true);
      onToast("Chưa sao chép được. Bạn có thể chọn và sao chép link bên dưới nhé.");
    }
  };

  const sendWish = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `Lời chúc 20/10 dành cho ${sister.name}`, text: shareText });
        return;
      } catch (reason) {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
      }
    }
    await copyToClipboard(shareText, "Đã sao chép lời chúc và link riêng. Dán vào Zalo hoặc Messenger để gửi nhé 💌");
  };

  const shareLinks = [
    { label: "Messenger", icon: "💬", href: "fb-messenger://share?link=" + encodedUrl },
    { label: "Zalo", icon: "🔷", href: "https://social.zalo.me/share?url=" + encodedUrl },
    { label: "Telegram", icon: "✈️", href: "https://t.me/share/url?url=" + encodedUrl + "&text=" + encodedText },
    { label: "WhatsApp", icon: "🟢", href: "https://wa.me/?text=" + encodedText },
    { label: "SMS", icon: "📲", href: "sms:?&body=" + encodedText },
    { label: "Facebook", icon: "👍", href: "https://www.facebook.com/sharer/sharer.php?u=" + encodedUrl },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-rose-950/40 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* Modal card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="member-dialog"
        ref={dialogRef}
        tabIndex={-1}

      >
        {/* Header gradient */}
        <div className="member-dialog-banner" />

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Đóng lời chúc"
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-rose-500 hover:bg-white hover:text-rose-700 hover:rotate-90 transition-all duration-300 shadow-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="relative px-6 pb-6 pt-14 text-center">
          {/* Avatar */}
          <div className="flex justify-center -mt-16 mb-4">
            <div className="ring-4 ring-white shadow-xl rounded-full">
              <Avatar src={sister.photo} name={sister.name} size="xl" />
            </div>
          </div>

          {/* Name & handle */}
          <h3 id="modal-title" className="font-display text-2xl font-bold text-rose-900">
            {sister.name}
          </h3>

          {/* Traits */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {sister.traits.map((trait) => (
              <span
                key={trait}
                className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-gradient-to-r from-rose-100 to-pink-100 text-rose-600 border border-rose-200/60"
              >
                {trait}
              </span>
            ))}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-rose-200" />
            <span className="text-rose-300 text-sm">💌</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-rose-200" />
          </div>

          {/* Personalized wish */}
          <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-4 text-left">
            <p className="font-script text-2xl text-rose-600 mb-2">Gửi riêng cho {firstName} 💕</p>
            <p className="text-rose-800/90 leading-relaxed text-[15px] font-medium">
              {sister.wish}
            </p>
          </div>

          {/* Appreciation */}
          <div className="mt-4 bg-amber-50/60 border border-amber-100 rounded-2xl p-4 text-left">
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-500 mb-1.5">
              💛 Một lời nhắn dành cho bạn
            </p>
            <p className="text-amber-900/80 text-sm leading-relaxed italic font-medium">
              {sister.appreciation}
            </p>
          </div>

          {/* Native sharing when supported; otherwise copy a complete message. */}
          <button
            type="button"
            onClick={sendWish}
            className="button-primary mt-5 w-full"
          >
            {"💌 Gửi lời chúc cho " + firstName}
          </button>
          <div className="wish-share-actions">
            <button type="button" disabled={exporting} aria-busy={exporting} onClick={async () => {
              setExporting(true);
              try { await downloadPostcard(sister); }
              catch { onToast("Chưa tải được thiệp. Vui lòng thử lại."); }
              finally { setExporting(false); }
            }}>{exporting ? "Đang tạo thiệp…" : "Tải thiệp PNG ↓"}</button>
            <button type="button" onClick={() => copyToClipboard(shareText, "Đã sao chép lời chúc kèm link riêng 💌")}>Sao chép lời chúc + link</button>
            <button type="button" onClick={() => copyToClipboard(pageUrl, "Đã sao chép link riêng 💕")}>Chỉ sao chép link</button>
          </div>
          <p className="share-help">Chọn ứng dụng và người nhận để gửi. Hoặc sao chép rồi dán vào cuộc trò chuyện của bạn.</p>
          <button type="button" className="button-text mt-3" aria-expanded={showShare} aria-controls="wish-share-options" onClick={() => setShowShare((value) => !value)}>{showShare ? "Ẩn tùy chọn chia sẻ" : "Thêm cách chia sẻ"}</button>

          {/* Share panel */}
          <div
            id="wish-share-options"
            inert={!showShare}
            className={
              "overflow-hidden transition-all duration-400 " +
              (showShare ? "opacity-100 mt-4" : "max-h-0 opacity-0 mt-0")
            }
          >
            <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-4 text-left space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                🔗 Link riêng cho {firstName}
              </p>
              <div className="flex items-center gap-2">
                <code tabIndex={0} className="flex-1 min-w-0 break-all select-all text-xs text-rose-600 bg-white rounded-lg px-3 py-2 border border-rose-100 font-mono">
                  {pageUrl || "/?to=" + sister.slug}
                </code>
                <button
                  onClick={() =>
                    copyToClipboard(pageUrl, "Đã sao chép link! Gửi cho " + firstName + " nha 💕")
                  }
                  className="shrink-0 px-3.5 py-2 rounded-lg bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-colors shadow-sm"
                >
                  Sao chép
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {shareLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-white border border-rose-100 text-rose-600 hover:border-rose-300 hover:shadow-md hover:-translate-y-0.5 transition-all text-[11px] font-semibold"
                  >
                    <span className="text-lg leading-none">{link.icon}</span>
                    {link.label}
                  </a>
                ))}
                <button
                  onClick={() =>
                    copyToClipboard(shareText, "Đã sao chép lời chúc! Dán và gửi cho " + firstName + " nha 💌")
                  }
                  className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-white border border-rose-100 text-rose-600 hover:border-rose-300 hover:shadow-md hover:-translate-y-0.5 transition-all text-[11px] font-semibold"
                >
                  <span className="text-lg leading-none">📋</span>
                  Copy lời chúc
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
