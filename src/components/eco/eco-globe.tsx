"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { CountryCode } from "@/types";
import { COUNTRIES } from "@/lib/eco/data";

interface EcoGlobeProps {
  selected: CountryCode;
  onSelect: (code: CountryCode) => void;
}

/**
 * Convert lat/lon to a 3D position on a sphere of given radius.
 * Texture alignment: the equirectangular Earth texture maps lon [-180,180]
 * to u [0,1] and lat [90,-90] to v [0,1]. Three.js SphereGeometry's default
 * UV mapping has u=0 at the -X axis (lon -180) increasing toward +Z then +X.
 */
function latLonToVec3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

/**
 * EcoGlobe — a REALISTIC textured 3D Earth globe with:
 *   - NASA Blue Marble day texture (continents, oceans, ice caps)
 *   - Normal map (mountain relief / bumpiness)
 *   - Specular map (oceans reflect light, land doesn't)
 *   - Cloud layer (semi-transparent, slow independent rotation)
 *   - Atmosphere glow rim (Fresnel shader)
 *   - Glowing cyan country markers positioned on the surface
 *   - Auto-rotation + drag-to-rotate with inertia + click selection
 */
export function EcoGlobe({ selected, onSelect }: EcoGlobeProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<CountryCode>(selected);
  const onSelectRef = useRef(onSelect);

  useEffect(() => { selectedRef.current = selected; }, [selected]);
  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // ── scene + camera + renderer ───────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0); // transparent so forest bg shows through
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    // ── lights ──────────────────────────────────────────────────────────
    // Soft ambient so the dark side isn't pitch black
    const ambient = new THREE.AmbientLight(0x405060, 0.45);
    scene.add(ambient);
    // Directional "sun" — warm light from upper-left
    const sun = new THREE.DirectionalLight(0xfff2e0, 1.1);
    sun.position.set(3, 2, 4);
    scene.add(sun);
    // Fill light from the opposite side (cool, dim)
    const fill = new THREE.DirectionalLight(0x4a6080, 0.3);
    fill.position.set(-3, -1, -2);
    scene.add(fill);

    // ── globe group (rotates as one) ────────────────────────────────────
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const RADIUS = 1;
    const loader = new THREE.TextureLoader();

    // ── Earth surface — realistic day texture + normal + specular ───────
    const dayTex = loader.load("/textures/earth-day.jpg");
    const normalTex = loader.load("/textures/earth-normal.jpg");
    const specularTex = loader.load("/textures/earth-specular.jpg");
    dayTex.colorSpace = THREE.SRGBColorSpace;

    const earthGeo = new THREE.SphereGeometry(RADIUS, 96, 96);
    const earthMat = new THREE.MeshPhongMaterial({
      map: dayTex,
      normalMap: normalTex,
      normalScale: new THREE.Vector2(0.7, 0.7),
      specularMap: specularTex,
      specular: new THREE.Color(0x2a4a6a),
      shininess: 18,
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earth);

    // ── Cloud layer — slightly larger, transparent, rotates independently ─
    const cloudsTex = loader.load("/textures/earth-clouds.png");
    const cloudsGeo = new THREE.SphereGeometry(RADIUS * 1.012, 64, 64);
    const cloudsMat = new THREE.MeshLambertMaterial({
      map: cloudsTex,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
    });
    const clouds = new THREE.Mesh(cloudsGeo, cloudsMat);
    globeGroup.add(clouds);

    // ── Atmosphere glow — Fresnel rim shader ────────────────────────────
    const atmGeo = new THREE.SphereGeometry(RADIUS * 1.15, 64, 64);
    const atmMat = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
          gl_FragColor = vec4(0.13, 0.83, 0.93, 1.0) * intensity;
        }
      `,
    });
    const atmosphere = new THREE.Mesh(atmGeo, atmMat);
    scene.add(atmosphere);

    // ── Country markers — glowing cyan dots + halo rings on the surface ─
    const markersGroup = new THREE.Group();
    globeGroup.add(markersGroup);

    interface MarkerData {
      code: CountryCode;
      dot: THREE.Mesh;
      halo: THREE.Mesh;
    }
    const markers: MarkerData[] = [];

    for (const c of COUNTRIES) {
      const pos = latLonToVec3(c.coords[0], c.coords[1], RADIUS * 1.015);

      // Glowing dot
      const dotGeo = new THREE.SphereGeometry(0.016, 12, 12);
      const dotMat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.95,
      });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.copy(pos);
      markersGroup.add(dot);

      // Halo ring — additive, faces outward
      const haloGeo = new THREE.RingGeometry(0.022, 0.045, 20);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.copy(pos);
      halo.lookAt(0, 0, 0);
      halo.rotateY(Math.PI);
      markersGroup.add(halo);

      markers.push({ code: c.code, dot, halo });
    }

    // ── raycaster for click selection ───────────────────────────────────
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    // ── drag rotation ───────────────────────────────────────────────────
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    let rotVelX = 0;
    let rotVelY = 0.0012; // initial slow auto-rotation
    let autoRotate = true;
    let autoRotateTimer: number | null = null;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      autoRotate = false;
      lastX = e.clientX;
      lastY = e.clientY;
      if (autoRotateTimer !== null) {
        window.clearTimeout(autoRotateTimer);
        autoRotateTimer = null;
      }
    };
    const onPointerMoveDrag = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      if (isDragging) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        rotVelY = dx * 0.005;
        rotVelX = dy * 0.005;
        globeGroup.rotation.y += rotVelY;
        globeGroup.rotation.x += rotVelX;
        globeGroup.rotation.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, globeGroup.rotation.x));
        lastX = e.clientX;
        lastY = e.clientY;
      }
    };
    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      // Treat as click if pointer barely moved — try to select a marker
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(
        markers.map((m) => m.dot),
        false
      );
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const marker = markers.find((m) => m.dot === hit);
        if (marker) onSelectRef.current(marker.code);
      }
      autoRotateTimer = window.setTimeout(() => {
        autoRotate = true;
      }, 2500);
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMoveDrag);
    window.addEventListener("pointerup", onPointerUp);

    // ── resize ──────────────────────────────────────────────────────────
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    // ── render loop ─────────────────────────────────────────────────────
    let raf = 0;
    const animate = () => {
      if (autoRotate && !isDragging) {
        globeGroup.rotation.y += 0.0012;
      } else if (!isDragging) {
        globeGroup.rotation.y += rotVelY;
        globeGroup.rotation.x += rotVelX;
        rotVelY *= 0.95;
        rotVelX *= 0.95;
      }
      // Clouds drift slightly faster than the earth
      clouds.rotation.y += 0.0004;

      // Update marker scales/colors based on selection
      const sel = selectedRef.current;
      for (const m of markers) {
        const isSelected = m.code === sel;
        const s = isSelected ? 2.4 : 1;
        m.dot.scale.lerp(new THREE.Vector3(s, s, s), 0.12);
        (m.dot.material as THREE.MeshBasicMaterial).color.setHex(isSelected ? 0x67e8f9 : 0x22d3ee);
        (m.dot.material as THREE.MeshBasicMaterial).opacity = isSelected ? 1 : 0.9;
        const hs = isSelected ? 1.8 : 1;
        m.halo.scale.lerp(new THREE.Vector3(hs, hs, hs), 0.12);
        (m.halo.material as THREE.MeshBasicMaterial).opacity = isSelected ? 0.7 : 0.4;
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      if (autoRotateTimer !== null) window.clearTimeout(autoRotateTimer);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMoveDrag);
      window.removeEventListener("pointerup", onPointerUp);
      renderer.dispose();
      earthGeo.dispose();
      earthMat.dispose();
      cloudsGeo.dispose();
      cloudsMat.dispose();
      atmGeo.dispose();
      atmMat.dispose();
      dayTex.dispose();
      normalTex.dispose();
      specularTex.dispose();
      cloudsTex.dispose();
      markers.forEach((m) => {
        m.dot.geometry.dispose();
        (m.dot.material as THREE.Material).dispose();
        m.halo.geometry.dispose();
        (m.halo.material as THREE.Material).dispose();
      });
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="eco-globe-stage relative rounded-2xl overflow-hidden border border-cyan-500/20 shadow-2xl shadow-cyan-950/40 h-[350px] bg-transparent">
      <div ref={mountRef} className="w-full h-full" />
      {/* Radial vignette to blend globe edges with forest bg */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background:
            "radial-gradient(circle at center, transparent 50%, rgba(7,16,13,0.35) 82%, rgba(7,16,13,0.7) 100%)",
        }}
      />
      <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-lg text-xs text-cyan-400 border border-cyan-500/30 z-[400] flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        Live Globe · Drag to rotate
      </div>
      <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-lg text-[10px] text-slate-400 border border-white/10 z-[400]">
        Click a glowing marker to select a country
      </div>
    </div>
  );
}
