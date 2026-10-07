import { pngDimensions } from "./graph";
import { createZIP, safeFilename, statePNGFilename } from "./archive";

/** Snapshot the current scene, optionally focusing another state for batch export. */
export function prepareExportSVG(svg: SVGSVGElement, focus?: string): SVGSVGElement {
  const copy = svg.cloneNode(true) as SVGSVGElement;
  if (focus === undefined) return copy;
  const nodes = [...copy.querySelectorAll<SVGGElement>("[data-state]")];
  if (focus && !nodes.some((node) => node.getAttribute("data-state") === focus)) throw new Error("The selected state is missing from the graph.");
  const connected = new Set([focus]);
  copy.querySelectorAll("[data-transition]").forEach((edge) => {
    const from = edge.getAttribute("data-from"), to = edge.getAttribute("data-to");
    const related = !focus || from === focus || to === focus;
    edge.setAttribute("opacity", related ? "0.7" : "0.08");
    if (from === focus || to === focus) { if (from) connected.add(from); if (to) connected.add(to); }
  });
  copy.querySelectorAll("[data-edge-label]").forEach((label) => {
    const visible = focus ? label.getAttribute("data-from") === focus || label.getAttribute("data-to") === focus : label.getAttribute("data-overview-opacity") === "1";
    label.setAttribute("opacity", visible ? "1" : "0");
    label.setAttribute("aria-hidden", String(!visible));
  });
  nodes.forEach((node) => {
    const state = node.getAttribute("data-state")!;
    node.setAttribute("opacity", !focus || connected.has(state) ? "1" : "0.35");
    node.setAttribute("aria-pressed", String(state === focus));
    node.querySelector("circle")?.setAttribute("stroke-width", state === focus ? "4" : "1.6");
  });
  const caption = copy.querySelector("[data-focus-caption]");
  if (caption) {
    caption.textContent = focus ? `Focus: ${focus} · Other connections are faded` : "";
    caption.setAttribute("opacity", focus ? "1" : "0");
  }
  return copy;
}

async function renderPNG(svg: SVGSVGElement, scale: number, signal?: AbortSignal): Promise<{ blob: Blob; width: number; height: number }> {
  signal?.throwIfAborted();
  await document.fonts.ready;
  signal?.throwIfAborted();
  const source = new XMLSerializer().serializeToString(svg);
  const url = URL.createObjectURL(new Blob([source], { type: "image/svg+xml;charset=utf-8" }));
  const canvas = document.createElement("canvas");
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("The graph could not be converted to an image."));
      image.src = url;
    });
    signal?.throwIfAborted();
    const dimensions = pngDimensions(svg.viewBox.baseVal.width, svg.viewBox.baseVal.height, scale);
    canvas.width = dimensions.width; canvas.height = dimensions.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser could not create the PNG canvas.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("PNG export failed.")), "image/png"));
    signal?.throwIfAborted();
    return { blob, ...dimensions };
  } finally { canvas.width = 0; canvas.height = 0; URL.revokeObjectURL(url); }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = filename;
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export async function exportPNG(svg: SVGSVGElement, title: string, scale: number, focus = "", signal?: AbortSignal): Promise<{ width: number; height: number }> {
  const { blob, width, height } = await renderPNG(prepareExportSVG(svg), scale, signal);
  const name = `${safeFilename(title)}${focus ? `--${safeFilename(focus)}` : ""}.png`;
  downloadBlob(blob, name);
  return { width, height };
}

export async function exportAllStates(svg: SVGSVGElement, title: string, scale: number, options: {
  signal?: AbortSignal; onProgress?: (completed: number, total: number, state: string) => void;
} = {}): Promise<{ count: number }> {
  const snapshot = prepareExportSVG(svg);
  const states = [...snapshot.querySelectorAll("[data-state]")].map((node) => node.getAttribute("data-state")!);
  if (!states.length) throw new Error("Add transitions before exporting states.");
  const files: { name: string; data: Blob }[] = [];
  for (const [i, state] of states.entries()) {
    options.signal?.throwIfAborted();
    options.onProgress?.(i, states.length, state);
    const { blob } = await renderPNG(prepareExportSVG(snapshot, state), scale, options.signal);
    files.push({ name: statePNGFilename(state, i), data: blob });
  }
  options.onProgress?.(states.length, states.length, "");
  const archive = await createZIP(files, options.signal);
  options.signal?.throwIfAborted();
  downloadBlob(archive, `${safeFilename(title)}-all-states.zip`);
  return { count: states.length };
}
