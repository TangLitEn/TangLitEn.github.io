import Hero from "../components/Hero";
import TimelineSection from "../components/TimelineSection";
import { getAllPostsMeta } from "../lib/posts";
import Link from "next/link";

export default function HomePage() {
  const posts = getAllPostsMeta();

  return (
    <main style={{ padding: "28px 0 52px" }}>
      <Hero />

      <hr />

      <section>
        <h2 style={{ margin: "0 0 10px" }}>Current timeline</h2>
        <p style={{ margin: "0 0 18px", color: "rgba(255,255,255,0.65)" }}>
          Writing, shipping, and systems I’m building.
        </p>
        <TimelineSection compact posts={posts} />
        <div style={{ marginTop: 14 }}>
          <Link href="/timeline/">View full timeline →</Link>
        </div>
      </section>

    </main>
  );
}
