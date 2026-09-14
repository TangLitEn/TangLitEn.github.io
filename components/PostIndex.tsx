"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import type { Badge } from "../lib/badges";
import { Medal } from "./BadgeCollection";
import type { PostMeta } from "../lib/posts";
import { formatDate, timelineHref } from "../lib/format";

type Props = { posts: PostMeta[]; badges?: Badge[]; collection?: "posts" | "checkpoints" };
type Filters = { tag: string; year: string };
type View = "checkpoints" | "badges";

function TimelineContent({ posts, badges = [], collection = "posts", tag = "", year = "", onFilter, view = "checkpoints", onView }: Props & Partial<Filters> & { onFilter?: (filters: Filters) => void; view?: View; onView?: (view: View) => void }) {
  const checkpoints = collection === "checkpoints";
  const title = checkpoints ? "Life checkpoints" : "Research notes";
  const tags = Array.from(new Set(posts.flatMap((post) => post.tags))).sort((a, b) => a.localeCompare(b));
  const years = Array.from(new Set(posts.map((post) => post.date.slice(0, 4)))).sort().reverse();
  const filtered = posts.filter((post) => (!tag || post.tags.includes(tag)) && (!year || post.date.slice(0, 4) === year))
    .sort((a, b) => b.date.localeCompare(a.date));
  const groupedYears = Array.from(new Set(filtered.map((post) => post.date.slice(0, 4))));
  const yearId = (value: string) => checkpoints ? `year-${value}` : `posts-year-${value}`;

  const badgeGroups = badges.filter((badge) => badge.status === "earned")
    .map((badge) => ({ badge, entries: filtered.filter((post) => badge.checkpoints.includes(post.slug)) }))
    .filter((group) => group.entries.length)
    .sort((a, b) => b.entries[0].date.localeCompare(a.entries[0].date));
  const unbadged = filtered.filter((post) => !badges.filter((badge) => badge.checkpoints.includes(post.slug)).length);

  return <section id={collection} className={`post-index ${checkpoints ? "about-checkpoints" : "research-timeline"}`} aria-labelledby={`${collection}-heading`}>
    <div className="index-toolbar">
      <h2 id={`${collection}-heading`} className="timeline-heading">{title}</h2>
      <span className="entry-count" role="status">{filtered.length} {filtered.length === 1 ? "entry" : "entries"}</span>
    </div>
    {checkpoints && <div className="timeline-view-switch" role="group" aria-label="Timeline view">
      <button type="button" aria-pressed={view === "checkpoints"} disabled={!onView} onClick={() => onView?.("checkpoints")}>Life checkpoints</button>
      <button type="button" aria-pressed={view === "badges"} disabled={!onView} onClick={() => onView?.("badges")}>Badges</button>
    </div>}
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
    {(!checkpoints || view === "checkpoints") && groupedYears.length > 1 && <nav className="year-jumps timeline-jumps" aria-label={`Jump to ${title.toLowerCase()} year`}>{groupedYears.map((item) => <a key={item} href={`#${yearId(item)}`}>{item}</a>)}</nav>}
    {!filtered.length && <div className="empty-state"><h3>No entries here yet.</h3><p>Try a different tag or year.</p></div>}
    {checkpoints && view === "badges" ? <div className="badge-groups">
      {badgeGroups.map(({ badge, entries }) => <section id={`badge-${badge.id}`} className="badge-group" key={badge.id} aria-labelledby={`badge-heading-${badge.id}`}>
        <div className="badge-group-heading"><Medal badge={badge} /><div><p className="eyebrow">EARNED · {entries.length} {entries.length === 1 ? "CHECKPOINT" : "CHECKPOINTS"}{tag || year ? " MATCHING FILTERS" : ""}</p><h3 id={`badge-heading-${badge.id}`}>{badge.name}</h3></div></div>
        <ul className="badge-checkpoints">{entries.map((post) => <li key={post.slug}><time dateTime={post.date}>{formatDate(post.date, true)}</time><Link href={`/blog/${post.slug}/`}>{post.title}<span aria-hidden="true"> ↗</span></Link></li>)}</ul>
      </section>)}
      {!!unbadged.length && <section className="badge-group"><h3>More life checkpoints</h3><p>Stories that aren’t part of an earned badge yet.</p><ul className="badge-checkpoints">{unbadged.map((post) => <li key={post.slug}><time dateTime={post.date}>{formatDate(post.date, true)}</time><Link href={`/blog/${post.slug}/`}>{post.title} ↗</Link></li>)}</ul></section>}
    </div> : <div className="checkpoint-timeline">{groupedYears.map((groupYear) => <section id={yearId(groupYear)} className="checkpoint-year" key={groupYear} aria-labelledby={`${collection}-${groupYear}-heading`}>
      <h3 id={`${collection}-${groupYear}-heading`}>{groupYear}</h3>
      <div>{filtered.filter((post) => post.date.startsWith(groupYear)).map((post) => <article className="checkpoint" key={post.slug}>
        <div className="checkpoint-copy">
          <div className="entry-meta"><time dateTime={post.date}>{formatDate(post.date, true)}</time><span>·</span><span>{post.readingMinutes} min read</span></div>
          <h4><Link href={`/blog/${post.slug}/`}>{post.title}</Link></h4>
          {post.description && <p>{post.description}</p>}
          <div className="tag-links">{post.tags.map((item) => <Link key={item} href={timelineHref(item, checkpoints)}>{item}</Link>)}</div>
        </div>
        {checkpoints && badges.filter((badge) => badge.checkpoints.includes(post.slug)).length > 0 && <aside className="checkpoint-badges" aria-label="Earned badges">{badges.filter((badge) => badge.checkpoints.includes(post.slug)).map((badge) => <Link key={badge.id} href={`/about/?view=badges#badge-${badge.id}`}><Medal badge={badge} /><span>{badge.name}</span></Link>)}</aside>}
        {post.image && <Link className="checkpoint-image" href={`/blog/${post.slug}/`} aria-label={`View ${post.title}`}><Image src={post.image} alt={post.title} width={220} height={160} /></Link>}
      </article>)}</div>
    </section>)}</div>}
    {checkpoints && <p className="timeline-end">More to learn. More to come.</p>}
  </section>;
}

function FilteredTimeline(props: Props) {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  return <TimelineContent {...props} tag={params.get("tag") ?? ""} year={params.get("year") ?? ""} view={params.get("view") === "badges" ? "badges" : "checkpoints"} onView={(view) => {
    const next = new URLSearchParams(params.toString());
    if (view === "badges") next.set("view", view); else next.delete("view");
    const query = next.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}#checkpoints`, { scroll: false });
  }} onFilter={({ tag, year }) => {
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
