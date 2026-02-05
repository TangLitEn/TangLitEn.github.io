"use client";

import { useEffect, useRef, useState } from "react";

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = true;
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const tryAutoPlay = () => {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Autoplay can be blocked until a user gesture; ignore.
        });
    };

    const handleFirstInteract = () => {
      tryAutoPlay();
      window.removeEventListener("pointerdown", handleFirstInteract);
      window.removeEventListener("keydown", handleFirstInteract);
    };

    window.addEventListener("pointerdown", handleFirstInteract);
    window.addEventListener("keydown", handleFirstInteract);

    return () => {
      window.removeEventListener("pointerdown", handleFirstInteract);
      window.removeEventListener("keydown", handleFirstInteract);
    };
  }, []);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <button className="lp-slider-btn lp-slider-btn-play" type="button" onClick={togglePlayback}>
        <span className="lp-slider-btn-icon" aria-hidden>
          {isPlaying ? (
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M7 5.5v9M13 5.5v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" fill="none">
              <path
                d="M7 5.5L14.5 10L7 14.5V5.5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        <span className="lp-slider-btn-label">{isPlaying ? "Pause" : "Play"}</span>
      </button>
      <a
        className="lp-slider-btn lp-music-info"
        href="https://www.youtube.com/watch?v=ieCU9OV8_tg"
        target="_blank"
        rel="noreferrer"
        aria-label="Music info: Exyl - Discord Checkpoint"
        title="Exyl — Discord Checkpoint (I very like it)"
      >
        <span className="lp-slider-btn-icon" aria-hidden>
          <svg viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" />
            <path d="M10 8v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="10" cy="5.5" r="1" fill="currentColor" />
          </svg>
        </span>
      </a>
      <audio ref={audioRef} src="/Exyl.mp3" preload="none" />
    </div>
  );
}
