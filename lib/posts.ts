import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Marked, Renderer } from "marked";
import { isSimulationName, simulations, type SimulationName } from "./simulations";

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
  checkpoint: boolean;
  readingMinutes: number;
};

export type SearchEntry = PostMeta & { searchText: string };
export type Heading = { id: string; text: string; depth: number };
export type PostBlock =
  | { type: "html"; html: string }
  | { type: "simulation"; name: SimulationName; id: string; acceptLegacyQuery: boolean };
export type RenderedPost = { html: string; headings: Heading[]; blocks: PostBlock[] };

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

  if (input.startsWith("/") || input.startsWith("#")) return true;

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
  const input = value instanceof Date ? value.toISOString().slice(0, 10) : typeof value === "string" ? value.trim() : "";
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
      return matter(fs.readFileSync(path.join(POSTS_DIR, `${slug}.md`), "utf8")).data.draft !== true;
    });
}

export function getAllPostsMeta(): PostMeta[] {
  const slugs = getAllPostSlugs();
  const all = slugs.map((slug) => getPostBySlug(slug).meta);
  return all.sort((a, b) => normalizeDate(b.date).localeCompare(normalizeDate(a.date)));
}

export function getNotebookPostsMeta(): PostMeta[] {
  return getAllPostsMeta().filter((post) => !post.checkpoint);
}

export function getCheckpointPostsMeta(): PostMeta[] {
  return getAllPostsMeta().filter((post) => post.checkpoint);
}

export function getSearchIndex(): SearchEntry[] {
  return getAllPostsMeta().map((meta) => {
    const { html } = getPostBySlug(meta.slug);
    return { ...meta, searchText: `${meta.title} ${meta.description} ${meta.tags.join(" ")} ${html.replace(/<[^>]*>/g, " ")}`.toLowerCase() };
  });
}

export function getPostBySlug(slug: string): RenderedPost & { meta: PostMeta } {
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
    image,
    checkpoint: data.checkpoint === true,
    readingMinutes: Math.max(1, Math.ceil(content.split(/\s+/).length / 220))
  };

  return { meta, ...renderMarkdown(content) };
}

