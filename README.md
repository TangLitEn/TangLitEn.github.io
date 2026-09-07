# Lit En’s personal notebook

A reading-focused Next.js site published to **https://tangliten.github.io** through GitHub Pages. Posts and a year-based archive share the home page. Search stays in the header and searches titles, descriptions, tags, and post text. Life checkpoints and tags have their own pages.

## Publish a Markdown post

Create a file in `content/blog/`, such as `learning-in-public.md`:

```markdown
---
title: "Learning in public"
date: "2026-09-07"
tags: ["Learning", "Research"]
description: "A short summary of what this note explores."
draft: false
checkpoint: false
---

## The question

Write your note here. Standard Markdown supports headings, links, lists,
quotes, fenced code blocks, images, and tables.

Here is a thought with a personal comment.[^thought]

[^thought]: An aside, a source, or something I’m still thinking about.
    Indented continuation lines belong to the same note.
```

The filename becomes `/blog/learning-in-public/`. Use lowercase letters, numbers, and hyphens. Quote dates; `YYYY`, `YYYY-MM`, and `YYYY-MM-DD` work. Add an optional `image: "/blog/my-photo.jpg"` field for a cover image (place the image inside `public/`).

Posts appear automatically in the home page, archive, search, and their tag pages. Set `checkpoint: true` to also include a post in **Life checkpoints**. Existing entries have this flag. Set `draft: true` to exclude a draft from the exported site, search, tags, and archive. Keep private notes outside this public repository: the flag only hides them from the website.

### Personal side notes

Use standard footnote references, `[^label]`, with a matching definition, `[^label]: Your comment`, at the bottom of the file. Labels may contain letters, numbers, hyphens, and underscores. Notes support inline Markdown, including emphasis and links. Repeated references reuse the same note.

On wide screens, comments sit in the right margin beside their reference. On phones and tablets they appear directly in the reading flow, so no hover or horizontal scrolling is needed. Numbered links jump to the note; the return arrow jumps back. Long adjacent notes stack without overlap.

The About page demonstrates this layout using existing biographical details. Its copy lives in `app/about/page.tsx`.

### Existing media syntax

These formats continue to work:

```markdown
::: media
![Photo description](/blog/my-photo.jpg)
**Photo caption**
A few words about the photo.
:::

::: youtube-lite
https://www.youtube.com/watch?v=VIDEO_ID
:::

[[Project website|https://example.com]]
```

Use `youtube` in place of `youtube-lite` for an embedded player. Regular Markdown images and links work too. Raw HTML is disabled in posts.

## Local development and validation

```sh
npm ci
npm run dev
```

Open the local address printed by Next.js. Before publishing:

```sh
npm run test:content
npm run lint
npm run build
```

The build generates a static site in `out/`. After reviewing the changes, commit and push to `main`; `.github/workflows/pages.yml` builds and deploys to GitHub Pages. No server, database, or CMS is required. `/timeline/` remains available for existing bookmarks.
