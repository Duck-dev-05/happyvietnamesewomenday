"use client";

import { useEffect, useRef, useState } from "react";

function randomRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

interface ConfettiProps {
  isActive: boolean;
}

export default function Confetti({ isActive }: ConfettiProps) {
  const [pieces, setPieces] = useState<Array<{ id: number; x: number; y: number; color: string; delay: number; duration: number; shape: string }>>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      const colors = ["#ef4444", "#ec4899", "#f59e0b", "#8b5cf6", "#14b8a6", "#fbbf24"];
      const shapes = ["circle", "square"];
      const newPieces: Array<{ id: number; x: number; y: number; color: string; delay: number; duration: number; shape: string }> = [];
      for (let i = 0; i < 80; i++) {
        newPieces.push({
          id: i,
          x: randomRange(5, 95),
          y: randomRange(15, 65),
          color: colors[Math.floor(Math.random() * colors.length)],
          delay: randomRange(0, 0.8),
          duration: randomRange(1.5, 2.5),
          shape: shapes[Math.floor(Math.random() * shapes.length)],
        });
      }
      const frame = requestAnimationFrame(() => setPieces(newPieces));
      timeoutRef.current = setTimeout(() => {
        setPieces([]);
      }, 3500);
      return () => {
        cancelAnimationFrame(frame);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isActive]);

  if (!isActive || pieces.length === 0) return null;

  return (
    <div className="confetti-container fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="confetti-piece absolute"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            backgroundColor: piece.color,
            animationDuration: `${piece.duration}s`,
            animationDelay: `${piece.delay}s`,
            borderRadius: piece.shape === "circle" ? "50%" : "2px",
            width: piece.shape === "circle" ? "7px" : "6px",
            height: piece.shape === "circle" ? "7px" : "10px",
          }}
        />
      ))}
    </div>
  );
}
