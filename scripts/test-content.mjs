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
const simulationModule = { exports: {} };
const simulationSource = fs.readFileSync(new URL("../lib/simulations.ts", import.meta.url), "utf8");
vm.runInNewContext(ts.transpileModule(simulationSource, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports: simulationModule.exports });
function loadPosts(root = process.cwd()) {
  const compiledModule = { exports: {} };
  vm.runInNewContext(compiled, { module: compiledModule, exports: compiledModule.exports, require: (id) => id === "./simulations" ? simulationModule.exports : require(id), process: { cwd: () => root }, console, URL, Date });
  return compiledModule.exports;
}
const { renderMarkdown, getAllPostsMeta, getPostBySlug, getNotebookPostsMeta, getCheckpointPostsMeta } = loadPosts();
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
const simulationMarker = "::: simulation uniform-plane-waves\n:::";
const embedded = renderMarkdown(`## Before\n\nFirst note.[^wave]\n\n${simulationMarker}\n\n## Between\n\n[Reference][book]\n\n${simulationMarker}\n\n## After\n\nAgain.[^wave]\n\n[^wave]: A shared note.\n\n[book]: https://example.com/book`);
assert.equal(embedded.blocks.map((block) => block.type).join(","), "html,simulation,html,simulation,html", "Multiple simulations remain between the surrounding paragraphs");
assert.equal(embedded.headings.map((heading) => heading.id).join(","), "before,explore,between,explore-2,after", "Contents follow document order with unique simulation anchors");
assert.equal(embedded.blocks[1].acceptLegacyQuery, true);
assert.equal(embedded.blocks[3].acceptLegacyQuery, false, "Old unscoped links affect only the first instance");
assert.equal((embedded.html.match(/role="note"/g) ?? []).length, 1, "Notes remain shared across simulations");
assert.match(embedded.html, /href="https:\/\/example.com\/book"/, "Reference links resolve across simulation boundaries");
assert.match(embedded.html, /id="snref-wave-2"/);
assert.equal(renderMarkdown(`${simulationMarker}\n\n${simulationMarker}`).blocks.filter((block) => block.type === "simulation").length, 2, "Adjacent simulations and simulation-only posts work");
assert.equal(renderMarkdown(`\`\`\`md\n${simulationMarker}\n\`\`\``).blocks.some((block) => block.type === "simulation"), false, "Fenced examples are literal");
assert.equal(renderMarkdown(`~~~md\n${simulationMarker}\n~~~`).blocks.some((block) => block.type === "simulation"), false, "Tilde-fenced examples are literal");
assert.equal(renderMarkdown(`    ::: simulation uniform-plane-waves\n    :::`).blocks.some((block) => block.type === "simulation"), false, "Indented examples are literal");
assert.throws(() => renderMarkdown("::: simulation missing-project\n:::"), /Unknown simulation "missing-project"/, "Unknown names fail clearly during the build");
assert.throws(() => renderMarkdown("> ::: simulation uniform-plane-waves\n> :::"), /outside lists, quotes/, "Nested markers cannot split HTML containers");
assert.equal(renderMarkdown(`## Explore\n\n${simulationMarker}\n\n## Explore`).headings.map((heading) => heading.id).join(","), "explore,explore-2,explore-3", "Markdown and simulation anchors cannot collide");
assert.equal(renderMarkdown("Plain post.").blocks.length, 1, "Ordinary posts retain one Markdown block");
const posts = getAllPostsMeta();
const originalSlugs = ["29th-cohort-cadet-reporter-training-camp", "enitio2021", "enitio2023", "event-director-ntu-buddhist-society", "garage-eee", "johor-segamat-division-29th-cohort-camp", "learnr", "mediatek", "micron-problem-solving", "mlda-eee", "ntu-eee-lead-laos", "ntu-valedictorian", "project-design-and-optimization-of-radio-frequency-circuits-ntu", "tinkrr-life-optimization", "uksaei-2022-foreign-foragers-learn-grow-local"];
for (const slug of originalSlugs) assert.ok(posts.find((post) => post.slug === slug)?.checkpoint, `${slug} remains a published checkpoint`);
const notebookPosts = getNotebookPostsMeta();
const wavePost = notebookPosts.find((post) => post.slug === "uniform-plane-waves");
assert.ok(wavePost, "The interactive wave post appears in the notebook");
assert.ok(wavePost.tags.includes("Engineering"), "The wave post is discoverable by topic");
assert.equal(getPostBySlug(wavePost.slug).blocks[1].type, "simulation", "The published wave post inserts its simulator after the introduction");
assert.ok(loadPosts().getSearchIndex().find((post) => post.slug === wavePost.slug)?.searchText.includes("fresnel"), "The wave notes are searchable");
const checkpointPosts = getCheckpointPostsMeta();
assert.ok(notebookPosts.every((post) => !post.checkpoint), "Life checkpoints never enter the notebook");
assert.ok(checkpointPosts.every((post) => post.checkpoint));
assert.equal(notebookPosts.length + checkpointPosts.length, posts.length, "Each published entry belongs to exactly one collection");
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
  fs.writeFileSync(path.join(fixture, "content/blog/milestone.md"), '---\ntitle: A milestone\ndate: "2020-01-01"\ncheckpoint: true\ntags: [Research]\n---\nA life checkpoint');
  assert.equal(fixturePosts.getNotebookPostsMeta().length, 1);
  assert.equal(fixturePosts.getCheckpointPostsMeta().length, 1);
  assert.equal(fixturePosts.getNotebookPostsMeta()[0].slug, "published");
  assert.equal(fixturePosts.getCheckpointPostsMeta()[0].slug, "milestone");
  const search = fixturePosts.getSearchIndex();
  assert.equal(search.length, 2, "Search includes both collections");
  assert.match(search[0].searchText, /body-only searchable phrase/);
  assert.doesNotMatch(search[0].searchText, /draft-only/);
} finally { fs.rmSync(fixture, { recursive: true, force: true }); }
console.log("Content checks passed: Markdown, notes, links, media, all 15 existing entries, drafts, dates, collection separation, and search indexing.");

