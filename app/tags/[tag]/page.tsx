import Link from "next/link";
import { notFound } from "next/navigation";
import PostIndex from "../../../components/PostIndex";
import { getAllPostsMeta } from "../../../lib/posts";

const getTags = () => Array.from(new Set(getAllPostsMeta().flatMap((post) => post.tags)));
export function generateStaticParams() { return getTags().map((tag) => ({ tag: tag.toLowerCase() })); }
export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  return { title: `Tagged ${getTags().find((item) => item.toLowerCase() === tag) ?? tag}` };
}
export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag: slug } = await params;
  const tag = getTags().find((item) => item.toLowerCase() === slug);
  if (!tag) notFound();
  const taggedPosts = getAllPostsMeta().filter((post) => post.tags.includes(tag));
  const notebook = taggedPosts.filter((post) => !post.checkpoint);
  const checkpoints = taggedPosts.filter((post) => post.checkpoint);
  return <main id="main-content" className="page narrow-page"><Link className="back-link" href="/tags/">← All tags</Link><div className="page-heading"><p className="eyebrow">FILED UNDER</p><h1>{tag}<span className="accent">.</span></h1><p>Notes, projects, and memories connected by {tag}.</p></div>{notebook.length > 0 && <div className="tag-collection"><h2>Notebook</h2><PostIndex posts={notebook} initialTag={tag} /></div>}{checkpoints.length > 0 && <div className="tag-collection"><h2>Life checkpoints</h2><PostIndex posts={checkpoints} initialTag={tag} collection="checkpoints" /></div>}</main>;
}
