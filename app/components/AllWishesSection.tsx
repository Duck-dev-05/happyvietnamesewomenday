import type { Sister } from "@/app/data/sisters";
import SectionHeading from "./SectionHeading";

export default function AllWishesSection({ wishes, onViewWish }: { wishes: Sister[]; onViewWish: (wish: Sister) => void }) {
  return (
    <section id="wishes" className="content-section">
      <SectionHeading description={`${wishes.length} LỜI CHÚC ĐÃ ĐƯỢC LƯU`} title="Những lời thương được gửi đến" />
      {wishes.length ? <div className="wishes-grid">{wishes.map((recipient) => <article className="wish-note" key={recipient.wishId}>
        <div className="wish-note-top"><span>Gửi {recipient.name}</span><span aria-hidden="true">💌</span></div>
        <blockquote>“{recipient.wish}”</blockquote>
        {recipient.appreciation && <div className="appreciation"><p>{recipient.appreciation}</p></div>}
        <button className="button-text" type="button" onClick={() => onViewWish(recipient)}>Mở & chia sẻ lời chúc ↗</button>
      </article>)}</div> : <div className="search-empty"><p>Bạn chưa viết lời chúc nào.</p><a className="button-text" href="#sisters">Viết lời chúc đầu tiên →</a></div>}
    </section>
  );
}
