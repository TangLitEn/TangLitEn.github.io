"use client";

import { useState } from "react";
import Lightbox from "./Lightbox";

type Post = {
  meta: {
    title: string;
    date: string;
    description?: string;
    tags?: string[];
    image?: string;
  };
  html: string;
};

export default function PostView({ post }: { post: Post }) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState<string | undefined>(undefined);

  return (
    <>
      <div
        style={{
          marginTop: 14,
          marginBottom: 18,
          display: "grid",
          gridTemplateColumns: post.meta.image ? "150px 1fr" : "1fr",
          gap: 16,
          alignItems: "center",
          background: "linear-gradient(120deg, rgba(255,255,255,0.05), rgba(0,0,0,0.0))",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 16,
          padding: 16
        }}
      >
        {post.meta.image ? (
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              setLightboxSrc(post.meta.image as string);
              setLightboxAlt(post.meta.title);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setLightboxSrc(post.meta.image as string);
                setLightboxAlt(post.meta.title);
              }
            }}
            style={{ cursor: "zoom-in" }}
          >
            <div
              style={{
                width: 150,
                height: 150,
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.04)"
              }}
            >
              <img
                src={post.meta.image}
                alt={post.meta.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
          </div>
        ) : null}

        <div style={{ display: "grid", gap: 6 }}>
          <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>{post.meta.date}</div>
          <h1 style={{ margin: 0, fontSize: 22 }}>{post.meta.title}</h1>
          {post.meta.description ? (
            <div style={{ color: "rgba(255,255,255,0.75)" }}>{post.meta.description}</div>
          ) : null}

          {post.meta.tags?.length ? (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
              {post.meta.tags.map((t) => (
                <span
                  key={t}
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.75)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(255,255,255,0.04)",
                    padding: "4px 8px",
                    borderRadius: 999
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <article
        onClick={(e) => {
          const target = e.target as HTMLElement | null;
          if (!target) return;
          if (target.tagName !== "IMG") return;
          const img = target as HTMLImageElement;
          if (!img.src) return;
          setLightboxSrc(img.src);
          setLightboxAlt(img.alt || undefined);
        }}
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 14,
          padding: 18
        }}
        dangerouslySetInnerHTML={{ __html: post.html }}
      />

      <Lightbox src={lightboxSrc} alt={lightboxAlt} onClose={() => setLightboxSrc(null)} />
    </>
  );
}
