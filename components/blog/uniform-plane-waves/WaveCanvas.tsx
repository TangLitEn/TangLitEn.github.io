"use client";

import styles from "./styles.module.css";

import { useEffect, useRef } from "react";
import { radians, type WaveInput, type WaveResult } from "../../../lib/uniform-plane-waves/physics";

const colors = {
  incident: "#5c704c",
  reflected: "#ad694b",
  transmitted: "#527e8a",
};

export default function WaveCanvas({
  input,
  result,
  playing,
}: {
  input: WaveInput;
  result: WaveResult;
  playing: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phase = useRef(0);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const ctx = context;
    let frame = 0;
    let lastTime = 0;
    let visible = !document.hidden;
    const W = 720,
      H = 420,
      cx = W / 2,
      cy = H / 2;

    function draw() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.clientWidth;
      if (!width) return;
      const pixelWidth = Math.round(width * dpr);
      const pixelHeight = Math.round(((width * H) / W) * dpr);
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }
      ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#f7f7f0";
      ctx.fillRect(0, 0, cx, H);
      ctx.fillStyle = "#edf1ee";
      ctx.fillRect(cx, 0, cx, H);
      ctx.strokeStyle = "#dce0d6";
      ctx.lineWidth = 0.6;
      for (let x = 0; x <= W; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y <= H; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      ctx.strokeStyle = "#a9b19e";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, H);
      ctx.stroke();
      ctx.setLineDash([5, 6]);
      ctx.strokeStyle = "#a1a798";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(18, cy);
      ctx.lineTo(W - 18, cy);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = "12px system-ui, sans-serif";
      ctx.fillStyle = "#71736b";
      ctx.fillText("MEDIUM 1", 22, 29);
      ctx.fillText("MEDIUM 2", cx + 22, 29);
      ctx.font = "italic 20px Georgia, serif";
      ctx.fillStyle = "#454d3f";
      ctx.fillText(`n₁ = ${input.n1}`, 22, 56);
      ctx.fillText(`n₂ = ${input.n2}`, cx + 22, 56);
      ctx.font = "11px system-ui, sans-serif";
      ctx.fillStyle = "#71736b";
      ctx.fillText("normal", W - 65, cy - 10);
      ctx.fillText("boundary", cx + 10, H - 16);

      function endpoint(angle: number, sx: number, sy: number) {
        const dx = Math.cos(angle) * sx,
          dy = Math.sin(angle) * sy;
        const length = Math.min(
          (cx - 35) / Math.max(Math.abs(dx), 1e-12),
          (cy - 75) / Math.max(Math.abs(dy), 1e-12),
        );
        return { x: cx + dx * length, y: cy + dy * length };
      }
      function ray(
        end: { x: number; y: number },
        color: string,
        incoming: boolean,
        power: number,
        offset = 0,
      ) {
        if (power < 1e-12) return;
        const start = incoming ? end : { x: cx, y: cy };
        const finish = incoming ? { x: cx, y: cy } : end;
        const dx = finish.x - start.x,
          dy = finish.y - start.y;
        const a = Math.atan2(dy, dx);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.globalAlpha = 0.35 + 0.65 * Math.sqrt(power);
        ctx.setLineDash(
          incoming ? [] : color === colors.reflected ? [7, 4] : [],
        );
        ctx.beginPath();
        ctx.moveTo(start.x, start.y + offset);
        ctx.lineTo(finish.x, finish.y + offset);
        ctx.stroke();
        ctx.setLineDash([]);
        const ax = start.x + dx * 0.6,
          ay = start.y + dy * 0.6 + offset;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax - 10 * Math.cos(a - 0.45), ay - 10 * Math.sin(a - 0.45));
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax - 10 * Math.cos(a + 0.45), ay - 10 * Math.sin(a + 0.45));
        ctx.stroke();
        for (let i = 0; i < 3; i++) {
          const t = (phase.current + i / 3) % 1;
          ctx.beginPath();
          ctx.arc(
            start.x + dx * t,
            start.y + dy * t + offset,
            3,
            0,
            2 * Math.PI,
          );
          ctx.fillStyle = color;
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      const theta = radians(input.angle);
      ray(
        endpoint(theta, -1, -1),
        colors.incident,
        true,
        1,
        input.angle === 0 ? -3 : 0,
      );
      ray(
        endpoint(theta, -1, 1),
        colors.reflected,
        false,
        result.reflectance,
        input.angle === 0 ? 3 : 0,
      );
      if (result.transmittedAngle !== null && !result.atCriticalAngle)
        ray(
          endpoint(radians(result.transmittedAngle), 1, 1),
          colors.transmitted,
          false,
          result.transmittance,
        );
      if (result.atCriticalAngle) {
        ctx.strokeStyle = colors.transmitted;
        ctx.setLineDash([3, 5]);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx, H - 45);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      function arc(radius: number, from: number, to: number, color: string) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.arc(cx, cy, radius, from, to);
        ctx.stroke();
      }
      if (input.angle > 5) {
        arc(44, Math.PI, Math.PI + theta, colors.incident);
        arc(52, Math.PI - theta, Math.PI, colors.reflected);
        ctx.font = "italic 15px Georgia, serif";
        ctx.fillStyle = colors.incident;
        ctx.fillText("θᵢ", cx - 75, cy - 19);
        ctx.fillStyle = colors.reflected;
        ctx.fillText("θᵣ", cx - 75, cy + 30);
      }
      if (result.transmittedAngle !== null && result.transmittedAngle > 5) {
        arc(50, 0, radians(result.transmittedAngle), colors.transmitted);
        ctx.fillStyle = colors.transmitted;
        ctx.font = "italic 15px Georgia, serif";
        ctx.fillText("θₜ", cx + 63, cy + 28);
      }
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, 2 * Math.PI);
      ctx.fillStyle = "#454d3f";
      ctx.fill();
      if (result.totalInternalReflection) {
        ctx.font = "italic 18px Georgia, serif";
        ctx.fillStyle = "#647469";
        ctx.fillText("No propagating transmitted ray", cx + 22, cy + 81);
        ctx.font = "12px system-ui, sans-serif";
        ctx.fillText("Evanescent field not shown", cx + 22, cy + 106);
      }
    }
    function tick(time: number) {
      if (lastTime)
        phase.current =
          (phase.current + Math.min(time - lastTime, 50) / 4500) % 1;
      lastTime = time;
      draw();
      if (playing && visible) frame = requestAnimationFrame(tick);
    }
    function start() {
      cancelAnimationFrame(frame);
      lastTime = 0;
      draw();
      if (playing && visible) frame = requestAnimationFrame(tick);
    }
    function visibility() {
      visible = !document.hidden;
      start();
    }
    const resize = new ResizeObserver(draw);
    resize.observe(canvas);
    document.addEventListener("visibilitychange", visibility);
    start();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [input, result, playing]);

  const description = `Incident and reflected angles: ${input.angle.toFixed(1)} degrees. ${result.transmittedAngle === null ? "Total internal reflection; no propagating transmitted ray." : `Transmitted angle: ${result.transmittedAngle.toFixed(1)} degrees.`} Reflected power: ${(result.reflectance * 100).toFixed(1)} percent. Transmitted power: ${(result.transmittance * 100).toFixed(1)} percent.`;
  return (
    <canvas
      className={styles["wave-canvas"]}
      ref={canvasRef}
      role="img"
      aria-label={description}
    >
      Your browser cannot draw the diagram. The angles and power fractions are
      available in the results below.
    </canvas>
  );
}
