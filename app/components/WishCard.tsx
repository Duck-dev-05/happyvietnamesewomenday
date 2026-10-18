"use client";
import styles from "./Letter.module.css";
interface WishCardProps { onConfetti: () => void; }
export default function WishCard({ onConfetti }: WishCardProps) {
  return (
    <article className={styles.letter}>
      <div className={styles.paper}>
        <header className={styles.header}><span>MỘT LÁ THƯ NHỎ</span><span>20.10 <span aria-hidden="true">♡</span></span></header>
        <p className={styles.salutation}>Gửi mấy nàng iu,</p>
        <h2>Luôn là <em>chính mình.</em><br />Luôn được yêu thương.</h2>
        <p className={styles.message}>Chúc mấy nàng luôn xinh đẹp, vui vẻ và được cưng chiều hết nấc. Hy vọng 20/10 năm nay mang đến thật nhiều niềm vui và những điều dễ thương nhất đến với mỗi người nha!</p>
        <footer className={styles.footer}>
          <div><span className={styles.signoff}>Với thật nhiều thương mến</span><span className={styles.brand}>thương.</span></div>
          <button type="button" onClick={onConfetti} className={styles.surprise}>Một chút bất ngờ <span aria-hidden="true">✧</span><small>Chạm để thả hoa giấy</small></button>
        </footer>
      </div>
    </article>
  );
}
