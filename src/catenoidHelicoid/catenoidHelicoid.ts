/*
 * Catenoid–Helicoid Isometrie – an catenoid.ts angelehnt (korrigierte Version)
 */

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// ---- Szene/Renderer/Kamera ----
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
const renderer = new THREE.WebGLRenderer(
  canvas ? { canvas, antialias: true } : { antialias: true }
);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000);
camera.position.set(6, 6, 0);

// ---- Licht ----
scene.add(new THREE.AmbientLight(0xffffff, 0.85));
const dir = new THREE.DirectionalLight(0xffffff, 0.6);
dir.position.set(5, 10, 8);
scene.add(dir);
scene.add(new THREE.HemisphereLight(0xffffff, 0x888899, 0.25));

// ---- Achsen + Controls ----
const axes = new THREE.AxesHelper(1.5);
axes.visible = true;
scene.add(axes);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0);

// ---- Parameter ----
type IsoParams = {
  alpha: number;     // 0: Catenoid, π/2: Helicoid
  c: number;         // Skalierung / "waist radius"
  vMin: number;
  vMax: number;
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

// ---- Materialien ----
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

// ---- Geometrie ----
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

    const vs = v / c;
    const ch = Math.cosh(vs);
    const sh = Math.sinh(vs);

    for (let i = 0; i <= uSegments; i++) {
      const u = 2 * Math.PI * (i / uSegments);

      // X_alpha(u,v)
      const x = c * ( Math.cos(u) * ch * cosA + Math.sin(u) * sh * sinA );
      const y = c * ( Math.sin(u) * ch * cosA - Math.cos(u) * sh * sinA );
      const z =       v * cosA + (c * u) * sinA;

      positions.push(x, y, z);

      // Farbverlauf entlang v
      const s = tj;
      colors.push(s, 1.0 - s, 0.15);
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
  geom.center();
  return geom;
}

// ---- Initialisierung ----
function initialBuild() {
  const geom = makeGeometry(params);
  meshFront = new THREE.Mesh(geom, matFront);
  meshBack  = new THREE.Mesh(geom, matBack);
  scene.add(meshFront, meshBack);

  wireframe = new THREE.LineSegments(new THREE.WireframeGeometry(geom), new THREE.LineBasicMaterial({ color: 0x000000 }));
  wireframe.renderOrder = 1;
  scene.add(wireframe);

  // Ready-Handshake (für Widget)
  try { window.parent?.postMessage({ type: "ready" }, "*"); } catch {}
}
initialBuild();

// ---- Rebuild ----
function rebuild() {
  if (!meshFront || !meshBack || !wireframe) return;

  const newGeom = makeGeometry(params);

  meshFront.geometry.dispose();
  meshBack.geometry.dispose();
  wireframe.geometry.dispose();

  meshFront.geometry = newGeom;
  meshBack.geometry  = newGeom;
  wireframe.geometry = new THREE.WireframeGeometry(newGeom);

  controls.target.set(0, 0, 0);
}

// ---- postMessage-Listener ----
window.addEventListener("message", (ev: MessageEvent) => {
  const msg = ev.data;
  if (!msg || typeof msg !== "object") return;

  if (msg.type === "update") {
    if (typeof msg.alpha === "number")      params.alpha     = msg.alpha;
    if (typeof msg.c     === "number")      params.c         = Math.max(0.05, msg.c);
    if (typeof msg.L     === "number")     { params.vMin     = -msg.L; params.vMax = msg.L; }
    if (typeof msg.vMin  === "number")      params.vMin      = msg.vMin;
    if (typeof msg.vMax  === "number")      params.vMax      = msg.vMax;
    if (typeof msg.uSegments === "number")  params.uSegments = Math.max(4, Math.floor(msg.uSegments));
    if (typeof msg.vSegments === "number")  params.vSegments = Math.max(4, Math.floor(msg.vSegments));
    if (params.vMin > params.vMax) [params.vMin, params.vMax] = [params.vMax, params.vMin];
    rebuild();
  }

  // Legacy: nur Alpha
  if (msg.type === "alpha" && typeof msg.alpha === "number") {
    params.alpha = msg.alpha;
    rebuild();
  }
}, false);

// ---- Öffentliche API (direkt anwenden, kein postMessage) ----
(window as any).updateCatenoidHelicoid = (newAlpha: number) => {
  if (typeof newAlpha === "number") {
    params.alpha = newAlpha;
    rebuild();
  }
};
(window as any).updateCH = (data: {
  alpha?: number; c?: number; L?: number; vMin?: number; vMax?: number; uSegments?: number; vSegments?: number;
}) => {
  if (typeof data.alpha === "number")      params.alpha     = data.alpha;
  if (typeof data.c     === "number")      params.c         = Math.max(0.05, data.c);
  if (typeof data.L     === "number")     { params.vMin     = -data.L; params.vMax = data.L; }
  if (typeof data.vMin  === "number")      params.vMin      = data.vMin;
  if (typeof data.vMax  === "number")      params.vMax      = data.vMax;
  if (typeof data.uSegments === "number")  params.uSegments = Math.max(4, Math.floor(data.uSegments));
  if (typeof data.vSegments === "number")  params.vSegments = Math.max(4, Math.floor(data.vSegments));
  if (params.vMin > params.vMax) [params.vMin, params.vMax] = [params.vMax, params.vMin];
  rebuild();
};

// ---- Resize + Renderloop ----
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

export {};
