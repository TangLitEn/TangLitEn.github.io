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

const isSafeYouTubeEmbed = (value: string): boolean => {
  if (!value) return false;
  try {
    const url = new URL(value, "https://www.youtube.com");
    if (url.protocol !== "https:") return false;
    if (url.hostname === "www.youtube.com" || url.hostname === "youtube.com") {
      return url.pathname.startsWith("/embed/");
    }
    if (url.hostname === "www.youtube-nocookie.com" || url.hostname === "youtube-nocookie.com") {
      return url.pathname.startsWith("/embed/");
    }
    return false;
  } catch {
    return false;
  }
};

const sanitizeHtml = (html: string): string => {
  let output = html;
  output = output.replace(
    /<(script|style|object|embed|link|meta)\b[\s\S]*?>[\s\S]*?<\/\1>/gi,
    ""
  );
  output = output.replace(/<(script|style|object|embed|link|meta)\b[^>]*?>/gi, "");
  output = output.replace(/\son\w+="[^"]*"/gi, "");
  output = output.replace(/\son\w+='[^']*'/gi, "");
  output = output.replace(/\son\w+=\S+/gi, "");
  output = output.replace(/\b(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi, '$1=""');
  output = output.replace(/\b(href|src)\s*=\s*(['"])\s*data:[\s\S]*?\2/gi, '$1=""');
  output = output.replace(/<iframe\b([^>]*)>/gi, (match, attrs) => {
    const srcMatch = /\bsrc\s*=\s*(['"])([^'"]+)\1/i.exec(attrs);
    const src = srcMatch ? srcMatch[2] : "";
    if (!isSafeYouTubeEmbed(src)) return "";
    return `<iframe${attrs}>`;
  });
  output = output.replace(/<iframe\b[^>]*>\s*<\/iframe>/gi, (match) => match);
  return output;
};

const escapeAttr = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const escapeHtml = (value: string) =>
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

const getYouTubeEmbedUrl = (value: string): string | null => {
  const input = value.trim();
  if (!input) return null;

  try {
    const url = new URL(input, "https://www.youtube.com");
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.slice(1);
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (url.pathname.startsWith("/watch")) {
        const id = url.searchParams.get("v");
        return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
      }
      if (url.pathname.startsWith("/embed/")) {
        return `https://www.youtube-nocookie.com${url.pathname}`;
      }
      if (url.pathname.startsWith("/shorts/")) {
        const id = url.pathname.split("/").filter(Boolean)[1];
        return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
      }
    }
  } catch {
    return null;
  }

  return null;
};

const getYouTubeIdFromEmbed = (embedUrl: string): string | null => {
  try {
    const url = new URL(embedUrl);
    if (!url.pathname.startsWith("/embed/")) return null;
    const id = url.pathname.split("/").filter(Boolean)[1];
    return id || null;
  } catch {
    return null;
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

let markedConfigured = false;

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

  if (!markedConfigured) {
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

      return `<a href="${safeHref}"${safeTitle}${targetAttr}${relAttr}>${escapeAttr(
        resolved.text
      )}</a>`;
    };
    renderer.image = (href, title, text) => {
      const resolved = resolveMarkedArg(href, title, text);
      if (!resolved.href || !isSafeUrl(resolved.href)) return "";
      const safeTitle = resolved.title ? ` title="${escapeAttr(resolved.title)}"` : "";
      const safeText = resolved.text ? escapeAttr(resolved.text) : "";
      const safeSrc = escapeAttr(resolved.href);
      return `<img src="${safeSrc}" alt="${safeText}"${safeTitle} style="max-width:100%;height:auto;cursor:zoom-in;" />`;
    };

    const mediaBlock = {
      name: "mediaBlock",
      level: "block" as const,
      start(src: string) {
        return src.match(/:::\s*media/)?.index;
      },
      tokenizer(src: string) {
        const rule = /^:::\s*media\s*\n([\s\S]*?)\n:::\s*(?:\n|$)/;
        const match = rule.exec(src);
        if (!match) return;

        const body = match[1].trim();
        const imgRule = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)\s*\n?/;
        const imgMatch = imgRule.exec(body);
        if (!imgMatch) return;

        const [, alt, href, title] = imgMatch;
        let rest = body.slice(imgMatch[0].length).trim();

        let heading = "";
        const titleMatch = /^\*\*(.+?)\*\*\s*\n?/.exec(rest);
        if (titleMatch) {
          heading = titleMatch[1].trim();
          rest = rest.slice(titleMatch[0].length).trim();
        }

        return {
          type: "mediaBlock",
          raw: match[0],
          href,
          alt,
          title,
          heading,
          text: rest,
        };
      },
      renderer(token: {
        href: string;
        alt?: string;
        title?: string;
        heading?: string;
        text?: string;
      }) {
        const href = token.href?.trim() ?? "";
        if (!href || !isSafeUrl(href)) return "";
        const safeSrc = escapeAttr(href);
        const safeAlt = escapeAttr(token.alt ?? "");
        const safeTitle = token.title ? ` title="${escapeAttr(token.title)}"` : "";
        const heading = token.heading
          ? `<div class="md-media-title">${escapeHtml(token.heading)}</div>`
          : "";
        const desc = token.text
          ? `<div class="md-media-text">${marked.parseInline(token.text, { renderer })}</div>`
          : "";

        return `<div class="md-media">
  <div class="md-media-image">
    <img src="${safeSrc}" alt="${safeAlt}"${safeTitle} />
  </div>
  <div class="md-media-body">
    ${heading}
    ${desc}
  </div>
</div>`;
      },
    };

    marked.use({
      renderer,
      extensions: [
        mediaBlock,
        {
          name: "youtubeBlock",
          level: "block",
          start(src: string) {
            return src.match(/:::\s*youtube/)?.index;
          },
          tokenizer(src: string) {
            const rule = /^:::\s*youtube\s*\n([\s\S]*?)\n:::\s*(?:\n|$)/;
            const match = rule.exec(src);
            if (!match) return;
            const url = match[1].trim().split(/\s+/)[0];
            const embed = getYouTubeEmbedUrl(url);
            if (!embed) return;
            return {
              type: "youtubeBlock",
              raw: match[0],
              embed,
            };
          },
          renderer(token: unknown) {
            const typed = token as { embed?: string };
            if (!typed.embed || !isSafeYouTubeEmbed(typed.embed)) return "";
            const safeSrc = escapeAttr(typed.embed);
            return `<div class="md-embed">
  <iframe src="${safeSrc}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
</div>`;
          },
        },
        {
          name: "youtubeLiteBlock",
          level: "block",
          start(src: string) {
            return src.match(/:::\s*youtube-lite/)?.index;
          },
          tokenizer(src: string) {
            const rule = /^:::\s*youtube-lite\s*\n([\s\S]*?)\n:::\s*(?:\n|$)/;
            const match = rule.exec(src);
            if (!match) return;
            const url = match[1].trim().split(/\s+/)[0];
            const embed = getYouTubeEmbedUrl(url);
            if (!embed) return;
            const id = getYouTubeIdFromEmbed(embed);
            if (!id) return;
            return {
              type: "youtubeLiteBlock",
              raw: match[0],
              embed,
              id,
            };
          },
          renderer(token: unknown) {
            const typed = token as { embed?: string; id?: string };
            if (!typed.embed || !typed.id || !isSafeYouTubeEmbed(typed.embed)) return "";
            const safeEmbed = escapeAttr(typed.embed);
            const safeId = escapeAttr(typed.id);
            const thumb = `https://i.ytimg.com/vi/${safeId}/hqdefault.jpg`;
            return `<div class="md-embed-lite" data-embed="${safeEmbed}">
  <img class="md-embed-lite-thumb" src="${thumb}" alt="YouTube thumbnail" />
  <button class="md-embed-lite-button" type="button" aria-label="Play video">
    <span class="md-embed-lite-icon"></span>
  </button>
</div>`;
          },
        },
      ],
    });
    markedConfigured = true;
  }

  const html = sanitizeHtml(marked.parse(content) as string);
  return { meta, html };
}
