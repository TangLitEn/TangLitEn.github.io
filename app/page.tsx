import Image from "next/image";
import Link from "next/link";
import PostIndex from "../components/PostIndex";
import MailingList from "../components/MailingList";
import { getNotebookPostsMeta } from "../lib/posts";
import { ORGANISATION_CHIPS } from "../data/organisations";
import { tagSlug } from "../lib/format";

export default function HomePage() {
  const posts = getNotebookPostsMeta();
  const tags = Array.from(new Set(posts.flatMap((post) => post.tags))).sort();
  return <main id="main-content" className="page home-page">
    <section className="home-intro">
      <div><p className="eyebrow">A PERSONAL NOTEBOOK</p><h1>Learning, building,<br />figuring things out<span className="accent">.</span></h1>
      <p className="intro-copy">Hi, I’m Lit En. An engineer who likes to analyse problems and design solutions. This is where I keep my learning notes, research, and questions I’m exploring.</p>
      <Link className="underlined-link" href="/about/">A little more about me <span aria-hidden="true">↗</span></Link></div>
      <div className="portrait"><Image src="/avatar.png" alt="Lit En" width={120} height={120} priority /><span>永远在学习<br /><small>Always learning.</small></span></div>
    </section>
    <div className="notebook-layout">
      <PostIndex posts={posts} />
      <aside className="notebook-sidebar" aria-label="Notebook margin">
        <section className="margin-section"><p className="eyebrow">IN THE MARGINS</p><p className="margin-thought">“I thrive in places where ideas move fast, ownership matters, and systems can be continuously improved.”</p><Link href="/about/" className="small-link">A note about me ↗</Link></section>
        <section className="margin-section"><p className="eyebrow">THINGS I’M PART OF</p>{ORGANISATION_CHIPS.map((org) => <a className="organisation-link" key={org.name} href={org.href} target="_blank" rel="noreferrer noopener"><span>{org.name}</span><span aria-hidden="true">↗</span></a>)}</section>
        <section className="margin-section"><p className="eyebrow">EXPLORE BY TOPIC</p><div className="sidebar-tags">{tags.map((tag) => <Link href={`/tags/${tagSlug(tag)}/`} key={tag}>{tag}<span>{posts.filter((post) => post.tags.includes(tag)).length}</span></Link>)}</div></section>
        <section className="margin-section margin-checkpoints"><span className="tiny-star" aria-hidden="true">✳</span><h2>A few moments<br />that shaped me.</h2><p>People, projects, and places along the way.</p><Link className="underlined-link" href="/about/#checkpoints">Life checkpoints ↗</Link></section>
        <MailingList compact />
      </aside>
    </div>
  </main>;
}
