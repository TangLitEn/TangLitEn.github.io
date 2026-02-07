import { notFound } from "next/navigation";
import Link from "next/link";
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
  if (!getAllPostSlugs().includes(slug)) notFound();

  let post;
  try {
    post = getPostBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <main style={{ padding: "28px 0 52px" }}>
      <Link href="/timeline/" style={{ color: "rgba(255,255,255,0.65)" }}>
        ← Back to Timeline
      </Link>

      <PostView post={post} />
    </main>
  );
}
