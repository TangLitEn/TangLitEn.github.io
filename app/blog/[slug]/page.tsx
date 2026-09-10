import { notFound } from "next/navigation";
import { getAllPostSlugs, getPostBySlug } from "../../../lib/posts";
import PostView from "../../../components/PostView";
import { getPostExperiment } from "../../../components/blog/experiments";

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
  const experiment = getPostExperiment(slug);
  if (experiment) post.headings.unshift(experiment.heading);
  return <main id="main-content" className="page article-page"><PostView post={post}>{experiment && <experiment.Component />}</PostView></main>;
}
