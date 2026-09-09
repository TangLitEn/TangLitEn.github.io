import TagCloud from "../../components/TagCloud";
import { getNotebookPostsMeta, getCheckpointPostsMeta } from "../../lib/posts";
import { timelineHref } from "../../lib/format";

export const metadata = { title: "Tags" };
export default function TagsPage() {
  const collections = [
    { title: "Posts", description: "Research notes and questions I’m exploring.", posts: getNotebookPostsMeta(), checkpoint: false },
    { title: "Life checkpoints", description: "People, projects, and moments from my life.", posts: getCheckpointPostsMeta(), checkpoint: true },
  ];
  return <main id="main-content" className="page tags-page">
    <div className="page-heading"><p className="eyebrow">FOLLOW A THREAD</p><h1>Tags<span className="accent">.</span></h1><p>Choose a tag to explore its timeline. Bigger bubbles hold more entries.</p></div>
    {collections.map((collection) => <section className="tag-collection" key={collection.title}>
      <h2>{collection.title}</h2><p className="tag-collection-description">{collection.description}</p>
      {collection.posts.length > 0 && <TagCloud label={collection.title} tags={Array.from(new Set(collection.posts.flatMap((post) => post.tags))).sort((a, b) => a.localeCompare(b)).map((tag) => ({
        label: tag,
        count: collection.posts.filter((post) => post.tags.includes(tag)).length,
        href: timelineHref(tag, collection.checkpoint),
      }))} />}
      {!collection.posts.length && <p className="empty-state">No tags yet.</p>}
    </section>)}
  </main>;
}
