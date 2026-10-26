import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getDraftPostSlugs, getPostBySlug } from "../../../lib/posts";
import PostView from "../../../components/PostView";
import PostBody from "../../../components/blog/PostBody";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getDraftPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!getDraftPostSlugs().includes(slug)) notFound();
  const { meta } = getPostBySlug(slug);
  return { title: `${meta.title} · Draft`, description: meta.description, robots: { index: false, follow: false } };
}

export default async function DraftPostPage({ params }: Props) {
  const { slug } = await params;
  if (!getDraftPostSlugs().includes(slug)) notFound();
  const post = getPostBySlug(slug);
  return <main id="main-content" className="page article-page">
    <Link href="/drafts/" className="back-link">← Back to draft posts</Link>
    <p className="eyebrow">WIP · This draft is still taking shape.</p>
    <PostView post={{ meta: post.meta, headings: post.headings }}><PostBody blocks={post.blocks} /></PostView>
  </main>;
}
