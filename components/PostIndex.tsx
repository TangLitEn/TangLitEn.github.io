"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import type { PostMeta } from "../lib/posts";
import { formatDate, timelineHref } from "../lib/format";

type Props = { posts: PostMeta[]; collection?: "posts" | "checkpoints" };
type Filters = { tag: string; year: string };

function TimelineContent({ posts, collection = "posts", tag = "", year = "", onFilter }: Props & Partial<Filters> & { onFilter?: (filters: Filters) => void }) {
  const checkpoints = collection === "checkpoints";
  const title = checkpoints ? "Life checkpoints" : "Research notes";
  const tags = Array.from(new Set(posts.flatMap((post) => post.tags))).sort((a, b) => a.localeCompare(b));
  const years = Array.from(new Set(posts.map((post) => post.date.slice(0, 4)))).sort().reverse();
  const filtered = posts.filter((post) => (!tag || post.tags.includes(tag)) && (!year || post.date.slice(0, 4) === year))
    .sort((a, b) => b.date.localeCompare(a.date));
  const groupedYears = Array.from(new Set(filtered.map((post) => post.date.slice(0, 4))));
  const yearId = (value: string) => checkpoints ? `year-${value}` : `posts-year-${value}`;

  return <section id={collection} className={`post-index ${checkpoints ? "about-checkpoints" : "research-timeline"}`} aria-labelledby={`${collection}-heading`}>
    <div className="index-toolbar">
      <h2 id={`${collection}-heading`} className="timeline-heading">{title}</h2>
      <span className="entry-count" role="status">{filtered.length} {filtered.length === 1 ? "entry" : "entries"}</span>
    </div>
    <div className="index-filters">
      <label><span className="sr-only">Filter by tag</span><select value={tag} disabled={!onFilter} onChange={(event) => onFilter?.({ tag: event.target.value, year })}>
        <option value="">All tags</option>
        {tag && !tags.includes(tag) && <option value={tag}>{tag}</option>}
        {tags.map((item) => <option key={item}>{item}</option>)}
      </select></label>
      <label><span className="sr-only">Filter by year</span><select value={year} disabled={!onFilter} onChange={(event) => onFilter?.({ tag, year: event.target.value })}>
        <option value="">All years</option>
        {year && !years.includes(year) && <option value={year}>{year}</option>}
        {years.map((item) => <option key={item}>{item}</option>)}
      </select></label>
      {(tag || year) && <button type="button" className="text-button" onClick={() => onFilter?.({ tag: "", year: "" })}>Clear filters ×</button>}
    </div>
    {groupedYears.length > 1 && <nav className="year-jumps timeline-jumps" aria-label={`Jump to ${title.toLowerCase()} year`}>{groupedYears.map((item) => <a key={item} href={`#${yearId(item)}`}>{item}</a>)}</nav>}
    {!filtered.length && <div className="empty-state"><h3>No entries here yet.</h3><p>Try a different tag or year.</p></div>}
    <div className="checkpoint-timeline">{groupedYears.map((groupYear) => <section id={yearId(groupYear)} className="checkpoint-year" key={groupYear} aria-labelledby={`${collection}-${groupYear}-heading`}>
      <h3 id={`${collection}-${groupYear}-heading`}>{groupYear}</h3>
      <div>{filtered.filter((post) => post.date.startsWith(groupYear)).map((post) => <article className="checkpoint" key={post.slug}>
        <div className="checkpoint-copy">
          <div className="entry-meta"><time dateTime={post.date}>{formatDate(post.date, true)}</time><span>·</span><span>{post.readingMinutes} min read</span></div>
          <h4><Link href={`/blog/${post.slug}/`}>{post.title}</Link></h4>
          {post.description && <p>{post.description}</p>}
          <div className="tag-links">{post.tags.map((item) => <Link key={item} href={timelineHref(item, checkpoints)}>{item}</Link>)}</div>
        </div>
        {post.image && <Link className="checkpoint-image" href={`/blog/${post.slug}/`} aria-label={`View ${post.title}`}><Image src={post.image} alt={post.title} width={220} height={160} /></Link>}
      </article>)}</div>
    </section>)}</div>
    {checkpoints && <p className="timeline-end">More to learn. More to come.</p>}
  </section>;
}

function FilteredTimeline(props: Props) {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  return <TimelineContent {...props} tag={params.get("tag") ?? ""} year={params.get("year") ?? ""} onFilter={({ tag, year }) => {
    const next = new URLSearchParams(params.toString());
    if (tag) next.set("tag", tag); else next.delete("tag");
    if (year) next.set("year", year); else next.delete("year");
    const query = next.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}#${props.collection ?? "posts"}`, { scroll: false });
  }} />;
}

export default function PostIndex(props: Props) {
  // Keep the timeline in the static export; URL filters become active on hydration.
  return <Suspense fallback={<TimelineContent {...props} />}><FilteredTimeline {...props} /></Suspense>;
}
