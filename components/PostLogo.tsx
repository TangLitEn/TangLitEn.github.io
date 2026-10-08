import Image from "next/image";
import type { PostMeta } from "../lib/posts";

export default function PostLogo({ post }: { post: Pick<PostMeta, "logo" | "title"> }) {
  if (!post.logo) return null;
  return <Image className="post-logo" src={post.logo} alt="" width={96} height={96} />;
}
