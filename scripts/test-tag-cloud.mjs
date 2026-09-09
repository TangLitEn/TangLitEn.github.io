import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const source = fs.readFileSync(new URL("../lib/tag-cloud.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const compiledModule = { exports: {} };
vm.runInNewContext(compiled, { module: compiledModule, exports: compiledModule.exports });
const { layoutTagCloud, createCloudSimulation, dragCloudBubble, stepCloudSimulation, cloudContactGap, CLOUD_PADDING } = compiledModule.exports;

for (const width of [236, 276, 331, 636, 996, 1036]) {
  for (const counts of [[], [1], [1, 1], [2, 3, 1, 1, 1, 9, 1, 2], Array.from({ length: 40 }, (_, i) => i + 1)]) {
    const tags = counts.map((count, index) => ({ label: `Topic ${index}`, count, href: `/?tag=${index}#posts` }));
    const layout = layoutTagCloud(tags, width);
    assert.equal(layout.bubbles.length, counts.length);
    assert.deepEqual(layout, layoutTagCloud(tags, width), "Layout is deterministic");
    for (const [index, bubble] of layout.bubbles.entries()) {
      assert.ok(bubble.x >= CLOUD_PADDING - 0.1 && bubble.x + bubble.size <= width - CLOUD_PADDING + 0.1, "Bubble fits horizontally");
      assert.ok(bubble.y >= CLOUD_PADDING - 0.1 && bubble.y + bubble.size <= layout.height - CLOUD_PADDING + 0.1, "Bubble fits vertically");
      for (let otherIndex = index + 1; otherIndex < layout.bubbles.length; otherIndex++) {
        const other = layout.bubbles[otherIndex];
        const distance = Math.hypot(bubble.x + bubble.size / 2 - other.x - other.size / 2, bubble.y + bubble.size / 2 - other.y - other.size / 2);
        assert.ok(distance >= (bubble.size + other.size) / 2 + 11.8, "Bubbles do not overlap");
        if (counts[index] < counts[otherIndex]) assert.ok(bubble.size <= other.size, "More entries never produce a smaller bubble");
      }
    }
  }
}
const tagsFor = (counts) => counts.map((count, index) => ({ label: `Topic ${index}`, count, href: `/?tag=${index}#posts` }));
function assertSafe(simulation) {
  for (const [index, body] of simulation.bubbles.entries()) {
    assert.ok([body.x, body.y, body.vx, body.vy].every(Number.isFinite), "Physics remains finite");
    assert.ok(body.x >= CLOUD_PADDING - 0.01 && body.x + body.size <= simulation.width - CLOUD_PADDING + 0.01, "Physics keeps tags inside the width");
    assert.ok(body.y >= CLOUD_PADDING - 0.01 && body.y + body.size <= simulation.height - CLOUD_PADDING + 0.01, "Physics keeps tags inside the height");
    for (const other of simulation.bubbles.slice(index + 1)) {
      const distance = Math.hypot(body.x + body.size / 2 - other.x - other.size / 2, body.y + body.size / 2 - other.y - other.size / 2);
      assert.ok(distance >= (body.size + other.size) / 2 + cloudContactGap(simulation.width) - 0.1, "Bubbles retain the responsive gap during dragging and attraction");
    }
  }
}

let pair = createCloudSimulation(tagsFor([1, 1]), 996);
pair = dragCloudBubble(pair, { index: 0, x: 30, y: 65 });
const separated = pair.bubbles.map((body) => ({ ...body }));
for (let frame = 0; frame < 480; frame++) {
  pair = stepCloudSimulation(pair, 1 / 60);
  assertSafe(pair);
}
assert.ok(pair.bubbles[0].x > separated[0].x + 100, "A released bubble is attracted back toward its neighbor");
assert.ok(pair.bubbles[1].x < separated[1].x - 100, "Attraction acts on both bubbles");
assert.ok(Math.hypot(pair.bubbles[1].x - pair.bubbles[0].x, pair.bubbles[1].y - pair.bubbles[0].y) < 120, "Separated bubbles gather into contact");

const touching = createCloudSimulation(tagsFor([1, 1]), 996);
const pushed = dragCloudBubble(touching, { index: 0, x: touching.bubbles[1].x, y: touching.bubbles[1].y });
assertSafe(pushed);
assert.ok(pushed.bubbles[1].x > touching.bubbles[1].x + 50, "Dragging into a neighbor pushes it aside");

const desktop = layoutTagCloud(tagsFor([1, 9]), 996);
for (const width of [276, 331]) {
  const mobile = layoutTagCloud(tagsFor([1, 9]), width);
  assert.ok(mobile.bubbles[1].size < desktop.bubbles[1].size * 0.75, "Dominant tags take less space on phones");
  assert.ok(mobile.bubbles.every((bubble) => bubble.size >= 80 && bubble.fontSize >= 16), "Mobile tags remain readable and easy to touch");
  assert.ok(cloudContactGap(width) >= 12, "Mobile bubbles retain more breathing room after attraction");
}

for (const width of [276, 331, 996]) {
  let simulation = createCloudSimulation(tagsFor([2, 3, 1, 1, 1, 9, 1, 2]), width);
  for (let frame = 0; frame < 300; frame++) {
    if (frame % 15 === 0) {
      simulation = dragCloudBubble(simulation, {
        index: (frame / 15) % simulation.bubbles.length,
        x: ((frame * 37) % (width + 300)) - 150,
        y: ((frame * 53) % (simulation.height + 300)) - 150,
      });
      assertSafe(simulation);
    }
    simulation = stepCloudSimulation(simulation, [1 / 120, 1 / 60, 1 / 30, 2][frame % 4]);
    assertSafe(simulation);
  }
}
console.log("Tag cloud checks passed: weighted layouts, mutual attraction, collision-safe dragging, neighbor displacement, boundaries, and frame-rate variation on mobile and desktop.");
