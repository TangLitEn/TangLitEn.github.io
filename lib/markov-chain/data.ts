export type Workflow = { name: string; minutes: number; users: number | null };
export type Edge = { from: string; to: string; count: number | null; probability: number };
export type Match = { target: string; score: number; reason: string };
export type Node = { name: string; minutes: number | null; users: number | null };
export type ProbabilityMode = "provided" | "counts";

// Spreadsheet clipboard data is TSV. Also support quoted CSV, including newlines.
export function readTable(text: string): string[][] {
  const separators = { "\t": 0, ";": 0, ",": 0 };
  let inQuote = false;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '"') {
      if (inQuote && text[i + 1] === '"') i++;
      else inQuote = !inQuote;
    } else if (!inQuote && Object.hasOwn(separators, text[i])) separators[text[i] as keyof typeof separators]++;
  }
  const separator = separators["\t"] ? "\t" : separators[";"] > separators[","] ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [], cell = "", quoted = false;
  text = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"' && (quoted || !cell.trim())) {
      if (quoted && text[i + 1] === '"') { cell += '"'; i++; }
      else quoted = !quoted;
    } else if (!quoted && (char === separator || char === "\n")) {
      row.push(cell.trim()); cell = "";
      if (char === "\n") { if (row.some(Boolean)) rows.push(row); row = []; }
    } else cell += char;
  }
  if (quoted) throw new Error("A quoted cell is missing its closing quote.");
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

const header = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
export function workflowName(s: string) { return s.replace(/^time\s*\((.*)\)$/i, "$1").trim(); }

function number(value: string, label: string, optional = false): number | null {
  if (!value.trim() && optional) return null;
  const clean = value.replace(/,/g, "").trim();
  if (!/^\+?(?:\d+(?:\.\d*)?|\.\d+)(?:\s*(?:%|min(?:ute)?s?|h(?:ours?|rs?)?|s(?:ec(?:ond)?s?)?))?$/i.test(clean)) {
    throw new Error(`${label}: “${value}” must be a nonnegative number.`);
  }
  const n = parseFloat(clean);
  if (!Number.isFinite(n)) throw new Error(`${label} is too large.`);
  return n;
}

export function parseWorkflows(text: string): Workflow[] {
  if (!text.trim()) return [];
  const rows = readTable(text);
  const start = rows.findIndex((r) => r.some((c) => header(c) === "workflow") && r.some((c) => header(c) === "total"));
  const columns = start >= 0 ? rows[start].map(header) : ["workflow", "total", "peractiveuser", "users"];
  const result: Workflow[] = [];
  for (const [i, row] of rows.slice(start >= 0 ? start + 1 : 0).entries()) {
    const raw = row[columns.indexOf("workflow")] ?? "";
    if (header(raw) === "namemapping") break;
    if (!raw) throw new Error(`Time row ${i + 1}: the workflow name is missing.`);
    const value = row[columns.indexOf("total")] ?? "";
    const parsed = number(value, `Time row ${i + 1}, Total`)!;
    const minutes = /\b(h|hr|hrs|hour|hours)\s*$/i.test(value) ? parsed * 60 : /\b(s|sec|secs|second|seconds)\s*$/i.test(value) ? parsed / 60 : parsed;
    if (value.includes("%")) throw new Error(`Time row ${i + 1}: use minutes, seconds, or hours, not percentages.`);
    const users = columns.includes("users") ? number(row[columns.indexOf("users")] ?? "", `Time row ${i + 1}, Users`, true) : null;
    if (users !== null && (!Number.isInteger(users) || /[a-z%]/i.test(row[columns.indexOf("users")]))) throw new Error(`Time row ${i + 1}: Users must be a whole number.`);
    const name = workflowName(raw);
    if (!name) throw new Error(`Time row ${i + 1}: the workflow name is empty.`);
    result.push({ name, minutes, users });
  }
  if (!result.length) throw new Error("The time table has no workflow rows.");
  return result;
}

