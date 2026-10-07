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
const originalSlugs = ["29th-cohort-cadet-reporter-training-camp", "enitio2021", "enitio2023", "event-director-ntu-buddhist-society", "garage-eee", "johor-segamat-division-29th-cohort-camp", "micron-problem-solving", "mlda-eee", "ntu-eee-lead-laos", "ntu-valedictorian", "project-design-and-optimization-of-radio-frequency-circuits-ntu", "uksaei-2022-foreign-foragers-learn-grow-local"];
for (const slug of originalSlugs) assert.ok(posts.find((post) => post.slug === slug)?.checkpoint, `${slug} remains a published checkpoint`);
for (const slug of ["learnr", "mediatek", "tinkrr-life-optimization"]) {
  assert.ok(!posts.some((post) => post.slug === slug), `${slug} is unpublished`);
  assert.ok(fs.existsSync(path.join(process.cwd(), "content/checkpoints", `${slug}.md`)), `${slug} source is preserved`);
  assert.ok(!loadPosts().getSearchIndex().some((post) => post.slug === slug), `${slug} is absent from search`);
}
const notebookPosts = getNotebookPostsMeta();
const wavePost = notebookPosts.find((post) => post.slug === "uniform-plane-waves");
assert.ok(wavePost, "The interactive wave post appears in the notebook");
assert.ok(wavePost.tags.length > 0, "The wave post is discoverable by topic");
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
  fs.mkdirSync(path.join(fixture, "content/checkpoints"));
  fs.writeFileSync(path.join(fixture, "content/checkpoints/milestone.md"), '---\ntitle: A milestone\ndate: "2020-01-01"\nbadges: ["Brains/NTU.png", "Brains/NTU.png"]\ntags: [Research]\n---\nA life checkpoint');
  assert.equal(fixturePosts.getNotebookPostsMeta().length, 1);
  assert.equal(fixturePosts.getCheckpointPostsMeta().length, 1);
  assert.equal(fixturePosts.getNotebookPostsMeta()[0].slug, "published");
  assert.equal(fixturePosts.getCheckpointPostsMeta()[0].slug, "milestone");
  const search = fixturePosts.getSearchIndex();
  assert.equal(search.length, 2, "Search includes both collections");
  assert.match(search[0].searchText, /body-only searchable phrase/);
  assert.doesNotMatch(search[0].searchText, /draft-only/);
  assert.equal(fixturePosts.getPostBySlug("milestone").meta.badges.join(), "Brains/NTU.png", "Checkpoint badge references are preserved and deduplicated");
  fs.writeFileSync(path.join(fixture, "content/checkpoints/hidden.md"), '---\ndraft: true\n---\nHidden checkpoint');
  assert.equal(fixturePosts.getAllPostSlugs().length, 2, "Drafts in either folder stay unpublished");
  fs.writeFileSync(path.join(fixture, "content/blog/published.md"), '---\ncheckpoint: true\nbadges: ["Brains/NTU.png"]\n---\nA blog');
  assert.equal(fixturePosts.getPostBySlug("published").meta.checkpoint, false, "Legacy frontmatter cannot turn a blog into a checkpoint");
  assert.equal(fixturePosts.getPostBySlug("published").meta.badges.length, 0, "Blogs ignore checkpoint-only badge fields");
  fs.writeFileSync(path.join(fixture, "content/checkpoints/milestone.md"), '---\ncheckpoint: false\nbadges: "Brains/NTU.png"\n---\nA checkpoint');
  assert.equal(fixturePosts.getPostBySlug("milestone").meta.checkpoint, true, "Checkpoint folder determines the collection regardless of legacy flags");
  assert.equal(fixturePosts.getPostBySlug("milestone").meta.badges.join(), "Brains/NTU.png", "Scalar badge references work in checkpoint files");
  fs.mkdirSync(path.join(fixture, "content/blog/nested.md"));
  fs.writeFileSync(path.join(fixture, "content/blog/nested.md/ignored.md"), "Nested");
  assert.equal(fixturePosts.getAllPostSlugs().length, 2, "Only direct Markdown files are scanned");
  fs.writeFileSync(path.join(fixture, "content/blog/milestone.md"), '---\ndraft: true\n---\nDuplicate');
  assert.throws(() => fixturePosts.getAllPostSlugs(), /Duplicate post slug "milestone"/, "Duplicate filenames across folders cannot shadow existing URLs, even for drafts");
  assert.throws(() => fixturePosts.getPostBySlug("milestone"), /Duplicate post slug/);
  fs.rmSync(path.join(fixture, "content/blog"), { recursive: true });
  assert.equal(fixturePosts.getAllPostSlugs().join(), "milestone", "Checkpoint-only sites work without a blog folder");
  fs.rmSync(path.join(fixture, "content/checkpoints"), { recursive: true });
  assert.equal(fixturePosts.getAllPostSlugs().length, 0, "Missing content folders are empty collections");

} finally { fs.rmSync(fixture, { recursive: true, force: true }); }
console.log("Content checks passed: Markdown, notes, links, media, published checkpoint entries, drafts, dates, collection separation, and search indexing.");