export function renderMarkdown(content: string): RenderedPost {
  const marked = new Marked();
  const headings: Heading[] = [];
  const headingIds = new Set<string>();
  function uniqueId(base: string) {
    let id = base;
    let suffix = 2;
    while (headingIds.has(id)) id = `${base}-${suffix++}`;
    headingIds.add(id);
    return id;
  }
  const notes = new Map<string, string>();
  const noteNumbers = new Map<string, number>();
  const noteReferences = new Map<string, number>();
  {
    const renderer = new Renderer();
    renderer.html = () => "";
    renderer.heading = (text, depth, raw) => {
      const base = raw.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || "section";
      const id = uniqueId(base);
      if (depth === 2 || depth === 3) headings.push({ id, text: raw.replace(/[*_`]/g, ""), depth });
      return `<h${depth} id="${id}">${text}</h${depth}>`;
    };
    renderer.link = (href, title, text) => {
      const resolved = resolveMarkedArg(href, title, text);
      if (!resolved.href || !isSafeUrl(resolved.href)) return escapeAttr(resolved.text);

      const isExternal = /^https?:\/\//i.test(resolved.href);
      const safeHref = escapeAttr(resolved.href);
      const safeTitle = resolved.title ? ` title="${escapeAttr(resolved.title)}"` : "";
      const relAttr = isExternal ? ' rel="noreferrer noopener"' : "";
      const targetAttr = isExternal ? ' target="_blank"' : "";

      return `<a href="${safeHref}"${safeTitle}${targetAttr}${relAttr}>${resolved.text}</a>`;
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
        {
          name: "simulationBlock",
          level: "block",
          start(src: string) { return src.match(/^::: simulation\b/m)?.index; },
          tokenizer(src: string) {
            const match = /^::: simulation[ \t]+([a-z0-9-]+)[ \t]*\n:::[ \t]*(?:\n|$)/.exec(src);
            if (!match) return;
            return { type: "simulationBlock", raw: match[0], name: match[1] };
          },
          renderer() {
            throw new Error("Place simulation blocks between paragraphs, outside lists, quotes, and other containers.");
          },
        },
        {
          name: "sidenoteDefinition",
          level: "block",
          start(src: string) { return src.match(/^\[\^[a-zA-Z0-9_-]+\]:/m)?.index; },
          tokenizer(src: string) {
            const match = /^\[\^([a-zA-Z0-9_-]+)\]:[ \t]+([^\n]*(?:\n(?: {4}|\t)[^\n]*)*)(?:\n|$)/.exec(src);
            if (!match) return;
            notes.set(match[1], match[2].replace(/\n(?: {4}|\t)/g, " "));
            return { type: "sidenoteDefinition", raw: match[0] };
          },
          renderer() { return ""; },
        },
        {
          name: "sidenoteReference",
          level: "inline",
          start(src: string) { return src.indexOf("[^"); },
          tokenizer(src: string) {
            const match = /^\[\^([a-zA-Z0-9_-]+)\]/.exec(src);
            if (match) return { type: "sidenoteReference", raw: match[0], label: match[1] };
          },
          renderer(token: unknown) {
            const { label } = token as { label: string };
            const body = notes.get(label);
            if (body === undefined) return escapeHtml(`[^${label}]`);
            if (!noteNumbers.has(label)) noteNumbers.set(label, noteNumbers.size + 1);
            const number = noteNumbers.get(label);
            const occurrence = (noteReferences.get(label) ?? 0) + 1;
            noteReferences.set(label, occurrence);
            const reference = `<sup class="sidenote-ref" id="snref-${label}-${occurrence}"><a href="#sn-${label}" aria-label="Read note ${number}">${number}</a></sup>`;
            if (occurrence > 1) return reference;
            // Definitions are inline Markdown; disable recursive note references.
            const noteHtml = marked.parseInline(body.replace(/\[\^([a-zA-Z0-9_-]+)\]/g, "($1)")) as string;
            return `${reference}<span class="sidenote" id="sn-${label}" role="note" tabindex="-1" aria-label="Note ${number}"><span class="sidenote-number">${number}</span><span>${noteHtml} <a class="sidenote-back" href="#snref-${label}-1" aria-label="Back to reference ${number}">↩</a></span></span>`;
          },
        },
        {
          name: "chipLink",
          level: "inline",
          start(src: string) {
            return src.match(/\[\[/)?.index;
          },
          tokenizer(src: string) {
            const rule = /^\[\[([^\]|]+)\|([^\]]+)\]\]/;
            const match = rule.exec(src);
            if (!match) return;
            const [, label, href] = match;
            if (!label || !href) return;
            if (!isSafeUrl(href.trim())) return;
            return {
              type: "chipLink",
              raw: match[0],
              text: label.trim(),
              href: href.trim(),
            };
          },
          renderer(token: unknown) {
            const typed = token as { text?: string; href?: string };
            if (!typed.text || !typed.href || !isSafeUrl(typed.href)) return "";
            const safeText = escapeHtml(typed.text);
            const safeHref = escapeAttr(typed.href);
            const isExternal = /^https?:\/\//i.test(typed.href);
            const relAttr = isExternal ? ' rel="noreferrer noopener"' : "";
            const targetAttr = isExternal ? ' target="_blank"' : "";
            return `<a class="md-chip" href="${safeHref}"${targetAttr}${relAttr}>${safeText}</a>`;
          },
        },
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
            const watchUrl = `https://www.youtube.com/watch?v=${safeId}`;
            return `<div class="md-embed-lite" data-embed="${safeEmbed}" data-watch="${escapeAttr(
              watchUrl
            )}">
  <img class="md-embed-lite-thumb" src="${thumb}" alt="YouTube thumbnail" />
  <a class="md-embed-lite-button" href="${escapeAttr(
    watchUrl
  )}" target="_blank" rel="noreferrer noopener" aria-label="Play video">
    <span class="md-embed-lite-icon"></span>
  </a>
  <a class="md-embed-lite-link" href="${escapeAttr(
    watchUrl
  )}" target="_blank" rel="noreferrer noopener">Open on YouTube</a>
</div>`;
          },
        },
      ],
    });
  }

  // Lex the whole document once so reference links and note definitions work
  // across simulations. Split only at top-level tokens, never inside HTML.
  const tokens = marked.lexer(content);
  const blocks: PostBlock[] = [];
  const occurrences = new Map<SimulationName, number>();
  let pending: typeof tokens = Object.assign([], { links: tokens.links });
  function flushMarkdown() {
    if (!pending.length) return;
    const html = sanitizeHtml(marked.parser(pending));
    if (html.trim()) blocks.push({ type: "html", html });
    pending = Object.assign([], { links: tokens.links });
  }
  for (const token of tokens) {
    if (token.type !== "simulationBlock") {
      pending.push(token);
      continue;
    }
    flushMarkdown();
    const name = token.name as string;
    if (!isSimulationName(name)) {
      throw new Error(`Unknown simulation "${name}". Available simulations: ${Object.keys(simulations).join(", ")}.`);
    }
    const occurrence = (occurrences.get(name) ?? 0) + 1;
    occurrences.set(name, occurrence);
    const definition = simulations[name];
    const id = uniqueId(definition.anchor);
    blocks.push({ type: "simulation", name, id, acceptLegacyQuery: occurrence === 1 });
    headings.push({ id, text: definition.title, depth: 2 });
  }
  flushMarkdown();
  const html = blocks.map((block) => block.type === "html" ? block.html : `<h2 id="${block.id}">${escapeHtml(simulations[block.name].title)}</h2>`).join("\n");
  return { html, headings, blocks };
}
