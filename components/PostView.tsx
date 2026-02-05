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
      <div className={`post-hero ${post.meta.image ? "has-image" : "no-image"}`}>
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
            className="post-hero-media"
          >
            <div className="post-hero-media-frame">
              <img
                src={post.meta.image}
                alt={post.meta.title}
                className="post-hero-media-image"
              />
            </div>
          </div>
        ) : null}

        <div className="post-hero-body">
          <div className="post-hero-date">{post.meta.date}</div>
          <h1 className="post-hero-title">{post.meta.title}</h1>
          {post.meta.description ? (
            <div className="post-hero-description">{post.meta.description}</div>
          ) : null}

          {post.meta.tags?.length ? (
            <div className="post-hero-tags">
              {post.meta.tags.map((t) => (
                <span
                  key={t}
                  className="post-hero-tag"
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
