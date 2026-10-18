"use client";

import { useEffect, useState } from "react";

const PETAL_COUNT = 24;
const BOKEH_COUNT = 14;

function randomRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

const petalColors = ["#fda4af", "#fbcfe8", "#fecdd3", "#f9a8d4", "#fecaca"];
const bokehColors = ["#fda4af", "#fde68a", "#fbcfe8", "#c7d2fe"];

export default function FloatingElements() {
  const [petals, setPetals] = useState<Array<{ id: number; left: number; delay: number; duration: number; size: number; color: string; rotate: number }>>([]);
  const [bokeh, setBokeh] = useState<Array<{ id: number; left: number; top: number; delay: number; duration: number; size: number; color: string }>>([]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
    setPetals(Array.from({ length: PETAL_COUNT }, (_, i) => ({
      id: i,
      left: randomRange(0, 100),
      delay: randomRange(0, 18),
      duration: randomRange(9, 18),
      size: randomRange(14, 28),
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
      rotate: randomRange(0, 360),
    })));
    setBokeh(Array.from({ length: BOKEH_COUNT }, (_, i) => ({
      id: i,
      left: randomRange(0, 100),
      top: randomRange(0, 100),
      delay: randomRange(0, 6),
      duration: randomRange(4, 9),
      size: randomRange(40, 130),
      color: bokehColors[Math.floor(Math.random() * bokehColors.length)],
    })));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="floating-bg" aria-hidden="true">
      {/* Cherry blossom petals */}
      {petals.map((p) => (
        <div
          key={p.id}
          className="petal"
          style={{
            left: p.left + "%",
            animationDelay: p.delay + "s",
            animationDuration: p.duration + "s",
          }}
        >
          <svg
            width={p.size}
            height={p.size}
            viewBox="0 0 24 24"
            fill={p.color}
            style={{ transform: "rotate(" + p.rotate + "deg)" }}
          >
            <path d="M12 2C13 6 17 8 20 8C17 10 15 14 14 18C13 14 10 11 6 10C10 9 12 6 12 2Z" />
            <path d="M12 22C11 18 7 16 4 16C7 14 9 10 10 6C11 10 14 13 18 14C14 15 12 18 12 22Z" />
          </svg>
        </div>
      ))}

      {/* Bokeh glow particles */}
      {bokeh.map((b) => (
        <div
          key={b.id}
          className="bokeh"
          style={{
            left: b.left + "%",
            top: b.top + "%",
            width: b.size,
            height: b.size,
            background:
              "radial-gradient(circle, " + b.color + "88 0%, transparent 70%)",
            animationDelay: b.delay + "s",
            animationDuration: b.duration + "s",
          }}
        />
      ))}
    </div>
  );
}
