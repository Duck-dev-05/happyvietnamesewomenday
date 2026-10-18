"use client";

import { useEffect, useState } from "react";
import Confetti from "./components/Confetti";
import BackgroundMusic from "./components/BackgroundMusic";
import MemberModal from "./components/MemberModal";
import { sisters, type Sister } from "@/app/data/sisters";

// New UI components
import HeaderSection from "./components/HeaderSection";
import PhotoSlideshowSection from "./components/PhotoSlideshowSection";
import SistersSection from "./components/SistersSection";
import AllWishesSection from "./components/AllWishesSection";
import FooterSection from "./components/FooterSection";
import WishComposer from "./components/WishComposer";
import { readSavedRecipients, recipientFromLink, WISH_STORAGE_KEY } from "./lib/recipients";
import { photos } from "./data/photos";
import { saveRecipient } from "./lib/wishesClient";
import styles from "./components/PageShell.module.css";

export default function Home() {
  const [confettiActive, setConfettiActive] = useState(false);
  const [selectedSister, setSelectedSister] = useState<Sister | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [recipients, setRecipients] = useState<Sister[]>(sisters);
  const [wishes, setWishes] = useState<Sister[]>([]);
  const [databaseError, setDatabaseError] = useState<string | null>(null);
  const [writingRecipient, setWritingRecipient] = useState<Sister | null>(null);
  const savedWishCount = wishes.length;

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2800);
  };

  // Auto-open a sister's wish when arriving via personal link (?to=slug)
  useEffect(() => {
    let disposed = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const load = async () => {
      try {
        const response = await fetch("/api/wishes", { cache: "no-store" });
        if (!response.ok) throw new Error("Chưa kết nối được cơ sở dữ liệu. Hãy tải lại trang để thử lại.");
        const data = await response.json();
        const allRecipients: Sister[] = data.recipients;
        if (disposed) return;
        let migrationFailed = false;
        for (const saved of readSavedRecipients()) {
          if (disposed) return;
          try {
            const imported = await saveRecipient(saved);
            if (!allRecipients.some((item) => item.slug === imported.slug)) allRecipients.push(imported);
          } catch { migrationFailed = true; }
        }
        if (disposed) return;
        if (!migrationFailed) {
          try { localStorage.removeItem(WISH_STORAGE_KEY); } catch { /* Reimporting is idempotent. */ }
        }
        const params = new URLSearchParams(window.location.search);
        const linked = recipientFromLink(); // Preserve old long links.
        const fresh = await fetch("/api/wishes", { cache: "no-store" });
        if (!fresh.ok) throw new Error("Chưa tải được danh sách lời chúc.");
        const latest = await fresh.json();
        if (disposed) return;
        const allWishes: Sister[] = latest.wishes ?? [];
        const match = linked ?? (params.has("wishId") ? allWishes.find((wish) => String(wish.wishId) === params.get("wishId") && wish.slug === params.get("to")) : (latest.recipients as Sister[]).find((recipient) => recipient.slug === params.get("to")));
        setWishes(allWishes);
        setRecipients(latest.recipients);
        setDatabaseError(migrationFailed ? "Một số lời chúc cũ chưa được chuyển. Dữ liệu gốc vẫn được giữ trong trình duyệt này." : null);
        if (match?.wish) { setSelectedSister(match); setConfettiActive(true); }
        else if (match) { setWritingRecipient(match); }
        else if (params.has("wish") || params.has("to")) setToast("Link lời chúc không hợp lệ hoặc không còn tồn tại.");
        timer = setTimeout(() => { setConfettiActive(false); setToast(null); }, 3500);
      } catch (error) {
        if (!disposed) setDatabaseError(error instanceof Error ? error.message : "Chưa tải được lời chúc. Vui lòng tải lại trang.");
      }
    };
    void load();
    return () => { disposed = true; clearTimeout(timer); };
  }, []);

  // Fetch wishes from other visitors without reopening dialogs or importing again.
  useEffect(() => {
    let disposed = false;
    let inFlight = false;
    const refresh = async () => {
      if (document.hidden || inFlight) return;
      inFlight = true;
      try {
        const response = await fetch("/api/wishes", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        if (!disposed) { setRecipients(data.recipients); setWishes(data.wishes ?? []); }
      } catch { /* Keep the last loaded wishes available while offline. */ }
      finally { inFlight = false; }
    };
    const timer = setInterval(refresh, 20000);
    window.addEventListener("focus", refresh);
    return () => { disposed = true; clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, []);

  const createRecipient = async (recipient: Sister) => {
    const saved = await saveRecipient(recipient);
    setWishes((current) => [saved, ...current.filter((wish) => wish.wishId !== saved.wishId)]);
    setRecipients((current) => current.some((item) => item.slug === saved.slug) ? current.map((item) => item.slug === saved.slug ? saved : item) : [...current, saved]);
    setWritingRecipient(null);
    setSelectedSister(saved);
    showToast("Đã lưu lời chúc vào cơ sở dữ liệu. Bạn có thể gửi ngay 💌");
  };

  const viewWish = (recipient: Sister) => {
    setWritingRecipient(recipient);
  };

  return (
    <div className={`celebration-page ${styles.page}`}>
      <a className="skip-link" href="#main-content">Đến nội dung chính</a>
      <nav className={`site-nav ${styles.navigation}`} aria-label="Điều hướng chính">
        <a className={`site-brand ${styles.brand}`} href="#home"><span aria-hidden="true">❀</span> thương<span className="brand-dot">.</span></a>
        <div className={`nav-links ${styles.links}`}>{photos.length > 0 && <a href="#memories">Xem lại kỷ niệm</a>}<a href="#wishes">Lời chúc · {savedWishCount}</a><a className={styles.navAction} href="#sisters">Gửi lời thương <span aria-hidden="true">↗</span></a></div>
        <span className={`nav-date ${styles.date}`}>20 / 10 <span aria-hidden="true">♡</span></span>
      </nav>
      <Confetti isActive={confettiActive} />
      <BackgroundMusic />
      {writingRecipient && <WishComposer key={writingRecipient.slug} initialRecipient={writingRecipient} onCreate={createRecipient} onClose={() => setWritingRecipient(null)} />}
      <MemberModal
        key={selectedSister?.wishId ?? selectedSister?.slug ?? "closed"}
        sister={selectedSister}
        onClose={() => setSelectedSister(null)}
        onToast={showToast}
      />

      {/* Toast notification */}
      {toast && (
        <div
          role="status"
          className={styles.toast}
        >
          {toast}
        </div>
      )}

      {/* ===== Main Content ===== */}
      <main id="main-content" className={`page-content ${styles.content}`}>
        {photos.length > 0 ? <PhotoSlideshowSection /> : <HeaderSection />}

        {databaseError && <p className="database-error" role="alert">{databaseError}</p>}
        <AllWishesSection wishes={wishes} onViewWish={setSelectedSister} />
        <SistersSection sisters={recipients} onViewWish={viewWish} />
        <FooterSection />
      </main>
    </div>
  );
}
