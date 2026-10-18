import React from "react";
import WishCard from "./WishCard";
import Reveal from "./Reveal";

type WishSectionProps = {
  onConfetti: () => void;
};

export default function WishSection({ onConfetti }: WishSectionProps) {
  return (
    <section id="letter" aria-label="Lá thư chúc mừng 20/10">
      <Reveal className="py-6 md:py-10">
        <WishCard onConfetti={onConfetti} />
      </Reveal>
    </section>
  );
}