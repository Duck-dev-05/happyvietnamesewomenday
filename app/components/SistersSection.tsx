"use client";
import SisterCard from "./SisterCard";
import type { Sister } from "@/app/data/sisters";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

export default function SistersSection({ sisters, onViewWish }: { sisters: Sister[]; onViewWish: (sister: Sister) => void }) {
  return (
    <section id="sisters" className="content-section">
      <Reveal>
        <SectionHeading description="TỪ MÌNH · GỬI ĐẾN NHỮNG NGƯỜI THƯƠNG" title="Có những điều, mình muốn gửi riêng." />
        <p className="section-note">Một chút biết ơn, một chút yêu thương. Chọn tấm thiệp của bạn để đọc những điều mình muốn nói.</p>
        <div className="sisters-grid">{sisters.map((sister) => <SisterCard key={sister.id} sister={sister} onViewWish={onViewWish} />)}</div>
      </Reveal>
    </section>
  );
}
