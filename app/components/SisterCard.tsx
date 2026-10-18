"use client";
import { useState } from "react";
import Avatar from "./Avatar";
import { copyWishText, personalWishMessage } from "@/app/lib/shareWish";
import type { Sister } from "@/app/data/sisters";
import styles from "./RecipientFlow.module.css";
interface SisterCardProps { sister: Sister; onViewWish: (sister: Sister) => void; }
export default function SisterCard({ sister, onViewWish }: SisterCardProps) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const copyMessage = async () => {
    try {
      await copyWishText(personalWishMessage(sister));
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  };
  return (
    <article className={`sister-card ${styles.card}`}>
      <button type="button" className={`sister-card-open ${styles.cardOpen}`} onClick={() => onViewWish(sister)} aria-label={`Viết lời chúc dành cho ${sister.name}`}>
      <span className="sister-card-top"><span className={styles.state} data-ready={Boolean(sister.wish)}>{sister.wish ? "LỜI THƯƠNG ĐÃ GỬI" : "DÀNH RIÊNG CHO"}</span><span className={styles.cardDate} aria-hidden="true">20.10</span></span>
      <Avatar src={sister.photo} name={sister.name} size="xl" />
      <h3>{sister.name}</h3>
      {sister.traits.length > 0 && <span className="trait-list">{sister.traits.map((trait) => <span key={trait}>{trait}</span>)}</span>}
      <span className={`sister-preview ${styles.preview}`}>{sister.wish ? `“${sister.wish}”` : "Một lời thương, dành riêng cho người bạn trân quý."}</span>
      <span className="sister-link">{sister.wish ? "Gửi thêm lời thương" : "Gửi lời thương"} <span aria-hidden="true">↗</span></span>
      </button>
      {sister.wish && <button type="button" className="sister-quick-copy" onClick={copyMessage} aria-label={`Sao chép lời chúc và link dành cho ${sister.name}`}>Sao chép lời chúc + link <span aria-hidden="true">⧉</span></button>}
      {copyStatus !== "idle" && <span className="card-copy-status" role="status">{copyStatus === "copied" ? "Đã sao chép · Dán vào cuộc trò chuyện để gửi 💌" : "Chưa sao chép được. Mở lời chúc để chia sẻ nhé."}</span>}
    </article>
  );
}
