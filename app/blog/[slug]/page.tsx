import { notFound } from "next/navigation";
import { getAllPostSlugs, getPostBySlug } from "../../../lib/posts";
import PostView from "../../../components/PostView";

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
      <a href="/timeline/" style={{ color: "rgba(255,255,255,0.65)" }}>
        ← Back to Timeline
      </a>

      <PostView post={post} />
    </main>
  );
}
