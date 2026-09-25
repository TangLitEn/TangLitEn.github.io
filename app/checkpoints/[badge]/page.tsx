import Link from "next/link";
import { notFound } from "next/navigation";
import BadgeImage from "../../../components/BadgeImage";
import { getBadges } from "../../../lib/badges";
import { getCheckpointPostsMeta } from "../../../lib/posts";
import { formatAchievementDate, formatDate } from "../../../lib/format";
import styles from "../checkpoints.module.css";

type Props = { params: Promise<{ badge: string }> };

const getBadge = (id: string) => getBadges(getCheckpointPostsMeta()).find((badge) => badge.id === id);
export const dynamicParams = false;
export function generateStaticParams() {
  return getBadges(getCheckpointPostsMeta()).map((badge) => ({ badge: badge.id }));
}
export async function generateMetadata({ params }: Props) {
  const { badge: id } = await params;
  const badge = getBadge(id);
  if (!badge) notFound();
  return { title: badge.name, alternates: { canonical: `/checkpoints/${badge.id}/` } };
}

export default async function BadgePage({ params }: Props) {
  const { badge: id } = await params;
  const badge = getBadge(id);
  if (!badge) notFound();
  const posts = getCheckpointPostsMeta();
  const stories = badge.checkpoints.map((slug) => posts.find((post) => post.slug === slug)!);
  return <main id="main-content" className="page">
    <Link className="back-link" href={`/checkpoints/${badge.category ? `#${badge.category}` : ""}`}>← Back to Checkpoint</Link>
    <header className={styles.detailHeading}>
      <BadgeImage badge={badge} />
      <div>
        <p className="eyebrow">{badge.category === "brawls" ? "BRAWLS" : "BRAINS"}</p>
        <h1>{badge.name}<span className="accent">.</span></h1>
        {badge.achieved && <p className={styles.achieved}>Achieved <time dateTime={badge.achieved}>{formatAchievementDate(badge.achieved)}</time></p>}
      </div>
    </header>
    <section className={styles.stories} aria-labelledby="stories-heading">
      <h2 id="stories-heading">The {stories.length === 1 ? "story" : "stories"} behind the badge</h2>
      {stories.length ? <ul>{stories.map((post) => <li key={post.slug}>
        <time dateTime={post.date}>{formatDate(post.date, true)}</time>
        <div><h3><Link href={`/blog/${post.slug}/`}>{post.title} <span aria-hidden="true">↗</span></Link></h3>
        {post.description && <p>{post.description}</p>}</div>
      </li>)}</ul> : <p className={styles.storyPending}>Story coming soon.</p>}
    </section>
  </main>;
}