export function parseEdges(text: string, mode: ProbabilityMode): { edges: Edge[]; warnings: string[] } {
  const rows = readTable(text);
  const start = rows.findIndex((r) => r.some((c) => header(c) === "from") && r.some((c) => header(c) === "to"));
  const columns = start >= 0 ? rows[start].map(header) : ["from", "to", "count", "pnext"];
  const pIndex = columns.findIndex((c) => ["pnext", "probability", "p", "weight"].includes(c));
  const countIndex = columns.indexOf("count");
  if (mode === "provided" && pIndex < 0) throw new Error("Add a P(next) column, or select probabilities from counts.");
  if (mode === "counts" && countIndex < 0) throw new Error("Add a Count column to calculate probabilities.");
  const merged = new Map<string, Edge>();
  let duplicates = 0;
  for (const [i, row] of rows.slice(start >= 0 ? start + 1 : 0).entries()) {
    const from = row[columns.indexOf("from")] ?? "", to = row[columns.indexOf("to")] ?? "";
    if (!from || !to) throw new Error(`Edge row ${i + 1}: both From and To are required.`);
    const countText = row[countIndex] ?? "";
    const count = number(countText, `Edge row ${i + 1}, Count`, mode !== "counts");
    if (count !== null && (!Number.isInteger(count) || /[a-z%]/i.test(countText))) throw new Error(`Edge row ${i + 1}: Count must be a whole number.`);
    const pText = row[pIndex] ?? "";
    const probability = mode === "counts" ? 0 : number(pText, `Edge row ${i + 1}, P(next)`)! / (pText.endsWith("%") ? 100 : 1);
    if (probability > 1 || (mode === "provided" && /[a-z]/i.test(pText))) throw new Error(`Edge row ${i + 1}: P(next) must be between 0 and 1 (or 0% and 100%).`);
    const key = JSON.stringify([from, to]);
    const previous = merged.get(key);
    if (previous) {
      duplicates++;
      previous.count = previous.count === null || count === null ? null : previous.count + count;
      previous.probability += probability;
    } else merged.set(key, { from, to, count, probability });
  }
  const edges = [...merged.values()];
  if (!edges.length) throw new Error("Paste at least one transition into the edge table.");
  const totals = new Map<string, number>();
  for (const edge of edges) totals.set(edge.from, (totals.get(edge.from) ?? 0) + (mode === "counts" ? edge.count! : edge.probability));
  const warnings: string[] = [];
  if (duplicates) warnings.push(`${duplicates} duplicate From → To row(s) combined by adding their weights.`);
  if (mode === "counts") {
    for (const [from, total] of totals) if (!total) throw new Error(`“${from}” has zero outgoing counts; its probabilities are undefined.`);
    for (const edge of edges) edge.probability = edge.count! / totals.get(edge.from)!;
  } else {
    for (const [from, total] of totals) if (Math.abs(total - 1) > 0.000001) warnings.push(`“${from}”: outgoing P(next) sums to ${total.toFixed(3)}. Check rounding, missing edges, or duplicates; values are preserved.`);
  }
  for (const name of new Set(edges.flatMap((e) => [e.from, e.to]))) {
    if (!totals.has(name)) warnings.push(`“${name}” has no outgoing edges. Add an exit or a self-loop if it is an absorbing state; no transition is assumed.`);
  }
  if (new Set(edges.flatMap((e) => [e.from, e.to])).size > 200 || edges.length > 2000) throw new Error("Use up to 200 states and 2,000 distinct edges per graph.");
  return { edges, warnings };
}

// Transparent local heuristics: normalization, token overlap, and spelling similarity.
// A small synonym vocabulary handles common workflow terms; this is not an AI service.
export function normalizeName(value: string): string {
  return workflowName(value).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/preferences?|customi[sz]ation/g, "preference")
    .replace(/organizing/g, "organising").replace(/signup|sign-up/g, "sign up")
    .replace(/[^\p{L}\p{N}]+/gu, " ").trim().replace(/\s+/g, " ");
}

