import { notFound } from "next/navigation";
import { getAllPostSlugs, getPostBySlug } from "../../../lib/posts";

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug?: string }> | { slug?: string };
}) {
  // Next 16 sometimes provides params as a Promise
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug;

  if (!slug || slug === "undefined") notFound();

  const post = getPostBySlug(slug);

  return (
    <main style={{ padding: "28px 0 52px" }}>
      <a href="/blog/" style={{ color: "rgba(255,255,255,0.65)" }}>
        ← Back to Blog
      </a>

      <h1 style={{ margin: "14px 0 6px" }}>{post.meta.title}</h1>
      <div style={{ color: "rgba(255,255,255,0.65)", marginBottom: 18 }}>
        {post.meta.date}
        {post.meta.tags?.length ? ` · ${post.meta.tags.join(" · ")}` : ""}
      </div>

      <article
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 14,
          padding: 18,
        }}
        dangerouslySetInnerHTML={{ __html: post.html }}
      />
    </main>
  );
}
