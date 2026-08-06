"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/* ────────────────────────────────────────────────────────────────────────
   LensBackground — EXACTLY from prompt1's code.

   A full-screen WebGL background: the forest photograph is rendered as two
   texture layers. Outside the lens you see the SURFACE (cool, desaturated,
   dimmed — the "calm" grade). Inside the lens — refracted and chromatically
   split — the HIDDEN vivid warm grade shows through.

   The lens follows the cursor / touch with spring inertia (release glide).
   One WebGL pass (three): a full-screen quad samples two canvas textures.
   The fragment shader does spherical refraction + chromatic aberration +
   a glassy rim inside a soft circle at the lens position.

   This is the BACKGROUND + CURSOR. It sits at z -20 (behind content) so the
   forest shows as the page background and the lens acts as the cursor
   refracting the forest beneath the pointer.

   prefers-reduced-motion: one static surface frame, lens parked, no solver.
   ──────────────────────────────────────────────────────────────────────── */

// The two photo layers — EXACT paths from prompt1's code.
const IMAGES = ["/your-images/surface.jpg", "/your-images/hidden.jpg"];

// Two aligned layers — EXACT filter + wash values from prompt1's code.
const SURFACE = {
  filter: "grayscale(0.5) brightness(0.66) contrast(1.06) saturate(0.7)",
  wash: "rgba(28,40,54,0.42)",
};
const HIDDEN = {
  filter: "saturate(1.32) contrast(1.08) brightness(1.04)",
  wash: "rgba(255,150,70,0.10)",
};

const VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAG = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uSurface;
  uniform sampler2D uHidden;
  uniform vec2  uLens;
  uniform float uRadius;
  uniform float uAspect;
  uniform float uActive;
  uniform float uTime;

  void main() {
    vec2 p = vUv;
    vec3 surface = texture2D(uSurface, p).rgb;

    vec2 d = p - uLens;
    d.x *= uAspect;
    float dist = length(d);
    float r = uRadius;

    float rr = r * (1.0 + 0.012 * sin(uTime * 1.1));

    float feather = 0.014;
    float mask = (1.0 - smoothstep(rr - feather, rr, dist)) * uActive;

    float shadow = smoothstep(rr, rr + 0.012, dist) * (1.0 - smoothstep(rr + 0.012, rr + 0.10, dist));
    surface *= 1.0 - shadow * 0.32 * uActive;

    vec3 outc = surface;

    if (mask > 0.001) {
      float t = clamp(dist / rr, 0.0, 1.0);
      float z = sqrt(max(0.0, 1.0 - t * t));
      vec2 rel = p - uLens;

      float scale = 1.0 / (1.0 + 0.55 * z);
      float rim = 1.0 - z;
      vec2 sampUv = uLens + rel * scale + rel * (rim * 0.16);

      vec2 caDir = rel / max(length(rel), 1e-4);
      float ca = rim * rim * 0.010;
      vec3 col;
      col.r = texture2D(uHidden, sampUv + caDir * ca).r;
      col.g = texture2D(uHidden, sampUv).g;
      col.b = texture2D(uHidden, sampUv - caDir * ca).b;

      vec2 lightDir = normalize(vec2(-0.55, 0.62));
      float facing = max(0.0, dot(d / max(dist, 1e-4), lightDir));
      float spec = smoothstep(0.82, 0.995, t) * (1.0 - smoothstep(0.995, 1.06, t)) * facing;
      float ring = smoothstep(0.90, 0.99, t) * (1.0 - smoothstep(0.99, 1.0, t));

      vec3 inside = col * (1.0 + 0.05 * z) + spec * 0.6 + ring * 0.22;
      outc = mix(surface, inside, mask);
    }

    gl_FragColor = vec4(outc, 1.0);
  }
