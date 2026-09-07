import Image from "next/image";
import Link from "next/link";
import { CONTACT } from "../../data/contact";
import { renderMarkdown } from "../../lib/posts";

export const metadata = { title: "About" };
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

[^ntu]: I graduated as valedictorian with Highest Distinction (CGPA 4.79/5.00). [The checkpoint](/blog/ntu-valedictorian/).
[^garage]: “The place where I call home in NTU.” Some of my best memories are from [Garage@EEE](/blog/garage-eee/).
`;
export default function AboutPage() {
  const { html } = renderMarkdown(biography);
  return <main id="main-content" className="page about-page"><div className="page-heading about-heading"><div><p className="eyebrow">THE PERSON BEHIND THE NOTES</p><h1>Hello, I’m Lit En<span className="accent">.</span></h1><p>Analyse problems. Design solutions. Keep learning.</p></div><Image src="/avatar.png" alt="Lit En" width={104} height={104} /></div><div className="article-layout"><article className="post-content" dangerouslySetInnerHTML={{ __html: html }} /></div><div className="about-connect"><Link className="underlined-link" href="/checkpoints/">Explore my life checkpoints ↗</Link><a className="underlined-link" href={`mailto:${CONTACT.email}`}>Get in touch ↗</a></div></main>;
}
