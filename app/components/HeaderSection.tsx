

export default function HeaderSection() {
  return (
    <header className="celebration-hero" id="home">
      <div className="hero-copy">
        <p className="eyebrow"><span /> NGÀY PHỤ NỮ VIỆT NAM · 20.10.2026</p>
        <h1>Mỗi người một vẻ.<br /><em>Mỗi nàng một<br />đóa hoa.</em></h1>
        <p className="hero-description">Một chút yêu thương, một lời chúc nhỏ — dành tặng những người phụ nữ làm thế giới này đẹp hơn mỗi ngày.</p>
        <div className="hero-actions">
          <a className="button-primary" href="#sisters">Chọn người bạn muốn gửi <span aria-hidden="true">↗</span></a>
          <a className="button-text" href="#sisters">Chọn người nhận <span aria-hidden="true">→</span></a>
        </div>
        <div className="hero-signature"><span aria-hidden="true">♡</span> Chọn người nhận · Viết lời chúc · Gửi yêu thương</div>
      </div>
      <div className="hero-art">
        <div className="hero-orbit" aria-hidden="true" />
        <figure className="hero-photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/flower.svg" alt="Minh họa bó hoa dành tặng ngày 20/10" fetchPriority="high" />
          <figcaption>for you, with love.</figcaption>
        </figure>
        <div className="date-stamp"><span>THÁNG MƯỜI</span><strong>20</strong><span>MỘT NGÀY ĐẶC BIỆT</span></div>
        <span className="hero-spark" aria-hidden="true">✳</span>
        <p className="hero-handwriting">Bạn xứng đáng với<br />những điều dịu dàng nhất.</p>
      </div>
    </header>
  );
}

