// catenoid.ts — two meshes (front colorful, back gray) + point marker at (u0, v0)
// Control via parent postMessage({type:'update', a, vMin, vMax, uSegments, vSegments, u0Deg, v0})

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// ---- Scene / Camera / Renderer ----
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000);
// alte „schräge“ Ansicht:
camera.position.set(6, 6, 6);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.style.margin = "0";
document.body.appendChild(renderer.domElement);

// ---- Lights ----
scene.add(new THREE.AmbientLight(0xffffff, 0.85));
const dir = new THREE.DirectionalLight(0xffffff, 0.6);
dir.position.set(5, 10, 8);
scene.add(dir);
scene.add(new THREE.HemisphereLight(0xffffff, 0x888899, 0.25));

// ---- Helpers (optional) ----
const axes = new THREE.AxesHelper(1.5);
axes.visible = true;
scene.add(axes);

// ---- Controls ----
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0);

// ---- Params ----
type CatenoidParams = {
  a: number;
  vMin: number;
  vMax: number;
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

// Additional param point
let u0 = 0;      // radians
let v0 = 0;      // within [vMin, vMax]

// ---- Materials ----
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

// ---- Mesh refs ----
let meshFront: THREE.Mesh<THREE.BufferGeometry, THREE.Material> | null = null;
let meshBack:  THREE.Mesh<THREE.BufferGeometry, THREE.Material> | null = null;
let wireframe: THREE.LineSegments<THREE.WireframeGeometry, THREE.LineBasicMaterial> | null = null;

// Marker (small sphere)
const markerGeom = new THREE.SphereGeometry(0.06, 24, 16);
const markerMat  = new THREE.MeshStandardMaterial({ color: 0xff3333, roughness: 0.3, metalness: 0.0 });
const marker     = new THREE.Mesh(markerGeom, markerMat);
scene.add(marker);

// ---- Geometry builder ----
function makeGeometry(p: CatenoidParams): THREE.BufferGeometry {
  const { a, vMin, vMax, uSegments, vSegments } = p;

  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  for (let j = 0; j <= vSegments; j++) {
    const t = j / vSegments;
    const v = vMin + (vMax - vMin) * t;
    const R = a * Math.cosh(v / a);

    for (let i = 0; i <= uSegments; i++) {
      const u = 2 * Math.PI * (i / uSegments);
      const x = R * Math.cos(u);
      const y = R * Math.sin(u);
      const z = v;
      positions.push(x, y, z);

      // Farben wie früher: einfacher Gradient entlang v
      const s = t;
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
  geom.setAttribute("color",    new THREE.Float32BufferAttribute(colors, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  geom.center();
  return geom;
}

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

  updateMarker(); // place marker at current (u0, v0)
}
initialBuild();

function rebuild() {
  if (!meshFront || !meshBack || !wireframe) return;

  // clamp v0 to new bounds
  v0 = THREE.MathUtils.clamp(v0, params.vMin, params.vMax);

  const newGeom = makeGeometry(params);

  meshFront.geometry.dispose();
  meshBack.geometry.dispose();
  wireframe.geometry.dispose();

  meshFront.geometry = newGeom;
  meshBack.geometry  = newGeom;
  wireframe.geometry = new THREE.WireframeGeometry(newGeom);

  updateMarker();
  controls.target.set(0, 0, 0);
}

// compute param point
function paramPoint(a: number, u: number, v: number): THREE.Vector3 {
  const R = a * Math.cosh(v / a);
  return new THREE.Vector3(R * Math.cos(u), R * Math.sin(u), v);
}

function updateMarker() {
  const p = paramPoint(params.a, u0, THREE.MathUtils.clamp(v0, params.vMin, params.vMax));
  marker.position.copy(p);
}

// ---- postMessage listener ----
window.addEventListener("message", (ev: MessageEvent) => {
  const msg = ev.data;
  if (!msg || typeof msg !== "object") return;
  if (msg.type === "update") {
    if (typeof msg.a === "number")         params.a = Math.max(0.05, msg.a);
    if (typeof msg.vMin === "number")      params.vMin = msg.vMin;
    if (typeof msg.vMax === "number")      params.vMax = msg.vMax;
    if (typeof msg.uSegments === "number") params.uSegments = Math.max(4, Math.floor(msg.uSegments));
    if (typeof msg.vSegments === "number") params.vSegments = Math.max(4, Math.floor(msg.vSegments));
    if (typeof msg.u0Deg === "number")     u0 = THREE.MathUtils.degToRad(((msg.u0Deg % 360) + 360) % 360);
    if (typeof msg.v0 === "number")        v0 = msg.v0;

    if (params.vMin > params.vMax) [params.vMin, params.vMax] = [params.vMax, params.vMin];

    rebuild();
  }
}, false);

// ---- Resize ----
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---- Loop ----
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Optional: reset camera with "r"
window.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "r") {
    camera.position.set(6, 6, 6);
    controls.target.set(0, 0, 0);
  }
});

export {};
