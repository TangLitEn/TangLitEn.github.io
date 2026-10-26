# Lit En’s personal notebook

This site turns Markdown files in `content/blog/` into blog posts and files in `content/checkpoints/` into life checkpoint stories. You write Markdown, preview locally, then publish through the existing GitHub Pages workflow. No CMS or database is needed.

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

The filename determines the URL: `my-first-note.md` becomes `/blog/my-first-note/`. Use lowercase letters, numbers, and hyphens, with the `.md` extension. Put blog files directly in `content/blog/` and life checkpoint files directly in `content/checkpoints/`; nested folders are not scanned. Filenames must be unique across both folders, including drafts. Both collections retain `/blog/<filename>/` article URLs, so moving an existing post between folders preserves its links. Titles and body text can contain other languages, including Chinese.

Renaming a file changes its URL and can break old links. Editing its title does not change its URL.

## All post options

The settings at the top are YAML **front matter**. These fields are supported by blogs and checkpoints as indicated:

| Field | Example | Behavior when omitted |
| --- | --- | --- |
| `title` | `title: "Learning in public"` | Uses the filename without `.md`. Set this for every post. |
| `date` | `date: "2026-09-07"` | Falls back to `1970-01-01`. Set this for every post. |
| `description` | `description: "A short introduction to this note."` | No summary text. Used in post listings, the article introduction, and page metadata. |
| `tags` | `tags: ["Learning", "Research"]` | Blog only. No tags by default; tags link to the filtered Posts timeline. Ignored for checkpoints. |
| `image` | `image: "/blog/my-note/cover.jpg"` | No cover image. Used above the article and on its checkpoint entry. |
| `logo` | `logo: "/post-logos/my-tool.svg"` | Square icon in the post list, article heading, and Posts marquee. Blog posts default to a notebook icon; checkpoint articles use their badge. |
| `draft` | `draft: true` | Defaults to `false`: the post is included in the website. |

The Posts and About pages share a full-width strip beneath their introduction. Collections with fewer than eight unique items appear once as a static row; eight or more loop through the strip. The threshold is `MIN_MARQUEE_ITEMS` in `components/LogoMarquee.tsx`. Reduced-motion preferences always disable scrolling animation.

Use real YAML booleans, `true` and `false`, **without quotes**. `draft: "true"` is a string and will not hide a post.

Quote titles, descriptions, and dates, especially text containing `:` or `#`. For a long description, YAML can join several lines into one paragraph:

```yaml
description: >-
  A note about an engineering problem,
  what I tried, and what changed my understanding.
```

Field names start at the left edge. The text below `>-` is indented by two spaces.

Dates accept `"2026"`, `"2026-09"`, or `"2026-09-07"`. Missing month/day values become January/the first day for sorting. Displayed dates currently show the month and year, even when a full date is supplied. Use valid calendar dates. Posts sort newest first.

Blog tags are an array. Life checkpoints do not use tags. You can also write:

```yaml
tags:
  - "Learning"
  - "Research"
```

Keep tag spelling and capitalization consistent. Repeated identical tags on one post are removed automatically; avoid creating separate tags such as `NTU` and `ntu`, because their page URLs both become lowercase.

The two collections are separate:

- `content/blog/`: blog posts, shown in the Posts timeline.
- `content/checkpoints/`: life checkpoint stories, referenced by notes in About and excluded from the notebook.

The folder determines the collection; no `checkpoint` frontmatter field is needed. Only checkpoint files support `badges`, an optional array of image paths such as `badges: ["Brains/NTU.png"]`. Omit it when a checkpoint is not yet assigned to a badge. Blog files do not use `checkpoint` or `badges`.

