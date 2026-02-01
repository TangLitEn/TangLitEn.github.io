import Hero from "../components/Hero";
import TimelineSection from "../components/TimelineSection";
import BlogList from "../components/BlogList";
import { getAllPostsMeta } from "../lib/posts";

export default function HomePage() {
  const posts = getAllPostsMeta().slice(0, 3);

  return (
    <main style={{ padding: "28px 0 52px" }}>
      <Hero />

      <hr />

      <section>
        <h2 style={{ margin: "0 0 10px" }}>Current timeline</h2>
        <p style={{ margin: "0 0 18px", color: "rgba(255,255,255,0.65)" }}>
          What I’m building and what I’ve shipped. Toggle between timeline view and list view.
        </p>
        <TimelineSection compact />
        <div style={{ marginTop: 14 }}>
          <a href="/timeline/">View full timeline →</a>
        </div>
      </section>

      <hr />

      <section>
        <h2 style={{ margin: "0 0 10px" }}>Blog</h2>
        <p style={{ margin: "0 0 18px", color: "rgba(255,255,255,0.65)" }}>
          Notes on systems, UX, learning, and building products.
        </p>
        <BlogList posts={posts} />
        <div style={{ marginTop: 14 }}>
          <a href="/blog/">View all posts →</a>
        </div>
      </section>

      <hr />

      <section>
        <h2 style={{ margin: "0 0 10px" }}>Contact</h2>
        <p style={{ margin: "0 0 18px", color: "rgba(255,255,255,0.65)" }}>
          Want to collaborate, jam on ideas, or chat about product systems?
        </p>
        <a href="/contact/">Go to contact page →</a>
      </section>
    </main>
  );
}
