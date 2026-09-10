"use client";

import styles from "./styles.module.css";

import { useId, useState } from "react";

export default function NumberControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  const [draft, setDraft] = useState(String(Number(value.toFixed(6))));
  const [error, setError] = useState(false);
  const [previousValue, setPreviousValue] = useState(value);
  // Synchronize presets and reset without remounting the focused input.
  if (value !== previousValue) {
    setPreviousValue(value);
    setDraft(String(Number(value.toFixed(6))));
    setError(false);
  }
  const id = useId();
  return (
    <div className={styles["number-control"]}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={draft}
        aria-invalid={error}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => {
          const raw = event.target.value;
          setDraft(raw);
          const next = Number(raw);
          const valid =
            raw.trim() !== "" &&
            Number.isFinite(next) &&
            next >= min &&
            next <= max;
          setError(!valid);
          if (valid) onChange(next);
        }}
        onBlur={() => {
          if (error) {
            setDraft(String(Number(value.toFixed(6))));
            setError(false);
          }
        }}
      />
      {error && (
        <span id={`${id}-error`} className={styles["input-error"]} role="status">
          Use {min}–{max}. Showing the last valid value.
        </span>
      )}
    </div>
  );
}
