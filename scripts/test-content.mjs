import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";

const require = createRequire(import.meta.url);
const source = fs.readFileSync(new URL("../lib/posts.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2022 } }).outputText;
function loadPosts(root = process.cwd()) {
  const compiledModule = { exports: {} };
  vm.runInNewContext(compiled, { module: compiledModule, exports: compiledModule.exports, require, process: { cwd: () => root }, console, URL, Date });
  return compiledModule.exports;
}
const { renderMarkdown, getAllPostsMeta, getPostBySlug } = loadPosts();
const note = renderMarkdown("## First\n\nA thought.[^one] Another reference.[^one]\n\n## First\n\n[^one]: My *personal* comment with a [source](https://example.com).\n    A continuation line.\n");
assert.equal((note.html.match(/role="note"/g) ?? []).length, 1, "Repeated references must share a note");
assert.match(note.html, /href="#sn-one"/);
assert.match(note.html, /id="snref-one-2"/);
assert.match(note.html, /<em>personal<\/em>/);
assert.match(note.html, /A continuation line/);
assert.match(note.html, /href="#snref-one-1"/);
assert.equal(note.headings[1].id, "first-2", "Duplicate headings get unique anchors");
assert.match(renderMarkdown("Missing.[^one]").html, /\[\^one\]/, "Notes do not leak between posts");
assert.doesNotMatch(renderMarkdown("```md\n[^code]: This is literal code.\n```\n\nText.[^code]").html, /role="note"/, "Fenced examples must not create notes");
assert.doesNotMatch(renderMarkdown('<script>alert(1)</script>\n\n[bad](javascript:alert)\n\n![bad](data:text/html,anything)').html, /<script|href="javascript:|src="data:/);
assert.match(renderMarkdown("[Jump](#section)").html, /href="#section"/);
assert.match(renderMarkdown("::: media\n![Caption](/photo.jpg)\n**Heading**\nDescription\n:::").html, /class="md-media"/);
assert.match(renderMarkdown("::: youtube-lite\nhttps://youtu.be/aJ2kp675on8\n:::").html, /class="md-embed-lite"/);
assert.match(renderMarkdown("[[Website|https://example.com]]").html, /class="md-chip"/);
const posts = getAllPostsMeta();
const originalSlugs = ["29th-cohort-cadet-reporter-training-camp", "enitio2021", "enitio2023", "event-director-ntu-buddhist-society", "garage-eee", "johor-segamat-division-29th-cohort-camp", "learnr", "mediatek", "micron-problem-solving", "mlda-eee", "ntu-eee-lead-laos", "ntu-valedictorian", "project-design-and-optimization-of-radio-frequency-circuits-ntu", "tinkrr-life-optimization", "uksaei-2022-foreign-foragers-learn-grow-local"];
for (const slug of originalSlugs) assert.ok(posts.find((post) => post.slug === slug)?.checkpoint, `${slug} remains a published checkpoint`);
for (const post of posts) {
  assert.ok(getPostBySlug(post.slug).html.trim(), `${post.slug} renders`);
  assert.ok(post.readingMinutes >= 1);
  if (post.image) assert.ok(fs.existsSync(path.join(process.cwd(), "public", post.image)), `${post.slug} cover exists`);
}
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "notebook-content-"));
try {
  fs.mkdirSync(path.join(fixture, "content/blog"), { recursive: true });
  fs.writeFileSync(path.join(fixture, "content/blog/draft.md"), '---\ntitle: Hidden\ndate: "2026-01-01"\ntags: [Private]\ndraft: true\n---\nDraft-only phrase');
  fs.writeFileSync(path.join(fixture, "content/blog/published.md"), '---\ntitle: Public note\ndate: 2026-09-07\ntags: [Research, Research]\n---\nBody-only searchable phrase');
  const fixturePosts = loadPosts(fixture);
  const published = fixturePosts.getAllPostsMeta();
  assert.equal(published.length, 1, "Drafts must be excluded");
  assert.equal(published[0].date, "2026-09-07", "Unquoted YAML dates retain their value");
  assert.equal(published[0].checkpoint, false, "New notes are not automatically life checkpoints");
  assert.equal(published[0].tags.length, 1, "Tags are deduplicated");
  const search = fixturePosts.getSearchIndex();
  assert.equal(search.length, 1);
  assert.match(search[0].searchText, /body-only searchable phrase/);
  assert.doesNotMatch(search[0].searchText, /draft-only/);
} finally { fs.rmSync(fixture, { recursive: true, force: true }); }
console.log("Content checks passed: Markdown, notes, links, media, all 15 existing entries, drafts, dates, and search indexing.");