const badgeModule = { exports: {} };
const badgeSource = fs.readFileSync(new URL("../lib/badges.ts", import.meta.url), "utf8");
vm.runInNewContext(ts.transpileModule(badgeSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText, { exports: badgeModule.exports, require, process });
const { getBadges } = badgeModule.exports;
const badges = getBadges(posts);
const expected = {
  brains: [
    ["Micron Junior Engineer", "2024-08-19"],
    ["NTU EEE Valedictorian", "2024"],
    ["STPM 4.00", "2019"],
    ["SPM 10A", "2017"],
    ["Sin Chew Daily Student Reporter", "2015"],
    ["UPSR 7A", "2012"],
  ],
  brawls: [
    ["Gunung Ledang", "2025-10-19"],
    ["FBS_400kg", "2025-08-23"],
    ["Singapore Coast to Coast trail 40km", "2025-08-09"],
    ["Ironman Bangsean", "2020-02-23"],
  ],
};
assert.equal(badges.length, 10);
for (const [category, entries] of Object.entries(expected)) {
  assert.equal(JSON.stringify(badges.filter((badge) => badge.category === category).map((badge) => [badge.name, badge.achieved])), JSON.stringify(entries), `${category} dates and newest-first order match the supplied list`);
}
const expectedLinks = {
  gunungledang: ["gunung-ledang"],
  "ironmanbangsean-20": ["ironman-bangsean-2020"],
  stpm: ["form6-stpm"],
  spm: ["form5-spm"],
  micronjuniorengineer: ["micron-problem-solving"],
  ntu: ["ntu-valedictorian", "mlda-eee", "ntu-eee-lead-laos", "uksaei-2022-foreign-foragers-learn-grow-local", "enitio2023", "garage-eee", "project-design-and-optimization-of-radio-frequency-circuits-ntu", "event-director-ntu-buddhist-society", "enitio2021"],
  xj: ["29th-cohort-cadet-reporter-training-camp", "johor-segamat-division-29th-cohort-camp"],
};
for (const badge of badges) {
  assert.equal(badge.status, "earned", "All supplied badges are achieved, including those awaiting stories");
  assert.ok(fs.existsSync(path.join(process.cwd(), "public", decodeURIComponent(badge.image))), `${badge.name} artwork exists`);
  assert.equal(JSON.stringify([...badge.checkpoints].sort()), JSON.stringify((expectedLinks[badge.id] ?? []).sort()), `${badge.name} has exactly the requested nested stories`);
}
assert.equal(badges.flatMap((badge) => badge.checkpoints).length, checkpointPosts.length);

const formatModule = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL("../lib/format.ts", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports: formatModule.exports });
const { formatAchievementDate, timelineHref } = formatModule.exports;
assert.equal(formatAchievementDate("2024"), "2024", "Year-only dates do not invent a month");
assert.equal(formatAchievementDate("2025-08-09"), "9 Aug 2025");
assert.equal(formatAchievementDate("2026-04-05"), "5 Apr 2026");
assert.equal(formatAchievementDate("2020-02"), "Feb 2020");
assert.equal(timelineHref("NTU", true), "/checkpoints/");

const badgeFixture = fs.mkdtempSync(path.join(os.tmpdir(), "badge-content-"));
try {
  fs.mkdirSync(path.join(badgeFixture, "Brains"));
  fs.mkdirSync(path.join(badgeFixture, "Brawls"));
  fs.writeFileSync(path.join(badgeFixture, "Brains/test.png"), "test image");
  fs.writeFileSync(path.join(badgeFixture, "Brawls/other.png"), "test image");
  const writeMetadata = (header) => fs.writeFileSync(path.join(badgeFixture, "badges.md"), `---\n${header}\n---`);
  const entry = (date) => `badges:\n  Brains/test.png:\n    name: Test Badge\n    achieved: ${date}`;
  for (const date of ['"2012"', '"2024-08"', '"2024-02-29"']) {
    writeMetadata(entry(date));
    const badge = getBadges([], badgeFixture).find((badge) => badge.id === "test");
    assert.equal(badge.achieved, JSON.parse(date));
    assert.equal(badge.status, "earned", "Achievement date is independent of published stories");
    assert.equal(badge.category, "brains");
  }
  for (const invalid of ['"2024-13"', '"2025-02-29"', '"2024-04-31"', '"2024-01-00"', '"May 2024"', '2012', '2024-05-01']) {
    writeMetadata(entry(invalid));
    assert.throws(() => getBadges([], badgeFixture), /achieved must be/);
  }
  for (const [header, error] of [
    ['badges: []', /mapping/],
    ['badges:\n  missing.png: {}', /missing badge image/],
    ['badges:\n  Brains/test.png: text', /must contain/],
    ['badges:\n  Brains/test.png:\n    name: ""', /name must be/],
  ]) {
    writeMetadata(header);
    assert.throws(() => getBadges([], badgeFixture), error);
  }
  writeMetadata('badges: {}');
  const unlinked = getBadges([], badgeFixture);
  assert.equal(unlinked.find((badge) => badge.id === "other").category, "brawls");
  assert.equal(unlinked[0].status, "wip");
  const linked = getBadges([{ slug: "story", date: "2024-08", checkpoint: true, badges: ["Brains/test.png"] }], badgeFixture).find((badge) => badge.id === "test");
  assert.equal(linked.checkpoints.join(), "story");
  assert.equal(linked.achieved, null, "Story dates do not invent achievement dates");
  assert.throws(() => getBadges([{ slug: "story", checkpoint: true, badges: ["Brains/missing.png"] }], badgeFixture), /story.*missing badge image/);
  fs.writeFileSync(path.join(badgeFixture, "Brawls/test.png"), "duplicate id");
  assert.throws(() => getBadges([], badgeFixture), /unique name/);
  assert.equal(getBadges([], path.join(badgeFixture, "absent")).length, 0);
} finally {
  fs.rmSync(badgeFixture, { recursive: true, force: true });
}
console.log(`Badge artwork, dates, chronological order, and all ${checkpointPosts.length} nested story links passed.`);
