import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const cache = new Map();
function loadSource(filename) {
  const fullPath = path.resolve(filename);
  if (cache.has(fullPath)) return cache.get(fullPath).exports;
  const loaded = { exports: {} };
  cache.set(fullPath, loaded);
  const compiled = ts.transpileModule(fs.readFileSync(fullPath, "utf8"), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
    jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  } }).outputText;
  vm.runInNewContext(compiled, {
    module: loaded, exports: loaded.exports, URL, URLSearchParams, process, console,
    require(id) {
      if (id.endsWith(".module.css")) return { __esModule: true, default: new Proxy({}, { get: (_, key) => key }) };
      if (!id.startsWith(".")) return require(id);
      const target = path.resolve(path.dirname(fullPath), id);
      return loadSource([target, `${target}.ts`, `${target}.tsx`].find((file) => fs.existsSync(file)));
    },
  }, { filename: fullPath });
  return loaded.exports;
}
const { renderMarkdown, getPostBySlug } = loadSource("lib/posts.ts");
const PostBody = loadSource("components/blog/PostBody.tsx").default;

test("research post ends with the registered Markov builder", () => {
  const post = getPostBySlug("markov-chains");
  assert.equal(post.blocks.at(-1).name, "markov-chain");
  assert.equal(post.headings.at(-1).id, "markov-builder");
  assert.match(post.html, /statistical significance/);
});

test("repeated builders have unique controls, arrows, and accessible tabular data", () => {
  const marker = "::: simulation markov-chain\n:::";
  const { blocks } = renderMarkdown(`Before.\n\n${marker}\n\nBetween.\n\n${marker}`);
  const html = renderToStaticMarkup(React.createElement(PostBody, { blocks }));
  assert.equal((html.match(/<svg\b/g) ?? []).length, 2);
  assert.equal((html.match(/<textarea\b/g) ?? []).length, 4);
  assert.ok(html.includes('id="markov-builder-arrow"'));
  assert.ok(html.includes('id="markov-builder-2-arrow"'));
  const ids = Array.from(html.matchAll(/\bid="([^"]+)"/g), (match) => match[1]);
  assert.equal(ids.length, new Set(ids).size);
  for (const match of html.matchAll(/\bfor="([^"]+)"/g)) assert.ok(ids.includes(match[1]));
  for (const match of html.matchAll(/<title>(.*?)<\/title>/g)) assert.ok(!match[1].includes("<!--"), "SVG tooltips have a single text child for hydration");
  assert.match(html, /Directed transitions/);
  assert.match(html, /5 of 6 states have time data/);
  const assignments = [...html.matchAll(/<table aria-label="State time assignments">([\s\S]*?)<\/table>/g)];
  assert.equal(assignments.length, 2);
  for (const [, table] of assignments) {
    assert.match(table, /<thead><tr><th>State<\/th><th>Workflow time row<\/th>/);
    assert.equal((table.match(/<th scope="row">/g) ?? []).length, 6);
    assert.match(table, /<th scope="row">Session ended<\/th>/, "States without time still have a row");
    assert.match(table, /aria-label="Time row for Session ended"/);
    assert.doesNotMatch(table, /<th scope="row">Offline notes<\/th>/, "Unused time names are not state rows");
  }
  assert.match(html, /entirely fictional online-course data/);
  assert.match(html, /Zoom graph in/);
  assert.ok(html.indexOf('id="markov-builder-edges"') < html.indexOf('id="markov-builder-time"'), "Transitions are the first input");
  assert.match(html, /Clear time data/);
  assert.match(html, /Force-directed/);
  assert.match(html, /State spacing/);
  assert.match(html, /Focus connections/);
  assert.match(html, /<summary>Graph styling/);
  assert.match(html, /Export current view PNG/);
  assert.match(html, /Export every state ZIP/);
  assert.match(html, /keeps the selected focus, fading and visible labels/);
});

test("focus keeps all states and transitions, showing only the selected state's labels", () => {
  const { default: Graph, defaultAppearance } = loadSource("components/blog/markov-chain/Graph.tsx");
  const { exampleEdges } = loadSource("lib/markov-chain/example.ts");
  const { prepareGraph, buildNodes } = loadSource("lib/markov-chain/data.ts");
  const { createGraphLayout } = loadSource("lib/markov-chain/graph.ts");
  const parsed = prepareGraph(exampleEdges, "", "provided");
  // Two disconnected copies give a dense overview without using private data.
  const edges = [...parsed.edges, ...parsed.edges.map((edge) => ({ ...edge, from: `${edge.from} 2`, to: `${edge.to} 2` }))];
  const graph = createGraphLayout(buildNodes(edges, [], []), edges, 16, 1, "network", 1);
  const render = (focus = "", labelDisplay = "auto") => renderToStaticMarkup(React.createElement(Graph, {
    graph, edges, appearance: { ...defaultAppearance, labelDisplay }, svgRef: { current: null },
    instanceId: "test-markov", resetKey: 0, focus, onFocus() {},
  }));
  const overview = render();
  assert.equal((overview.match(/data-state=/g) ?? []).length, 12);
  assert.equal((overview.match(/data-transition=/g) ?? []).length, 28);
  assert.equal((overview.match(/data-edge-label="true"[^>]*opacity="0"/g) ?? []).length, 28);
  const focus = "Course catalog";
  const incident = edges.filter((edge) => edge.from === focus || edge.to === focus).length;
  const focused = render(focus);
  assert.equal((focused.match(/data-state=/g) ?? []).length, 12);
  assert.equal((focused.match(/data-transition=/g) ?? []).length, 28);
  assert.equal((focused.match(/<text data-edge-label="true"[^>]* opacity="1"/g) ?? []).length, incident);
  assert.equal((focused.match(/<path data-transition="true"[^>]* opacity="0.08"/g) ?? []).length, 28 - incident);
  assert.match(focused, /data-focus-caption="true" opacity="1"/);
  assert.match(focused, /aria-pressed="true"/);
  assert.equal((render("", "all").match(/<text data-edge-label="true"[^>]* opacity="1"/g) ?? []).length, 28);
});
