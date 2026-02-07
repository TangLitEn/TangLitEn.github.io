import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked, Renderer } from "marked";

const POSTS_DIR = path.join(process.cwd(), "content", "blog");
const VALID_SLUG_REGEX = /^[a-z0-9-]+$/;
const VALID_DATE_REGEX = /^\d{4}(?:-\d{2}){0,2}$/;

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  description: string;
  image?: string;
};

const sanitizeHtml = (html: string): string => {
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

const isSafeUrl = (value: string): boolean => {
  const input = value.trim();
  if (!input) return false;

  if (input.startsWith("/")) return true;

  try {
    const url = new URL(input);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const normalizeDate = (value: unknown): string => {
  const input = typeof value === "string" ? value.trim() : "";
  if (!VALID_DATE_REGEX.test(input)) return "1970-01-01";

  const [year, month = "01", day = "01"] = input.split("-");
  return `${year}-${month}-${day}`;
};

const assertValidSlug = (slug: string): void => {
  if (!VALID_SLUG_REGEX.test(slug)) {
    throw new Error(`Invalid slug "${slug}". Expected lowercase letters, numbers, and hyphens.`);
  }
};

const resolveMarkedArg = (
  href: unknown,
  title: unknown,
  text: unknown
): { href: string; title?: string; text: string } => {
  if (href && typeof href === "object") {
    const token = href as { href?: unknown; title?: unknown; text?: unknown };
    return {
      href: typeof token.href === "string" ? token.href : "",
      title: typeof token.title === "string" ? token.title : undefined,
      text: typeof token.text === "string" ? token.text : ""
    };
  }

  return {
    href: typeof href === "string" ? href : "",
    title: typeof title === "string" ? title : undefined,
    text: typeof text === "string" ? text : ""
  };
};

export function getAllPostSlugs(): string[] {
  const files = fs.readdirSync(POSTS_DIR).filter((file) => file.endsWith(".md"));

  return files
    .map((file) => file.replace(/\.md$/, ""))
    .filter((slug) => {
      if (!VALID_SLUG_REGEX.test(slug)) {
        console.warn(`[posts] Skipping invalid slug from filename: "${slug}"`);
        return false;
      }
      return true;
    });
}

export function getAllPostsMeta(): PostMeta[] {
  const slugs = getAllPostSlugs();
  const all = slugs.map((slug) => getPostBySlug(slug).meta);
  return all.sort((a, b) => normalizeDate(b.date).localeCompare(normalizeDate(a.date)));
}

export function getPostBySlug(slug: string): { meta: PostMeta; html: string } {
  assertValidSlug(slug);

  const fullPath = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Post not found for slug "${slug}"`);
  }
  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);

  const tags =
    Array.isArray(data.tags) && data.tags.length
      ? [...new Set(data.tags.map((tag) => String(tag).trim()).filter(Boolean))]
      : [];
  const image = typeof data.image === "string" && isSafeUrl(data.image) ? data.image : undefined;

  const meta: PostMeta = {
    slug,
    title: String(data.title ?? slug).trim() || slug,
    date: normalizeDate(data.date),
    tags,
    description: String(data.description ?? "").trim(),
    image
  };

  const renderer = new Renderer();
  renderer.html = () => "";
  renderer.link = (href, title, text) => {
    const resolved = resolveMarkedArg(href, title, text);
    if (!resolved.href || !isSafeUrl(resolved.href)) return escapeAttr(resolved.text);

    const isExternal = /^https?:\/\//i.test(resolved.href);
    const safeHref = escapeAttr(resolved.href);
    const safeTitle = resolved.title ? ` title="${escapeAttr(resolved.title)}"` : "";
    const relAttr = isExternal ? ' rel="noreferrer noopener"' : "";
    const targetAttr = isExternal ? ' target="_blank"' : "";

    return `<a href="${safeHref}"${safeTitle}${targetAttr}${relAttr}>${escapeAttr(resolved.text)}</a>`;
  };
  renderer.image = (href, title, text) => {
    const resolved = resolveMarkedArg(href, title, text);
    if (!resolved.href || !isSafeUrl(resolved.href)) return "";
    const safeTitle = resolved.title ? ` title="${escapeAttr(resolved.title)}"` : "";
    const safeText = resolved.text ? escapeAttr(resolved.text) : "";
    const safeSrc = escapeAttr(resolved.href);
    return `<img src="${safeSrc}" alt="${safeText}"${safeTitle} style="max-width:100%;height:auto;cursor:zoom-in;" />`;
  };

  const html = sanitizeHtml(marked.parse(content, { renderer }) as string);
  return { meta, html };
}
