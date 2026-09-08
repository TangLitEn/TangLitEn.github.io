import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPostsMeta } from "../../../lib/posts";
import { timelineHref } from "../../../lib/format";

const getTags = () => Array.from(new Set(getAllPostsMeta().flatMap((post) => post.tags)));
export function generateStaticParams() { return Array.from(new Set(getTags().map((tag) => tag.toLowerCase()))).map((tag) => ({ tag })); }
export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  return { title: `Tagged ${getTags().find((item) => item.toLowerCase() === tag) ?? tag}` };
}
// Keep old tag bookmarks useful; shared tags offer both timeline destinations.
export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag: slug } = await params;
  const tags = getTags().filter((item) => item.toLowerCase() === slug);
  if (!tags.length) notFound();
  const posts = getAllPostsMeta();
  return <main id="main-content" className="page narrow-page">
    <Link className="back-link" href="/tags/">← All tags</Link>
    <div className="page-heading"><p className="eyebrow">FILED UNDER</p><h1>{tags[0]}<span className="accent">.</span></h1><p>Explore this tag in its timeline.</p></div>
    <div className="tag-directory">{tags.flatMap((tag) => [false, true].map((checkpoint) => {
      const count = posts.filter((post) => post.checkpoint === checkpoint && post.tags.includes(tag)).length;
      return count > 0 ? <Link key={`${tag}-${checkpoint}`} href={timelineHref(tag, checkpoint)}><span>{checkpoint ? "Life checkpoints" : "Posts"}{tags.length > 1 ? ` · ${tag}` : ""}</span><span>{count} {count === 1 ? "entry" : "entries"} ↗</span></Link> : null;
    }))}</div>
  </main>;
}
