import { getCheckpointPostsMeta } from "../lib/posts";
import PostIndex from "./PostIndex";

export default function LifeCheckpoints() {
  return <PostIndex posts={getCheckpointPostsMeta()} collection="checkpoints" />;
}
