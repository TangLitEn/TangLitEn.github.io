import Image from "next/image";
import Link from "next/link";
import { getCheckpointPostsMeta } from "../lib/posts";
import { formatDate, tagSlug } from "../lib/format";

export default function LifeCheckpoints() {
  const posts = getCheckpointPostsMeta();
  const years = Array.from(new Set(posts.map((post) => post.date.slice(0, 4))));
  return <section id="checkpoints" className="about-checkpoints" aria-labelledby="checkpoints-heading"><div className="checkpoints-heading"><h2 id="checkpoints-heading">Life checkpoints</h2><p>Most recent first. Each entry holds a little more of the story.</p></div>
    <nav className="year-jumps" aria-label="Jump to checkpoint year">{years.map((year) => <a key={year} href={`#year-${year}`}>{year}</a>)}</nav>
    <div className="checkpoint-timeline">{years.map((year) => <section id={`year-${year}`} className="checkpoint-year" key={year}><h3>{year}</h3><div>{posts.filter((post) => post.date.startsWith(year)).map((post) => <article className="checkpoint" key={post.slug}><div className="checkpoint-copy"><time className="entry-meta" dateTime={post.date}>{formatDate(post.date)}</time><h4><Link href={`/blog/${post.slug}/`}>{post.title}</Link></h4><p>{post.description}</p><div className="tag-links">{post.tags.map((tag) => <Link key={tag} href={`/tags/${tagSlug(tag)}/`}>{tag}</Link>)}</div></div>{post.image && <Link className="checkpoint-image" href={`/blog/${post.slug}/`} aria-label={`View ${post.title}`}><Image src={post.image} alt={post.title} width={220} height={160} /></Link>}</article>)}</div></section>)}</div>
    <p className="timeline-end">More to learn. More to come.</p>
  </section>;
}