Both use the same Markdown format and keep their `/blog/filename/` article URLs. Search covers both and labels each result. Notebook tag links open the Posts timeline with tag and year filters saved in the URL. About weaves checkpoint stories into the biography as notes that open on click. TINKRR, Learnr, and MediaTek are retained as drafts and excluded from the published site.

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
[Another post](/blog/markov-chains/)
[About and life checkpoints](/about/)
[A section below](#what-i-learned)
[Download my PDF](/files/my-paper.pdf)
```

External HTTP/HTTPS links open in a new tab. Internal links stay in the current tab. Put downloadable files in `public/`, for example `public/files/my-paper.pdf`, then link without the `public` prefix.

Use `/` at the beginning of site links. Paths such as `../learnr/` or `my-paper.pdf` are not supported by the current link renderer. `mailto:` and `tel:` links are also not supported inside post Markdown; the site's existing contact links are managed separately.

Headings get automatic anchors: `## What I learned` becomes `#what-i-learned`. Duplicate headings receive suffixes such as `#what-i-learned-2`. For predictable anchors, use simple heading text and avoid inline formatting in headings.

For a small button-style link, use the site's custom syntax:

```markdown
[[Visit Learnr|https://www.learnr.sg/]]
[[Back to About|/about/#biography]]
```

This requires both a label and a URL separated by `|`. It is not wiki-link syntax; `[[A post title]]` alone does not link to another post.

## Personal side notes

Add a reference immediately after the relevant thought, then define the note at the bottom of the file:

```markdown
I graduated from NTU.[^graduation]

[^graduation]: **2024-05**

    I graduated as valedictorian with Highest Distinction (CGPA 4.79/5.00).

    ![Graduation photograph](/images/graduation.jpg)
```

Notes stay closed by default on every screen size. Click a number to open a popup; close it with **Close**, **Escape**, or a click outside the popup. Keyboard focus returns to the number when the popup closes. Images inside a note can be clicked or activated with the keyboard for a larger view.

Numbers are assigned by first reference, and repeated references share the same note. Labels may contain letters, numbers, hyphens, and underscores; they are case-sensitive. An undefined reference remains visible as literal `[^label]` text.

Definitions support paragraphs, images, emphasis, links, lists, tables, code, and the existing media and YouTube blocks. Indent each continuation line by four spaces (or a tab), leaving a blank line between paragraphs. Nested note references are rendered as plain text, and simulations belong in the main article body.

Edit the biography in [content/about.md](content/about.md). References matching a published checkpoint filename, such as `[^ntu-valedictorian]`, automatically use that story’s front-matter date, Markdown body, and cover image from `content/checkpoints/`. Drafts are excluded. Add a custom definition at the end of `content/about.md` to override a story note, or to add a standalone comment using the example above. After adding a new checkpoint, weave its reference into a relevant sentence in the biography.

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

This excludes the post from Posts, Life checkpoints, tag pages, header search, and generated article routes. It is excluded in both development and production. There is no separate unlisted-but-accessible mode.

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
| Posts timeline | Non-draft files in `content/blog/`, grouped by year, newest first |
| Timeline year | The post's `date` |
| Life checkpoint stories | Non-draft files in `content/checkpoints/`, referenced in the About biography |
| Blog tag filters | The `tags` arrays in `content/blog/` |
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
| New post is missing or returns 404 | Check `draft`, filename spelling, `.md` extension, and that the file is directly in `content/blog/` or `content/checkpoints/`. Refresh or restart the preview after adding a new file. |
| Post unexpectedly appears on the website | Use `draft: true`, not `draft: "true"`, `hidden: true`, or `published: false`. |
| Post is missing from the notebook | Place it in `content/blog/` and ensure `draft` is not `true`. |
| Post does not appear in Life checkpoints | Place it in `content/checkpoints/`, ensure it is not a draft, and add a matching `[^filename]` reference in `content/about.md`. |
| Date shows 1970 | Supply a quoted, valid date in the supported format. |
| Front matter causes an error | Check the opening/closing `---`, quote strings containing colons, and use spaces instead of tabs for YAML indentation. |
| Image is missing | Check that it exists under `public/`, that the URL omits `public`, and that capitalization matches. |
| Side note stays as `[^label]` | Check the matching definition, allowed label characters, and a space after its colon. |
| Media/video syntax appears as text | Put opening and closing `:::` on their own lines and use the exact supported block name. |
| Local changes are absent from the live site | Local preview and builds do not publish. Check the push to `main` and the Pages deployment in Actions. |
| Development server cannot acquire a lock | Use the existing preview or stop that server before starting another. |

## Where to edit other content

### Interactive blog projects

The uniform plane wave project is embedded at `/blog/uniform-plane-waves/` and
published by this site's existing GitHub Pages workflow. It needs no separate
deployment, iframe, or running backend.

- `content/blog/uniform-plane-waves.md` owns the title, date, tags, and explanatory
  notes. It participates in the notebook, search, and tag listings like any post.
- `lib/simulations.ts` lists supported simulation names, titles, and anchor
  bases. `components/blog/experiments.tsx` maps those names to trusted React
  components. Register a new simulation in both files; it can then be reused
  in any post without registering individual post slugs.
- `components/blog/uniform-plane-waves/` owns the controls, numeric input,
  animated canvas, scoped CSS module, and upstream MIT license. Styles inherit
  the notebook's theme variables without changing global selectors.
- `lib/uniform-plane-waves/physics.ts` holds the independent calculations.
- `tests/uniform-plane-waves/` preserves the source project's physics regression
  tests. Run them with `npm run test:upw`; the Pages workflow also runs them.

Place a marker on its own lines wherever you want a simulation between
paragraphs. You can repeat it as many times as needed in the same post:

```md
An introduction to the boundary.

::: simulation uniform-plane-waves
:::

Compare another setup below.

::: simulation uniform-plane-waves
:::

Your conclusions.
```

Currently `uniform-plane-waves` and `markov-chain` are available simulation names. A name refers
to the registered component, not the Markdown filename. Repeated instances
have independent controls, anchors, and share links. New share links restore
the selected instance; older links without an instance parameter still restore
the first wave simulator. They share that instance's settings, not the entire
page's experiment state. Sharing parameters currently applies to the wave simulator.

The post at `/blog/markov-chains/` embeds the Markov graph builder with
`::: simulation markov-chain`. Its two inputs accept spreadsheet clipboard TSV
or quoted CSV. Its default online-course example uses entirely fictional data.
The transition table is the first input and defines every state and edge;
optional time data is the second input. Empty or invalid time data never hides
valid transitions. Force-directed layout combines attraction, repulsion, and
collision spacing, then expands the canvas to contain the entire graph.
Adjust State spacing or use Actual size to inspect larger graphs. Up to 200
states and 2,000 distinct edges are supported. PNG resolution follows the
expanded canvas; very large exports scale down to fit raster browser limits.
The graph uses the full preview width; styling controls sit in a collapsed
panel below it. Select or click a state to emphasize its incoming and outgoing
connections. All other transitions remain visible with reduced opacity.
Automatic labels appear on focus when there are more than 20 transitions;
choose Show all in Graph styling for every label in the all-states overview.
Export current view PNG preserves focus, fading, visible labels, and dragged
positions. Select All states to export an overview. Export every state ZIP
creates one focused PNG per graph state, with numbered filenames, using a
snapshot of the current positions and styling. It preserves the selected view,
reports progress, and can be cancelled without downloading a partial archive.
The assignment table lists every graph state in its first column, including
states without time. Choose a workflow time row from the adjacent dropdown.
Automatic suggestions stay editable; ambiguous matches are left unassigned.
Each time row can belong to one state; selecting it elsewhere moves it, so its
minutes are never counted twice. Unused time rows are listed separately.
Select supplied
probabilities or normalization from counts, adjust graph styling, drag nodes,
and export PNG at 1×, 2×, or 3× resolution. Matching and export run locally.
Missing time is represented separately from zero, and incomplete outgoing
probabilities are reported without inventing edges. Editing either input
table resets manual name overrides. Controls and input tables are independent
for repeated instances; reloading the page restores the example.

`lib/markov-chain/` owns parsing, name matching, layout, sample data, and PNG
export. `components/blog/markov-chain/` owns the interface, SVG graph, and scoped
styles. Run `npm run test:markov` for regression checks; the Pages workflow also
runs them.

Markers must be top-level blocks, outside lists and quotes. Inside fenced or
indented code examples they remain literal text. An unknown simulation name
produces a descriptive build error. A post without markers has no simulations.

`lib/posts.ts` parses the whole document before splitting it into ordered text
and simulation blocks, so headings, reference links, and side notes work across
the insertions. `components/blog/PostBody.tsx` renders these blocks in order,
using the normal article width for prose and the full available width for
simulations. `PostView` retains the shared article header, contents, and image
lightbox. The contents list follows document order, with unique anchors for
repeated simulations (`#explore`, `#explore-2`, and so on, avoiding heading
collisions). New simulation components receive `instanceId` and
`acceptLegacyQuery` props and must keep their controls' IDs and state independent.

Copied from [UPW_Visualization](https://github.com/TangLitEn/UPW_Visualization).
Future changes in that repository are not synchronized automatically.

### Site-wide content

| Content | File |
| --- | --- |
| Welcome and notebook sidebar | `app/page.tsx` |
| About biography, notes, and page layout | `content/about.md`, `app/about/page.tsx`, and `components/AnnotatedContent.tsx` |
| FAQ questions, answers, and layout | `data/faq.ts`, `app/faq/page.tsx`, and `app/faq/faq.module.css` |
| Travel destinations, dated photos, and captions | `lib/travel.ts` and `content/travel/<country-code>.md` |
| Shared portrait, Malaysia/Singapore flags, and bilingual motto on Posts and About | `components/ProfileSignature.tsx` and `components/ProfileSignature.module.css` |
| Legacy checkpoint routes and badge story pages | `app/checkpoints/page.tsx` and `app/checkpoints/[badge]/page.tsx` |
| Shared year-grouped timelines and URL filters | `components/PostIndex.tsx` |
| Tag destination links | `lib/format.ts` |
| Floating back-to-top button | `components/BackToTop.tsx` |
| Email and social links | `data/contact.ts` |
| Organization links | `data/organisations.ts` |
| Header navigation and search | `components/NavBar.tsx` |
| Layout, typography, mobile rules | `styles/globals.css` |
| Markdown rendering and custom syntax | `lib/posts.ts` |
| Site title, description, and share metadata | `app/layout.tsx` |

The header has Posts, About, and FAQ tabs, in that order. Edit FAQ questions and answers in `data/faq.ts`; each question expands when clicked. About includes the checkpoint stories as biography notes, closed by default. The old `/checkpoints/` and `/timeline/` routes forward to `/about/#biography`; existing `/blog/<slug>/` article URLs and individual badge pages remain available.

Notebook tag links use `/?tag=Research#posts`; an optional `year` parameter combines with the tag filter. Checkpoint stories do not use tags.

### Checkpoint badges

Place artwork in `public/Badges R1/Brains/` or `public/Badges R1/Brawls/`. Edit names and achievement dates in `public/Badges R1/badges.md`, using image paths relative to that folder:

```yaml
---
badges:
  Brains/NTU.png:
    name: "NTU EEE Valedictorian"
    achieved: "2024"
  Brawls/FBS_400kg.png:
    name: "FBS_400kg"
    achieved: "2025-08-23"
---
```

The folder determines the category. Dates accept quoted years (`YYYY`), months (`YYYY-MM`), or full dates (`YYYY-MM-DD`) and preserve that precision on the page. Each category sorts newest first; year-only dates sort after more precise dates in the same year. Undated badges sort last, with ties sorted by name.

An achievement date marks a badge as earned even before stories are added. A badge with neither an achievement date nor a published story is WIP. Story publication dates never substitute for an achievement date.

To nest a story beneath a badge, create its Markdown file in `content/checkpoints/` and reference the image path in its frontmatter:

```yaml
badges: ["Brains/NTU.png"]
```

Only published life checkpoints are linked. One badge can collect several stories; a story can reference multiple badges. The 16 current stories are referenced in the About biography. Badge associations remain available for existing badge URLs.

Each legacy badge URL opens its own `/checkpoints/<badge-id>/` page with its achievement date and related stories, newest first. Badges without written stories show “Story coming soon”. Badge IDs come from image filenames without extensions; filenames must produce unique IDs across both folders. Missing image references or invalid dates fail the build with a descriptive error.

About starts with an earned-badge strip. Each badge links to its existing story page, and “See all badges” expands the full grid with names and achievement dates.

The biography includes an “Exploring the world” paragraph, followed by the “Places I’ve been” flag strip. Click a flag in the strip or expanded grid to open that country’s travel memories. Popups stay closed by default and support multiple entries in date → image → caption order, with enlarged images on click. Laos and Thailand reuse existing trip photos; other countries show “More memories to come” until their files are added.

Write travel memories in `content/travel/<country-code>.md`, for example `fr.md` for France. Use a date heading, a normal Markdown image, and a paragraph for the caption, then repeat for another memory. Put new photos in `public/travel/<country-code>/`. The [travel authoring guide](content/travel/README.md) has a copyable example and the full country-code list. Edit or reorder destinations in `lib/travel.ts`.

“See all flags” expands a stationary grid; the strip pauses on hover or keyboard focus and supports manual scrolling with reduced motion enabled. The compact Singapore and Malaysia flags beneath the portrait are managed in `components/ProfileSignature.tsx`. Local flag artwork lives in `public/flags/`; travel styles are in `app/about/about.module.css`, and shared profile styles are in `components/ProfileSignature.module.css`.

Run `npm run test:content` to check badge dates, ordering, artwork paths, all story assignments, archived posts, and content rules.
