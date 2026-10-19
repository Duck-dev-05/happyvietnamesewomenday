"use client";

import { useEffect, useRef, useState } from "react";
import { photos } from "@/app/data/photos";
import styles from "./PhotoLibrary.module.css";

export default function PhotoSlideshow() {
  const [index, setIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [inView, setInView] = useState(true);
  const [failed, setFailed] = useState<Set<number>>(() => new Set());
  const thumbnailRef = useRef<HTMLDivElement>(null);
  const libraryRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDialogElement>(null);
  const swipeRef = useRef<{ x: number; y: number } | null>(null);

  const goTo = (value: number) =>
    setIndex((value + photos.length) % photos.length);

  // Auto advance slides
  useEffect(() => {
    if (
      photos.length < 2 ||
      !autoplay ||
      expanded ||
      showAll ||
      !inView ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const timer = setTimeout(
      () => setIndex((value) => (value + 1) % photos.length),
      5000
    );
    return () => clearTimeout(timer);
  }, [autoplay, index, expanded, showAll, inView]);

  // Pause when out of view
  useEffect(() => {
    const library = libraryRef.current;
    if (!library) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.15 }
    );
    observer.observe(library);
    return () => observer.disconnect();
  }, []);

  // Modal dialog handling
  useEffect(() => {
    const dialog = viewerRef.current;
    if (!expanded || !dialog) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!dialog.open) dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
    };
  }, [expanded]);

  // Scroll active thumbnail into center of strip
  useEffect(() => {
    const strip = thumbnailRef.current;
    const selected = strip?.querySelector<HTMLElement>(
      '[aria-current="true"]'
    );
    if (!strip || !selected) return;
    if (
      selected.offsetLeft < strip.scrollLeft ||
      selected.offsetLeft + selected.offsetWidth >
        strip.scrollLeft + strip.clientWidth
    ) {
      strip.scrollTo({
        left:
          selected.offsetLeft -
          strip.clientWidth / 2 +
          selected.offsetWidth / 2,
        behavior: "smooth",
      });
    }
  }, [index]);

  if (photos.length === 0) return null;
  const current = photos[index];

  return (
    <div className={styles.hero}>
      {/* ===== Hero Header Intro ===== */}
      <div className={styles.intro}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowLiveDot} aria-hidden="true" />
          CUỐN PHIM NHỎ CỦA CHÚNG MÌNH
        </p>

        <h1>
          Mình cùng xem lại
          <em>những ngày có nhau.</em>
        </h1>

        <p className={styles.description}>
          Mình giữ lại những ngày có nhau trong từng khung hình,
          từng giai điệu và một lời chúc gửi đến tất cả mọi người.
        </p>

        <div className={styles.actions}>
          <a className={styles.primary} href="#memories">
            Xem lại kỷ niệm <span aria-hidden="true">↓</span>
          </a>
          <a className={styles.secondary} href="#wish">
            Đọc lời mình gửi <span aria-hidden="true">↗</span>
          </a>
        </div>

        <div className={styles.signature}>
          <span aria-hidden="true">♡</span>
          <div>
            <p>Mỗi khoảnh khắc, một yêu thương.</p>
            <span className={styles.photoCountBadge}>
              {photos.length} bức ảnh trong cuốn kỷ niệm này
            </span>
          </div>
        </div>
      </div>

      {/* ===== Slideshow Showcase Frame ===== */}
      <div
        id="memories"
        ref={libraryRef}
        className={styles.library}
        role="region"
        aria-roledescription="trình chiếu"
        aria-label="Ảnh kỷ niệm của chúng mình"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            goTo(index + 1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            goTo(index - 1);
          }
        }}
      >
        {/* Top Header of Showcase */}
        <div className={styles.topline}>
          <div className={styles.toplineTitle}>
            <span className={styles.liveDot} aria-hidden="true" />
            <span>Những khoảnh khắc của chúng mình</span>
          </div>

          <div className={styles.counterPill}>
            {String(index + 1).padStart(2, "0")}{" "}
            <span>/ {String(photos.length).padStart(2, "0")}</span>
          </div>
        </div>

        {/* Stage Viewport */}
        <div
          className={styles.stage}
          onPointerDown={(event) => {
            if (event.pointerType === "touch") {
              swipeRef.current = { x: event.clientX, y: event.clientY };
            }
          }}
          onPointerUp={(event) => {
            const start = swipeRef.current;
            swipeRef.current = null;
            if (!start) return;
            const dx = event.clientX - start.x;
            const dy = event.clientY - start.y;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
              goTo(index + (dx < 0 ? 1 : -1));
            }
          }}
          onPointerCancel={() => {
            swipeRef.current = null;
          }}
        >
          {/* Ambient blurred backdrop */}
          {!failed.has(current.id) && (
            <div
              className={styles.backdrop}
              style={{ backgroundImage: `url("${current.src}")` }}
              aria-hidden="true"
            />
          )}

          {/* Current photo */}
          {failed.has(current.id) ? (
            <div className={styles.error}>
              <p>Chưa tải được ảnh này.</p>
              <a href={current.original} download={current.filename}>
                Tải ảnh gốc để xem →
              </a>
            </div>
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={current.id}
              className={styles.photo}
              src={current.src}
              alt={`${current.caption} · Ảnh ${index + 1}`}
              width={current.width}
              height={current.height}
              loading="eager"
              fetchPriority={index === 0 ? "high" : "auto"}
              decoding="async"
              draggable={false}
              onError={() =>
                setFailed((previous) => new Set([...previous, current.id]))
              }
            />
          )}

          {/* Navigation Arrows */}
          <button
            className={`${styles.arrow} ${styles.previous}`}
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Ảnh trước"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <button
            className={`${styles.arrow} ${styles.next}`}
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Ảnh tiếp theo"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          {/* Expand Lightbox Button */}
          <button
            className={styles.expand}
            type="button"
            onClick={() => setExpanded(true)}
            aria-label="Phóng to ảnh hiện tại"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
            <span>Phóng to</span>
          </button>

        </div>

        {/* Progress Bar */}
        <div className={styles.position} aria-hidden="true">
          <span
            style={{ width: `${((index + 1) / photos.length) * 100}%` }}
          />
        </div>

        {/* Caption & Quick Tools Row */}
        <div className={styles.captionRow}>
          <div aria-live={autoplay ? "off" : "polite"}>
            <span className={styles.captionLabel}>
              KHOẢNH KHẮC {String(index + 1).padStart(2, "0")}
            </span>
            <p>{current.caption}</p>
          </div>

          <div className={styles.tools}>
            <button
              type="button"
              className={styles.playButton}
              onClick={() => setAutoplay((value) => !value)}
              aria-pressed={!autoplay}
              aria-label={
                autoplay ? "Tạm dừng trình chiếu" : "Tiếp tục trình chiếu"
              }
              title={
                autoplay ? "Tạm dừng trình chiếu" : "Tự động phát trình chiếu"
              }
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                {autoplay ? <path d="M6 4h4v16H6zm8 0h4v16h-4z" /> : <path d="m7 4 14 8-14 8z" />}
              </svg>
              <span>{autoplay ? "Tạm dừng" : "Tiếp tục"}</span>
            </button>

            <a
              className={styles.toolButton}
              href={current.original}
              download={current.filename}
              aria-label={`Tải ảnh gốc ${index + 1}`}
              title="Tải ảnh gốc chất lượng cao"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
            </a>
          </div>
        </div>

        {/* Filmstrip Thumbnails */}
        <div className={styles.thumbnails} ref={thumbnailRef}>
          {photos.map((photo, i) => (
            <button
              type="button"
              key={photo.id}
              onClick={() => goTo(i)}
              aria-label={`Xem ảnh ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.thumbnail}
                alt=""
                width={66}
                height={66}
                loading="lazy"
                decoding="async"
              />
              <span className={styles.thumbnailNumber} aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
            </button>
          ))}
        </div>

        {/* Album Footer */}
        <div className={styles.albumFooter}>
          <span>
            {photos.length} tấm ảnh, thật nhiều nụ cười và kỷ niệm đáng nhớ.
          </span>
          <button
            type="button"
            className={styles.toggleAllButton}
            aria-expanded={showAll}
            aria-controls="all-photos"
            onClick={() => setShowAll((value) => !value)}
          >
            {showAll ? "Thu gọn bộ ảnh" : `Xem toàn bộ ${photos.length} ảnh`}
            <span aria-hidden="true">{showAll ? "▴" : "▾"}</span>
          </button>
        </div>

        {/* Expandable Grid of all photos */}
        {showAll && (
          <div id="all-photos" className={styles.albumGrid}>
            {photos.map((photo, i) => (
              <button
                type="button"
                key={photo.id}
                onClick={() => {
                  goTo(i);
                  setExpanded(true);
                }}
                aria-label={`Phóng to ảnh ${i + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.thumbnail}
                  alt=""
                  width={160}
                  height={120}
                  loading="lazy"
                />
                <span>#{String(i + 1).padStart(2, "0")}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ===== Fullscreen Lightbox Modal ===== */}
      <dialog
        ref={viewerRef}
        className={styles.viewer}
        aria-label="Xem ảnh phóng to"
        onCancel={() => setExpanded(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setExpanded(false);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            goTo(index + 1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            goTo(index - 1);
          }
        }}
      >
        {expanded && (
          <>
            <div className={styles.viewerBar}>
              <span className={styles.viewerBrand}>Cuốn kỷ niệm <span> / 20.10</span></span>
              <span className={styles.viewerCount}>{String(index + 1).padStart(2, "0")} <span>/ {photos.length}</span></span>
              <button
                type="button"
                className={styles.viewerCloseButton}
                onClick={() => setExpanded(false)}
                aria-label="Đóng ảnh phóng to"
              >
                ✕
              </button>
            </div>

            <div className={styles.viewerStage}>
              <button className={`${styles.viewerArrow} ${styles.viewerPrevious}`} type="button" onClick={() => goTo(index - 1)} aria-label="Ảnh trước trong chế độ phóng to">←</button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.viewerImage}
              src={current.src}
              alt={`${current.caption} · Ảnh ${index + 1}`}
              width={current.width}
              height={current.height}
            />
              <button className={`${styles.viewerArrow} ${styles.viewerNext}`} type="button" onClick={() => goTo(index + 1)} aria-label="Ảnh tiếp theo trong chế độ phóng to">→</button>
            </div>

            <div className={styles.viewerControls}>
              <div className={styles.viewerCaption} aria-live="polite"><span>KHOẢNH KHẮC {String(index + 1).padStart(2, "0")}</span><p>{current.caption}</p></div>
              <a href={current.original} download={current.filename}>
                Tải ảnh gốc <span aria-hidden="true">↓</span>
              </a>
            </div>
          </>
        )}
      </dialog>
    </div>
  );
}


