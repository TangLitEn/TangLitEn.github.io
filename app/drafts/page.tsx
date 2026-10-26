import type { Metadata } from "next";
import Link from "next/link";
import { getDraftPostsMeta } from "../../lib/posts";
import { formatDate } from "../../lib/format";
import styles from "./drafts.module.css";

export const metadata: Metadata = {
  title: "Draft posts · The hidden notebook",
  description: "A little peek at the posts currently in progress.",
  robots: { index: false, follow: false },
};

export default function DraftPostsPage() {
  const posts = getDraftPostsMeta();
  return <main id="main-content" className="page">
    <Link href="/" className="back-link">← Back to posts</Link>
    <header className="article-heading">
      <p className="eyebrow">THE HIDDEN NOTEBOOK · WIP</p>
      <h1>Heehee, wow! You discovered a hidden page.</h1>
      <p className="article-description">These are the draft posts that are currently a work in progress. Ideas are still taking shape, so expect a few rough edges!</p>
    </header>
    <section className="post-index research-timeline" aria-labelledby="drafts-heading">
      <div className="index-toolbar">
        <h2 id="drafts-heading" className="timeline-heading">Draft posts</h2>
        <span className="entry-count">{posts.length} {posts.length === 1 ? "draft" : "drafts"}</span>
      </div>
      {posts.length ? posts.map((post) => <article className={`checkpoint ${styles.entry}`} key={post.slug}>
        <div className="checkpoint-copy">
          <div className="entry-meta"><span>WIP · Draft</span><span>·</span><time dateTime={post.date}>{formatDate(post.date, true)}</time></div>
          <h3><Link href={`/drafts/${post.slug}/`}>{post.title}</Link></h3>
          {post.description && <p>{post.description}</p>}
        </div>
      </article>) : <div className="empty-state"><h3>No drafts here right now.</h3><p>The dragon is keeping this spot warm for the next idea. Check back soon!</p></div>}
    </section>
  </main>;
}
