import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked, Renderer } from "marked";

const POSTS_DIR = path.join(process.cwd(), "content", "blog");

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  description: string;
  image?: string;
};

const sanitizeHtml = (html: string) => {
  let output = html;
  output = output.replace(
    /<(script|style|iframe|object|embed|link|meta)\b[\s\S]*?>[\s\S]*?<\/\1>/gi,
    ""
  );
  output = output.replace(/<(script|style|iframe|object|embed|link|meta)\b[^>]*?>/gi, "");
  output = output.replace(/\son\w+="[^"]*"/gi, "");
  output = output.replace(/\son\w+='[^']*'/gi, "");
  output = output.replace(/\son\w+=\S+/gi, "");
  output = output.replace(/\b(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi, '$1=""');
  output = output.replace(/\b(href|src)\s*=\s*(['"])\s*data:[\s\S]*?\2/gi, '$1=""');
  return output;
};

const escapeAttr = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export function getAllPostSlugs(): string[] {
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  return files.map((f) => f.replace(/\.md$/, ""));
}

export function getAllPostsMeta(): PostMeta[] {
  const slugs = getAllPostSlugs();
  const all = slugs.map((slug) => getPostBySlug(slug).meta);
  return all.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): { meta: PostMeta; html: string } {
  const fullPath = path.join(POSTS_DIR, `${slug}.md`);
  const raw = fs.readFileSync(fullPath, "utf8");

  const { data, content } = matter(raw);

  const meta: PostMeta = {
    slug,
    title: String(data.title ?? slug),
    date: String(data.date ?? "1970-01-01"),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    description: String(data.description ?? ""),
    image: typeof data.image === "string" ? data.image : undefined
  };

  const renderer = new Renderer();
  renderer.image = (href: any, title?: any, text?: any) => {
    const resolvedHref =
      typeof href === "string"
        ? href
        : href && typeof href === "object"
          ? href.href
          : "";
    const resolvedTitle =
      href && typeof href === "object" && typeof href.title === "string" ? href.title : title;
    const resolvedText =
      href && typeof href === "object" && typeof href.text === "string" ? href.text : text;

    if (!resolvedHref) return "";

    const safeTitle = resolvedTitle ? ` title="${escapeAttr(resolvedTitle)}"` : "";
    const safeText = resolvedText ? escapeAttr(resolvedText) : "";
    const safeSrc = escapeAttr(resolvedHref);
    return `<img src="${safeSrc}" alt="${safeText}"${safeTitle} style="max-width:100%;height:auto;cursor:zoom-in;" />`;
  };
  const html = sanitizeHtml(marked.parse(content, { renderer }) as string);
  return { meta, html };
}
