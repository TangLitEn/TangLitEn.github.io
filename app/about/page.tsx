import Image from "next/image";
import PageIntro from "../../components/PageIntro";
import MarqueeSection from "../../components/MarqueeSection";
import styles from "./about.module.css";
import { renderMarkdown } from "../../lib/posts";

export const metadata = { title: "About" };

const travelFlags = [
  { code: "la", name: "Laos" },
  { code: "th", name: "Thailand" },
  { code: "tw", name: "Taiwan" },
  { code: "id", name: "Indonesia" },
  { code: "fr", name: "France" },
  { code: "be", name: "Belgium" },
  { code: "de", name: "Germany" },
  { code: "it", name: "Italy" },
  { code: "ch", name: "Switzerland" },
  { code: "cn", name: "China" },
  { code: "mo", name: "Macao" },
  { code: "hk", name: "Hong Kong" },
  { code: "vn", name: "Vietnam" },
  { code: "kr", name: "South Korea" },
];

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

const biography = `## A little about me

I’m a graduate of Nanyang Technological University (NTU) in Electrical & Electronic Engineering, where I was actively involved in student leadership and hands-on projects.[^ntu]

Along the way, I’ve learned that I thrive in high-agency environments — places where ideas move fast, ownership matters, and systems can be continuously improved.

## Engineering & building

I joined Micron as a HVM Process Integration Engineer, using data analytics to identify problems and propose solutions.

Together with my friends, I started Learnr in March 2023 to explore better learning experiences through interactive content, discussion, and structured knowledge pathways.

With TINKRR, I’m designing a life OS that turns personal tracking into a coherent, gamified system: time, health, habits, and progress.

## The people along the way

Garage@EEE was a place to spark ideas with my friends and learn.[^garage] My university years also included leading orientation programmes, the Machine Learning and Data Analytics Lab, and community work in Laos.

Before university, I was a Sin Chew Daily cadet reporter, organising camps and learning to lead a team.

Read the stories behind these moments on my [Checkpoint page](/checkpoints/), from student reporting and university life to engineering and the projects I’m building now.

[^ntu]: I graduated as valedictorian with Highest Distinction (CGPA 4.79/5.00). [The checkpoint](/blog/ntu-valedictorian/).
[^garage]: “The place where I call home in NTU.” Some of my best memories are from [Garage@EEE](/blog/garage-eee/).
`;
export default function AboutPage() {
  const { html } = renderMarkdown(biography);
  return (
    <main id="main-content" className="page about-page">
      <PageIntro className="page-heading">
          <p className="eyebrow">THE PERSON BEHIND THE NOTES</p>
          <h1>Hello, I’m Lit En<span className="accent">.</span></h1>
          <p className="about-tagline">Analyse problems. Design solutions. Keep learning.</p>
      </PageIntro>
      <MarqueeSection title="Places I’ve been" label="Travel flags" expandLabel="See all flags" entries={travelFlags.map((flag) => ({ id: flag.code, name: flag.name, image: `/flags/${flag.code}.svg`, content: <WavingFlag code={flag.code} name={flag.name} /> }))}>
          <ul className={styles.travelFlags} aria-label="All travel destinations">
            {travelFlags.map((flag) => (
              <li key={flag.code}>
                <WavingFlag code={flag.code} name={flag.name} />
                <span className={styles.countryName}>{flag.name}</span>
              </li>
            ))}
          </ul>
      </MarqueeSection>
      <div id="biography" className="article-layout">
        <article className="post-content" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </main>
  );
}
