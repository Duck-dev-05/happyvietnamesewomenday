"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Sister } from "@/app/data/sisters";
import Avatar from "./Avatar";
import styles from "./WishComposer.module.css";

export default function WishComposer({ initialRecipient, onCreate, onClose }: { initialRecipient: Sister; onCreate: (recipient: Sister) => Promise<void>; onClose: () => void }) {
  const [wish, setWish] = useState("");
  const [closing, setClosing] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const wishRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.showModal();
    wishRef.current?.focus();
    return () => { dialog?.close(); document.body.style.overflow = previousOverflow; previousFocus?.focus(); };
  }, []);

  const create = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    if (!wish.trim()) { setError("Viết lời chúc trước khi lưu nhé."); return; }
    setSaving(true); setError("");
    try { await onCreate({ ...initialRecipient, wish: wish.trim(), appreciation: closing.trim() }); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Chưa lưu được lời chúc. Vui lòng thử lại."); setSaving(false); }
  };

  return (
    <dialog ref={dialogRef} className={styles.dialog} aria-labelledby="compose-title" onCancel={(event) => { event.preventDefault(); if (!saving) onClose(); }}>
      <button type="button" className={styles.close} aria-label="Đóng khung viết lời chúc" disabled={saving} onClick={onClose}>×</button>
      <header className={styles.recipient}>
        <Avatar src={initialRecipient.photo} name={initialRecipient.name} size="md" />
        <p>GỬI MỘT CHÚT THƯƠNG</p>
        <h2 id="compose-title">{initialRecipient.name}</h2>
      </header>
      <form className={styles.fields} onSubmit={create}>
        <div className={styles.field}>
          <div className={styles.labelRow}><label htmlFor="personal-wish">Lời chúc dành riêng</label><span className={styles.counter}>{wish.length} / 1500</span></div>
          <textarea ref={wishRef} id="personal-wish" className={styles.textarea} required rows={6} maxLength={1500} value={wish} onChange={(event) => setWish(event.target.value)} disabled={saving} placeholder="Viết những điều bạn muốn gửi đến người thương…" />
        </div>
        <div className={styles.field}>
          <div className={styles.labelRow}><label htmlFor="wish-closing">Lời nhắn cuối</label><span className={styles.counter}>Không bắt buộc</span></div>
          <textarea id="wish-closing" className={`${styles.textarea} ${styles.closing}`} rows={2} maxLength={500} value={closing} onChange={(event) => setClosing(event.target.value)} disabled={saving} />
        </div>
        {error && <p role="alert" className={styles.error}>{error}</p>}
        <p className={styles.note}>Lời chúc được lưu trên trang và có thể chia sẻ bằng link riêng.</p>
        <button type="submit" className={styles.submit} disabled={saving} aria-busy={saving}>{saving ? "Đang lưu…" : "Lưu & mở lời chúc"} <span aria-hidden="true">↗</span></button>
      </form>
    </dialog>
  );
}
