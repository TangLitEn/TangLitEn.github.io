"use client";

import Link from "next/link";
import { useState } from "react";
import type { PostMeta } from "../lib/posts";
import { formatDate, tagSlug } from "../lib/format";

export default function PostIndex({ posts, initialTag = "" }: { posts: PostMeta[]; initialTag?: string }) {
  const [view, setView] = useState("posts");
  const [tag, setTag] = useState(initialTag);
  const [year, setYear] = useState("");
  const tags = Array.from(new Set(posts.flatMap((post) => post.tags))).sort();
  const years = Array.from(new Set(posts.map((post) => post.date.slice(0, 4)))).sort().reverse();
  const filtered = posts.filter((post) => (!tag || post.tags.includes(tag)) && (!year || post.date.startsWith(year)));
  const groupedYears = Array.from(new Set(filtered.map((post) => post.date.slice(0, 4))));

  return <section id="posts" className="post-index" aria-label="Posts and archive">
    <div className="index-toolbar">
      <div className="view-switch" role="group" aria-label="Post display">
        <button type="button" aria-pressed={view === "posts"} onClick={() => setView("posts")}>Posts</button>
        <button type="button" aria-pressed={view === "archive"} onClick={() => setView("archive")}>Archive</button>
      </div>
      <span className="entry-count" aria-live="polite">{filtered.length} entries</span>
    </div>
    <div className="index-filters">
      <label><span className="sr-only">Filter by topic</span><select value={tag} onChange={(event) => setTag(event.target.value)}><option value="">All topics</option>{tags.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label><span className="sr-only">Filter by year</span><select value={year} onChange={(event) => setYear(event.target.value)}><option value="">All years</option>{years.map((item) => <option key={item}>{item}</option>)}</select></label>
      {(tag || year) && <button className="text-button" onClick={() => { setTag(""); setYear(""); }}>Clear filters ×</button>}
    </div>
    {!filtered.length && <div className="empty-state"><h3>No entries here yet.</h3><p>Try a different topic or year.</p></div>}
    {view === "posts" ? <div className="post-list">{filtered.map((post) => <article className="post-entry" key={post.slug}>
      <div className="entry-meta"><time dateTime={post.date}>{formatDate(post.date, true)}</time><span>·</span><span>{post.readingMinutes} min read</span></div>
      <h2><Link href={`/blog/${post.slug}/`}>{post.title}</Link></h2>
      <p>{post.description}</p>
      <div className="entry-bottom"><div className="tag-links">{post.tags.map((item) => <Link key={item} href={`/tags/${tagSlug(item)}/`}>{item}</Link>)}</div><Link className="read-post" href={`/blog/${post.slug}/`} aria-label={`Read ${post.title}`}>Read entry <span aria-hidden="true">↗</span></Link></div>
    </article>)}</div> : <div className="archive-list">{groupedYears.map((groupYear) => <section className="archive-year" key={groupYear}><h2>{groupYear}<span>{filtered.filter((post) => post.date.startsWith(groupYear)).length}</span></h2><ul>{filtered.filter((post) => post.date.startsWith(groupYear)).map((post) => <li key={post.slug}><time dateTime={post.date}>{formatDate(post.date, true).split(" ")[0]}</time><Link href={`/blog/${post.slug}/`}>{post.title}</Link></li>)}</ul></section>)}</div>}
  </section>;
}
