"use client";
import Image from "next/image";
import { useState } from "react";

interface AvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap: Record<string, string> = {
  sm: "w-10 h-10",
  md: "w-16 h-16",
  lg: "w-24 h-24",
  xl: "w-32 h-32",
};

export default function Avatar({ src, name, size = "xl" }: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | undefined>();
  const initials = name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={"relative rounded-full avatar-ring p-[3px] shadow-lg " + sizeMap[size]}>
      <div className="relative w-full h-full rounded-full overflow-hidden bg-white">
        {src && src !== failedSrc ? (
          <Image
            src={src}
            alt={name}
            fill
            sizes={size === "sm" ? "40px" : size === "md" ? "64px" : size === "lg" ? "96px" : "128px"}
            onError={() => setFailedSrc(src)}
            className="w-full h-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-100 via-pink-100 to-rose-200 text-rose-500 font-bold font-display text-xl">
            {initials}
          </div>
        )}
      </div>
    </div>
  );
}