`;

export function LensBackground() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const canvas = document.createElement("canvas");
    canvas.className = "eco-lens-gl";
    host.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const surfCanvas = document.createElement("canvas");
    const hiddenCanvas = document.createElement("canvas");
    const surfTex = new THREE.CanvasTexture(surfCanvas);
    const hiddenTex = new THREE.CanvasTexture(hiddenCanvas);
    for (const tx of [surfTex, hiddenTex]) {
      tx.minFilter = THREE.LinearFilter;
      tx.magFilter = THREE.LinearFilter;
      tx.generateMipmaps = false;
    }

    const uniforms = {
      uSurface: { value: surfTex },
      uHidden: { value: hiddenTex },
      uLens: { value: new THREE.Vector2(0.5, 0.42) },
      uRadius: { value: 0.18 },
      uAspect: { value: 1 },
      uActive: { value: 0 },
      uTime: { value: 0 },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms,
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);

    const imgs: (HTMLImageElement | null)[] = [null, null];
    let loaded = 0;
    let ready = false;
    IMAGES.forEach((src, i) => {
      const im = new Image();
      im.onload = () => {
        imgs[i] = im;
        loaded += 1;
        if (loaded === IMAGES.length) {
          ready = true;
          drawPanels();
        }
      };
      im.src = src;
    });

    function coverDraw(ctx: CanvasRenderingContext2D, img: HTMLImageElement, cw: number, ch: number) {
      const ir = img.width / img.height;
      const cr = cw / ch;
      let dw: number, dh: number;
      if (ir > cr) {
        dh = ch;
        dw = ch * ir;
      } else {
        dw = cw;
        dh = cw / ir;
      }
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    }

    function drawLayer(
      ctx: CanvasRenderingContext2D,
      cw: number,
      ch: number,
      img: HTMLImageElement | null,
      L: typeof SURFACE,
    ) {
      ctx.clearRect(0, 0, cw, ch);
      ctx.fillStyle = "#0c1014";
      ctx.fillRect(0, 0, cw, ch);

      if (img) {
        ctx.save();
        ctx.filter = L.filter;
        coverDraw(ctx, img, cw, ch);
        ctx.restore();
      }

      ctx.save();
      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = L.wash;
      ctx.fillRect(0, 0, cw, ch);
      ctx.restore();

      const g = ctx.createLinearGradient(0, 0, 0, ch);
      g.addColorStop(0, "rgba(6,9,12,0.55)");
      g.addColorStop(0.32, "rgba(6,9,12,0.10)");
      g.addColorStop(0.68, "rgba(6,9,12,0.18)");
      g.addColorStop(1, "rgba(6,9,12,0.6)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cw, ch);
    }

    function drawPanels() {
      if (!ready) return;
      drawLayer(surfCanvas.getContext("2d")!, surfCanvas.width, surfCanvas.height, imgs[0], SURFACE);
      drawLayer(hiddenCanvas.getContext("2d")!, hiddenCanvas.width, hiddenCanvas.height, imgs[1], HIDDEN);
      surfTex.needsUpdate = true;
      hiddenTex.needsUpdate = true;
    }

    function resize() {
      const w = host!.clientWidth || window.innerWidth;
      const h = host!.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      uniforms.uAspect.value = w / h;

      const pr = Math.min(window.devicePixelRatio || 1, 2);
      let tw = Math.round(w * pr);
      let th = Math.round(h * pr);
      const capW = 2200;
      if (tw > capW) {
        th = Math.round(th * (capW / tw));
        tw = capW;
      }
      for (const c of [surfCanvas, hiddenCanvas]) {
        c.width = tw;
        c.height = th;
      }
      uniforms.uRadius.value = Math.max(0.14, Math.min(0.2, 0.2 * Math.min(w / 1100, h / 720, 1) + 0.06));
      drawPanels();
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const target = new THREE.Vector2(0.5, 0.42);
    const lens = uniforms.uLens.value;
    const vel = new THREE.Vector2(0, 0);

    function setTargetFromClient(cx: number, cy: number) {
      const rect = host!.getBoundingClientRect();
      target.x = (cx - rect.left) / rect.width;
      target.y = 1 - (cy - rect.top) / rect.height;
    }

    let pointerInside = false;
    const onMove = (e: PointerEvent) => {
      pointerInside = true;
      setTargetFromClient(e.clientX, e.clientY);
    };
    const onLeave = () => {
      pointerInside = false;
      target.set(0.5, 0.42);
    };
    if (!reduced) {
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerleave", onLeave);
    }

    let raf = 0;
    let t0 = performance.now();
    const start = t0;

    function frame(now: number) {
      const dt = Math.min(0.05, (now - t0) / 1000);
      t0 = now;
      const elapsed = (now - start) / 1000;
      uniforms.uTime.value = elapsed;

      uniforms.uActive.value = Math.min(1, uniforms.uActive.value + dt * 1.8);

      vel.x = (vel.x + (target.x - lens.x) * 0.16) * 0.74;
      vel.y = (vel.y + (target.y - lens.y) * 0.16) * 0.74;
      lens.x += vel.x;
      lens.y += vel.y;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    }

    if (reduced) {
      lens.set(0.5, 0.42);
      uniforms.uActive.value = 1;
      uniforms.uTime.value = 0;
      const renderOnce = () => renderer.render(scene, camera);
      renderOnce();
      const id = window.setTimeout(renderOnce, 400);
      return () => {
        window.clearTimeout(id);
        ro.disconnect();
        renderer.dispose();
        material.dispose();
        quad.geometry.dispose();
        surfTex.dispose();
        hiddenTex.dispose();
        canvas.remove();
      };
    }

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      renderer.dispose();
      material.dispose();
      quad.geometry.dispose();
      surfTex.dispose();
      hiddenTex.dispose();
      canvas.remove();
    };
  }, []);

  return (
    <div ref={hostRef} className="eco-lens-stage fixed inset-0 -z-20 overflow-hidden bg-[#0c1014]" aria-hidden="true">
      <style>{`
        /* Hide default cursor over the background so the lens IS the cursor */
        html, body { cursor: none; }
        /* But RESTORE a visible cursor over interactive elements so users can
           see where they're pointing to click (buttons, inputs, selects, links,
           the globe canvas, sliders, etc.) */
        button, a, select, input, textarea, label, [role="button"],
        [role="option"], [role="combobox"], [role="slider"],
        .eco-globe-stage, .eco-globe-stage canvas,
        
        [data-radix-collection-item] {
          cursor: pointer !important;
        }
        /* Crosshair on the globe canvas for precise marker targeting */
        .eco-globe-stage canvas { cursor: crosshair !important; }
        /* Text cursor on text inputs/textareas */
        input[type="text"], input[type="number"], textarea { cursor: text !important; }
        .eco-lens-gl {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
        }
      `}</style>
    </div>
  );
}
