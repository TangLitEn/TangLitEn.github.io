import { getCheckpointPostsMeta } from "../lib/posts";
import { getBadges } from "../lib/badges";
import PostIndex from "./PostIndex";

export default function LifeCheckpoints() {
  const posts = getCheckpointPostsMeta();
  const badges = getBadges(posts);
  return <PostIndex posts={posts} badges={badges} collection="checkpoints" />;
}
