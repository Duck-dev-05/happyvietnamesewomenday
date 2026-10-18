"use client";

import { useState } from "react";
import SisterCard from "./SisterCard";
import { type Sister } from "@/app/data/sisters";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import styles from "./RecipientFlow.module.css";

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().trim();

export default function SistersSection({ sisters, onViewWish }: { sisters: Sister[]; onViewWish: (sister: Sister) => void }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "empty" | "ready">("all");
  const readyCount = sisters.filter((sister) => sister.wish.trim()).length;
  const matches = sisters.filter((sister) => normalize(`${sister.name} ${sister.handle}`).includes(normalize(query)) &&
    (filter === "all" || (filter === "ready" ? Boolean(sister.wish.trim()) : !sister.wish.trim())));

  return (
    <section id="sisters" className="content-section">
      <Reveal>
        <SectionHeading description="SAU NHỮNG KỶ NIỆM · GỬI MỘT LỜI THƯƠNG" title="Một tấm thiệp, dành riêng cho bạn." />
        <div className={styles.progress}><div><span>{readyCount} / {sisters.length} người đã nhận lời chúc</span><span>{readyCount === sisters.length && sisters.length > 0 ? "Sẵn sàng gửi yêu thương ♡" : "Mỗi người, một lời nhắn từ bạn."}</span></div><progress max={Math.max(sisters.length, 1)} value={readyCount} aria-label="Số lời chúc đã viết" /></div>
        <div className="sisters-toolbar">
          <div className={styles.filters} role="group" aria-label="Lọc theo trạng thái lời chúc">{([{ value: "all", label: "Tất cả", count: sisters.length }, { value: "empty", label: "Chưa có lời chúc", count: sisters.length - readyCount }, { value: "ready", label: "Đã có lời chúc", count: readyCount }] as const).map((item) => <button key={item.value} type="button" aria-pressed={filter === item.value} onClick={() => setFilter(item.value)}>{item.label}<span>{item.count}</span></button>)}</div>
          <label className="name-search">
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>
            <span className="sr-only">Tìm tên hoặc tài khoản của bạn</span>
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm tên của bạn…" />
          </label>
        </div>
        <p className="search-count" role="status">{matches.length} người nhận{query ? ` khớp với “${query}”` : ""}</p>
        <div className="sisters-grid">
          {matches.map((sister) => <SisterCard key={sister.id} sister={sister} onViewWish={onViewWish} />)}
        </div>
        {sisters.length === 0 ? <div className="search-empty"><span aria-hidden="true">💌</span><h3>Gửi lời chúc đầu tiên của bạn</h3><p>Danh sách người nhận sẽ xuất hiện tại đây.</p><a className="button-text" href="#sisters">Chọn người nhận →</a></div> : matches.length === 0 && <div className="search-empty"><span aria-hidden="true">❀</span><h3>{query ? "Chưa tìm thấy người nhận" : filter === "ready" ? "Chưa có lời chúc đã viết" : "Bạn đã viết cho tất cả mọi người"}</h3><p>{query ? "Thử tên ngắn hơn hoặc tìm không dấu nhé." : "Chọn một người trong danh sách để tiếp tục."}</p><button type="button" className="button-text" onClick={() => { setQuery(""); setFilter("all"); }}>Xem tất cả người nhận →</button></div>}
        <p className="section-note">Chọn một người để viết. Mọi lời chúc đã lưu đều xuất hiện trong mục Lời chúc; mỗi người có thể nhận nhiều lời chúc.</p>
      </Reveal>
    </section>
  );
}
