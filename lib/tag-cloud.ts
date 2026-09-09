export type CloudTag = { label: string; count: number; href: string };
export type CloudBubble = { x: number; y: number; size: number; fontSize: number };
export type CloudLayout = { bubbles: CloudBubble[]; height: number };

export const CLOUD_PADDING = 18;

export type CloudBody = CloudBubble & { vx: number; vy: number };
export type CloudSimulation = { bubbles: CloudBody[]; width: number; height: number };
export type CloudPin = { index: number; x: number; y: number };
// Reduce bubble sizes gradually as the cloud narrows, while preserving readable
// labels and touch targets. More space between circles keeps mobile clouds airy.
function compactness(width: number) {
  return Math.max(0, Math.min(1, (600 - width) / 324));
}

export function cloudContactGap(width: number) {
  return 8 + 6 * compactness(width);
}

export function createCloudSimulation(tags: CloudTag[], width: number): CloudSimulation {
  const layout = layoutTagCloud(tags, width);
  return { ...layout, width, bubbles: layout.bubbles.map((bubble) => ({ ...bubble, vx: 0, vy: 0 })) };
}

function constrainBody(body: CloudBody, width: number, height: number) {
  const x = Math.max(CLOUD_PADDING, Math.min(width - body.size - CLOUD_PADDING, body.x));
  const y = Math.max(CLOUD_PADDING, Math.min(height - body.size - CLOUD_PADDING, body.y));
  if (x !== body.x) body.vx = 0;
  if (y !== body.y) body.vy = 0;
  body.x = x;
  body.y = y;
}

// Resolve contacts repeatedly because pushing one circle can touch another.
// A held circle has infinite mass; the surrounding circles move out of its way.
function resolveContacts(simulation: CloudSimulation, held = -1): boolean {
  const { bubbles, width, height } = simulation;
  const contactGap = cloudContactGap(width);
  for (let pass = 0; pass < 80; pass++) {
    for (const body of bubbles) constrainBody(body, width, height);
    let largestOverlap = 0;
    for (let i = 0; i < bubbles.length; i++) {
      for (let j = i + 1; j < bubbles.length; j++) {
        const a = bubbles[i];
        const b = bubbles[j];
        let dx = b.x + b.size / 2 - a.x - a.size / 2;
        let dy = b.y + b.size / 2 - a.y - a.size / 2;
        let distance = Math.hypot(dx, dy);
        if (distance < 0.0001) { dx = 1; dy = 0; distance = 1; }
        const overlap = (a.size + b.size) / 2 + contactGap - distance;
        if (overlap <= 0) continue;
        largestOverlap = Math.max(largestOverlap, overlap);
        const nx = dx / distance;
        const ny = dy / distance;
        const massA = i === held ? 0 : 1 / (a.size * a.size);
        const massB = j === held ? 0 : 1 / (b.size * b.size);
        const shareA = massA / (massA + massB);
        const shareB = 1 - shareA;
        a.x -= nx * overlap * shareA;
        a.y -= ny * overlap * shareA;
        b.x += nx * overlap * shareB;
        b.y += ny * overlap * shareB;
        // Remove closing velocity so resting contacts settle instead of jittering.
        const closing = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        if (closing < 0) {
          a.vx += nx * closing * shareA;
          a.vy += ny * closing * shareA;
          b.vx -= nx * closing * shareB;
          b.vy -= ny * closing * shareB;
        }
      }
    }
    if (largestOverlap < 0.02) {
      for (const body of bubbles) constrainBody(body, width, height);
      // Check the final positions, including contacts at the container walls.
      return bubbles.every((a, i) => bubbles.slice(i + 1).every((b) =>
        Math.hypot(b.x + b.size / 2 - a.x - a.size / 2, b.y + b.size / 2 - a.y - a.size / 2) >= (a.size + b.size) / 2 + contactGap - 0.05));
    }
  }
  return false;
}

export function dragCloudBubble(previous: CloudSimulation, pin: CloudPin): CloudSimulation {
  const original = previous.bubbles[pin.index];
  if (!original) return previous;
  const target = { ...original, x: pin.x, y: pin.y };
  constrainBody(target, previous.width, previous.height);
  const distance = Math.hypot(target.x - original.x, target.y - original.y);
  const steps = Math.max(1, Math.ceil(distance / 8));
  let safe = previous;
  // Sweep fast pointer moves in small increments to avoid tunneling through tags.
  for (let step = 1; step <= steps; step++) {
    const next = { ...safe, bubbles: safe.bubbles.map((body) => ({ ...body })) };
    Object.assign(next.bubbles[pin.index], {
      x: original.x + (target.x - original.x) * step / steps,
      y: original.y + (target.y - original.y) * step / steps,
      vx: 0, vy: 0,
    });
    if (!resolveContacts(next, pin.index)) break;
    safe = next;
  }
  return safe;
}

