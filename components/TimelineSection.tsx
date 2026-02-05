"use client";

import { useMemo, useState } from "react";
import { PostMeta } from "../lib/posts";
import TimelineItem from "./TimelineItem";
import Lightbox from "./Lightbox";

type Props = { compact?: boolean; posts: PostMeta[] };

export default function TimelineSection({ compact, posts }: Props) {
  const [activeTag, setActiveTag] = useState<string>("All");
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState<string | undefined>(undefined);

  const tags = useMemo(() => {
    const all = new Set<string>();
    posts.forEach((p) => p.tags.forEach((t) => all.add(t)));
    return ["All", ...Array.from(all).sort((a, b) => a.localeCompare(b))];
  }, [posts]);

  const entries = useMemo(() => {
    const sorted = [...posts].sort((a, b) => (a.date < b.date ? 1 : -1));
    const filtered = activeTag === "All" ? sorted : sorted.filter((p) => p.tags.includes(activeTag));
    return compact ? filtered.slice(0, 4) : filtered;
  }, [posts, compact, activeTag]);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setActiveTag(tag)}
            style={{
              cursor: "pointer",
              borderRadius: 999,
              padding: "6px 10px",
              fontSize: 12,
              border:
                activeTag === tag
                  ? "1px solid rgba(255,255,255,0.45)"
                  : "1px solid rgba(255,255,255,0.10)",
              background: activeTag === tag ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
              color: activeTag === tag ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.75)"
            }}
          >
            {tag}
          </button>
        ))}
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
