import Link from "next/link";
import { getAllPostsMeta } from "../../lib/posts";
import { tagSlug } from "../../lib/format";

export const metadata = { title: "Tags" };
export default function TagsPage() {
  const posts = getAllPostsMeta();
  const tags = Array.from(new Set(posts.flatMap((post) => post.tags))).sort();
  return <main id="main-content" className="page narrow-page"><div className="page-heading"><p className="eyebrow">FOLLOW A THREAD</p><h1>Tags<span className="accent">.</span></h1><p>Different interests. A few connecting threads.</p></div><div className="tag-directory">{tags.map((tag) => <Link key={tag} href={`/tags/${tagSlug(tag)}/`}><span>{tag}</span><span>{posts.filter((post) => post.tags.includes(tag)).length} entries <span aria-hidden="true">↗</span></span></Link>)}</div></main>;
}
