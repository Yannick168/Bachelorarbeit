// catenoid.ts — Two-mesh setup: colorful outside (FrontSide) + gray inside (BackSide)
// Control from parent via: postMessage({type:'update', a, vMin, vMax, uSegments, vSegments}, '*');

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// ---------- Scene / Camera / Renderer ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000);
camera.position.set(6, 6, 6);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.style.margin = "0";
document.body.appendChild(renderer.domElement);

// ---------- Lights ----------
scene.add(new THREE.AmbientLight(0xffffff, 0.85));
const dir = new THREE.DirectionalLight(0xffffff, 0.6);
dir.position.set(5, 10, 8);
scene.add(dir);
scene.add(new THREE.HemisphereLight(0xffffff, 0x888899, 0.25));

// ---------- Helpers (optional) ----------
const axes = new THREE.AxesHelper(1.5);
axes.visible = true; // set false if you don't want axes
scene.add(axes);

// ---------- OrbitControls ----------
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0);

// ---------- Parameters ----------
type CatenoidParams = {
  a: number;        // waist radius
  vMin: number;     // lower v bound
  vMax: number;     // upper v bound
  uSegments: number;
  vSegments: number;
};

let params: CatenoidParams = {
  a: 1.0,
  vMin: -2.0,
  vMax:  2.0,
  uSegments: 30,
  vSegments: 30,
};

// ---------- Materials (two meshes: front colorful, back gray) ----------
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

// ---------- Mesh references (created after first build) ----------
let meshFront: THREE.Mesh<THREE.BufferGeometry, THREE.Material> | null = null;
let meshBack:  THREE.Mesh<THREE.BufferGeometry, THREE.Material> | null = null;
let wireframe: THREE.LineSegments<THREE.WireframeGeometry, THREE.LineBasicMaterial> | null = null;

// ---------- Geometry builder ----------
function makeGeometry(p: CatenoidParams): THREE.BufferGeometry {
  const { a, vMin, vMax, uSegments, vSegments } = p;

  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  for (let j = 0; j <= vSegments; j++) {
    const t = j / vSegments;                   // 0..1 along v
    const v = vMin + (vMax - vMin) * t;
    const R = a * Math.cosh(v / a);            // r(z) = a cosh(z/a)

    for (let i = 0; i <= uSegments; i++) {
      const u = 2 * Math.PI * (i / uSegments); // 0..2π
      const x = R * Math.cos(u);
      const y = R * Math.sin(u);
      const z = v;

      positions.push(x, y, z);

      // Colors like before: simple gradient along v
      const s = t;            // 0..1
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
  geom.center(); // center waist at origin
  return geom;
}

// ---------- First build: then create meshes ----------
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
}
initialBuild();

// ---------- Rebuild on param updates ----------
function rebuild() {
  if (!meshFront || !meshBack || !wireframe) return;

  const newGeom = makeGeometry(params);

  // dispose old geometries
  meshFront.geometry.dispose();
  meshBack.geometry.dispose();
  wireframe.geometry.dispose();

  // assign new ones
  meshFront.geometry = newGeom;
  meshBack.geometry  = newGeom;
  wireframe.geometry = new THREE.WireframeGeometry(newGeom);

  controls.target.set(0, 0, 0);
}

// ---------- postMessage listener ----------
window.addEventListener("message", (ev: MessageEvent) => {
  const msg = ev.data;
  if (!msg || typeof msg !== "object") return;
  if (msg.type === "update") {
    if (typeof msg.a === "number")         params.a = Math.max(0.05, msg.a);
    if (typeof msg.vMin === "number")      params.vMin = msg.vMin;
    if (typeof msg.vMax === "number")      params.vMax = msg.vMax;
    if (typeof msg.uSegments === "number") params.uSegments = Math.max(4, Math.floor(msg.uSegments));
    if (typeof msg.vSegments === "number") params.vSegments = Math.max(4, Math.floor(msg.vSegments));
    if (params.vMin > params.vMax) [params.vMin, params.vMax] = [params.vMax, params.vMin];
    rebuild();
  }
}, false);

// ---------- Resize ----------
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---------- Render loop ----------
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Optional: Reset camera with "r"
window.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "r") {
    camera.position.set(5, 4, 6);
    controls.target.set(0, 0, 0);
  }
});

export {};
