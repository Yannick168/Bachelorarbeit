/*
 * Author:          (adapted)
 * Letztes Update:  28.09.2025
 * Beschreibung:    Catenoid-Helicoid (assoziierte Familie) – Struktur analog zu catenoid.ts,
 *                  inkl. params/makeGeometry/initialBuild/rebuild/postMessage-Updates.
 */

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Szene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// Kamera
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);
camera.position.set(6, 6, 6);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.style.margin = "0";
document.body.appendChild(renderer.domElement);

// Beleuchtung (analog zu catenoid.ts)
scene.add(new THREE.AmbientLight(0xffffff, 0.85));
const dir = new THREE.DirectionalLight(0xffffff, 0.6);
dir.position.set(5, 10, 8);
scene.add(dir);
scene.add(new THREE.HemisphereLight(0xffffff, 0x888899, 0.25));

// Achsenanzeige
const axes = new THREE.AxesHelper(1.5);
axes.visible = true;
scene.add(axes);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0);

// -------------------------------------------------------
// Parameterstruktur – analog zu catenoid.ts, plus alpha
// -------------------------------------------------------
type CHParams = {
  alpha: number;     // Winkel der assoziierten Familie (0 = Catenoid, pi/2 = Helicoid)
  c: number;         // Skalen-/Taillen-Parameter
  vMin: number;      // untere v-Grenze
  vMax: number;      // obere v-Grenze
  uSegments: number;
  vSegments: number;
};

let params: CHParams = {
  alpha: 0.0,   // starte als Catenoid
  c: 1.0,
  vMin: -2.0,
  vMax:  2.0,
  uSegments: 30,
  vSegments: 30,
};

// Materialien (Vorder-/Rückseite)
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

// Mesh-/Wireframe-Handles
let meshFront: THREE.Mesh<THREE.BufferGeometry, THREE.Material> | null = null;
let meshBack:  THREE.Mesh<THREE.BufferGeometry, THREE.Material> | null = null;
let wireframe: THREE.LineSegments<THREE.WireframeGeometry, THREE.LineBasicMaterial> | null = null;

// -------------------------------------------------------
// Geometrie-Erzeugung (wie in catenoid.ts aufgebaut)
// -------------------------------------------------------
function makeGeometry(p: CHParams): THREE.BufferGeometry {
  const { alpha, c, vMin, vMax, uSegments, vSegments } = p;

  const cosA = Math.cos(alpha);
  const sinA = Math.sin(alpha);

  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  for (let j = 0; j <= vSegments; j++) {
    const t = j / vSegments;                     // 0..1 für Farbverlauf
    const v = vMin + (vMax - vMin) * t;          // Parameter v im Intervall
    const vs = v / c;                             // skaliert
    const C = Math.cosh(vs);
    const S = Math.sinh(vs);

    for (let i = 0; i <= uSegments; i++) {
      const u = 2 * Math.PI * (i / uSegments);

      // Assoziierte Familie (Catenoid <-> Helicoid) mit Parameter c und Winkel alpha:
      // x = c( cos(u)*cosh(v/c)*cosA + sin(u)*sinh(v/c)*sinA )
      // y = c( sin(u)*cosh(v/c)*cosA - cos(u)*sinh(v/c)*sinA )
      // z =      v * cosA + (c*u) * sinA
      const x = c * (Math.cos(u) * C * cosA + Math.sin(u) * S * sinA);
      const y = c * (Math.sin(u) * C * cosA - Math.cos(u) * S * sinA);
      const z = v * cosA + (c * u) * sinA;

      positions.push(x, y, z);

      // Farbverlauf entlang v (analog zu catenoid.ts)
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
  geom.setAttribute("color",    new THREE.Float32BufferAttribute(colors,    3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  geom.center();   // gleiche Zentrierung wie im catenoid.ts

  return geom;
}

// -------------------------------------------------------
// Initialisierung (analog catenoid.ts)
// -------------------------------------------------------
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

// -------------------------------------------------------
// Rebuild nach Parameter-Updates
// -------------------------------------------------------
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

// -------------------------------------------------------
// Externe Updates via postMessage – identisch zum Muster
// -------------------------------------------------------
window.addEventListener(
  "message",
  (ev: MessageEvent) => {
    const msg = ev.data;
    if (!msg || typeof msg !== "object") return;
    if (msg.type === "update") {
      if (typeof msg.alpha === "number")     params.alpha = msg.alpha;
      if (typeof msg.c === "number")         params.c = Math.max(0.05, msg.c);
      if (typeof msg.vMin === "number")      params.vMin = msg.vMin;
      if (typeof msg.vMax === "number")      params.vMax = msg.vMax;
      if (typeof msg.uSegments === "number") params.uSegments = Math.max(4, Math.floor(msg.uSegments));
      if (typeof msg.vSegments === "number") params.vSegments = Math.max(4, Math.floor(msg.vSegments));
      if (params.vMin > params.vMax) [params.vMin, params.vMax] = [params.vMax, params.vMin];
      rebuild();
    }
  },
  false
);


// Resize & Render-Loop
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
