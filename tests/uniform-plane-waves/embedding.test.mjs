import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Render the actual TSX components without adding a test-only bundler.
const require = createRequire(import.meta.url);
const cache = new Map();
function loadSource(filename) {
  const fullPath = path.resolve(filename);
  if (cache.has(fullPath)) return cache.get(fullPath).exports;
  const loaded = { exports: {} };
  cache.set(fullPath, loaded);
  const source = fs.readFileSync(fullPath, "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
    jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  } }).outputText;
  vm.runInNewContext(compiled, {
    module: loaded, exports: loaded.exports, URL, URLSearchParams, process, console,
    require(id) {
      if (id.endsWith(".module.css")) return { __esModule: true, default: new Proxy({}, { get: (_, key) => key }) };
      if (!id.startsWith(".")) return require(id);
      const target = path.resolve(path.dirname(fullPath), id);
      const resolved = [target, `${target}.ts`, `${target}.tsx`].find((file) => fs.existsSync(file));
      return loadSource(resolved);
    },
  }, { filename: fullPath });
  return loaded.exports;
}

const { renderMarkdown } = loadSource("lib/posts.ts");
const PostBody = loadSource("components/blog/PostBody.tsx").default;
const { createExperimentUrl, readExperimentInput } = loadSource("lib/uniform-plane-waves/sharing.ts");
const marker = "::: simulation uniform-plane-waves\n:::";

test("two inline simulators render in place with distinct accessible controls", () => {
  const { blocks } = renderMarkdown(`Before the first.\n\n${marker}\n\nBetween experiments.\n\n${marker}\n\nAfter the second.`);
  const html = renderToStaticMarkup(React.createElement(PostBody, { blocks }));
  assert.equal((html.match(/<canvas\b/g) ?? []).length, 2);
  assert.ok(html.indexOf("Before the first.") < html.indexOf('id="explore"'));
  assert.ok(html.indexOf('id="explore"') < html.indexOf("Between experiments."));
  assert.ok(html.indexOf("Between experiments.") < html.indexOf('id="explore-2"'));
  assert.ok(html.indexOf('id="explore-2"') < html.indexOf("After the second."));
  const ids = Array.from(html.matchAll(/\bid="([^"]+)"/g), (match) => match[1]);
  assert.equal(ids.length, new Set(ids).size, "Repeated controls never duplicate DOM IDs");
  const labels = Array.from(html.matchAll(/\bfor="([^"]+)"/g), (match) => match[1]);
  assert.equal(labels.length, 8, "Each instance labels three numeric controls and polarization");
  for (const id of labels) assert.ok(ids.includes(id), `Label ${id} targets a real control`);
  for (const match of html.matchAll(/aria-labelledby="([^"]+)"/g)) assert.ok(ids.includes(match[1]));
});

test("sharing a later simulator restores only that instance", () => {
  const input = { angle: 50, n1: 1.5, n2: 1, polarization: "p" };
  const url = new URL(createExperimentUrl("https://tangliten.github.io/blog/any-post/", input, "explore-2"));
  assert.equal(url.pathname, "/blog/any-post/");
  assert.equal(url.hash, "#explore-2");
  assert.equal(url.searchParams.get("experiment"), "explore-2");
  assert.equal(JSON.stringify(readExperimentInput(url.search, "explore-2", false)), JSON.stringify(input));
  assert.equal(readExperimentInput(url.search, "explore", true), null, "Other instances retain their defaults");
  assert.equal(readExperimentInput(url.search, "explore-3", false), null);
});

test("existing share links work only on the first simulator", () => {
  const query = "?angle=30&n1=1.5&n2=1&polarization=s";
  assert.equal(readExperimentInput(query, "explore", true).angle, 30);
  assert.equal(readExperimentInput(query, "explore-2", false), null);
  assert.equal(readExperimentInput("", "explore", true), null);
  assert.throws(() => readExperimentInput("?experiment=explore-2&angle=95", "explore-2", false), /incident angle/);
  assert.equal(readExperimentInput("?experiment=explore-2&angle=95", "explore", true), null, "Invalid parameters for a different instance are ignored");
});
