import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// ---------- Szene / Kamera / Renderer ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
scene.add(new THREE.AxesHelper(2));

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

const camera = new THREE.PerspectiveCamera(45, 2, 0.1, 100);
camera.position.set(8, 2, 5);
camera.up.set(0, 0, 1);
camera.lookAt(0, 0, 0);

function resize() {
  const w = canvas.clientWidth || window.innerWidth;
  const h = canvas.clientHeight || window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
resize();
window.addEventListener('resize', resize);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Licht
{
  const dir = new THREE.DirectionalLight(0xffffff, 1);
  dir.position.set(1, 2, 3);
  scene.add(dir);
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
}

// ---------- Parameter (per Parent steuerbar) ----------
let uSegments = 30;
let vSegments = 30;
let L = 2.0;     // v ∈ [-L, L]
let c = 1.0;     // Skalen-/„Waist“-Parameter
let alpha = 0.0; // 0 → Catenoid, π/2 → Helicoid

// ---------- Geometrie / Mesh / Buffer ----------
let geometry: THREE.BufferGeometry;
let mesh: THREE.Mesh;
let wireframe: THREE.LineSegments;
let positionAttr: THREE.BufferAttribute;
let colorAttr: THREE.BufferAttribute;

// Materialien: außen bunt, innen grau
const frontMaterial = new THREE.MeshPhongMaterial({ vertexColors: true, side: THREE.FrontSide });
const backMaterial  = new THREE.MeshPhongMaterial({ color: 0x888888, side: THREE.BackSide });

// Hilfsfunktion: Indices
function buildIndices(uSeg: number, vSeg: number): number[] {
  const idx: number[] = [];
  for (let j = 0; j < vSeg; j++) {
    for (let i = 0; i < uSeg; i++) {
      const a = j * (uSeg + 1) + i;
      const b = a + 1;
      const c = a + (uSeg + 1);
      const d = c + 1;
      idx.push(a, b, d, a, d, c);
    }
  }
  return idx;
}

// Geometrie komplett neu (bei Segments-Änderung)
function rebuildGeometry() {
  const vertexCount = (uSegments + 1) * (vSegments + 1);
  const positions = new Float32Array(vertexCount * 3);
  const colors    = new Float32Array(vertexCount * 3);
  const indices   = buildIndices(uSegments, vSegments);

  positionAttr = new THREE.BufferAttribute(positions, 3);
  colorAttr    = new THREE.BufferAttribute(colors,    3);

  if (geometry) geometry.dispose();
  geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', positionAttr);
  geometry.setAttribute('color',    colorAttr);
  geometry.setIndex(indices);

  if (!mesh) {
    mesh = new THREE.Mesh(geometry, [frontMaterial, backMaterial]);
    geometry.clearGroups();
    geometry.addGroup(0, indices.length, 0);
    geometry.addGroup(0, indices.length, 1);
    scene.add(mesh);
  } else {
    mesh.geometry = geometry;
    geometry.clearGroups();
    geometry.addGroup(0, indices.length, 0);
    geometry.addGroup(0, indices.length, 1);
  }

  if (wireframe) {
    scene.remove(wireframe);
    wireframe.geometry.dispose();
  }
  wireframe = new THREE.LineSegments(
    new THREE.WireframeGeometry(geometry),
    new THREE.LineBasicMaterial({ color: 0x000000 })
  );
  scene.add(wireframe);

  updateGeometry();
}

// Nur Positions-/Farb-Buffer aktualisieren
function updateGeometry() {
  const positions = positionAttr.array as Float32Array;
  const colors    = colorAttr.array as Float32Array;

  const cosA = Math.cos(alpha);
  const sinA = Math.sin(alpha);

  for (let j = 0; j <= vSegments; j++) {
    const vParam = -L + (2 * L) * (j / vSegments); // v ∈ [-L, L]
    const vs = vParam / c;                          // skaliert für cosh/sinh
    const cosh = Math.cosh(vs);
    const sinh = Math.sinh(vs);

    for (let i = 0; i <= uSegments; i++) {
      const u = 2 * Math.PI * (i / uSegments);
      const idx = (j * (uSegments + 1) + i) * 3;

      // Assoziierte Familie (Catenoid ↔ Helicoid) mit Skalierung c:
      const x = c * ( Math.cos(u) * cosh * cosA + Math.sin(u) * sinh * sinA );
      const y = c * ( Math.sin(u) * cosh * cosA - Math.cos(u) * sinh * sinA );
      const z =       vParam * cosA + (c * u) * sinA;

      positions[idx+0] = x;
      positions[idx+1] = y;
      positions[idx+2] = z;

      // Farbverlauf entlang v
      const t = (vParam + L) / (2 * L); // 0..1
      colors[idx+0] = t;
      colors[idx+1] = 1.0 - t;
      colors[idx+2] = 0.1;
    }
  }

  positionAttr.needsUpdate = true;
  colorAttr.needsUpdate = true;
  geometry.computeVertexNormals();

  // Wireframe neu aus Geometrie erzeugen (passt exakt)
  scene.remove(wireframe);
  wireframe.geometry.dispose();
  wireframe = new THREE.LineSegments(
    new THREE.WireframeGeometry(geometry),
    new THREE.LineBasicMaterial({ color: 0x000000 })
  );
  scene.add(wireframe);
}

// Öffentliche API für Parent (rückwärtskompatibel)
(window as any).updateCatenoidHelicoid = (newAlpha: number) => {
  alpha = newAlpha;
  updateGeometry();
};

// Neue, gebündelte API für Parent
(window as any).updateCH = (data: {
  alpha?: number; c?: number; L?: number; uSegments?: number; vSegments?: number;
}) => {
  let needRebuild = false;

  if (typeof data.alpha === 'number') alpha = data.alpha;
  if (typeof data.c     === 'number') c     = Math.max(0.05, data.c);
  if (typeof data.L     === 'number') L     = Math.max(0.1,  data.L);

  if (typeof data.uSegments === 'number') {
    const us = Math.max(8, Math.floor(data.uSegments));
    if (us !== uSegments) { uSegments = us; needRebuild = true; }
  }
  if (typeof data.vSegments === 'number') {
    const vs = Math.max(8, Math.floor(data.vSegments));
    if (vs !== vSegments) { vSegments = vs; needRebuild = true; }
  }

  if (needRebuild) rebuildGeometry();
  else updateGeometry();
};

// Initial
rebuildGeometry();

// Render-Loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

export {};