"use client";

import { useMemo, useState } from "react";
import { PostMeta } from "../lib/posts";
import TimelineItem from "./TimelineItem";
import Lightbox from "./Lightbox";

type Props = { compact?: boolean; posts: PostMeta[] };

export default function TimelineSection({ compact, posts }: Props) {
  const [activeTag, setActiveTag] = useState<string>("All");
  const [activeYear, setActiveYear] = useState<string>("All");
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState<string | undefined>(undefined);

  const tags = useMemo(() => {
    const all = new Set<string>();
    posts.forEach((p) => p.tags.forEach((t) => all.add(t)));
    return ["All", ...Array.from(all).sort((a, b) => a.localeCompare(b))];
  }, [posts]);

  const years = useMemo(() => {
    const all = new Set<string>();
    posts.forEach((p) => {
      const year = p.date.slice(0, 4);
      if (/^\d{4}$/.test(year)) all.add(year);
    });
    return ["All", ...Array.from(all).sort((a, b) => b.localeCompare(a))];
  }, [posts]);

  const availableTags = useMemo(() => {
    if (activeYear === "All") return new Set(tags);

    const inYear = posts.filter((p) => p.date.startsWith(`${activeYear}-`));
    const available = new Set<string>(["All"]);
    inYear.forEach((p) => p.tags.forEach((t) => available.add(t)));
    return available;
  }, [posts, tags, activeYear]);

  const availableYears = useMemo(() => {
    if (activeTag === "All") return new Set(years);

    const withTag = posts.filter((p) => p.tags.includes(activeTag));
    const available = new Set<string>(["All"]);
    withTag.forEach((p) => {
      const year = p.date.slice(0, 4);
      if (/^\d{4}$/.test(year)) available.add(year);
    });
    return available;
  }, [posts, years, activeTag]);

  const entries = useMemo(() => {
    const sorted = [...posts].sort((a, b) => (a.date < b.date ? 1 : -1));
    const tagFiltered = activeTag === "All" ? sorted : sorted.filter((p) => p.tags.includes(activeTag));
    const yearFiltered =
      activeYear === "All" ? tagFiltered : tagFiltered.filter((p) => p.date.startsWith(`${activeYear}-`));

    return compact ? yearFiltered.slice(0, 4) : yearFiltered;
  }, [posts, compact, activeTag, activeYear]);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {years.map((year) => {
          const enabled = availableYears.has(year);
          return (
            <button
              key={year}
              type="button"
              onClick={() => setActiveYear(year)}
              disabled={!enabled}
              style={{
                cursor: enabled ? "pointer" : "not-allowed",
                borderRadius: 999,
                padding: "6px 10px",
                fontSize: 12,
                border:
                  activeYear === year
                    ? "1px solid rgba(255,255,255,0.45)"
                    : "1px solid rgba(255,255,255,0.10)",
                background: activeYear === year ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
                color: enabled ? (activeYear === year ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.75)") : "rgba(255,255,255,0.35)",
                opacity: enabled ? 1 : 0.6
              }}
            >
              {year === "All" ? "All Years" : year}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {tags.map((tag) => {
          const enabled = availableTags.has(tag);
          return (
          <button
            key={tag}
            type="button"
            onClick={() => setActiveTag(tag)}
            disabled={!enabled}
            style={{
              cursor: enabled ? "pointer" : "not-allowed",
              borderRadius: 999,
              padding: "6px 10px",
              fontSize: 12,
              border:
                activeTag === tag
                  ? "1px solid rgba(255,255,255,0.45)"
                  : "1px solid rgba(255,255,255,0.10)",
              background: activeTag === tag ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
              color: enabled ? (activeTag === tag ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.75)") : "rgba(255,255,255,0.35)",
              opacity: enabled ? 1 : 0.6
            }}
          >
            {tag}
          </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {entries.map((p) => (
          <TimelineItem
            key={p.slug}
            post={p}
            onOpenImage={(src, alt) => {
              setLightboxSrc(src);
              setLightboxAlt(alt);
            }}
          />
        ))}
      </div>
      <Lightbox src={lightboxSrc} alt={lightboxAlt} onClose={() => setLightboxSrc(null)} />
    </div>
  );
}
