import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import ts from "typescript";

function load(name) {
  const filename = path.resolve(`lib/markov-chain/${name}.ts`);
  const loaded = { exports: {} };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { module: loaded, exports: loaded.exports });
  return loaded.exports;
}
const { readTable, parseWorkflows, parseEdges, suggestMatch, buildNodes, prepareGraph, matchTimesToStates, assignStateTime, stateTimeMapping } = load("data");
const { exampleTime, exampleEdges } = load("example");
const { edgePath, layoutNodes, wrapLabel, createGraphLayout, pngDimensions } = load("graph");

test("spreadsheet section headings, reordered columns, grouped numbers, units, and quoted CSV", () => {
  const csv = 'Workflow time spent\nUsers,Total,Workflow\n10,"1,200 min","Time(Plan, review)"\n3,2 hr,Time(Build)\n4,90 sec,Time(Check)';
  const data = parseWorkflows(csv);
  assert.equal(data[0].name, "Plan, review");
  assert.equal(data[0].minutes, 1200);
  assert.equal(data[1].minutes, 120);
  assert.equal(data[2].minutes, 1.5);
  assert.equal(data[0].users, 10);
  assert.equal(parseWorkflows(`Workflow time spent\n${exampleTime}`).length, 6);
  const quoted = readTable('From,To,P(next)\n"A\nquoted ""state""",B,100%');
  assert.equal(quoted[1][0], 'A\nquoted "state"');
  assert.equal(parseEdges('To\tP(next)\tFrom\nB\t75%\tA', "provided").edges[0].probability, .75);
  assert.equal(parseEdges('From;To;Count\nA;B;1', "counts").edges[0].probability, 1);
  assert.equal(parseWorkflows('Workflow,Total\n"Review; plan",2 h')[0].minutes, 120);
});

test("synthetic learning example maps five workflows and has complete probability rows", () => {
  const workflows = parseWorkflows(exampleTime);
  const { edges, warnings } = parseEdges(exampleEdges, "provided");
  const states = [...new Set(edges.flatMap((e) => [e.from, e.to]))];
  assert.equal(states.length, 6);
  assert.equal(edges.length, 14);
  const mapping = workflows.map((w) => suggestMatch(w.name, states).target);
  assert.equal(mapping.filter(Boolean).length, 5);
  assert.equal(mapping[0], "Course catalog");
  assert.equal(mapping[1], "Lesson / reading");
  assert.equal(mapping[3], "Progress dashboard");
  assert.equal(mapping[4], "Help center");
  assert.equal(mapping[5], "");
  const nodes = buildNodes(edges, workflows, mapping);
  assert.equal(nodes.find((n) => n.name === "Course catalog").minutes, 240);
  assert.equal(nodes.find((n) => n.name === "Session ended").minutes, null);
  assert.equal(warnings.length, 0);
  assert.equal(edges[0].probability, .60);
  const calculated = parseEdges(exampleEdges, "counts");
  calculated.edges.forEach((edge, i) => assert.equal(edge.probability, edges[i].probability));
});

test("count normalization uses each source's outgoing denominator and merges duplicate edges", () => {
  const { edges, warnings } = parseEdges('From\tTo\tCount\nA\tB\t2\nA\tB\t1\nA\tA\t1\nB\tA\t2', "counts");
  assert.equal(edges.length, 3);
  assert.equal(edges[0].probability, .75);
  assert.equal(edges[0].count, 3);
  assert.equal(edges[2].probability, 1);
  assert.equal(warnings.length, 1);
  const partialTable = 'From\tTo\tCount\tP(next)\nA\tB\t60\t.60\nA\tC\t30\t.30';
  const partial = parseEdges(partialTable, "counts");
  assert.equal(partial.edges[0].probability, 60 / 90);
  const supplied = parseEdges(partialTable, "provided");
  assert.equal(supplied.edges[0].probability, .60);
  assert.ok(supplied.warnings.some((w) => /0\.900/.test(w)));
});

