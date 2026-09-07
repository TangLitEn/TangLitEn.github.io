# Lit En’s personal notebook

This site turns files in `content/blog/` into posts. You write Markdown, preview locally, then publish through the existing GitHub Pages workflow. No CMS or database is needed.

This README is the authoring manual. [markdown-reference.md](content/blog/markdown-reference.md) is a copyable example post with `draft: true`. Read it in your editor or on GitHub; drafts do not have a page on the website, even in local development.

## Contents

- [Start and preview](#start-and-preview)
- [Create a post](#create-a-post)
- [All post options](#all-post-options)
- [Text, headings, and lists](#text-headings-and-lists)
- [Links and section anchors](#links-and-section-anchors)
- [Personal side notes](#personal-side-notes)
- [Images and captions](#images-and-captions)
- [Videos](#videos)
- [Code and tables](#code-and-tables)
- [Drafts and publishing](#drafts-and-publishing)
- [What is automatic](#what-is-automatic)
- [Current limitations](#current-limitations)
- [Troubleshooting](#troubleshooting)
- [Where to edit other content](#where-to-edit-other-content)

## Start and preview

From this project folder:

```sh
npm run dev
```

Open the **Local** URL printed in the terminal, usually `http://localhost:3000`. To test on your phone, connect to the same Wi-Fi and open the **Network** URL printed there. That address can change, so use the current terminal output.

If dependencies are missing, run `npm ci` first. If a preview is already running, use it; a second development server for the same project will report a `.next/dev/lock` error. Stop the existing server with **Ctrl+C** before starting another.

Saved changes normally update the preview. Refresh after adding or renaming Markdown files; restart the server if a new route still does not appear.

## Create a post

1. Create `content/blog/my-first-note.md`, or copy the [reference draft](content/blog/markdown-reference.md) to a new filename.
2. Fill in the settings between the two `---` lines at the very start of the file.
3. Write your Markdown below those settings.
4. Set `draft: false` to preview it on the website. Open `/blog/my-first-note/` or find it on the home page.

```markdown
---
title: "What I learned about learning"
date: "2026-09-07"
tags: ["Learning", "Research"]
description: "A short summary of the question, experiment, or idea."
draft: false
checkpoint: false
---

## The question

What am I trying to understand?

## What I learned

Explain the idea in my own words.[^reflection]

## Next steps

- Try a small experiment.
- Revisit the result later.

[^reflection]: My personal comment, uncertainty, or source goes here.
```

The filename determines the URL: `my-first-note.md` becomes `/blog/my-first-note/`. Use lowercase letters, numbers, and hyphens, with the `.md` extension. Put files directly in `content/blog/`; nested folders are not scanned. Titles and body text can contain other languages, including Chinese.

Renaming a file changes its URL and can break old links. Editing its title does not change its URL.

## All post options

The settings at the top are YAML **front matter**. These are all the fields currently supported:

| Field | Example | Behavior when omitted |
| --- | --- | --- |
| `title` | `title: "Learning in public"` | Uses the filename without `.md`. Set this for every post. |
| `date` | `date: "2026-09-07"` | Falls back to `1970-01-01`. Set this for every post. |
| `description` | `description: "A short introduction to this note."` | No summary text. Used in post listings, the article introduction, and page metadata. |
| `tags` | `tags: ["Learning", "Research"]` | No tags. Tags create their own pages automatically. |
| `image` | `image: "/blog/my-note/cover.jpg"` | No cover image. Used above the article and on its checkpoint entry. |
| `draft` | `draft: true` | Defaults to `false`: the post is included in the website. |
| `checkpoint` | `checkpoint: true` | Defaults to `false`: the post appears in Posts/Archive but not Life checkpoints. |

Use real YAML booleans, `true` and `false`, **without quotes**. `draft: "true"` is a string and will not hide a post.

Quote titles, descriptions, and dates, especially text containing `:` or `#`. For a long description, YAML can join several lines into one paragraph:

```yaml
description: >-
  A note about an engineering problem,
  what I tried, and what changed my understanding.
```

Field names start at the left edge. The text below `>-` is indented by two spaces.

Dates accept `"2026"`, `"2026-09"`, or `"2026-09-07"`. Missing month/day values become January/the first day for sorting. Displayed dates currently show the month and year, even when a full date is supplied. Use valid calendar dates. Posts sort newest first.

Tags are an array. You can also write:

```yaml
tags:
  - "Learning"
  - "Research"
```

Keep tag spelling and capitalization consistent. Repeated identical tags on one post are removed automatically; avoid creating separate tags such as `NTU` and `ntu`, because their page URLs both become lowercase.

The two collections are separate:

- `checkpoint: false` (or omitted): a notebook post, shown in Posts and Archive.
- `checkpoint: true`: a life checkpoint, shown in About’s timeline and excluded from the notebook.

Both use the same Markdown format and keep their `/blog/filename/` article URLs. Search covers both and labels each result. Tags are shared, with notebook posts and life checkpoints shown in separate groups on each tag page. All 15 original entries are life checkpoints; `protein-basics.md` is the notebook’s initial filler note.

Extra front-matter fields such as `author`, `slug`, `category`, `published`, `hidden`, or `readingTime` currently have no effect. Use `draft` to control inclusion and the filename to control the URL.

## Text, headings, and lists

Leave a blank line between paragraphs. A single newline normally continues the same paragraph. For a deliberate line break within a paragraph, end a line with a backslash:

```markdown
First line\
Second line

A separate paragraph with **bold**, *italic*, ~~strikethrough~~,
and `inline code`.
```

The site displays the front-matter title as the main heading. Start body sections with `##`:

```markdown
## Main section

### Subsection

#### Smaller heading
```

An **On this page** contents panel appears when the post has at least two `##` or `###` headings. Smaller headings do not enter that panel.

Lists, quotes, and separators:

```markdown
- One observation
- Another observation
  - A related detail

1. Define the problem.
2. Test an explanation.
3. Compare the result.

- [x] Read the paper
- [ ] Reproduce the experiment

> A quotation or a thought worth separating from the main text.

---
```

Task-list boxes show their saved state; they are not an interactive task tracker. Change `[ ]` to `[x]` in the Markdown to mark one complete.

## Links and section anchors

```markdown
[External source](https://example.com)
[Another post](/blog/learnr/)
[Life checkpoints](/about/#checkpoints)
[A section below](#what-i-learned)
[Download my PDF](/files/my-paper.pdf)
```

External HTTP/HTTPS links open in a new tab. Internal links stay in the current tab. Put downloadable files in `public/`, for example `public/files/my-paper.pdf`, then link without the `public` prefix.

Use `/` at the beginning of site links. Paths such as `../learnr/` or `my-paper.pdf` are not supported by the current link renderer. `mailto:` and `tel:` links are also not supported inside post Markdown; the site's existing contact links are managed separately.

Headings get automatic anchors: `## What I learned` becomes `#what-i-learned`. Duplicate headings receive suffixes such as `#what-i-learned-2`. For predictable anchors, use simple heading text and avoid inline formatting in headings.

For a small button-style link, use the site's custom syntax:

```markdown
[[Visit Learnr|https://www.learnr.sg/]]
[[Back to checkpoints|/about/#checkpoints]]
```

This requires both a label and a URL separated by `|`. It is not wiki-link syntax; `[[A post title]]` alone does not link to another post.

## Personal side notes

Add a reference immediately after the relevant thought, then define the note at the bottom of the file:

```markdown
This explanation seems useful.[^personal-note]

A later paragraph can refer to the same note again.[^personal-note]

[^personal-note]: I’m still testing this idea. Here is a [source](https://example.com).
    This continuation line starts with four spaces.
```

- Wide screens: the note sits in the right margin beside the first reference.
- Screens up to 900px wide: the note appears inline in the reading flow.
- Numbers are assigned automatically by first rendered reference; you do not need to number notes yourself.
- Repeated references point to the same note. The return arrow goes back to its first reference.
- Clicking a number highlights and jumps to its note; the sticky header leaves space above the destination.

Labels may contain `a–z`, `A–Z`, numbers, hyphens, and underscores. Labels are case-sensitive and should be unique within a post. Write a space after the definition's colon. An undefined reference remains visible as literal `[^label]` text.

Definitions support **inline** Markdown: emphasis, links, and inline code. Keep each note to one paragraph, optionally continued with four-space-indented lines. Nested notes, multiple paragraphs, tables, and fenced code blocks inside notes are not supported. For those, write a normal body section and link to it.

The [About page source](app/about/page.tsx) contains an example of real side notes using existing biographical details.

## Images and captions

Put images in a folder such as `public/blog/my-note/`. Prefer lowercase filenames with hyphens and no spaces; paths and filename capitalization must match exactly for GitHub Pages.

### Cover image

Add this to front matter:

```yaml
image: "/blog/my-note/cover.jpg"
```

The cover may be cropped to fit the article or timeline layout. Use a body image for diagrams that must remain fully visible.

### Body image

```markdown
![A clear description of the image](/blog/my-note/diagram.png)
```

Body images scale to the article width while preserving their aspect ratio. Clicking a body image or the cover opens a larger view. Close it with the **Close** button or **Escape**. Give each image meaningful alt text between `[` and `]`.

### Photo with a caption and description

```markdown
::: media
![The team after the event](/blog/my-note/team.jpg)
**The team**
A short description with *emphasis* or a [link](https://example.com).
:::
```

The image must be the first line inside the block. The bold caption and description are optional. Start each `:::` on its own line and leave blank lines around the block. The description supports inline formatting, not full nested sections or lists.

This format uses a cropped thumbnail beside the caption. Clicking it opens the full image. Use a normal body image for detailed charts and screenshots.

## Videos

Use a YouTube URL inside one of these blocks. Replace the example URL with the video you want to share.

### Thumbnail linking to YouTube

```markdown
::: youtube-lite
https://www.youtube.com/watch?v=aJ2kp675on8
:::
```

Shows a thumbnail and a play link. Clicking opens YouTube in a new tab; it does not turn into an inline player. This keeps the article lighter.

### Embedded player

```markdown
::: youtube
https://www.youtube.com/watch?v=aJ2kp675on8
:::
```

Shows an inline YouTube player using the `youtube-nocookie.com` embed host. Normal watch links, `youtu.be` short links, and YouTube Shorts links are accepted. Embedding also depends on the video's owner allowing it.

Custom video blocks currently support YouTube only. For other services, use a regular link. Pasted raw `<iframe>` HTML is disabled.

## Code and tables

Surround code with three backticks and optionally add a language name. For example:

````markdown
```python
scores = [0.72, 0.81, 0.86]
print(sum(scores) / len(scores))
```
````

Code preserves whitespace and scrolls horizontally on narrow screens. A language label is accepted, but syntax coloring and a copy button are not currently implemented.

Tables use pipes and a separator row:

```markdown
| Approach | Observation |
| --- | --- |
| Baseline | Simple to understand |
| Experiment | Needs more testing |
```

Wide tables scroll horizontally within the article. The current theme left-aligns table cells. Keep tables small enough to read comfortably on a phone.

## Drafts and publishing

### Keep a post off the website

Set:

```yaml
draft: true
```

This excludes the post from Posts, Archive, Life checkpoints, tag pages, header search, and generated article routes. It is excluded in both development and production. There is no separate unlisted-but-accessible mode.

To preview a draft as a webpage, temporarily set `draft: false` and visit its route locally. Change it back to `true` before publishing if it should stay hidden. You can always read a draft in your editor without changing the flag.

**Hidden from the website does not mean private.** A committed draft is still readable in this public GitHub repository. Files in `public/` are also published independently of the post's draft flag. Keep confidential material outside the repository.

The included `markdown-reference.md` is a non-confidential authoring example and is intentionally a draft. Leave its `draft: true` setting in place when publishing the site.

### Publish

1. Set `draft: false` on posts you want to publish.
2. Preview the post, its tags, images, side notes, and mobile layout.
3. Run the checks:

   ```sh
   npm run test:content
   npm run lint
   npm run build
   ```

4. Review your changes, commit, and push to `main`.
5. Check the repository's **Actions** tab for the GitHub Pages deployment to finish.

`npm run build` creates the static website in `out/`; it does not publish anything by itself. The existing `.github/workflows/pages.yml` deploys after a push to `main`. Edit source files, not `out/`.

Future dates do not schedule publication: a post with `draft: false` is included in the next build regardless of its date. Similarly, hiding a previously published post takes effect on the live site only after a new deployment.

## What is automatic

| Feature | Where its information comes from |
| --- | --- |
| Post URL | Markdown filename |
| Posts and Archive | Non-draft notebook posts (`checkpoint: false` or omitted), newest first |
| Archive year | The post's `date` |
| Life checkpoints on About | Non-draft posts with `checkpoint: true` |
| Topic filters and tag pages | The `tags` arrays; notebook filters use only notebook posts, tag pages group both collections separately |
| Header search | Titles, descriptions, tags, and rendered post text |
| Reading time | Approximate source word count divided by 220, rounded up; at least one minute |
| Author label | Currently fixed to Lit En |
| On this page | At least two level-2/level-3 headings |
| Side-note numbering | Order of first rendered reference |

## Current limitations

These features need additional implementation before they will work:

- LaTeX/KaTeX/MathJax equation rendering (`$...$` and `$$...$$` are not typeset).
- Mermaid diagrams (a `mermaid` code fence shows code, not a rendered diagram).
- MDX/React components, custom HTML, scripts, custom CSS, and pasted iframes inside Markdown.
- Automatic bibliographies or citation keys such as `[@paper]`; use links and side notes instead.
- Scheduled publication, password-protected posts, and directly accessible unlisted posts.
- Custom author, reading-time, or URL overrides in front matter.

For equations or diagrams today, include an image and a text explanation.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| New post is missing or returns 404 | Check `draft`, filename spelling, `.md` extension, and that the file is directly in `content/blog/`. Refresh or restart the preview after adding a new file. |
| Post unexpectedly appears on the website | Use `draft: true`, not `draft: "true"`, `hidden: true`, or `published: false`. |
| Post is missing from the notebook | Check that `checkpoint` is `false` or omitted, and `draft` is not `true`. |
| Post does not appear in Life checkpoints | Add `checkpoint: true` and ensure it is not a draft. |
| Date shows 1970 | Supply a quoted, valid date in the supported format. |
| Front matter causes an error | Check the opening/closing `---`, quote strings containing colons, and use spaces instead of tabs for YAML indentation. |
| Image is missing | Check that it exists under `public/`, that the URL omits `public`, and that capitalization matches. |
| Side note stays as `[^label]` | Check the matching definition, allowed label characters, and a space after its colon. |
| Media/video syntax appears as text | Put opening and closing `:::` on their own lines and use the exact supported block name. |
| Local changes are absent from the live site | Local preview and builds do not publish. Check the push to `main` and the Pages deployment in Actions. |
| Development server cannot acquire a lock | Use the existing preview or stop that server before starting another. |

## Where to edit other content

| Content | File |
| --- | --- |
| Welcome and notebook sidebar | `app/page.tsx` |
| About biography, side notes, and page layout | `app/about/page.tsx` |
| Life checkpoints section on About | `components/LifeCheckpoints.tsx` |
| Email and social links | `data/contact.ts` |
| Organization links | `data/organisations.ts` |
| Header navigation and search | `components/NavBar.tsx` |
| Layout, typography, mobile rules | `styles/globals.css` |
| Markdown rendering and custom syntax | `lib/posts.ts` |
| Site title, description, and share metadata | `app/layout.tsx` |

The old `/checkpoints/` and `/timeline/` routes forward older bookmarks to `/about/#checkpoints`. The header has one About tab for both the biography and life checkpoints.
