import { calculateWave, DEFAULT_INPUT, type WaveInput } from "./physics";

export function readExperimentInput(search: string, instanceId: string, acceptLegacyQuery: boolean): WaveInput | null {
  const query = new URLSearchParams(search);
  const target = query.get("experiment");
  if (target !== null ? target !== instanceId : !acceptLegacyQuery) return null;
  if (!["angle", "n1", "n2", "polarization"].some((key) => query.has(key))) return null;
  const input: WaveInput = {
    angle: Number(query.get("angle") ?? DEFAULT_INPUT.angle),
    n1: Number(query.get("n1") ?? DEFAULT_INPUT.n1),
    n2: Number(query.get("n2") ?? DEFAULT_INPUT.n2),
    polarization: (query.get("polarization") ?? DEFAULT_INPUT.polarization) as WaveInput["polarization"],
  };
  calculateWave(input);
  if (input.angle > 89.9 || input.n1 < 0.1 || input.n2 < 0.1) throw new RangeError("Outside control range");
  return input;
}

export function createExperimentUrl(href: string, input: WaveInput, instanceId: string): string {
  const url = new URL(href);
  url.search = new URLSearchParams({
    experiment: instanceId,
    angle: String(input.angle),
    n1: String(input.n1),
    n2: String(input.n2),
    polarization: input.polarization,
  }).toString();
  url.hash = instanceId;
  return url.href;
}
