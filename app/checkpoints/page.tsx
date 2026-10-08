import Link from "next/link";
import ProfileSignature from "../../components/ProfileSignature";
import profileStyles from "../../components/ProfileSignature.module.css";
import BadgeImage from "../../components/BadgeImage";
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
      <div className={`page-heading ${profileStyles.header} ${styles.pageHeading}`}>
        <div>
          <p className="eyebrow">MOMENTS THAT SHAPE ME</p>
          <h1>Checkpoint<span className="accent">.</span></h1>
          <p>A collection of milestones, with a story behind every badge.</p>
        </div>
        <ProfileSignature />
      </div>
      {earnedBadges.length > 0 && <section className={styles.earned} aria-label="Earned badges">
        <details className={styles.badgeDetails}>
          <summary>
            <span className={styles.earnedHeading}>Badges I’ve earned</span>
            <span className={styles.toggleLabel}>
              <span className={styles.showLabel}>See all badges</span>
              <span className={styles.hideLabel}>Show less</span>
              <span className={styles.chevron} aria-hidden="true">⌄</span>
            </span>
          </summary>
          <ul className={styles.earnedBadges} aria-label="All earned badges">
            {earnedBadges.map((badge) => (
              <li key={badge.id}>
                <Link href={`/checkpoints/${badge.id}/`}>
                  <BadgeImage badge={badge} />
                  <span className={styles.earnedName}>{badge.name}</span>
                  {badge.achieved && <time dateTime={badge.achieved}>{formatAchievementDate(badge.achieved)}</time>}
                </Link>
              </li>
            ))}
          </ul>
        </details>
        <div className={styles.marquee} tabIndex={0} role="region" aria-label="Earned badges. Expand See all badges to view the full list without scrolling.">
          <div className={styles.marqueeTrack}>
            {[false, true].map((duplicate) => (
              <ul className={styles.marqueeGroup} key={String(duplicate)} aria-hidden={duplicate || undefined}>
                {earnedBadges.map((badge) => (
                  <li key={badge.id}>
                    <Link href={`/checkpoints/${badge.id}/`} title={badge.name} aria-label={badge.name} tabIndex={duplicate ? -1 : undefined}>
                      <BadgeImage badge={badge} />
                    </Link>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </section>}
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
                <article className={styles.badge} key={badge.id}>
                  <BadgeImage badge={badge} />
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
