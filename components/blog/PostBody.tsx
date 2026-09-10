import type { PostBlock } from "../../lib/posts";
import { getSimulationComponent } from "./experiments";

export default function PostBody({ blocks }: { blocks: PostBlock[] }) {
  return blocks.map((block, index) => {
    if (block.type === "html") {
      return <div key={`text-${index}`} className="article-layout"><div className="post-content" dangerouslySetInnerHTML={{ __html: block.html }} /></div>;
    }
    const Simulation = getSimulationComponent(block.name);
    return <Simulation key={block.id} instanceId={block.id} acceptLegacyQuery={block.acceptLegacyQuery} />;
  });
}
