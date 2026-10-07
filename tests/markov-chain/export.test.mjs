import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { execFileSync } from "node:child_process";
import ts from "typescript";

const filename = path.resolve("lib/markov-chain/archive.ts");
const loaded = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, { module: loaded, exports: loaded.exports, Blob, TextEncoder });
const { createZIP, safeFilename, statePNGFilename } = loaded.exports;

async function inspectArchive(files) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "markov-zip-test-"));
  try {
    const blob = await createZIP(files);
    const target = path.join(directory, "states.zip");
    fs.writeFileSync(target, Buffer.from(await blob.arrayBuffer()));
    // Check interoperability and CRC integrity with an independent ZIP reader.
    const result = execFileSync("python3", ["-c", `
import json, sys, zipfile
with zipfile.ZipFile(sys.argv[1]) as archive:
    assert archive.testzip() is None
    print(json.dumps([{ "name": name, "bytes": list(archive.read(name)) } for name in archive.namelist()]))
`, target], { encoding: "utf8" });
    return JSON.parse(result);
  } finally { fs.rmSync(directory, { recursive: true, force: true }); }
}

test("state PNG archives preserve every file, Unicode names, and binary bytes", async () => {
  const files = [
    { name: statePNGFilename("Course catalog", 0), data: new Blob(["123456789"]) },
    { name: statePNGFilename("学习 · Help", 1), data: new Blob([Uint8Array.from([137,80,78,71,13,10,26,10,0,255])]) },
    { name: statePNGFilename("A/B", 2), data: new Blob([]) },
    { name: statePNGFilename("A?B", 3), data: new Blob(["different state"]) },
  ];
  const entries = await inspectArchive(files);
  assert.equal(entries.length, files.length);
  assert.equal(new Set(entries.map((entry) => entry.name)).size, files.length);
  for (const [i, entry] of entries.entries()) {
    assert.equal(entry.name, files[i].name);
    assert.deepEqual(entry.bytes, [...new Uint8Array(await files[i].data.arrayBuffer())]);
  }
  assert.deepEqual(await inspectArchive([]), []);
});

test("archive rejects unsafe or duplicate names and honours cancellation", async () => {
  const file = { name: "same.png", data: new Blob(["image"]) };
  await assert.rejects(createZIP([file, file]), /unique/);
  await assert.rejects(createZIP([{ ...file, name: "../bad.png" }]), /folder separators/);
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(createZIP([file], controller.signal), { name: "AbortError" });
  assert.equal(safeFilename("!!!"), "markov-chain");
  assert.equal(statePNGFilename("A/B", 0), "001-A-B.png");
  assert.notEqual(statePNGFilename("A/B", 0), statePNGFilename("A?B", 1));
});
