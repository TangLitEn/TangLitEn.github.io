import PageIntro from "../components/PageIntro";
import PostIndex from "../components/PostIndex";
import MailingList from "../components/MailingList";
import MarqueeSection from "../components/MarqueeSection";
import { getNotebookPostsMeta } from "../lib/posts";

export default function HomePage() {
  const posts = getNotebookPostsMeta();
  return <main id="main-content" className="page home-page">
    <PageIntro className="home-intro">
      <p className="eyebrow">A PERSONAL NOTEBOOK</p><h1>Learning, building,<br />figuring things out<span className="accent">.</span></h1>
      <p className="intro-copy">Hi, I’m Lit En. An engineer who likes to analyse problems and design solutions. This is where I keep my learning notes, research, and questions I’m exploring.</p>
    </PageIntro>
    <MarqueeSection title="Tools, experiments & ideas" label="Open a post by its logo" entries={posts.map((post) => ({ id: post.slug, name: post.title, image: post.logo!, href: `/blog/${post.slug}/` }))} />
    <div className="notebook-layout">
      <PostIndex posts={posts} />
      <aside className="notebook-sidebar" aria-label="Notebook margin">
        <MailingList compact />
      </aside>
    </div>
  </main>;
}
