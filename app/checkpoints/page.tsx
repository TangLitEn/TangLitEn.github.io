import Image from "next/image";
import Link from "next/link";
import { getAllPostsMeta } from "../../lib/posts";
import { formatDate, tagSlug } from "../../lib/format";

export const metadata = { title: "Life checkpoints" };
export default function CheckpointsPage() {
  const posts = getAllPostsMeta().filter((post) => post.checkpoint);
  const years = Array.from(new Set(posts.map((post) => post.date.slice(0, 4))));
  return <main id="main-content" className="page checkpoints-page"><div className="page-heading"><p className="eyebrow">THE JOURNEY SO FAR</p><h1>Life checkpoints<span className="accent">.</span></h1><p>A collection of beginnings, people, and experiences that shaped me.<br />From student reporting to engineering, and the projects in between.</p></div>
    <nav className="year-jumps" aria-label="Jump to checkpoint year">{years.map((year) => <a key={year} href={`#year-${year}`}>{year}</a>)}</nav>
    <div className="checkpoint-timeline">{years.map((year) => <section id={`year-${year}`} className="checkpoint-year" key={year}><h2>{year}</h2><div>{posts.filter((post) => post.date.startsWith(year)).map((post) => <article className="checkpoint" key={post.slug}><div className="checkpoint-copy"><time className="entry-meta" dateTime={post.date}>{formatDate(post.date)}</time><h3><Link href={`/blog/${post.slug}/`}>{post.title}</Link></h3><p>{post.description}</p><div className="tag-links">{post.tags.map((tag) => <Link key={tag} href={`/tags/${tagSlug(tag)}/`}>{tag}</Link>)}</div></div>{post.image && <Link className="checkpoint-image" href={`/blog/${post.slug}/`} aria-label={`View ${post.title}`}><Image src={post.image} alt={post.title} width={220} height={160} /></Link>}</article>)}</div></section>)}</div>
    <p className="timeline-end">More to learn. More to come.</p>
  </main>;
}