const badgeModule = { exports: {} };
const badgeSource = fs.readFileSync(new URL("../lib/badges.ts", import.meta.url), "utf8");
vm.runInNewContext(ts.transpileModule(badgeSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText, { exports: badgeModule.exports, require, process });
const { getBadges } = badgeModule.exports;
const badges = getBadges(posts);
assert.ok(badges.find((badge) => badge.id === "student-leader").checkpoints.length > 1);
assert.equal(badges.filter((badge) => badge.checkpoints.includes("event-director-ntu-buddhist-society")).length, 2);
assert.equal(badges.find((badge) => badge.id === "life-os").status, "wip");
const badgeFixture = fs.mkdtempSync(path.join(os.tmpdir(), "badge-content-"));
try {
  fs.mkdirSync(path.join(badgeFixture, "public/badges"), { recursive: true });
  fs.mkdirSync(path.join(badgeFixture, "content/blog"), { recursive: true });
  const imageDir = path.join(badgeFixture, "public/badges");
  fs.writeFileSync(path.join(imageDir, "test-badge.svg"), '<svg xmlns="http://www.w3.org/2000/svg"/>');
  fs.writeFileSync(path.join(imageDir, "README.md"), "Ignored");
  fs.mkdirSync(path.join(imageDir, "ignored.png"));
  const writePost = (name, header) => fs.writeFileSync(path.join(badgeFixture, `content/blog/${name}.md`), `---\ntitle: Test\n${header}\n---\nTest`);
  writePost("draft", 'draft: true\ncheckpoint: true\nbadges: ["test-badge.svg"]');
  writePost("note", 'badges: ["test-badge.svg"]');
  let fixturePosts = loadPosts(badgeFixture).getAllPostsMeta();
  assert.equal(fixturePosts.length, 1, "Drafts are excluded");
  assert.equal(fixturePosts[0].badges.length, 0, "Notebook posts cannot earn badges");
  assert.equal(getBadges(fixturePosts, imageDir)[0].status, "wip");
  writePost("checkpoint", 'checkpoint: true\nbadges: ["test-badge.svg", "test-badge.svg"]');
  fixturePosts = loadPosts(badgeFixture).getAllPostsMeta();
  assert.equal(fixturePosts.find((post) => post.slug === "checkpoint").badges.length, 1, "Duplicate references are normalized");
  let discovered = getBadges(fixturePosts, imageDir);
  assert.equal(discovered.length, 1, "Only image files count");
  assert.equal(discovered[0].name, "Test Badge");
  fs.writeFileSync(path.join(imageDir, "flags.md"), '---\nflags:\n  test-badge.svg:\n    name: Custom flag name\n    achieved: "2024-05"\n---\nIgnored description.');
  discovered = getBadges(fixturePosts, imageDir);
  assert.equal(discovered[0].name, "Custom flag name", "Markdown overrides the filename caption");
  assert.equal(discovered[0].achieved, "2024-05");
  for (const invalid of ['"2024-13"', '"May 2024"', '202405', '2024-05-01']) {
    fs.writeFileSync(path.join(imageDir, "flags.md"), `---\nflags:\n  test-badge.svg:\n    name: Test\n    achieved: ${invalid}\n---`);
    assert.throws(() => getBadges(fixturePosts, imageDir), /achieved must be/);
  }
  fs.writeFileSync(path.join(imageDir, "flags.md"), '---\nflags:\n  test-badge.svg:\n    name: Test\n    achieved: ""\n---');
  assert.equal(getBadges([{ slug: "year-only", checkpoint: true, badges: ["test-badge.svg"], date: "2020" }], imageDir)[0].achieved, null, "Year-only dates do not invent a month");
  const datedPosts = [
    { slug: "later", checkpoint: true, badges: ["test-badge.svg"], date: "2025-08-15" },
    { slug: "earlier", checkpoint: true, badges: ["test-badge.svg"], date: "2023-02" },
  ];
  assert.equal(getBadges(datedPosts, imageDir)[0].achieved, "2023-02", "Blank metadata uses the earliest linked checkpoint month");
  fs.writeFileSync(path.join(imageDir, "flags.md"), '---\nflags:\n  test-badge.svg:\n    achieved: "2024-05"\n---');
  assert.equal(getBadges(datedPosts, imageDir)[0].achieved, "2024-05", "Explicit months override checkpoint dates");
  assert.equal(getBadges([], imageDir)[0].achieved, null, "WIP flags have no achievement month");
  fs.writeFileSync(path.join(imageDir, "newest.svg"), '<svg/>');
  fs.writeFileSync(path.join(imageDir, "undated.svg"), '<svg/>');
  fs.writeFileSync(path.join(imageDir, "flags.md"), '---\nflags:\n  test-badge.svg:\n    achieved: "2024-05"\n  newest.svg:\n    name: Most recent flag\n---');
  const sorted = getBadges([...datedPosts,
    { slug: "newest", checkpoint: true, badges: ["newest.svg"], date: "2026-01" },
    { slug: "undated", checkpoint: true, badges: ["undated.svg"], date: "2020" },
  ], imageDir);
  assert.equal(sorted.map((badge) => badge.id).join(), "newest,test-badge,undated", "Newest months first, undated last");
  assert.equal(sorted[0].name, "Most recent flag", "One Markdown file supplies independent entries for multiple images");
  for (const [header, error] of [
    ['flags: []', /mapping/],
    ['flags:\n  missing.svg: {}', /missing badge image/],
    ['flags:\n  newest.svg: text', /must contain/],
    ['flags:\n  newest.svg:\n    name: ""', /name must be/],
  ]) {
    fs.writeFileSync(path.join(imageDir, "flags.md"), `---\n${header}\n---`);
    assert.throws(() => getBadges(datedPosts, imageDir), error);
  }
  fs.writeFileSync(path.join(imageDir, "flags.md"), '---\nflags:\n  test-badge.svg:\n    achieved: "2024-05"\n---');
  fs.unlinkSync(path.join(imageDir, "newest.svg"));
  fs.unlinkSync(path.join(imageDir, "undated.svg"));
  assert.equal(discovered[0].status, "earned");
  assert.equal(discovered[0].checkpoints.join(), "checkpoint");
  writePost("second", 'checkpoint: true\nbadges: "test-badge.svg"');
  assert.equal(getBadges(loadPosts(badgeFixture).getAllPostsMeta(), imageDir)[0].checkpoints.length, 2, "Scalar references and shared badges work");
  writePost("second", 'checkpoint: true');
  writePost("checkpoint", 'checkpoint: true\nbadges: []');
  assert.equal(getBadges(loadPosts(badgeFixture).getAllPostsMeta(), imageDir)[0].status, "wip", "Removing all links restores WIP");
  writePost("checkpoint", 'checkpoint: true\nbadges: ["missing.png"]');
  assert.throws(() => getBadges(loadPosts(badgeFixture).getAllPostsMeta(), imageDir), /checkpoint.*missing badge image.*missing.png/);
  fs.writeFileSync(path.join(imageDir, "test-badge.png"), "test");
  assert.throws(() => getBadges([], imageDir), /unique name/);
  assert.equal(getBadges([], path.join(badgeFixture, "absent")).length, 0, "An absent badge folder yields an empty collection");
} finally {
  fs.rmSync(badgeFixture, { recursive: true, force: true });
}
console.log("Folder-based badges, frontmatter links, and automatic WIP checks passed.");
