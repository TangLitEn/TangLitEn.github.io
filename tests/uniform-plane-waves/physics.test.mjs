import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const source = fs.readFileSync(new URL("../../lib/uniform-plane-waves/physics.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const physics = { exports: {} };
vm.runInNewContext(compiled, { module: physics, exports: physics.exports, RangeError });
const { calculateWave, DEFAULT_INPUT, radians, degrees } = physics.exports;

const close = (actual, expected, tolerance = 1e-10) =>
  assert.ok(
    Math.abs(actual - expected) < tolerance,
    `${actual} should be within ${tolerance} of ${expected}`,
  );
const wave = (overrides) => calculateWave({ ...DEFAULT_INPUT, ...overrides });

test("degree conversion uses Math.PI instead of the original 22/7 approximation", () => {
  close(radians(180), Math.PI);
  close(degrees(Math.PI / 4), 45);
});
test("normal incidence from air into glass reflects 4% for both polarizations", () => {
  for (const polarization of ["s", "p", "unpolarized"]) {
    const r = wave({ angle: 0, polarization });
    close(r.reflectedAngle, 0);
    close(r.transmittedAngle, 0);
    close(r.reflectance, 0.04);
    close(r.transmittance, 0.96);
  }
});
test("45-degree air/glass reference values satisfy Snell and Fresnel", () => {
  const r = wave({});
  close(r.transmittedAngle, 28.1255057020557);
  close(r.Rs, 0.0920133630455244);
  close(r.Rp, 0.00846645897894748);
});
test("matching indices transmit completely, including near grazing incidence", () => {
  for (const angle of [0, 30, 45, 89.9]) {
    const r = wave({ angle, n1: 1.5, n2: 1.5 });
    close(r.reflectance, 0);
    close(r.transmittance, 1);
    close(r.transmittedAngle, angle, 1e-8);
    assert.equal(r.criticalAngle, null);
  }
});
test("glass to air bends away from the normal below the critical angle", () => {
  const r = wave({ n1: 1.5, n2: 1, angle: 30 });
  close(r.transmittedAngle, 48.5903778907291);
  close(r.criticalAngle, 41.8103148957786);
});
test("above the critical angle there is no propagating transmitted ray", () => {
  for (const polarization of ["s", "p", "unpolarized"]) {
    const r = wave({ n1: 1.5, n2: 1, angle: 50, polarization });
    assert.equal(r.totalInternalReflection, true);
    assert.equal(r.transmittedAngle, null);
    assert.equal(r.reflectance, 1);
    assert.equal(r.transmittance, 0);
  }
});
test("at and on either side of the critical angle the transition is well defined", () => {
  const angle = degrees(Math.asin(1 / 1.5));
  const r = wave({ n1: 1.5, n2: 1, angle });
  assert.equal(r.atCriticalAngle, true);
  assert.equal(r.totalInternalReflection, false);
  close(r.transmittedAngle, 90);
  close(r.transmittance, 0);
  assert.ok(wave({ n1: 1.5, n2: 1, angle: angle - 0.001 }).transmittance > 0);
  assert.equal(
    wave({ n1: 1.5, n2: 1, angle: angle + 0.001 }).totalInternalReflection,
    true,
  );
});
test("p polarization has zero reflected power at Brewster's angle", () => {
  const angle = degrees(Math.atan(1.5));
  const r = wave({ angle, polarization: "p" });
  close(r.reflectance, 0);
  close(r.transmittance, 1);
  close(angle + r.transmittedAngle, 90);
  assert.ok(wave({ angle, polarization: "s" }).reflectance > 0.1);
});
test("unpolarized power averages the two independent polarizations", () => {
  close(wave({ polarization: "unpolarized" }).reflectance, 0.0502399110122359);
});
test("all supported inputs produce finite, bounded power and conserve energy", () => {
  for (const n1 of [0.1, 1, 1.33, 1.5, 2.42, 10])
    for (const n2 of [0.1, 1, 1.5, 10]) {
      for (const angle of [0, 0.01, 30, 45, 60, 89.9])
        for (const polarization of ["s", "p", "unpolarized"]) {
          const r = wave({ n1, n2, angle, polarization });
          for (const p of [r.reflectance, r.transmittance, r.Rs, r.Rp])
            assert.ok(Number.isFinite(p) && p >= 0 && p <= 1);
          close(r.reflectance + r.transmittance, 1);
          if (r.transmittedAngle !== null)
            close(
              n1 * Math.sin(radians(angle)),
              n2 * Math.sin(radians(r.transmittedAngle)),
            );
        }
    }
});
test("invalid angles, indices, and polarization cannot reach the renderer", () => {
  for (const angle of [-1, 90, 100, NaN, Infinity])
    assert.throws(() => wave({ angle }), RangeError);
  for (const index of [-1, 0, 11, NaN, Infinity]) {
    assert.throws(() => wave({ n1: index }), RangeError);
    assert.throws(() => wave({ n2: index }), RangeError);
  }
  assert.throws(() => wave({ polarization: "unknown" }), RangeError);
});
