/*
 * Author:          Yannick Häberlin
 * Letzes Update:   28.09.2025
 * Beschreibung:    ...
 */

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Szene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// Kamera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000);
camera.position.set(6, 6, 6);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.style.margin = "0";
document.body.appendChild(renderer.domElement);

// Beleuchtung
scene.add(new THREE.AmbientLight(0xffffff, 0.85));
const dir = new THREE.DirectionalLight(0xffffff, 0.6);
dir.position.set(5, 10, 8);
scene.add(dir);
scene.add(new THREE.HemisphereLight(0xffffff, 0x888899, 0.25));

// Achsenanzeige
const axes = new THREE.AxesHelper(1.5);
axes.visible = true; // 
scene.add(axes);

// Trackball
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0);


type CatenoidParams = {
  c: number;        // waist radius
  vMin: number;     // lower v bound
  vMax: number;     // upper v bound
  uSegments: number;
  vSegments: number;
};

let params: CatenoidParams = {
  c: 1.0,
  vMin: -2.0,
  vMax:  2.0,
  uSegments: 30,
  vSegments: 30,
};

// Vorderseite Material
const matFront = new THREE.MeshPhongMaterial({
  vertexColors: true,
  side: THREE.FrontSide,
  shininess: 60,
  specular: 0x222222,
});

// Rueckseite Material
const matBack = new THREE.MeshPhongMaterial({
  color: 0x999999,
  side: THREE.BackSide,
  shininess: 10,
});

let meshFront: THREE.Mesh<THREE.BufferGeometry, THREE.Material> | null = null;
let meshBack:  THREE.Mesh<THREE.BufferGeometry, THREE.Material> | null = null;
let wireframe: THREE.LineSegments<THREE.WireframeGeometry, THREE.LineBasicMaterial> | null = null;

// Geometry 
function makeGeometry(p: CatenoidParams): THREE.BufferGeometry {
  const { c, vMin, vMax, uSegments, vSegments } = p;

  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  for (let j = 0; j <= vSegments; j++) {
    const t = j / vSegments;                   
    const v = vMin + (vMax - vMin) * t;
    const R = c * Math.cosh(v / c);            

    for (let i = 0; i <= uSegments; i++) {
      const u = 2 * Math.PI * (i / uSegments); 
      const x = R * Math.cos(u);
      const y = R * Math.sin(u);
      const z = v;

      positions.push(x, y, z);

      // Farbberechnung
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
  geom.center(); 
  return geom;
}

// Initialisierung
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

// Mesh rebuild nach update
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

// postMessage listener 
window.addEventListener("message", (ev: MessageEvent) => {
  const msg = ev.data;
  if (!msg || typeof msg !== "object") return;
  if (msg.type === "update") {
    if (typeof msg.c === "number")         params.c = Math.max(0.05, msg.c);
    if (typeof msg.vMin === "number")      params.vMin = msg.vMin;
    if (typeof msg.vMax === "number")      params.vMax = msg.vMax;
    if (typeof msg.uSegments === "number") params.uSegments = Math.max(4, Math.floor(msg.uSegments));
    if (typeof msg.vSegments === "number") params.vSegments = Math.max(4, Math.floor(msg.vSegments));
    if (params.vMin > params.vMax) [params.vMin, params.vMax] = [params.vMax, params.vMin];
    rebuild();
  }
}, false);

// Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Render loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

export {};