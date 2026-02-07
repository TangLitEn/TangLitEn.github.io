/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";

const SLIDE_INTERVAL_MS = 4000;
const MAX_SLIDES = 20;
const SLIDE_BASES = ["/landing", "/lifedashboard", "/lifeDashboardIntro"];

export default function ImageSlider() {
  const [slides, setSlides] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHoverPaused, setIsHoverPaused] = useState(false);
  const [mediaMeta, setMediaMeta] = useState<Record<string, { w: number; h: number }>>({});
  const [frameAspect, setFrameAspect] = useState(16 / 9);
  const [zoomedSrc, setZoomedSrc] = useState<string | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const playButtonRef = useRef<HTMLButtonElement | null>(null);
  const progressRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);

  const setProgress = (value: number) => {
    const nextValue = Math.max(0, Math.min(1, value));
    progressRef.current = nextValue;
    if (playButtonRef.current) {
      playButtonRef.current.style.setProperty("--play-progress", nextValue.toString());
    }
  };

  const resetProgress = () => {
    lastTickRef.current = null;
    setProgress(0);
  };

  useEffect(() => {
    let isMounted = true;

    const probeSlide = (basePath: string, index: number) =>
      new Promise<string | null>((resolve) => {
        const extensions = ["jpg", "png", "gif"];
        let extIndex = 0;
        const tryLoad = () => {
          const ext = extensions[extIndex];
          const src = `${basePath}/${index}.${ext}`;
          const img = new Image();
          img.onload = () => resolve(src);
          img.onerror = () => {
            extIndex += 1;
            if (extIndex >= extensions.length) resolve(null);
            else tryLoad();
          };
          img.src = src;
        };
        tryLoad();
      });

    const loadSlides = async () => {
      for (const basePath of SLIDE_BASES) {
        const found: string[] = [];
        for (let i = 1; i <= MAX_SLIDES; i += 1) {
          const src = await probeSlide(basePath, i);
          if (!src) break;
          found.push(src);
        }
        if (found.length > 0) {
          if (isMounted) setSlides(found);
          return;
        }
      }
      if (isMounted) setSlides([]);
    };

    loadSlides();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const updateAspect = () => {
      const rect = frame.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setFrameAspect(rect.width / rect.height);
      }
    };

    updateAspect();
    const observer = new ResizeObserver(updateAspect);
    observer.observe(frame);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const shouldPlay = isPlaying && !isHoverPaused;
    if (!shouldPlay || slides.length < 2) return;

    const tick = (timestamp: number) => {
      if (lastTickRef.current === null) lastTickRef.current = timestamp;
      const delta = timestamp - lastTickRef.current;
      lastTickRef.current = timestamp;
      const nextProgress = progressRef.current + delta / SLIDE_INTERVAL_MS;
      if (nextProgress >= 1) {
        setProgress(0);
        lastTickRef.current = timestamp;
        setActiveIndex((current) => (current + 1) % slides.length);
      } else {
        setProgress(nextProgress);
      }
      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTickRef.current = null;
    };
  }, [isHoverPaused, isPlaying, slides.length, activeIndex]);

  const handlePrev = () => {
    resetProgress();
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    resetProgress();
    setActiveIndex((current) => (current + 1) % slides.length);
  };

  const togglePlayback = () => setIsPlaying((current) => !current);
  const closeZoom = () => setZoomedSrc(null);

  useEffect(() => {
    if (!zoomedSrc) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeZoom();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zoomedSrc]);

  if (slides.length === 0) return null;

  const shouldContain = (src: string) => {
    const meta = mediaMeta[src];
    if (!meta) return false;
    const mediaAspect = meta.w / meta.h;
    return mediaAspect < frameAspect;
  };

  return (
    <section
      className="lp-slider lp-animate"
      aria-label="Life Dashboard highlights"
      onMouseEnter={() => setIsHoverPaused(true)}
      onMouseLeave={() => setIsHoverPaused(false)}
    >
      <div className="lp-slider-frame" ref={frameRef}>
        {slides.map((src, index) => (
          <img
            key={src}
            src={src}
            alt={`Life Dashboard slide ${index + 1}`}
            className={`lp-slide ${index === activeIndex ? "is-active" : ""} ${
              shouldContain(src) ? "is-contain" : ""
            }`}
            loading={index === 0 ? "eager" : "lazy"}
            role="button"
            tabIndex={index === activeIndex ? 0 : -1}
            onClick={() => {
              setIsPlaying(false);
              setZoomedSrc(src);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setIsPlaying(false);
                setZoomedSrc(src);
              }
            }}
            onLoad={(event) => {
              const target = event.currentTarget;
              const nextMeta = { w: target.naturalWidth, h: target.naturalHeight };
              setMediaMeta((current) =>
                current[src]?.w === nextMeta.w && current[src]?.h === nextMeta.h
                  ? current
                  : { ...current, [src]: nextMeta }
              );
            }}
          />
        ))}
      </div>
      {zoomedSrc ? (
        <div className="lp-zoom" role="dialog" aria-modal="true" aria-label="Slide preview">
          <button className="lp-zoom-backdrop" type="button" onClick={closeZoom} aria-label="Close preview" />
          <img className="lp-zoom-image" src={zoomedSrc} alt="Enlarged slide preview" />
          <button className="lp-zoom-close" type="button" onClick={closeZoom}>
            Close
          </button>
        </div>
      ) : null}
      <div className="lp-slider-controls">
        <button className="lp-slider-btn" type="button" onClick={handlePrev}>
          <span className="lp-slider-btn-icon" aria-hidden>
            <svg viewBox="0 0 20 20" fill="none">
              <path
                d="M12.5 4.5L7 10l5.5 5.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="lp-slider-btn-label">Prev</span>
        </button>
        <button
          className="lp-slider-btn lp-slider-btn-play"
          type="button"
          onClick={togglePlayback}
          ref={playButtonRef}
        >
          <span className="lp-slider-btn-icon" aria-hidden>
            {isPlaying ? (
              <svg viewBox="0 0 20 20" fill="none">
                <path
                  d="M7 5.5v9M13 5.5v9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
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
        <button className="lp-slider-btn" type="button" onClick={handleNext}>
          <span className="lp-slider-btn-icon" aria-hidden>
            <svg viewBox="0 0 20 20" fill="none">
              <path
                d="M7.5 4.5L13 10l-5.5 5.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="lp-slider-btn-label">Next</span>
        </button>
        <div className="lp-slider-progress" role="tablist" aria-label="Slide selector">
          {slides.map((_, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={`slide-${index + 1}`}
                type="button"
                className={`lp-slider-dot ${isActive ? "is-active" : ""}`}
                onClick={() => {
                  resetProgress();
                  setActiveIndex(index);
                }}
                aria-label={`Go to slide ${index + 1}`}
                aria-selected={isActive}
                role="tab"
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
