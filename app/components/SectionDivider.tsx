import React from "react";

export default function SectionDivider() {
  return (
    <div className="w-full flex justify-center items-center my-16 md:my-24">
      <div className="relative z-0 flex items-center gap-3 w-full max-w-sm">
        <div className="flex-1 divider-line" />
        <div className="flex flex-col items-center gap-1 z-10">
          <span className="text-rose-300 text-xl">❀</span>
          <span className="text-rose-200 text-xs tracking-widest uppercase font-semibold">
            20/10
          </span>
        </div>
        <div className="flex-1 divider-line" />
      </div>
    </div>
  );
}
