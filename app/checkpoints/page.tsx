import Link from "next/link";
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
  return (
    <main id="main-content" className="page">
      <div className="page-heading">
        <p className="eyebrow">MOMENTS THAT SHAPE ME</p>
        <h1>Checkpoint<span className="accent">.</span></h1>
        <p>A collection of milestones, with a story behind every badge.</p>
      </div>
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
                <Link className={styles.badge} href={`/checkpoints/${badge.id}/`} key={badge.id}>
                  <BadgeImage badge={badge} />
                  <h3>{badge.name}</h3>
                  {badge.achieved && <time dateTime={badge.achieved}>{formatAchievementDate(badge.achieved)}</time>}
                  <span>{badge.checkpoints.length ? `Read ${badge.checkpoints.length === 1 ? "the story" : `the ${badge.checkpoints.length} stories`}` : "View checkpoint"} <span aria-hidden="true">↗</span></span>
                </Link>
              )}
            </div> : <div className={styles.empty}><p>Badges coming soon.</p><span>The stories are already taking shape.</span></div>}
          </section>;
        })}
      </div>
    </main>
  );
}
