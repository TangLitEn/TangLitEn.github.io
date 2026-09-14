export type FlagWind = { speed: number; gust: number; direction: number };

// Fixed decorative strong wind; no location or weather service is involved.
export const STRONG_WIND: FlagWind = { speed: 32, gust: 48, direction: 100 };

// Vertical banners: u runs left to right, v runs from the pinned top to the free hem.
export function flagDisplacement(u: number, v: number, time: number, phase: number, wind: FlagWind = STRONG_WIND) {
  const strength = Math.min(1, wind.speed / 45);
  const gust = Math.min(1, Math.max(0, wind.gust - wind.speed) / 45);
  const pulse = .5 + .5 * Math.sin(time * .73 + phase);
  const amplitude = .035 + strength * .22 + gust * pulse * .12;
  const wave = time * (1.3 + strength * 3.2) - v * 8 + phase;
  return {
    x: v * v * (.015 + strength * .09) * Math.sin(time * .65 + phase),
    z: v * amplitude * (Math.sin(wave + u * 1.4) + .35 * Math.sin(wave * 1.8 - u * 2)),
    y: v * .025 * Math.sin(wave + 1),
  };
}
