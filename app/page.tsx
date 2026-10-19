"use client";
import { useState } from "react";
import BackgroundMusic from "./components/BackgroundMusic";
import PhotoSlideshowSection from "./components/PhotoSlideshowSection";
import FooterSection from "./components/FooterSection";
import { sharedWish } from "./data/sharedWish";
import { sisters } from "./data/sisters";
import Avatar from "./components/Avatar";
import { downloadPostcard } from "./lib/downloadPostcard";
import { copyWishText } from "./lib/shareWish";
import styles from "./components/PageShell.module.css";
import letter from "./components/SharedLetter.module.css";

export default function Home() {
  const [status, setStatus] = useState("");
  const [exporting, setExporting] = useState(false);
  return (
    <div className={`celebration-page ${styles.page}`}>
      <a className="skip-link" href="#main-content">Đến nội dung chính</a>
      <nav className={`site-nav ${styles.navigation}`} aria-label="Điều hướng chính">
        <a className={`site-brand ${styles.brand}`} href="#home"><span aria-hidden="true">❀</span> thương<span className="brand-dot">.</span></a>
        <div className={`nav-links ${styles.links}`}><a href="#memories">Cuốn kỷ niệm</a><a className={styles.navAction} href="#wish">Lời mình muốn gửi <span aria-hidden="true">↗</span></a></div>
        <span className={`nav-date ${styles.date}`}>20 / 10 <span aria-hidden="true">♡</span></span>
      </nav>
      <BackgroundMusic />
      <main id="main-content" className={`page-content ${styles.content}`}>
        <PhotoSlideshowSection />
        <section id="wish" className={letter.section} aria-labelledby="shared-wish-title">
          <article className={letter.card}>
            <p className={letter.eyebrow}>20.10 · MỘT LỜI TỪ MÌNH</p>
            <span className={letter.flower} aria-hidden="true">❀</span>
            <h2 id="shared-wish-title">{sharedWish.name}</h2>
            <div className={letter.recipients} aria-label="Gửi đến tất cả sáu chị em">
              {sisters.map((sister) => <div className={letter.person} key={sister.slug}>
                <Avatar src={sister.photo} name={sister.name} size="lg" />
                <h3>{sister.name}</h3>
              </div>)}
            </div>
            <div className={letter.message}>{sharedWish.wish.split("\n\n").map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
            <p className={letter.closing}>{sharedWish.appreciation}</p>
            <div className={letter.actions}>
              <button type="button" disabled={exporting} onClick={async () => {
                setExporting(true); setStatus("");
                try { await downloadPostcard(sharedWish); }
                catch { setStatus("Chưa tải được thiệp. Bạn thử lại nhé."); }
                finally { setExporting(false); }
              }}>{exporting ? "Đang tạo thiệp…" : "Giữ lại tấm thiệp ↓"}</button>
              <button type="button" onClick={async () => {
                try { await copyWishText(`${window.location.origin}${window.location.pathname}#wish`); setStatus("Đã sao chép link của trang."); }
                catch { setStatus("Chưa sao chép được. Bạn có thể sao chép địa chỉ trang để chia sẻ."); }
              }}>Sao chép link ↗</button>
            </div>
            <p role="status" className={letter.status}>{status}</p>
          </article>
        </section>
        <FooterSection />
      </main>
    </div>
  );
}
