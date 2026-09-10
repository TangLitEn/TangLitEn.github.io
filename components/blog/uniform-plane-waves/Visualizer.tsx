"use client";

import styles from "./styles.module.css";

import { useEffect, useId, useMemo, useState } from "react";
import type { SimulationProps } from "../../../lib/simulations";
import { createExperimentUrl, readExperimentInput } from "../../../lib/uniform-plane-waves/sharing";
import {
  calculateWave,
  DEFAULT_INPUT,
  type Polarization,
  type WaveInput,
} from "../../../lib/uniform-plane-waves/physics";
import WaveCanvas from "./WaveCanvas";
import NumberControl from "./NumberControl";

const presets: { label: string; input: WaveInput }[] = [
  { label: "Air → glass", input: DEFAULT_INPUT },
  {
    label: "Glass → air",
    input: { angle: 30, n1: 1.5, n2: 1, polarization: "s" },
  },
  {
    label: "Total reflection",
    input: { angle: 50, n1: 1.5, n2: 1, polarization: "s" },
  },
  {
    label: "Brewster’s angle",
    input: {
      angle: (Math.atan(1.5) * 180) / Math.PI,
      n1: 1,
      n2: 1.5,
      polarization: "p",
    },
  },
];
const angleText = (value: number | null) =>
  value === null ? "—" : `${value.toFixed(2)}°`;

