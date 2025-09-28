/*
 * Author:          Yannick Häberlin (Refactor angepasst an catenoid.ts-Stil)
 * Letztes Update:  28.09.2025
 * Beschreibung:    Catenoid–Helicoid Isometrie in gleicher Struktur wie catenoid.ts
 */

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// ---- Szene/Renderer/Kamera (an catenoid.ts angelehnt) ----
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
const renderer = new THREE.WebGLRenderer(
  canvas ? { canvas, antialias: true } : { antialias: true }
);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);
camera.position.set(6, 6, 6);

// ---- Beleuchtung (wie in catenoid.ts) ----
scene.add(new THREE.AmbientLight(0xffffff, 0.85));
const dir = new THREE.DirectionalLight(0xffffff, 0.6);
dir.position.set(5, 10, 8);
scene.add(dir);
scene.add(new THREE.HemisphereLight(0xffffff, 0x888899, 0.25));

// ---- Achsenhilfe (sichtbar) ----
const axes = new THREE.AxesHelper(1.5);
axes.visible = true;
scene.add(axes);

// ---- OrbitControls ----
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0);

// ---- Parameter & Typen (analog zu catenoid.ts) ----
type IsoParams = {
  alpha: number;     // 0: Catenoid, π/2: Helicoid
  c: number;         // waist radius / Skalierung
  vMin: number;      // untere v-Grenze
  vMax: number;      // obere v-Grenze
  uSegments: number;
  vSegments: number;
};

let params: IsoParams = {
  alpha: 0.0,
  c: 1.0,
  vMin: -2.0,
  vMax:  2.0,
  uSegments: 30,
  vSegments: 30,
};

// ---- Materialien (Front: Vertexfarben, Back: Grau) ----
const matFront = new THREE.MeshPhongMaterial({
  vertexColors: true,
  side: THREE.FrontSide,
  shininess: 60,
  specular: 0x222222,
});
const matBack = new THREE.MeshPhongMaterial({
  color: 0x999999,
  side: THREE.BackSide,
  shininess: 10,
});

// ---- Mesh-Handles ----
let meshFront: THREE.Mesh<THREE.BufferGeometry, THREE.Material> | null = null;
let meshBack:  THREE.Mesh<THREE.BufferGeometry, THREE.Material> | null = null;
let wireframe: THREE.LineSegments<THREE.WireframeGeometry, THREE.LineBasicMaterial> | null = null;

// ---- Geometrie-Erzeugung (Struktur wie in catenoid.ts) ----
function makeGeometry(p: IsoParams): THREE.BufferGeometry {
  const { alpha, c, vMin, vMax, uSegments, vSegments } = p;

  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  const cosA = Math.cos(alpha);
  const sinA = Math.sin(alpha);

  for (let j = 0; j <= vSegments; j++) {
    const tj = j / vSegments;
    const v  = vMin + (vMax - vMin) * tj;

    // Skaliert für cosh/sinh mit c (wie im bisherigen Isometrie-Code)
    const vs   = v / c;
    const ch   = Math.cosh(vs);
    const sh   = Math.sinh(vs);

    for (let i = 0; i <= uSegments; i++) {
      const u  = 2 * Math.PI * (i / uSegments);

      // Assoziierte Familie: X_alpha(u,v)
      const x = c * ( Math.cos(u) * ch * cosA + Math.sin(u) * sh * sinA );
      const y = c * ( Math.sin(u) * ch * cosA - Math.cos(u) * sh * sinA );
      const z =       v * cosA + (c * u) * sinA;

      positions.push(x, y, z);

      // Farbverlauf entlang v (wie in catenoid.ts)
      const s = tj;
      const r = s;
      const g = 1.0 - s;
      const b = 0.15;
      colors.push(r, g, b);
    }
  }

  for (let j = 0; j < vSegments; j++) {
    for (let i = 0; i < uSegments; i++) {
      const a0 = j * (uSegments + 1) + i;
      const b0 = a0 + 1;
      const c0 = a0 + (uSegments + 1);
      const d0 = c0 + 1;
      indices.push(a0, b0, d0, a0, d0, c0);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute("color",    new THREE.Float32BufferAttribute(colors,    3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  geom.center(); // wie in catenoid.ts
  return geom;
}

// ---- Initialisierung (wie initialBuild in catenoid.ts) ----
function initialBuild() {
  const geom = makeGeometry(params);

  meshFront = new THREE.Mesh(geom, matFront);
  meshBack  = new THREE.Mesh(geom, matBack);
  scene.add(meshFront, meshBack);

  wireframe = new THREE.LineSegments(
    new THREE.WireframeGeometry(geom),
    new THREE.LineBasicMaterial({ color: 0x000000 })
  );
  wireframe.renderOrder = 1;
  scene.add(wireframe);

  // Widget-Handshake (optional)
  try {
    window.parent?.postMessage({ type: "ready" }, "*");
  } catch {}
}
initialBuild();

// ---- Rebuild (wie in catenoid.ts) ----
function rebuild() {
  if (!meshFront || !meshBack || !wireframe) return;

  const newGeom = makeGeometry(params);

  meshFront.geometry.dispose();
  meshBack.geometry.dispose();
  wireframe.geometry.dispose();

  meshFront.geometry  = newGeom;
  meshBack.geometry   = newGeom;
  wireframe.geometry  = new THREE.WireframeGeometry(newGeom);

  controls.target.set(0, 0, 0);
}

// ---- postMessage-Listener (kompatibel zu Widget & Legacy) ----
window.addEventListener(
  "message",
  (ev: MessageEvent) => {
    const msg = ev.data;
    if (!msg || typeof msg !== "object") return;

    // 1) Neues, gebündeltes Update-Format (Widget sendet {alpha,c,L,uSegments,vSegments})
    if (msg.type === "update") {
      if (typeof msg.alpha === "number")      params.alpha     = msg.alpha;
      if (typeof msg.c     === "number")      params.c         = Math.max(0.05, msg.c);
      if (typeof msg.L     === "number")     { params.vMin     = -msg.L; params.vMax = msg.L; }
      if (typeof msg.vMin  === "number")      params.vMin      = msg.vMin; // optional unterstützt
      if (typeof msg.vMax  === "number")      params.vMax      = msg.vMax; // optional unterstützt
      if (typeof msg.uSegments === "number")  params.uSegments = Math.max(4, Math.floor(msg.uSegments));
      if (typeof msg.vSegments === "number")  params.vSegments = Math.max(4, Math.floor(msg.vSegments));
      if (params.vMin > params.vMax) [params.vMin, params.vMax] = [params.vMax, params.vMin];
      rebuild();
    }

    // 2) Rückwärtskompatibel: nur Alpha-Update
    if (msg.type === "alpha" && typeof msg.alpha === "number") {
      params.alpha = msg.alpha;
      rebuild();
    }
  },
  false
);

// ---- Öffentliche API (kompatibel zu deiner bisherigen HTML/Widget-Seite) ----
(window as any).updateCatenoidHelicoid = (newAlpha: number) => {
  if (typeof newAlpha === "number") {
    params.alpha = newAlpha;
    rebuild();
  }
};
(window as any).updateCH = (data: {
  alpha?: number; c?: number; L?: number; vMin?: number; vMax?: number; uSegments?: number; vSegments?: number;
}) => {
  const msg = { type: "update", ...data };
  window.postMessage(msg, "*");
};

// ---- Resize (wie in catenoid.ts) ----
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---- Render-Loop ----
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

export {};
