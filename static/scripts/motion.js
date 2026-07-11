// ponytail: beUI motion ports (not-found-glitch + dot-matrix loader) — no React stack

const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&@$?/\\";
const SCRAMBLE_MS = 700;
const TICK_MS = 45;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function scrambleText(el, text) {
  const chars = text.split("");
  const start = performance.now();
  let last = 0;
  let raf = 0;

  const loop = (now) => {
    if (now - last >= TICK_MS) {
      last = now;
      const progress = Math.min((now - start) / SCRAMBLE_MS, 1);
      const settled = Math.floor(progress * chars.length);
      el.textContent = chars
        .map((ch, i) =>
          i < settled || ch === " "
            ? ch
            : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        )
        .join("");
    }
    if (now - start < SCRAMBLE_MS) {
      raf = requestAnimationFrame(loop);
    } else {
      el.textContent = text;
    }
  };

  raf = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(raf);
}

function initNotFoundGlitch(root) {
  if (root.dataset.notFoundGlitchReady) return;
  root.dataset.notFoundGlitchReady = "1";

  const reduce = prefersReducedMotion();
  root.querySelectorAll("[data-glitch-text]").forEach((el) => {
    const text = el.dataset.glitchText || el.textContent.trim();
    if (reduce) {
      el.textContent = text;
      return;
    }
    scrambleText(el, text);
  });
}

function initDotMatrix(el) {
  if (el.dataset.dotMatrixReady) return;
  el.dataset.dotMatrixReady = "1";

  const size = Number(el.dataset.size) || 32;
  const speed = Number(el.dataset.speed) || 1;
  el.style.setProperty("--loader-size", `${size}px`);
  el.style.setProperty("--loader-speed", `${speed}s`);

  const n = 3;
  for (let idx = 0; idx < n * n; idx++) {
    const x = idx % n;
    const y = Math.floor(idx / n);
    const delay = ((x + y) / (2 * (n - 1))) * speed;
    const dot = document.createElement("span");
    dot.style.animationDelay = `${delay}s`;
    el.appendChild(dot);
  }
}

function bootMotion() {
  document.querySelectorAll("[data-not-found-glitch]").forEach(initNotFoundGlitch);
  document.querySelectorAll("[data-dot-matrix]").forEach(initDotMatrix);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootMotion);
} else {
  bootMotion();
}

document.body.addEventListener("htmx:afterSwap", bootMotion);
