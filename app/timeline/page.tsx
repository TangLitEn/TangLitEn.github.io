import TimelineSection from "../../components/TimelineSection";
import { getAllPostsMeta } from "../../lib/posts";

export const metadata = { title: "Timeline — Lit En" };

export default function TimelinePage() {
  const posts = getAllPostsMeta();

  return (
    <main style={{ padding: "28px 0 52px" }}>
      <h1 style={{ margin: "0 0 10px" }}>Timeline</h1>
      <p style={{ margin: "0 0 18px", color: "rgba(255,255,255,0.65)" }}>
        Posts, projects, and learning arcs — all in one stream.
      </p>
      <TimelineSection posts={posts} />
    </main>
  );
}
