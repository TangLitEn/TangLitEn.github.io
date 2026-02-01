import BlogList from "../../components/BlogList";
import { getAllPostsMeta } from "../../lib/posts";

export const metadata = { title: "Blog — Lit En" };

export default function BlogIndexPage() {
  const posts = getAllPostsMeta();

  return (
    <main style={{ padding: "28px 0 52px" }}>
      <h1 style={{ margin: "0 0 10px" }}>Blog</h1>
      <p style={{ margin: "0 0 18px", color: "rgba(255,255,255,0.65)" }}>
        Writing to think. Systems, UX, learning, and long-term building.
      </p>
      <BlogList posts={posts} />
    </main>
  );
}
