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
  category: "brains" | "brawls" | null;
};

function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}(?:-(?:0[1-9]|1[0-2])(?:-(?:0[1-9]|[12]\d|3[01]))?)?$/.test(value)) return false;
  const full = value.length === 4 ? `${value}-01-01` : value.length === 7 ? `${value}-01` : value;
  const parsed = new Date(`${full}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === full;
}

// Images live in Brains/Brawls; badges.md preserves their achievement dates.
export function getBadges(posts: PostMeta[], directory = path.join(process.cwd(), "public", "Badges R1")): Badge[] {
  const readImages = (folder: string, prefix = ""): string[] => fs.existsSync(folder)
    ? fs.readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
      const file = `${prefix}${entry.name}`;
      if (entry.isDirectory() && ["Brains", "Brawls"].includes(entry.name) && !prefix) {
        return readImages(path.join(folder, entry.name), `${file}/`);
      }
      return entry.isFile() && /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(entry.name) ? [file] : [];
    }).sort()
    : [];
  const files = readImages(directory);
  const metadataPath = path.join(directory, "badges.md");
  const metadataByFile = fs.existsSync(metadataPath) ? matter(fs.readFileSync(metadataPath, "utf8")).data.badges ?? {} : {};
  if (typeof metadataByFile !== "object" || Array.isArray(metadataByFile)) {
    throw new Error("badges.md: badges must be a mapping keyed by image path.");
  }
  for (const [file, metadata] of Object.entries(metadataByFile)) {
    if (!files.includes(file)) throw new Error(`badges.md references missing badge image "${file}".`);
    if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
      throw new Error(`badges.md: "${file}" must contain name and/or achieved fields.`);
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
    const category = file.startsWith("Brains/") ? "brains" as const : file.startsWith("Brawls/") ? "brawls" as const : null;
    if (metadata.name != null && (typeof metadata.name !== "string" || !metadata.name.trim())) {
      throw new Error(`badges.md: "${file}" name must be a non-empty string.`);
    }
    const achieved = metadata.achieved == null || metadata.achieved === "" ? null : metadata.achieved;
    if (achieved !== null && !validDate(achieved)) {
      throw new Error(`badges.md: "${file}" achieved must be a quoted date in YYYY, YYYY-MM, or YYYY-MM-DD format, or blank.`);
    }
    const linkedPosts = checkpoints.filter((post) => post.badges.includes(file))
      .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
    const linked = linkedPosts.map((post) => post.slug);
    return {
      id,
      name: metadata.name?.trim() ?? stem.replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
      achieved,
      image: `/Badges%20R1/${file.split("/").map(encodeURIComponent).join("/")}`,
      status: achieved !== null || linked.length ? "earned" as const : "wip" as const,
      checkpoints: linked,
      category,
    };
  });
  for (const post of checkpoints) {
    for (const file of post.badges) {
      if (!files.includes(file)) throw new Error(`Checkpoint "${post.slug}" references missing badge image "${file}". Add it to public/Badges R1 or fix the badges header.`);
    }
  }
  return badges.sort((a, b) => (b.achieved ?? "").localeCompare(a.achieved ?? "") || a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
}