export function stepCloudSimulation(previous: CloudSimulation, seconds: number, held = -1): CloudSimulation {
  const dt = Math.max(0, Math.min(seconds, 1 / 30));
  const next = { ...previous, bubbles: previous.bubbles.map((body) => ({ ...body })) };
  const { bubbles } = next;
  const contactGap = cloudContactGap(next.width);
  const strength = 7 / Math.max(1, bubbles.length - 1);
  for (let i = 0; i < bubbles.length; i++) {
    for (let j = i + 1; j < bubbles.length; j++) {
      const a = bubbles[i];
      const b = bubbles[j];
      const dx = b.x + b.size / 2 - a.x - a.size / 2;
      const dy = b.y + b.size / 2 - a.y - a.size / 2;
      const distance = Math.max(0.001, Math.hypot(dx, dy));
      const gap = Math.max(0, distance - (a.size + b.size) / 2 - contactGap);
      const force = Math.min(400, gap * strength) * dt;
      if (i !== held) { a.vx += dx / distance * force; a.vy += dy / distance * force; }
      if (j !== held) { b.vx -= dx / distance * force; b.vy -= dy / distance * force; }
    }
  }
  const damping = Math.exp(-4 * dt);
  for (const [index, body] of bubbles.entries()) {
    if (index === held) { body.vx = 0; body.vy = 0; continue; }
    body.vx *= damping;
    body.vy *= damping;
    body.x += body.vx * dt;
    body.y += body.vy * dt;
  }
  // A crowded boundary can be immovable. Keep the last valid frame in that case.
  return resolveContacts(next, held) ? next : { ...previous, bubbles: previous.bubbles.map((body) => ({ ...body, vx: 0, vy: 0 })) };
}

// Pack the largest tags first, then nest smaller ones around their edges.
// The same counts always produce the same arrangement; no random SSR layout.
export function layoutTagCloud(tags: CloudTag[], width: number): CloudLayout {
  const available = Math.max(44, width - CLOUD_PADDING * 2);
  const compact = compactness(width);
  const gap = cloudContactGap(width) + 4;
  const sizes = tags.map(({ count }) => Math.min(available, 220 - 80 * compact, 110 - 28 * compact + (48 - 24 * compact) * (Math.sqrt(Math.max(1, count)) - 1)));
  const order = tags.map((_, index) => index).sort((a, b) => sizes[b] - sizes[a] || a - b);
  const placed: (CloudBubble & { index: number })[] = [];

  for (const index of order) {
    const size = sizes[index];
    const radius = size / 2;
    let best: { x: number; y: number; score: number } | undefined;
    if (!placed.length) best = { x: 0, y: 0, score: 0 };
    for (const neighbor of placed) {
      const distance = radius + neighbor.size / 2 + gap;
      for (let step = 0; step < 48; step++) {
        const angle = (step / 48) * Math.PI * 2;
        const x = neighbor.x + Math.cos(angle) * distance;
        const y = neighbor.y + Math.sin(angle) * distance;
        if (Math.abs(x) + radius > available / 2) continue;
        if (placed.some((other) => Math.hypot(x - other.x, y - other.y) < radius + other.size / 2 + gap - 0.1)) continue;
        const score = x * x + y * y * 1.6;
        if (!best || score < best.score) best = { x, y, score };
      }
    }
    // Narrow screens (or unusually long collections) can always grow vertically.
    if (!best) best = { x: 0, y: Math.max(...placed.map((item) => item.y + item.size / 2)) + radius + gap, score: 0 };
    placed.push({ index, x: best.x, y: best.y, size, fontSize: Math.min(36 - 10 * compact, 20 - 4 * compact + (6 - 2 * compact) * (Math.sqrt(Math.max(1, tags[index].count)) - 1)) });
  }

  if (!placed.length) return { bubbles: [], height: 0 };
  const left = Math.min(...placed.map((item) => item.x - item.size / 2));
  const right = Math.max(...placed.map((item) => item.x + item.size / 2));
  const top = Math.min(...placed.map((item) => item.y - item.size / 2));
  const bottom = Math.max(...placed.map((item) => item.y + item.size / 2));
  const height = Math.max(240, bottom - top + CLOUD_PADDING * 2 + compact * 48);
  const bubbles: CloudBubble[] = [];
  for (const item of placed) {
    bubbles[item.index] = {
      x: item.x - item.size / 2 + (width - left - right) / 2,
      y: item.y - item.size / 2 + (height - top - bottom) / 2,
      size: item.size,
      fontSize: item.fontSize,
    };
  }
  return { bubbles, height };
}
