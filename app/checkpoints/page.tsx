import Link from "next/link";
import PageIntro from "../../components/PageIntro";
import BadgeImage from "../../components/BadgeImage";
import MarqueeSection from "../../components/MarqueeSection";
import { formatAchievementDate } from "../../lib/format";
import { getBadges } from "../../lib/badges";
import { getCheckpointPostsMeta } from "../../lib/posts";
import styles from "./checkpoints.module.css";

export const metadata = {
  title: "Checkpoint",
  description: "Brains, Brawls, and the life stories behind each badge.",
  alternates: { canonical: "/checkpoints/" },
};

const categories = [
  { id: "brains", name: "Brains", description: "Learning, ideas, and discoveries along the way." },
  { id: "brawls", name: "Brawls", description: "Challenges, grit, and moments of growth." },
] as const;

export default function CheckpointPage() {
  const badges = getBadges(getCheckpointPostsMeta());
  const earnedBadges = badges.filter((badge) => badge.status === "earned");
  return (
    <main id="main-content" className="page">
      <PageIntro className="page-heading">
          <p className="eyebrow">MOMENTS THAT SHAPE ME</p>
          <h1>Checkpoint<span className="accent">.</span></h1>
          <p>A collection of milestones, with a story behind every badge.</p>
      </PageIntro>
      <MarqueeSection title="Badges I’ve earned" label="Jump to an earned badge" expandLabel="See all badges" entries={earnedBadges.map((badge) => ({ id: badge.id, name: badge.name, image: badge.image, href: `#badge-${badge.id}` }))}>
          <ul className={styles.earnedBadges} aria-label="All earned badges">
            {earnedBadges.map((badge) => (
              <li key={badge.id}>
                <a href={`#badge-${badge.id}`}>
                  <BadgeImage badge={badge} />
                  <span className={styles.earnedName}>{badge.name}</span>
                  {badge.achieved && <time dateTime={badge.achieved}>{formatAchievementDate(badge.achieved)}</time>}
                </a>
              </li>
            ))}
          </ul>
      </MarqueeSection>
      <nav className={`year-jumps ${styles.sections}`} aria-label="Checkpoint sections">
        <a href="#brains">Brains</a>
        <a href="#brawls">Brawls</a>
      </nav>
      <div className={styles.categories}>
        {categories.map((category) => {
          const collection = badges.filter((badge) => badge.category === category.id);
          return <section id={category.id} className={styles.category} key={category.id} aria-labelledby={`${category.id}-heading`}>
            <div className={styles.heading}>
              <h2 id={`${category.id}-heading`}>{category.name}</h2>
              <p>{category.description}</p>
            </div>
            {collection.length ? <div className={styles.badges}>
              {collection.map((badge) =>
                <article id={`badge-${badge.id}`} className={styles.badge} key={badge.id}>
                  <Link className={styles.badgeLink} href={`/checkpoints/${badge.id}/`} aria-label={`View ${badge.name}`}><BadgeImage badge={badge} /></Link>
                  <h3>{badge.name}</h3>
                  <div className={styles.badgeMeta}>
                    {badge.achieved && <time dateTime={badge.achieved}>{formatAchievementDate(badge.achieved)}</time>}
                    {badge.checkpoints.length > 0 && <>
                      {badge.achieved && <span aria-hidden="true">*</span>}
                      <Link href={`/checkpoints/${badge.id}/`}>Read {badge.checkpoints.length === 1 ? "the story" : `the ${badge.checkpoints.length} stories`} <span aria-hidden="true">↗</span></Link>
                    </>}
                  </div>
                </article>
              )}
            </div> : <div className={styles.empty}><p>Badges coming soon.</p><span>The stories are already taking shape.</span></div>}
          </section>;
        })}
      </div>
    </main>
  );
}
