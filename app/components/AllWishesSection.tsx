import type { Sister } from "@/app/data/sisters";
import SectionHeading from "./SectionHeading";

export default function AllWishesSection({ wishes, onViewWish, loading = false, unavailable = false }: { wishes: Sister[]; onViewWish: (wish: Sister) => void; loading?: boolean; unavailable?: boolean }) {
  return (
    <section id="wishes" className="content-section">
      <SectionHeading description={loading ? "ĐANG MỞ NHỮNG LỜI THƯƠNG" : unavailable ? "CHƯA TẢI ĐƯỢC LỜI CHÚC" : `${wishes.length} LỜI CHÚC ĐÃ ĐƯỢC LƯU`} title="Những lời thương được gửi đến" />
      {loading || unavailable ? <div className="search-empty" role="status"><p>{loading ? "Đang tải những lời chúc đã lưu…" : "Chưa thể tải lời chúc. Trang sẽ tự động thử lại."}</p></div> : wishes.length ? <div className="wishes-grid">{wishes.map((recipient) => <article className="wish-note" key={recipient.wishId}>
        <div className="wish-note-top"><span>Gửi {recipient.name}</span><span aria-hidden="true">💌</span></div>
        <blockquote>“{recipient.wish}”</blockquote>
        {recipient.appreciation && <div className="appreciation"><p>{recipient.appreciation}</p></div>}
        <button className="button-text" type="button" onClick={() => onViewWish(recipient)}>Mở & chia sẻ lời chúc ↗</button>
      </article>)}</div> : <div className="search-empty"><p>Bạn chưa viết lời chúc nào.</p><a className="button-text" href="#sisters">Viết lời chúc đầu tiên →</a></div>}
    </section>
  );
}
