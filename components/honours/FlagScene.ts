import * as THREE from "three";
import type { Badge } from "../../lib/badges";
import { flagDisplacement, STRONG_WIND } from "../../lib/flag-motion";

// One shared WebGL context renders all flag slots, including responsive rows.
export function createFlagScene(host: HTMLElement, badges: Badge[]) {
  const canvas = document.createElement("canvas");
  canvas.className = "flag-canvas";
  // These bounds are essential to the renderer, independent of stylesheet timing.
  Object.assign(canvas.style, { position: "absolute", inset: "0", width: "100%", height: "100%", pointerEvents: "none", zIndex: "1" });
  canvas.setAttribute("aria-hidden", "true");
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.setScissorTest(true);
  host.appendChild(canvas);
  let disposed = false;
  let frame = 0;
  let visible = false;
  let last = 0;
  let time = 0;
  let width = 0;
  let height = 0;
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const slots = Array.from(host.querySelectorAll<HTMLElement>("[data-flag-slot]"));
  const views = slots.map((slot, index) => {
    const badge = badges.find((item) => item.id === slot.dataset.flagId)!;
    const scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xffffff, 1.9));
    const light = new THREE.DirectionalLight(0xfff4df, 1.8);
    light.position.set(-2, 4, 5);
    scene.add(light);
    const camera = new THREE.PerspectiveCamera(34, 1, .1, 30);
    camera.position.set(0, 0, 5.5);
    camera.lookAt(0, 0, 0);
    const group = new THREE.Group();
    scene.add(group);
    // The image IS the fabric, including its transparent cutout and complete design.
    const textureCanvas = document.createElement("canvas");
    textureCanvas.width = 240;
    textureCanvas.height = 400;
    const ctx = textureCanvas.getContext("2d")!;
    const wip = badge.status === "wip";
    const texture = new THREE.CanvasTexture(textureCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    const image = new window.Image();
    image.onload = () => {
      if (disposed) return;
      const scale = Math.min(1, 1024 / Math.max(image.naturalWidth, image.naturalHeight));
      textureCanvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      textureCanvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      if (wip) ctx.filter = "grayscale(1)";
      ctx.drawImage(image, 0, 0, textureCanvas.width, textureCanvas.height);
      // Preserve the artwork's aspect ratio, rather than stamping it on a background.
      cloth.scale.x = (image.naturalWidth / image.naturalHeight) / (1.65 / 2.75);
      texture.needsUpdate = true;
      slot.classList.add("flag-loaded");
      invalidate();
    };
    image.src = badge.image;
    const geometry = new THREE.PlaneGeometry(1.65, 2.75, 24, 40);
    const original = new Float32Array(geometry.attributes.position.array);
    const material = new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide, transparent: true, alphaTest: .08, roughness: .94, metalness: 0 });
    const cloth = new THREE.Mesh(geometry, material);
    cloth.frustumCulled = false;
    group.add(cloth);
    return { scene, camera, group, geometry, original, texture, material, cloth, image, light, slot, phase: index * 2.399 + .7 };
  });

  function draw(now: number) {
    frame = 0;
    if (disposed || !visible || document.hidden) return;
    const animate = !motion.matches;
    if (animate && now - last < 32) { frame = requestAnimationFrame(draw); return; }
    if (animate) time += Math.min((now - last) / 1000, .05);
    last = now;
    const bounds = host.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    if (width !== bounds.width || height !== bounds.height) {
      width = bounds.width; height = bounds.height;
      renderer.setSize(width, height, false);
    }
    renderer.setScissorTest(false);
    renderer.clear();
    renderer.setScissorTest(true);
    for (const view of views) {
      if (!view.slot) continue;
      const box = view.slot.getBoundingClientRect();
      if (box.bottom < 0 || box.top > window.innerHeight || box.right < bounds.left || box.left > bounds.right || !box.width) continue;
      const positions = view.geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const x = view.original[i * 3], y = view.original[i * 3 + 1];
        const delta = flagDisplacement((x + .825) / 1.65, (1.375 - y) / 2.75, time, view.phase);
        positions.setXYZ(i, x + delta.x, y + delta.y, delta.z);
      }
      positions.needsUpdate = true;
      view.geometry.computeVertexNormals();
      view.group.rotation.y = -.15 + .18 * Math.sin(STRONG_WIND.direction * Math.PI / 180);
      view.camera.aspect = box.width / box.height;
      const clothWidth = 1.65 * view.cloth.scale.x;
      view.camera.position.z = Math.max(5.5, (clothWidth + .4) / (2 * Math.tan(17 * Math.PI / 180) * view.camera.aspect));
      view.camera.updateProjectionMatrix();
      renderer.setViewport(box.left - bounds.left, height - (box.bottom - bounds.top), box.width, box.height);
      renderer.setScissor(box.left - bounds.left, height - (box.bottom - bounds.top), box.width, box.height);
      renderer.render(view.scene, view.camera);
    }
    if (animate) frame = requestAnimationFrame(draw);
  }
  function invalidate() { if (!disposed && !frame) frame = requestAnimationFrame(draw); }
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) invalidate();
    else { cancelAnimationFrame(frame); frame = 0; }
  });
  observer.observe(host);
  const resize = new ResizeObserver(invalidate);
  resize.observe(host);
  window.addEventListener("scroll", invalidate, { passive: true });
  document.addEventListener("visibilitychange", invalidate);
  motion.addEventListener("change", invalidate);
  // Losing GPU access reveals the static flag artwork and preserves every link.
  const contextLost = () => cleanup();
  canvas.addEventListener("webglcontextlost", contextLost);
  function cleanup() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect(); resize.disconnect();
    window.removeEventListener("scroll", invalidate);
    document.removeEventListener("visibilitychange", invalidate);
    motion.removeEventListener("change", invalidate);
    canvas.removeEventListener("webglcontextlost", contextLost);
    views.forEach((view) => {
      view.image.onload = null;
      view.slot?.classList.remove("flag-loaded");
      view.scene.traverse((object) => { if (object instanceof THREE.Mesh) object.geometry.dispose(); });
      view.texture.dispose(); view.material.dispose();
    });
    renderer.dispose(); canvas.remove();
  }
  return { invalidate, dispose: cleanup };
}