function similarity(a: string, b: string): number {
  if (a === b) return 1;
  const aa = new Set(a.split(" ")), bb = new Set(b.split(" "));
  const common = [...aa].filter((t) => bb.has(t)).length;
  const tokens = common / Math.max(1, Math.min(aa.size, bb.size));
  const charsA = new Set(Array.from({ length: Math.max(0, a.length - 1) }, (_, i) => a.slice(i, i + 2)));
  const charsB = new Set(Array.from({ length: Math.max(0, b.length - 1) }, (_, i) => b.slice(i, i + 2)));
  const overlap = [...charsA].filter((c) => charsB.has(c)).length;
  const spelling = 2 * overlap / Math.max(1, charsA.size + charsB.size);
  return Math.max(tokens * 0.86, spelling * 0.9);
}

export function suggestMatch(name: string, states: string[]): Match {
  const normalized = normalizeName(name);
  const ranked = states.map((target) => ({ target, score: similarity(normalized, normalizeName(target)) })).sort((a, b) => b.score - a.score);
  const best = ranked[0];
  if (!best || !normalized || best.score < 0.62) return { target: "", score: best?.score ?? 0, reason: "Unmatched" };
  if (ranked[1] && best.score - ranked[1].score < 0.12) return { target: "", score: best.score, reason: "Ambiguous — choose a state" };
  return { ...best, reason: best.score === 1 ? "Normalized match" : "Suggested — review" };
}

export function buildNodes(edges: Edge[], workflows: Workflow[], mapping: string[]): Node[] {
  const names = [...new Set(edges.flatMap((e) => [e.from, e.to]))];
  return names.map((name) => {
    const rows = workflows.filter((_, i) => mapping[i] === name);
    return { name, minutes: rows.length ? rows.reduce((sum, r) => sum + r.minutes, 0) : null,
      // Unique users cannot be summed across multiple workflows without identities.
      users: rows.length === 1 ? rows[0].users : null };
  });
}

export function matchTimesToStates(states: string[], suggestions: Match[]): { timeIndex: number | null; reason: string }[] {
  return states.map((state) => {
    const candidates = suggestions.map((match, timeIndex) => ({ ...match, timeIndex }))
      .filter((match) => match.target === state).sort((a, b) => b.score - a.score);
    if (!candidates.length) return { timeIndex: null, reason: suggestions.length ? "No matching time row" : "No time data" };
    if (candidates[1] && candidates[0].score - candidates[1].score < .12) return { timeIndex: null, reason: "Ambiguous — choose a time row" };
    return { timeIndex: candidates[0].timeIndex, reason: candidates[0].reason };
  });
}

// Move a selected time row rather than counting its minutes in two states.
export function assignStateTime(selection: (number | null)[], stateIndex: number, timeIndex: number | null): (number | null)[] {
  return selection.map((value, i) => i === stateIndex ? timeIndex : timeIndex !== null && value === timeIndex ? null : value);
}

export function stateTimeMapping(states: string[], selection: (number | null)[], rowCount: number): string[] {
  const mapping = Array<string>(rowCount).fill("");
  selection.forEach((timeIndex, stateIndex) => {
    if (timeIndex !== null && timeIndex >= 0 && timeIndex < rowCount) mapping[timeIndex] = states[stateIndex];
  });
  return mapping;
}

export function prepareGraph(edgeText: string, timeText: string, mode: ProbabilityMode) {
  let edges: Edge[] = [], warnings: string[] = [], error = "", timeError = "";
  try { ({ edges, warnings } = parseEdges(edgeText, mode)); }
  catch (cause) { error = (cause as Error).message; }
  const states = [...new Set(edges.flatMap((edge) => [edge.from, edge.to]))];
  let workflows: Workflow[] = [];
  try { workflows = parseWorkflows(timeText); }
  catch (cause) { timeError = (cause as Error).message; }
  const suggestions = workflows.map((workflow) => suggestMatch(workflow.name, states));
  const stateMatches = matchTimesToStates(states, suggestions);
  return { edges, warnings, workflows, states, suggestions, stateMatches, error, timeError };
}
