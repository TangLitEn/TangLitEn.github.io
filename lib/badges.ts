import fs from "fs";
import path from "path";
import type { PostMeta } from "./posts";

export type Badge = {
  id: string;
  name: string;
  image: string;
  status: "earned" | "wip";
  checkpoints: string[];
};

// Only filenames from this directory define badges; no separate registry or status.
export function getBadges(posts: PostMeta[], directory = path.join(process.cwd(), "public", "badges")): Badge[] {
  const files = fs.existsSync(directory)
    ? fs.readdirSync(directory, { withFileTypes: true })
      .filter((entry) => entry.isFile() && /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(entry.name))
      .map((entry) => entry.name).sort()
    : [];
  const checkpoints = posts.filter((post) => post.checkpoint);
  const ids = new Set<string>();
  const badges = files.map((file) => {
    const stem = path.parse(file).name;
    const id = stem.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!id || ids.has(id)) throw new Error(`Badge image needs a unique name: ${file}`);
    ids.add(id);
    const linked = checkpoints.filter((post) => post.badges.includes(file)).map((post) => post.slug);
    return {
      id,
      name: stem.replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
      image: `/badges/${encodeURIComponent(file)}`,
      status: linked.length ? "earned" as const : "wip" as const,
      checkpoints: linked,
    };
  });
  for (const post of checkpoints) {
    for (const file of post.badges) {
      if (!files.includes(file)) throw new Error(`Checkpoint "${post.slug}" references missing badge image "${file}". Add it to public/badges or fix the badges header.`);
    }
  }
  return badges;
}
