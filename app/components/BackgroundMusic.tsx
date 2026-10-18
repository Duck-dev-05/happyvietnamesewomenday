"use client";

import { useEffect, useRef } from "react";
import { tracks } from "@/app/data/tracks";

const LAST_TRACK_KEY = "thuong-last-music-track-v1";

export default function BackgroundMusic() {
  const order = useRef<number[]>([]);
  useEffect(() => {
    if (!tracks.length) return;
    const shuffle = (previous = -1) => {
      const result = tracks.map((_, index) => index);
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
      if (result.length > 1 && result[0] === previous) [result[0], result[1]] = [result[1], result[0]];
      return result;
    };
    if (!order.current.length) {
      let previous = -1;
      try { previous = tracks.findIndex((track) => String(track.id) === localStorage.getItem(LAST_TRACK_KEY)); } catch {}
      order.current = shuffle(previous);
    }
    const audio = new Audio();
    audio.volume = .6;
    audio.preload = "auto";
    audio.autoplay = true;
    let position = 0;
    let failures = 0;
    let disposed = false;
    const play = () => {
      if (disposed || !audio.paused) return;
      // NotAllowedError means the browser requires a genuine user gesture.
      // Keep the same track ready; do not fake clicks or start muted playback.
      void audio.play().catch(() => {});
    };
    const load = () => {
      audio.src = encodeURI(tracks[order.current[position]].src);
      play();
    };
    const advance = () => {
      const previous = order.current[position];
      position++;
      if (position >= order.current.length) { order.current = shuffle(previous); position = 0; }
      load();
    };
    const onPlay = () => {
      failures = 0;
      try { localStorage.setItem(LAST_TRACK_KEY, String(tracks[order.current[position]].id)); } catch {}
    };
    const onError = () => { if (++failures < tracks.length) advance(); };
    const onInteraction = (event: Event) => {
      if (event.isTrusted && audio.paused && failures < tracks.length) play();
    };
    audio.addEventListener("play", onPlay);
    audio.addEventListener("canplay", play);
    audio.addEventListener("ended", advance);
    audio.addEventListener("error", onError);
    document.addEventListener("pointerdown", onInteraction, true);
    document.addEventListener("click", onInteraction, true);
    document.addEventListener("touchend", onInteraction, { passive: true, capture: true });
    document.addEventListener("keydown", onInteraction, true);
    load();
    return () => {
      disposed = true;
      document.removeEventListener("pointerdown", onInteraction, true);
      document.removeEventListener("click", onInteraction, true);
      document.removeEventListener("touchend", onInteraction, true);
      document.removeEventListener("keydown", onInteraction, true);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("canplay", play);
      audio.removeEventListener("ended", advance);
      audio.removeEventListener("error", onError);
      audio.pause(); audio.removeAttribute("src"); audio.load();
    };
  }, []);
  return null;
}