test("invalid and missing values fail visibly rather than becoming zeros", () => {
  for (const text of ["A\tB\t-1\t.5", "A\tB\t1.5\t.5", "A\tB\t1\t1.2", "A\tB\t1\tgarbage", "A\t\t1\t.5", "A\tB\t1\t", "A\tB\t1 min\t.5"]) assert.throws(() => parseEdges(text, "provided"));
  assert.throws(() => parseEdges("From\tTo\tCount\nA\tB\t0", "counts"), /zero outgoing/);
  assert.throws(() => parseEdges("From\tTo\tCount\nA\tB\t1", "provided"), /P\(next\) column/);
  assert.throws(() => parseWorkflows("Workflow\tTotal\nTime()\t1"), /name is empty/);
  assert.throws(() => parseWorkflows("Workflow\tTotal\nTime(A)\t50%"), /not percentages/);
  assert.throws(() => parseWorkflows("Workflow\tTotal\nTime(A)\tbanana"));
  assert.throws(() => readTable('From,To\n"A,B'), /closing quote/);
  assert.equal(parseWorkflows("").length, 0);
});

test("ambiguous name matches stay unassigned, and arbitrary state names remain safe", () => {
  assert.equal(suggestMatch("Search", ["Search results", "Search filters"]).target, "");
  assert.equal(suggestMatch("Time(Organizing books)", ["Organising books"]).target, "Organising books");
  const { edges } = parseEdges("From\tTo\tP(next)\n__proto__\t<script>alert(1)</script>\t1", "provided");
  const nodes = buildNodes(edges, [{ name: "A", minutes: 0, users: 2 }, { name: "B", minutes: 5, users: 3 }], ["__proto__", "__proto__"]);
  assert.equal(nodes[0].minutes, 5);
  assert.equal(nodes[0].users, null, "Do not add overlapping unique user counts");
  assert.equal(nodes[1].name, "<script>alert(1)</script>");
});

test("graph geometry supports reciprocal edges and self loops with finite coordinates", () => {
  const { edges } = parseEdges("From\tTo\tCount\nA\tB\t2\nB\tA\t1\nA\tA\t1", "counts");
  const nodes = buildNodes(edges, [], []);
  for (const kind of ["network", "circle"]) {
    const placed = layoutNodes(nodes, edges, 16, 1, kind);
    assert.ok(placed.every((n) => Number.isFinite(n.x) && Number.isFinite(n.y) && n.radius > 0));
    const forward = edgePath(placed[0], placed[1], true);
    const reverse = edgePath(placed[1], placed[0], true);
    assert.notEqual(forward.label.y, reverse.label.y);
    assert.match(edgePath(placed[0], placed[0], false).path, / C /);
  }
  assert.ok(wrapLabel("A".repeat(100)).every((line) => line.length <= 18));
});

test("transitions survive empty, unmatched, and invalid optional time data", () => {
  for (const time of ["", "Workflow\tTotal\nTime(Unrelated)\t12", "Workflow\tTotal\nTime(A)\tinvalid"]) {
    const parsed = prepareGraph("From\tTo\tP(next)\nA\tB\t1\nB\tB\t1", time, "provided");
    assert.equal(parsed.error, "");
    assert.equal(parsed.edges.length, 2);
    const nodes = buildNodes(parsed.edges, parsed.workflows, parsed.suggestions.map((match) => match.target));
    assert.equal(nodes.length, 2);
    assert.ok(nodes.every((node) => node.minutes === null));
    assert.equal(Boolean(parsed.timeError), time.includes("invalid"));
  }
});

