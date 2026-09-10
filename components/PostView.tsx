"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import Lightbox from "./Lightbox";
import type { Heading, PostMeta } from "../lib/posts";
import { formatDate, timelineHref } from "../lib/format";

type Post = { meta: PostMeta; html: string; headings: Heading[] };

export default function PostView({ post, children }: { post: Post; children?: ReactNode }) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState<string | undefined>(undefined);
  const openImage = (src: string, alt?: string) => { setLightboxSrc(src); setLightboxAlt(alt); };
  return <>
    <header className="article-heading">
      <p className="eyebrow">{post.meta.checkpoint ? "LIFE CHECKPOINT" : "NOTEBOOK"}</p>
      <div className="entry-meta"><time dateTime={post.meta.date}>{formatDate(post.meta.date)}</time><span>·</span><span>{post.meta.readingMinutes} min read</span><span>·</span><span>Lit En</span></div>
      <h1>{post.meta.title}</h1>
      {post.meta.description && <p className="article-description">{post.meta.description}</p>}
      <div className="tag-links">{post.meta.tags.map((tag) => <Link key={tag} href={timelineHref(tag, post.meta.checkpoint)}>{tag}</Link>)}</div>
    </header>
    {post.headings.length > 1 && <details className="contents"><summary>On this page</summary><ol>{post.headings.map((heading) => <li key={heading.id} className={heading.depth === 3 ? "subheading" : ""}><a href={`#${heading.id}`}>{heading.text}</a></li>)}</ol></details>}
    {post.meta.image && <button type="button" className="article-cover" onClick={() => openImage(post.meta.image!, post.meta.title)} aria-label="Enlarge cover image"><Image src={post.meta.image} alt={post.meta.title} width={960} height={540} priority /></button>}
    {children}
    <div className="article-layout"><article className="post-content" onClick={(event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === "IMG" && !target.closest("a")) {
        const img = target as HTMLImageElement; openImage(img.src, img.alt);
      }
    }} dangerouslySetInnerHTML={{ __html: post.html }} /></div>
    <div className="article-end"><span>Thanks for reading.</span><Link href={post.meta.checkpoint ? "/about/#checkpoints" : "/"}>{post.meta.checkpoint ? "More life checkpoints ↗" : "More from the notebook ↗"}</Link></div>
    <Lightbox src={lightboxSrc} alt={lightboxAlt} onClose={() => setLightboxSrc(null)} />
  </>;
}
