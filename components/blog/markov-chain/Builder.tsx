"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { SimulationProps } from "../../../lib/simulations";
import { assignStateTime, buildNodes, prepareGraph, stateTimeMapping, type ProbabilityMode } from "../../../lib/markov-chain/data";
import { createGraphLayout, pngDimensions } from "../../../lib/markov-chain/graph";
import { exampleEdges, exampleTime } from "../../../lib/markov-chain/example";
import { exportAllStates, exportPNG } from "../../../lib/markov-chain/export";
import Graph, { defaultAppearance, type Appearance } from "./Graph";
import styles from "./styles.module.css";

export default function Builder({ instanceId }: SimulationProps) {
  const [timeText, setTimeText] = useState(exampleTime);
  const [edgeText, setEdgeText] = useState(exampleEdges);
  const [mode, setMode] = useState<ProbabilityMode>("provided");
  const [appearance, setAppearance] = useState(defaultAppearance);
  const [overrides, setOverrides] = useState<{ key: string; values: Record<string, number | null> }>({ key: "", values: {} });
  const [resetKey, setResetKey] = useState(0);
  const [scale, setScale] = useState(2);
  const [zoom, setZoom] = useState(1);
  const [focusedState, setFocusedState] = useState("");
  const [exporting, setExporting] = useState<"current" | "all" | null>(null);
  const [exportStatus, setExportStatus] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const exportAbort = useRef<AbortController | null>(null);
  useEffect(() => () => exportAbort.current?.abort(), []);
  const dataKey = JSON.stringify([timeText, edgeText]);
  const parsed = useMemo(() => prepareGraph(edgeText, timeText, mode), [timeText, edgeText, mode]);
  const timeSelection = useMemo(() => parsed.stateMatches.map((match, i) => overrides.key === dataKey && Object.hasOwn(overrides.values, parsed.states[i]) ? overrides.values[parsed.states[i]] : match.timeIndex), [parsed, overrides, dataKey]);
  const mapping = useMemo(() => stateTimeMapping(parsed.states, timeSelection, parsed.workflows.length), [parsed, timeSelection]);
  const nodes = useMemo(() => buildNodes(parsed.edges, parsed.workflows, mapping), [parsed, mapping]);
  const graph = useMemo(() => createGraphLayout(nodes, parsed.edges, appearance.fontSize, appearance.nodeSize, appearance.layout, appearance.spacing), [nodes, parsed.edges, appearance.fontSize, appearance.nodeSize, appearance.layout, appearance.spacing]);
  const maxZoom = Math.max(3, Math.ceil(graph.width / 200));
  const matched = timeSelection.filter((timeIndex) => timeIndex !== null).length;
  const unusedTimeRows = parsed.workflows.filter((_, i) => !timeSelection.includes(i));
  const focus = parsed.states.includes(focusedState) ? focusedState : "";
  const denseLabels = appearance.labelDisplay === "auto" && parsed.edges.length > 20 && appearance.labels !== "none";
  const id = (name: string) => `${instanceId}-${name}`;
  const setStyle = <K extends keyof Appearance>(key: K, value: Appearance[K]) => setAppearance((old) => ({ ...old, [key]: value }));
  function loadExample() {
    setTimeText(exampleTime); setEdgeText(exampleEdges); setMode("provided");
    setOverrides({ key: "", values: {} }); setExportStatus(""); setResetKey((n) => n + 1); setZoom(1); setFocusedState("");
  }
  async function download(kind: "current" | "all") {
    if (!svgRef.current || parsed.error || exportAbort.current) return;
    const controller = new AbortController();
    exportAbort.current = controller; setExporting(kind); setExportStatus("");
    try {
      if (kind === "all") {
        const result = await exportAllStates(svgRef.current, appearance.title, scale, {
          signal: controller.signal,
          onProgress: (completed, total, state) => setExportStatus(completed === total ? `Packing ${total} PNGs into a ZIP…` : `Preparing state ${completed + 1} of ${total}: ${state}`),
        });
        setExportStatus(`ZIP ready: ${result.count} focused state PNGs.`);
      } else {
        const result = await exportPNG(svgRef.current, appearance.title, scale, focus, controller.signal);
        setExportStatus(`PNG ready: ${result.width} × ${result.height} pixels${focus ? ` · ${focus}` : " · All states"}.`);
      }
    }
    catch (error) { setExportStatus(controller.signal.aborted ? "Export cancelled. No download was created." : `Export failed: ${(error as Error).message}`); }
    finally { exportAbort.current = null; setExporting(null); }
  }
  return <section id={instanceId} className={styles.builder} aria-labelledby={id("heading")}>
    <div className={styles.heading}>
      <div><p className={styles.eyebrow}>FROM TABLES TO TRANSITIONS</p><h2 id={id("heading")}>Build your Markov chain</h2></div>
      <button type="button" className={styles.button} onClick={loadExample}>Load learning example</button>
    </div>
    <p className={styles.intro}>Start with transitions to draw every state and edge. Add time data if you want to size the states by time spent. Everything runs in your browser. The example uses entirely fictional online-course data.</p>
    <div className={styles.inputs}>
      <div className={styles.inputCard}>
        <label htmlFor={id("edges")}><span className={styles.step}>01</span> Transitions / Markov edges</label>
        <p id={id("edges-help")}>This table defines every state and edge, even without time data. Use From, To, Count, P(next). Paste tab-separated cells or quoted CSV; headers let you omit Count or P(next) depending on the probability source.</p>
        <textarea id={id("edges")} aria-describedby={id("edges-help")} value={edgeText} onChange={(e) => { setEdgeText(e.target.value); setExportStatus(""); setZoom(1); setFocusedState(""); }} spellCheck={false} placeholder={"From\tTo\tCount\tP(next)\nCourse catalog\tLesson / reading\t60\t0.60"} />
      </div>
      <div className={styles.inputCard}>
        <label htmlFor={id("time")}><span className={styles.step}>02</span> Workflow time <span className={styles.optional}>Optional</span></label>
        <p id={id("time-help")}>Add Workflow, Total, and optional Users. Per active user is accepted but not used. Time defaults to minutes. Unmatched states and their edges stay on the graph.</p>
        <textarea id={id("time")} aria-describedby={id("time-help")} value={timeText} onChange={(e) => { setTimeText(e.target.value); setExportStatus(""); }} spellCheck={false} placeholder={"Workflow\tTotal\tUsers\nTime(Catalog)\t240 min\t24"} />
        <button type="button" className={styles.resetStyle} onClick={() => { setTimeText(""); setExportStatus(""); }}>Clear time data</button>
      </div>
    </div>
    <div className={styles.modeRow}>
      <label htmlFor={id("mode")}>Probability source</label>
      <select id={id("mode")} value={mode} onChange={(e) => { setMode(e.target.value as ProbabilityMode); setExportStatus(""); }}>
        <option value="provided">Use pasted P(next)</option><option value="counts">Calculate Count / outgoing total</option>
      </select>
      <span>{mode === "provided" ? "Pasted probabilities are kept as supplied." : "Normalizes only the transitions you pasted."}</span>
    </div>
    {parsed.error ? <p className={styles.error} role="alert">{parsed.error}</p> : <>
      {parsed.timeError && <p className={styles.error} role="alert">Time data: {parsed.timeError} The graph still shows all transitions; time sizing will resume when this table is valid.</p>}
      <details className={styles.mapping} open={parsed.states.length <= 8}>
        <summary>Match time to states <span>{matched} of {parsed.states.length} states have time data</span></summary>
        <p>Every state from the transition table appears here. Select its matching workflow time row, or leave it without time data. Suggested matches are editable. Each time row belongs to one state; choosing it elsewhere moves the assignment.</p>
        {!parsed.workflows.length && <p>No time data supplied. Add the optional time table to enable the dropdowns; every state and edge remains on the graph.</p>}
        <div className={styles.tableScroll}><table aria-label="State time assignments">
          <thead><tr><th>State</th><th>Workflow time row</th><th>Match</th><th>Total time</th></tr></thead>
          <tbody>{parsed.states.map((state, i) => {
            const timeIndex = timeSelection[i];
            const workflow = timeIndex === null ? null : parsed.workflows[timeIndex];
            const manual = overrides.key === dataKey && Object.hasOwn(overrides.values, state);
            return <tr key={state}>
              <th scope="row">{state}</th><td><select aria-label={`Time row for ${state}`} disabled={!parsed.workflows.length} value={timeIndex === null ? "" : String(timeIndex)} onChange={(e) => {
                const next = assignStateTime(timeSelection, i, e.target.value === "" ? null : Number(e.target.value));
                const changes: Record<string, number | null> = { [state]: next[i] };
                parsed.states.forEach((name, j) => { if (next[j] !== timeSelection[j]) changes[name] = next[j]; });
                setOverrides((previous) => ({ key: dataKey, values: { ...(previous.key === dataKey ? previous.values : {}), ...changes } }));
                setExportStatus("");
              }}><option value="">No time data</option>{parsed.workflows.map((row, j) => <option key={j} value={j}>{row.name} · {row.minutes.toFixed(1)} min{parsed.workflows.some((other, k) => k !== j && other.name === row.name) ? ` (row ${j + 1})` : ""}</option>)}</select></td>
              <td>{manual ? timeIndex === null ? "No time selected" : "Manual choice" : parsed.stateMatches[i].reason}</td><td>{workflow ? `${workflow.minutes.toFixed(1)} min` : "Not mapped"}</td>
            </tr>;
          })}</tbody>
        </table></div>
        {matched < parsed.states.length && <p className={styles.note}>States without a selected time row stay on the graph with a dashed outline.</p>}
        {unusedTimeRows.length > 0 && <p className={styles.note}>Unused time rows: {unusedTimeRows.map((row) => `${row.name} (${row.minutes.toFixed(1)} min)`).join(", ")}. These rows do not create extra states.</p>}
      </details>
      {parsed.warnings.length > 0 && <details className={styles.warnings}><summary>{parsed.warnings.length} data notes · review probability completeness</summary><ul>{parsed.warnings.map((warning, i) => <li key={i}>{warning}</li>)}</ul><p>A partial graph is still exportable. These notes do not infer missing transitions.</p></details>}
      <div className={styles.workspace}>
        <div className={styles.preview}>
          <div className={styles.previewBar}><span>LIVE GRAPH · {nodes.length} STATES</span><button type="button" onClick={() => setResetKey((n) => n + 1)}>Reset positions ↺</button></div>
          <div className={styles.zoomBar} aria-label="Preview zoom"><button type="button" aria-label="Zoom graph out" disabled={zoom <= 1} onClick={() => setZoom((n) => Math.max(1, n - .5))}>−</button><span>{Math.round(zoom * 100)}%</span><button type="button" aria-label="Zoom graph in" disabled={zoom >= maxZoom} onClick={() => setZoom((n) => Math.min(maxZoom, n + .5))}>+</button><button type="button" onClick={() => { setZoom(1); viewportRef.current?.scrollTo({ top: 0, left: 0 }); }}>Fit graph</button><button type="button" onClick={() => setZoom(Math.max(1, graph.width / (viewportRef.current?.clientWidth || graph.width)))}>Actual size</button></div>
          <div className={styles.focusBar}>
            <label htmlFor={id("focus")}>Focus connections</label><select id={id("focus")} value={focus} onChange={(e) => setFocusedState(e.target.value)}><option value="">All states</option>{parsed.states.map((state) => <option key={state} value={state}>{state}</option>)}</select>
            {focus && <button type="button" className={styles.resetStyle} onClick={() => setFocusedState("")}>Clear focus</button>}
            <span>{denseLabels ? "Select a state to see its edge labels." : "Select or click a state to follow its arrows."}</span>
          </div>
          <div ref={viewportRef} className={styles.graphViewport}><div style={{ width: `${zoom * 100}%` }}><Graph graph={graph} edges={parsed.edges} appearance={appearance} svgRef={svgRef} instanceId={instanceId} resetKey={resetKey} focus={focus} onFocus={setFocusedState} /></div></div>
          <p className={styles.hint}>All states and edges are kept. Drag states to arrange them; zoom and scroll for detail. {denseLabels && "Automatic labels keep dense overviews clear. Choose Show all in Graph styling to display every value. "}Export current view keeps the selected focus, fading and visible labels. Export every state creates one focused PNG per state in a ZIP.</p>
        </div>
        <details className={styles.settings}>
          <summary>Graph styling <span>Title, labels, text sizes, spacing and colours</span></summary>
          <div className={styles.controls} aria-label="Graph appearance">
          <fieldset className={styles.controlGroup}><legend>Title and labels</legend>
          <label htmlFor={id("title")}>Graph title</label><input id={id("title")} value={appearance.title} maxLength={180} onChange={(e) => setStyle("title", e.target.value)} />
          <label htmlFor={id("layout")}>Layout</label><select id={id("layout")} value={appearance.layout} onChange={(e) => setStyle("layout", e.target.value as Appearance["layout"])}><option value="network">Force-directed</option><option value="circle">Circle</option></select>
          <label htmlFor={id("labels")}>Edge labels</label><select id={id("labels")} value={appearance.labels} onChange={(e) => setStyle("labels", e.target.value as Appearance["labels"])}><option value="probability">Probability</option><option value="count">Count</option><option value="both">Probability + count</option><option value="none">Hide labels</option></select>
          <label htmlFor={id("label-display")}>Label display</label><select id={id("label-display")} value={appearance.labelDisplay} onChange={(e) => setStyle("labelDisplay", e.target.value as Appearance["labelDisplay"])}><option value="auto">Automatic · focus dense graphs</option><option value="all">Show all</option></select>
          <p>With more than 20 transitions, automatic labels appear when you focus a state. Show all displays every label in the all-states overview. PNGs keep the labels visible in each view.</p>
          </fieldset>
          <fieldset className={styles.controlGroup}><legend>Text and sizes</legend>
          {([
            ["fontSize", "Node text", 10, 24, 1, "px"], ["edgeFontSize", "Edge text", 9, 22, 1, "px"], ["titleSize", "Title text", 18, 34, 1, "px"],
            ["edgeSize", "Edge thickness", .3, 3, .1, "×"], ["nodeSize", "Node size", .5, 1.5, .1, "×"],
            ["spacing", "State spacing", .7, 2.5, .1, "×"],
          ] as const).map(([name, label, min, max, step, unit]) => <div className={styles.range} key={name}>
            <label htmlFor={id(name)}>{label}<output htmlFor={id(name)}>{appearance[name]}{unit}</output></label>
            <input id={id(name)} type="range" min={min} max={max} step={step} value={appearance[name]} onChange={(e) => setStyle(name, Number(e.target.value))} />
          </div>)}
          </fieldset>
          <fieldset className={styles.controlGroup}><legend>Colours</legend>
          <div className={styles.colors}>{([["nodeColor", "Nodes"], ["edgeColor", "Edges"], ["textColor", "Text"], ["background", "Background"]] as const).map(([name, label]) => <label key={name} htmlFor={id(name)}><input id={id(name)} type="color" value={appearance[name]} onChange={(e) => setStyle(name, e.target.value)} />{label}</label>)}</div>
          <button type="button" className={styles.resetStyle} onClick={() => setAppearance(defaultAppearance)}>Reset appearance</button>
          </fieldset>
          </div>
        </details>
      </div>
      <div className={styles.exportBar}>
        <div><label htmlFor={id("resolution")}>PNG resolution</label><select id={id("resolution")} value={scale} onChange={(e) => setScale(Number(e.target.value))}>{[1, 2, 3].map((factor) => { const dimensions = pngDimensions(graph.width, graph.height, factor); return <option key={factor} value={factor}>{dimensions.width} × {dimensions.height} ({factor}×)</option>; })}</select></div>
        <div className={styles.exportActions}>
          <button type="button" className={styles.primary} onClick={() => download("current")} disabled={exporting !== null}>{exporting === "current" ? "Preparing PNG…" : "Export current view PNG ↓"}</button>
          <button type="button" className={styles.button} onClick={() => download("all")} disabled={exporting !== null}>{exporting === "all" ? "Preparing state PNGs…" : "Export every state ZIP ↓"}</button>
          {exporting === "all" && <button type="button" className={styles.resetStyle} onClick={() => exportAbort.current?.abort()}>Cancel export</button>}
        </div>
      </div>
      <p role="status" className={styles.exportStatus}>{exportStatus}</p>
      <details className={styles.mapping}><summary>Inspect graph data</summary><div className={styles.tableScroll}><table><caption>State time and users</caption><thead><tr><th>State</th><th>Total minutes</th><th>Users</th></tr></thead><tbody>{nodes.map((node) => <tr key={node.name}><td>{node.name}</td><td>{node.minutes?.toFixed(1) ?? "Not mapped"}</td><td>{node.users ?? "Unknown"}</td></tr>)}</tbody></table><table><caption>Directed transitions</caption><thead><tr><th>From</th><th>To</th><th>Count</th><th>P(next)</th></tr></thead><tbody>{parsed.edges.map((edge, i) => <tr key={i}><td>{edge.from}</td><td>{edge.to}</td><td>{edge.count ?? "Not supplied"}</td><td>{edge.probability.toFixed(4)}</td></tr>)}</tbody></table></div></details>
    </>}
  </section>;
}
