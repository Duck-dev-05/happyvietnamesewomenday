import React from "react";

export default function Dots() {
  return (
    <div className="flex justify-center mt-3 gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-300" />
      <span className="w-1.5 h-1.5 rounded-full bg-pink-300" />
      <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
    </div>
  );
}