export default function Visualizer({ instanceId, acceptLegacyQuery }: SimulationProps) {
  const titleId = useId();
  const polarizationId = useId();
  const [input, setInput] = useState<WaveInput>(DEFAULT_INPUT);
  const [playing, setPlaying] = useState(false);
  const [shared, setShared] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const result = useMemo(() => calculateWave(input), [input]);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Initial browser preferences and query parameters are unavailable during static rendering.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydrate external browser state after the static first render.
    setPlaying(!preference.matches);
    const change = () => setPlaying(!preference.matches);
    preference.addEventListener("change", change);
    try {
      const parsed = readExperimentInput(window.location.search, instanceId, acceptLegacyQuery);
      if (parsed) setInput(parsed);
    } catch {
      setShared("That link contained invalid parameters. The default example is shown.");
    }
    return () => preference.removeEventListener("change", change);
  }, [instanceId, acceptLegacyQuery]);
  function update(next: WaveInput) {
    setInput(next);
    setShared("");
    setShareUrl("");
  }
  async function share() {
    const url = createExperimentUrl(window.location.href, input, instanceId);
    try {
      await navigator.clipboard.writeText(url);
      setShared("Link copied. It opens with these parameters.");
    } catch {
      setShareUrl(url);
      setShared("Copy the link below to share these parameters.");
    }
  }
  const status = result.totalInternalReflection
    ? "Total internal reflection"
    : result.atCriticalAngle
      ? "At the critical angle"
      : input.n1 === input.n2
        ? "Matched refractive indices"
        : result.Rp < 1e-12 && input.polarization === "p"
          ? "At Brewster’s angle"
          : "Reflection & refraction";
  return (
    <section className={styles["explorer"]} id={instanceId} aria-labelledby={titleId}>
      <noscript><p className={styles["notice"]}>Enable JavaScript to change parameters and view the diagram. The equations and notes below remain available.</p></noscript>
      <div className={styles["section-heading"]}>
        <h2 id={titleId}>Explore the boundary</h2>
        <span className={styles["section-kicker"]}>
          CHANGE A PARAMETER. FOLLOW THE WAVE.
        </span>
      </div>
      <div className={styles["experiment-layout"]}>
        <div className={styles["visualization"]}>
          <div className={styles["diagram-heading"]}>
            <span className={styles["status"]}>
              <span aria-hidden="true" />
              {status}
            </span>
            <button
              className={styles["text-button"]}
              onClick={() => setPlaying((p) => !p)}
              aria-pressed={playing}
            >
              {playing ? "Pause motion" : "Play motion"}{" "}
              <span aria-hidden="true">{playing ? "Ⅱ" : "▷"}</span>
            </button>
          </div>
          <WaveCanvas input={input} result={result} playing={playing} />
          <div className={styles["legend"]} aria-label="Ray legend">
            <span>
              <i className={styles["incident"]} />
              Incident
            </span>
            <span>
              <i className={styles["reflected"]} />
              Reflected
            </span>
            <span>
              <i className={styles["transmitted"]} />
              Transmitted
            </span>
            <span className={styles["legend-note"]}>Angles from the normal</span>
          </div>
          <div className={styles["results"]} aria-live="polite" aria-atomic="true">
            <div>
              <span>
                Reflection <i>θᵣ</i>
              </span>
              <strong>{angleText(result.reflectedAngle)}</strong>
            </div>
            <div>
              <span>
                Refraction <i>θₜ</i>
              </span>
              <strong>{angleText(result.transmittedAngle)}</strong>
              {result.totalInternalReflection && (
                <small>No propagating ray</small>
              )}
            </div>
            <div>
              <span>
                Reflected power <i>R</i>
              </span>
              <strong>
                {(result.reflectance * 100).toFixed(2)}
                <small>%</small>
              </strong>
            </div>
            <div>
              <span>
                Transmitted power <i>T</i>
              </span>
              <strong>
                {(result.transmittance * 100).toFixed(2)}
                <small>%</small>
              </strong>
            </div>
          </div>
          <div
            className={styles["power-track"]}
            role="img"
            aria-label={`${(result.reflectance * 100).toFixed(2)}% reflected, ${(result.transmittance * 100).toFixed(2)}% transmitted`}
          >
            <span style={{ width: `${result.reflectance * 100}%` }} />
            <span style={{ width: `${result.transmittance * 100}%` }} />
          </div>
          <p className={styles["diagram-caption"]}>
            {result.totalInternalReflection
              ? "Above the critical angle, all incident power is reflected. The evanescent field is not shown."
              : result.atCriticalAngle
                ? "The transmitted direction is along the boundary; no power crosses into medium 2."
                : input.n1 === input.n2
                  ? "With matching refractive indices, the wave continues straight through without reflection."
                  : input.angle === 0
                    ? "At normal incidence, rays share the normal. Incident and reflected lines are slightly offset for readability."
                    : input.n2 > input.n1
                      ? "Into a higher refractive index: the transmitted wave bends toward the normal."
                      : "Into a lower refractive index: the transmitted wave bends away from the normal."}
          </p>
        </div>
        <aside className={styles["controls"]} aria-label="Wave parameters">
          <p className={styles["eyebrow"]}>THE SETUP</p>
          <NumberControl
            label="Incident angle θᵢ (°)"
            value={input.angle}
            min={0}
            max={89.9}
            step={0.1}
            onChange={(angle) => update({ ...input, angle })}
          />
          <input
            className={styles["angle-slider"]}
            type="range"
            min={0}
            max={89.9}
            step={0.1}
            value={input.angle}
            aria-label="Incident angle slider"
            aria-valuetext={`${input.angle.toFixed(2)} degrees`}
            onChange={(e) =>
              update({ ...input, angle: Number(e.target.value) })
            }
          />
          <div className={styles["range-labels"]}>
            <span>0°</span>
            <span>89.9°</span>
          </div>
          <div className={styles["medium-inputs"]}>
            <NumberControl
              label="Medium 1 · n₁"
              value={input.n1}
              min={0.1}
              max={10}
              step={0.01}
              onChange={(n1) => update({ ...input, n1 })}
            />
            <NumberControl
              label="Medium 2 · n₂"
              value={input.n2}
              min={0.1}
              max={10}
              step={0.01}
              onChange={(n2) => update({ ...input, n2 })}
            />
          </div>
          <label className={styles["select-label"]} htmlFor={polarizationId}>
            Polarization
          </label>
          <select
            id={polarizationId}
            value={input.polarization}
            onChange={(e) =>
              update({ ...input, polarization: e.target.value as Polarization })
            }
          >
            <option value="s">s / TE — perpendicular</option>
            <option value="p">p / TM — parallel</option>
            <option value="unpolarized">Unpolarized</option>
          </select>
          <p className={styles["control-help"]}>
            Electric field relative to the plane of incidence. Changes the power
            split.
          </p>
          <div className={styles["presets"]}>
            <p className={styles["eyebrow"]}>TRY AN EXAMPLE</p>
            {presets.map((preset) => (
              <button
                key={preset.label}
                aria-pressed={Object.keys(preset.input).every(
                  (key) =>
                    input[key as keyof WaveInput] ===
                    preset.input[key as keyof WaveInput],
                )}
                onClick={() => update({ ...preset.input })}
              >
                {preset.label}
                <span aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
          <dl className={styles["special-angles"]}>
            <div>
              <dt>Critical angle</dt>
              <dd>{angleText(result.criticalAngle)}</dd>
            </div>
            <div>
              <dt>
                Brewster’s angle <small>(p)</small>
              </dt>
              <dd>{angleText(result.brewsterAngle)}</dd>
            </div>
          </dl>
          {result.criticalAngle === null && (
            <p className={styles["control-help"]}>No critical angle when n₁ ≤ n₂.</p>
          )}
          <div className={styles["control-actions"]}>
            <button
              className={styles["underlined-button"]}
              onClick={() => update({ ...DEFAULT_INPUT })}
            >
              Reset
            </button>
            <button className={styles["underlined-button"]} onClick={share}>
              Copy experiment link ↗
            </button>
          </div>
          <p className={styles["share-status"]} role="status">
            {shared}
          </p>
          {shareUrl && (
            <input
              className={styles["share-url"]}
              aria-label="Experiment link"
              readOnly
              value={shareUrl}
              onFocus={(e) => e.target.select()}
            />
          )}
        </aside>
      </div>
    </section>
  );
}
