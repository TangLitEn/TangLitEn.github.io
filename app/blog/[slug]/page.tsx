import { notFound } from "next/navigation";
import Link from "next/link";
import { getBadges } from "../../../lib/badges";
import { getAllPostSlugs, getPostBySlug } from "../../../lib/posts";
import PostView from "../../../components/PostView";
import PostBody from "../../../components/blog/PostBody";
import PostBackLink from "../../../components/PostBackLink";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return getAllPostSlugs().map((slug) => ({ slug })); }
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  if (!getAllPostSlugs().includes(slug)) notFound();
  const { meta } = getPostBySlug(slug);
  return { title: meta.title, description: meta.description, alternates: { canonical: `/blog/${slug}/` }, openGraph: { title: meta.title, description: meta.description, type: "article", publishedTime: meta.date, authors: ["Lit En"] } };
}
export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  if (!getAllPostSlugs().includes(slug)) notFound();
  const post = getPostBySlug(slug);
  const badge = post.meta.checkpoint ? getBadges([post.meta]).find((item) => item.checkpoints.includes(slug)) : undefined;
  return <main id="main-content" className="page article-page">
    {post.meta.checkpoint ? <Link className="back-link" href={badge ? `/checkpoints/${badge.id}/` : "/checkpoints/"}>
      ← Back to {badge?.name ?? "Checkpoint"}
    </Link> : <PostBackLink slug={slug} />}
    <PostView post={{ meta: post.meta, headings: post.headings }}><PostBody blocks={post.blocks} /></PostView>
  </main>;
}
