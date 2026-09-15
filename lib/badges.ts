import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { PostMeta } from "./posts";

export type Badge = {
  id: string;
  name: string;
  achieved: string | null;
  image: string;
  status: "earned" | "wip";
  checkpoints: string[];
};

// Images define badges; flags.md supplies captions keyed by image filename.
export function getBadges(posts: PostMeta[], directory = path.join(process.cwd(), "public", "badges")): Badge[] {
  const files = fs.existsSync(directory)
    ? fs.readdirSync(directory, { withFileTypes: true })
      .filter((entry) => entry.isFile() && /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(entry.name))
      .map((entry) => entry.name).sort()
    : [];
  const metadataPath = path.join(directory, "flags.md");
  const metadataByFile = fs.existsSync(metadataPath) ? matter(fs.readFileSync(metadataPath, "utf8")).data.flags ?? {} : {};
  if (typeof metadataByFile !== "object" || Array.isArray(metadataByFile)) {
    throw new Error("flags.md: flags must be a mapping keyed by image filename.");
  }
  for (const [file, metadata] of Object.entries(metadataByFile)) {
    if (!files.includes(file)) throw new Error(`flags.md references missing badge image "${file}".`);
    if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
      throw new Error(`flags.md: "${file}" must contain name and/or achieved fields.`);
    }
  }
  const checkpoints = posts.filter((post) => post.checkpoint);
  const ids = new Set<string>();
  const badges = files.map((file) => {
    const stem = path.parse(file).name;
    const id = stem.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!id || ids.has(id)) throw new Error(`Badge image needs a unique name: ${file}`);
    ids.add(id);
    const metadata = metadataByFile[file] ?? {};
    if (metadata.name != null && (typeof metadata.name !== "string" || !metadata.name.trim())) {
      throw new Error(`flags.md: "${file}" name must be a non-empty string.`);
    }
    const achieved = metadata.achieved == null || metadata.achieved === "" ? null : metadata.achieved;
    if (achieved !== null && (typeof achieved !== "string" || !/^[0-9]{4}-(0[1-9]|1[0-2])$/.test(achieved))) {
      throw new Error(`flags.md: "${file}" achieved must be a quoted month in YYYY-MM format, or blank.`);
    }
    const linkedPosts = checkpoints.filter((post) => post.badges.includes(file));
    const linked = linkedPosts.map((post) => post.slug);
    const firstMonth = linkedPosts.map((post) => post.date.slice(0, 7))
      .filter((date) => /^[0-9]{4}-(0[1-9]|1[0-2])$/.test(date)).sort()[0] ?? null;
    return {
      id,
      name: metadata.name?.trim() ?? stem.replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
      achieved: linked.length ? achieved ?? firstMonth : null,
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
  return badges.sort((a, b) => (b.achieved ?? "").localeCompare(a.achieved ?? "") || a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
}
