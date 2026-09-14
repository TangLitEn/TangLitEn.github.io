import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const flagModule = { exports: {} };
const source = fs.readFileSync(new URL("../lib/flag-motion.ts", import.meta.url), "utf8");
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports: flagModule.exports });
const { flagDisplacement, STRONG_WIND } = flagModule.exports;
const calm = { speed: 1, gust: 3, direction: 100 };
for (const weather of [STRONG_WIND, calm]) {
  for (const time of [0, 1, 10, 1000]) {
    for (const u of [0, .5, 1]) {
      const pinned = flagDisplacement(u, 0, time, 0, weather);
      assert.ok(pinned.x === 0 && pinned.y === 0 && pinned.z === 0, "Entire top edge remains pinned");
    }
    for (const v of [.25, .5, 1]) {
      const displacement = flagDisplacement(.5, v, time, 2, weather);
      assert.ok(Number.isFinite(displacement.x) && Number.isFinite(displacement.y) && Number.isFinite(displacement.z));
      assert.ok(Math.abs(displacement.z) < .6, "Gusts remain visually bounded");
    }
  }
}
const sum = (weather) => Array.from({ length: 100 }, (_, t) => Math.abs(flagDisplacement(.5, 1, t / 10, 1, weather).z)).reduce((a, b) => a + b, 0);
assert.ok(sum(STRONG_WIND) > sum(calm) * 2, "Stronger winds create larger waves");
assert.notEqual(flagDisplacement(.5, 1, 1, 0, STRONG_WIND).z, flagDisplacement(.5, 1, 1, 2.4, STRONG_WIND).z, "Flags have independent phases");
console.log("Fixed strong wind and cloth motion checks passed.");

assert.equal(flagDisplacement(.5, 1, 1, 0).z, flagDisplacement(.5, 1, 1, 0, STRONG_WIND).z, "The default uses strong wind");
