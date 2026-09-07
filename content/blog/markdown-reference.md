---
title: "Markdown reference — authoring examples"
date: "2026-09-07"
tags: ["Reference"]
description: "A copyable example of the Markdown features supported by this notebook."
image: "/images/graduation.jpg"
draft: true
checkpoint: false
---

This is a non-confidential authoring reference, hidden from the website by `draft: true`. Read it in your editor or on GitHub. The full authoring manual is in the repository's `README.md`.

To see this page in the local preview, temporarily set `draft: false` and open `/blog/markdown-reference/`. Restore `draft: true` before publishing the site. Drafts have no website route while hidden, including in local development. A draft committed to this public repository is not private.

Copy this file to a new lowercase, hyphenated `.md` filename when starting a post. Replace the title, date, tags, description, cover image, and example content. Set `checkpoint: true` only if it should also appear in Life checkpoints.

## Text and structure

A paragraph with **bold text**, *italic text*, ~~strikethrough~~, and `inline code`. Leave a blank line before the next paragraph.

A deliberate line break uses a trailing backslash.\
This starts a new line within the same paragraph.

### A subsection

Use `##` for main sections and `###` for subsections. The site already displays the front-matter title as the main heading. Two or more level-2/level-3 headings create an “On this page” panel.

- An observation
- Another observation
  - A supporting detail

1. Define the question.
2. Try an experiment.
3. Review the result.

- [x] Write a first draft
- [ ] Revisit the explanation

> A quotation or an aside set apart from the main text.

---

## Links

[Open an existing post](/blog/learnr/).

[Jump to the code section](#code).

[Visit Learnr](https://www.learnr.sg/).

A button-style project link:

[[Visit Learnr|https://www.learnr.sg/]]

Internal paths start with `/`. Standard post Markdown accepts HTTP/HTTPS, site paths, and `#section` links; it does not support `mailto:` links or relative paths such as `../another-post/`.

## Personal side notes

Add a comment immediately after a thought.[^reflection]

A second thought can have a different note.[^source]

A later paragraph can refer back to the first note without repeating it.[^reflection]

On wide screens, these notes sit in the right margin. On phones and tablets, they appear inline. Click a number to jump to its note, and the return arrow to jump back.

The definitions are at the bottom of this file. Keep them to one paragraph with inline formatting. Use four spaces to continue a definition onto another source line.

## Images

A regular image keeps its proportions and can be enlarged by clicking it:

![Graduation photograph](/images/graduation.jpg)

A compact photo with a caption and description uses a `media` block:

::: media
![The team behind Learnr](/blog/2023-03/team.jpeg)
**The team behind Learnr**
An example caption using an existing photo. It can contain *emphasis* and a [project link](https://www.learnr.sg/).
:::

For a new post, put images in `public/blog/your-post/` and reference them as `/blog/your-post/photo.jpg`. Remove the `image` field from front matter if you do not want a cover.

## Video

A thumbnail link opens the video on YouTube:

::: youtube-lite
https://www.youtube.com/watch?v=aJ2kp675on8
:::

For an embedded player instead, change `youtube-lite` to `youtube`. Here is the syntax shown as code so this reference does not load a second player:

```markdown
::: youtube
https://www.youtube.com/watch?v=aJ2kp675on8
:::
```

## Code

```python
observations = [0.72, 0.81, 0.86]
average = sum(observations) / len(observations)
print(average)
```

The language label is optional. Code formatting is supported; syntax coloring is not currently enabled. Mermaid and LaTeX are not rendered as diagrams or equations.

## Tables

| Setting | Value | Effect |
| --- | --- | --- |
| draft | true | Excluded from the website |
| checkpoint | true | Also appears in Life checkpoints when published |
| tags | An array of topic names | Creates topic links and filters |

Wide tables and code blocks scroll within the article on narrow screens.

## Before publishing

1. Replace all example content and metadata in your new post.
2. Set `draft: false` on the post you want to publish.
3. Check the local preview and mobile layout.
4. Run `npm run test:content`, `npm run lint`, and `npm run build`.
5. Review, commit, and push to `main` to deploy through GitHub Pages.

Keep **this reference file** set to `draft: true`. A future `date` does not schedule publication; the `draft` flag controls inclusion in the next build.

[^reflection]: A personal comment can include **emphasis**, `inline code`, and a [link](/about/).
    This is an indented continuation of the same note.
[^source]: Use a note for a source or an uncertainty. Labels are case-sensitive and allow letters, numbers, hyphens, and underscores.
