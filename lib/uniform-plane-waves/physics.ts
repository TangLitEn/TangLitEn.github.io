export type Polarization = "s" | "p" | "unpolarized";
export type WaveInput = {
  angle: number;
  n1: number;
  n2: number;
  polarization: Polarization;
};
export const DEFAULT_INPUT: WaveInput = {
  angle: 45,
  n1: 1,
  n2: 1.5,
  polarization: "s",
};
export const radians = (degrees: number) => (degrees * Math.PI) / 180;
export const degrees = (angle: number) => (angle * 180) / Math.PI;

/** Lossless, isotropic, nonmagnetic dielectrics; angles from the interface normal.
 * Fresnel power coefficients, not electric-field amplitudes. No absorption.
 */
export function calculateWave({ angle, n1, n2, polarization }: WaveInput) {
  if (!Number.isFinite(angle) || angle < 0 || angle >= 90)
    throw new RangeError(
      "The incident angle must be at least 0° and less than 90°.",
    );
  if (![n1, n2].every((n) => Number.isFinite(n) && n > 0 && n <= 10))
    throw new RangeError(
      "Refractive indices must be greater than 0 and at most 10.",
    );
  if (!["s", "p", "unpolarized"].includes(polarization))
    throw new RangeError("Choose a valid polarization.");
  const theta = radians(angle);
  const sinT = (n1 / n2) * Math.sin(theta);
  const criticalAngle = n1 > n2 ? degrees(Math.asin(n2 / n1)) : null;
  const brewsterAngle = degrees(Math.atan(n2 / n1));
  const totalInternalReflection = sinT > 1 + 1e-12;
  const atCriticalAngle = n1 > n2 && Math.abs(sinT - 1) <= 1e-12;
  const transmittedAngle = totalInternalReflection
    ? null
    : degrees(Math.asin(Math.min(1, sinT)));
  let Rs = 1;
  let Rp = 1;
  if (!totalInternalReflection) {
    const ci = Math.cos(theta);
    const ct = atCriticalAngle ? 0 : Math.sqrt(Math.max(0, 1 - sinT * sinT));
    Rs = ((n1 * ci - n2 * ct) / (n1 * ci + n2 * ct)) ** 2;
    Rp = ((n2 * ci - n1 * ct) / (n2 * ci + n1 * ct)) ** 2;
    if (n1 === n2) Rs = Rp = 0;
  }
  const reflectance = Math.max(
    0,
    Math.min(
      1,
      polarization === "s" ? Rs : polarization === "p" ? Rp : (Rs + Rp) / 2,
    ),
  );
  return {
    reflectedAngle: angle,
    transmittedAngle,
    criticalAngle,
    brewsterAngle,
    totalInternalReflection,
    atCriticalAngle,
    reflectance,
    transmittance: 1 - reflectance,
    Rs,
    Rp,
  };
}
export type WaveResult = ReturnType<typeof calculateWave>;
