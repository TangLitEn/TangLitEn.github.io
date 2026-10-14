import fs from "fs";
import path from "path";
import Image from "next/image";
import PageIntro from "../../components/PageIntro";
import MarqueeSection from "../../components/MarqueeSection";
import styles from "./about.module.css";
import { getCheckpointNoteDefinitions, getCheckpointPostsMeta, renderMarkdown } from "../../lib/posts";
import AnnotatedContent from "../../components/AnnotatedContent";
import BadgeImage from "../../components/BadgeImage";
import { getBadges } from "../../lib/badges";
import { formatAchievementDate } from "../../lib/format";
import { getTravelMemories } from "../../lib/travel";
import badgeStyles from "../checkpoints/checkpoints.module.css";

export const metadata = { title: "About" };

function WavingFlag({ code, name }: { code: string; name: string }) {
  const height = ({ my: 150, be: 260, ch: 300, de: 180 } as Record<string, number>)[code] ?? 200;
  return (
    <span className={styles.flagMount}>
      <span className={styles.flagFabric}>
        <Image src={`/flags/${code}.svg`} alt={`Flag of ${name}`} width={300} height={height} />
      </span>
    </span>
  );
}

export default function AboutPage() {
  const badges = getBadges(getCheckpointPostsMeta()).filter((badge) => badge.status === "earned");
  const travelMemories = getTravelMemories();
  const biography = fs.readFileSync(path.join(process.cwd(), "content", "about.md"), "utf8");
  const { html } = renderMarkdown(biography, getCheckpointNoteDefinitions());
  return (
    <main id="main-content" className="page about-page">
      <PageIntro className="page-heading">
          <p className="eyebrow">THE PERSON BEHIND THE NOTES</p>
          <h1>Hello, I’m Lit En<span className="accent">.</span></h1>
          <p className="about-tagline">Analyse problems. Design solutions. Keep learning.</p>
      </PageIntro>
      <MarqueeSection title="Badges I’ve earned" label="Earned badges" expandLabel="See all badges" entries={badges.map((badge) => ({ id: badge.id, name: badge.name, image: badge.image, href: `/checkpoints/${badge.id}/` }))}>
        <ul className={badgeStyles.earnedBadges} aria-label="All earned badges">
          {badges.map((badge) => <li key={badge.id}>
            <a href={`/checkpoints/${badge.id}/`}>
              <BadgeImage badge={badge} />
              <span className={badgeStyles.earnedName}>{badge.name}</span>
              {badge.achieved && <time dateTime={badge.achieved}>{formatAchievementDate(badge.achieved)}</time>}
            </a>
          </li>)}
        </ul>
      </MarqueeSection>
      <div id="biography" className={styles.biography}>
        <AnnotatedContent>
          <div className="post-content" dangerouslySetInnerHTML={{ __html: html }} />
          <MarqueeSection title="Places I’ve been" label="Open travel memories by destination" expandLabel="See all flags" entries={travelMemories.map((place) => ({ id: place.code, name: place.name, image: `/flags/${place.code}.svg`, noteId: `travel-${place.code}`, content: <WavingFlag code={place.code} name={place.name} /> }))}>
            <ul className={styles.travelFlags} aria-label="All travel destinations">
              {travelMemories.map((place) => <li key={place.code}>
                <button type="button" className={styles.destination} data-note={`travel-${place.code}`} aria-haspopup="dialog" aria-label={`Travel memories: ${place.name}`}>
                  <WavingFlag code={place.code} name={place.name} />
                  <span className={styles.countryName}>{place.name}</span>
                </button>
              </li>)}
            </ul>
          </MarqueeSection>
          {travelMemories.map((place) => <template key={place.code} id={`travel-${place.code}`} data-note-title={place.name}
            dangerouslySetInnerHTML={{ __html: `<div role="note">${place.html}</div>` }} />)}
        </AnnotatedContent>
      </div>
    </main>
  );
}