test("state-first assignments include all states and move time rows without double counting", () => {
  const parsed = prepareGraph(exampleEdges, exampleTime, "provided");
  const selection = parsed.stateMatches.map((match) => match.timeIndex);
  assert.equal(selection.length, parsed.states.length);
  const catalogIndex = parsed.states.indexOf("Course catalog");
  const exitIndex = parsed.states.indexOf("Session ended");
  assert.equal(selection[catalogIndex], 0, "The first time row is a valid match");
  assert.equal(selection[exitIndex], null);
  const moved = assignStateTime(selection, exitIndex, 0);
  assert.equal(moved[catalogIndex], null);
  assert.equal(moved[exitIndex], 0);
  const nodes = buildNodes(parsed.edges, parsed.workflows, stateTimeMapping(parsed.states, moved, parsed.workflows.length));
  assert.equal(nodes[catalogIndex].minutes, null);
  assert.equal(nodes[exitIndex].minutes, 240);
  assert.equal(nodes[exitIndex].users, 24);
  const cleared = assignStateTime(moved, exitIndex, null);
  assert.equal(cleared[exitIndex], null);
  assert.equal(cleared.filter((value) => value === 0).length, 0);
  const empty = prepareGraph(exampleEdges, "", "provided");
  assert.equal(empty.stateMatches.length, 6);
  assert.ok(empty.stateMatches.every((match) => match.timeIndex === null));
});

test("multiple equally plausible time rows require a choice instead of silently summing", () => {
  const matches = matchTimesToStates(["Study"], [{ target: "Study", score: 1, reason: "Normalized match" }, { target: "Study", score: 1, reason: "Normalized match" }]);
  assert.equal(matches[0].timeIndex, null);
  assert.match(matches[0].reason, /Ambiguous/);
});

test("large graphs expand, avoid node collisions, and include every state and self-loop", () => {
  const count = 100;
  const names = Array.from({ length: count }, (_, i) => `Synthetic lesson ${i}: reading and practice`);
  const edgeTable = 'From\tTo\tCount\n' + names.map((name, i) => `${name}\t${names[(i + 1) % count]}\t1`).join('\n') + `\n${names[0]}\t${names[0]}\t1`;
  const { edges } = parseEdges(edgeTable, "counts");
  const nodes = buildNodes(edges, [], []);
  for (const kind of ["network", "circle"]) {
    const graph = createGraphLayout(nodes, edges, 24, 1.5, kind, 1.5);
    assert.equal(graph.nodes.length, count);
    assert.ok(graph.width > 1200 || graph.height > 900);
    graph.nodes.forEach((node, i) => {
      assert.ok(node.x - node.radius >= 30 && node.x + node.radius <= graph.width - 30);
      const upperRadius = i === 0 ? node.radius * 2.2 : node.radius;
      assert.ok(node.y - upperRadius >= 155 && node.y + node.radius <= graph.height - 100);
      graph.nodes.slice(i + 1).forEach((other) => {
        assert.ok(Math.hypot(node.x - other.x, node.y - other.y) >= node.radius + other.radius + 10, `${kind}: ${node.name} and ${other.name} collide`);
      });
    });
    const png = pngDimensions(graph.width, graph.height, 3);
    assert.ok(png.width <= 8192 && png.height <= 8192 && png.width * png.height <= 32000000);
    assert.ok(Math.abs(png.width / png.height - graph.width / graph.height) < .01);
  }
});

test("dense hubs remain separated and state spacing increases separation", () => {
  const names = Array.from({ length: 45 }, (_, i) => `State ${i}`);
  const nodes = names.map((name, i) => ({ name, minutes: i * 10, users: null }));
  const links = names.slice(1).flatMap((name) => [{ from: names[0], to: name }, { from: name, to: names[0] }]);
  for (const spacing of [.7, 2.5]) {
    const graph = createGraphLayout(nodes, links, 24, 1.5, "network", spacing);
    graph.nodes.forEach((node, i) => graph.nodes.slice(i + 1).forEach((other) => {
      assert.ok(Math.hypot(node.x - other.x, node.y - other.y) >= node.radius + other.radius + 45 * spacing - .2);
    }));
  }
});
