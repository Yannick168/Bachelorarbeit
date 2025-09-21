// hypotrochoid.ts — Viewport vom Parameter-Update entkoppelt
import * as THREE from 'three';
import { resizeToMaxViewportOrthographic } from '../utils/resizeViewport';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0xffffff);

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-10, 10, 5, -5, 0.1, 100);
camera.position.z = 10;

// --- Parameter ---
let R = 4;
let r = 1;
let d = 1;
const tStep = 0.05;

// --- Objekte ---
let pathLine: THREE.Line;
let circleLine: THREE.Line;     // rollender Kreis (r)
let bigCircleLine: THREE.Line;  // fixer Kreis (R)
let pointMesh: THREE.Mesh;
let lineToPoint: THREE.Line;
let pathPoints: THREE.Vector3[] = [];

// === WICHTIG: Viewport NICHT an R,r,d koppeln ===
// Slider-Grenzen aus dem Widget: R ≤ 8, r ≤ 4, d ≤ 2r ≤ 8
const MAX_R = 8.0;
const MAX_r = 4.0;
const MAX_d = 2 * MAX_r; // 8.0
const MAX_VISIBLE_RADIUS = (MAX_R + MAX_r + MAX_d) * 1.1; // kleiner Puffer
let didInitialFit = false;

function fitViewportOnce() {
  if (didInitialFit) return;
  const sceneWidth = MAX_VISIBLE_RADIUS * 2; // Durchmesser
  resizeToMaxViewportOrthographic(renderer, camera, canvas, sceneWidth, 16 / 9, true);
  camera.updateProjectionMatrix();
  didInitialFit = true;
}

// Hypotrochoid
function hypotrochoid(t: number): THREE.Vector3 {
  const k = (R - r) / r;
  const x = (R - r) * Math.cos(t) + d * Math.cos(k * t);
  const y = (R - r) * Math.sin(t) - d * Math.sin(k * t);
  return new THREE.Vector3(x, y, 0);
}

function createSceneObjects() {
  [pathLine, circleLine, bigCircleLine, pointMesh, lineToPoint].forEach(obj => {
    if (obj) scene.remove(obj);
  });

  // Nur EINMAL fitten – nie anhand aktueller R/r/d
  fitViewportOnce();

  const segments = 128;

  // großer Kreis (R)
  {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * R, Math.sin(a) * R, 0));
    }
    const geom = new THREE.BufferGeometry().setFromPoints(pts);
    bigCircleLine = new THREE.LineLoop(geom, new THREE.LineBasicMaterial({ color: 0xaaaaaa }));
    scene.add(bigCircleLine);
  }

  // rollender kleiner Kreis (r)
  {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0));
    }
    const geom = new THREE.BufferGeometry().setFromPoints(pts);
    circleLine = new THREE.LineLoop(geom, new THREE.LineBasicMaterial({ color: 0x000000 }));
    scene.add(circleLine);
  }

  // Pfad
  {
    const geom = new THREE.BufferGeometry().setFromPoints([]);
    pathLine = new THREE.Line(geom, new THREE.LineBasicMaterial({ color: 0x0000ff }));
    scene.add(pathLine);
  }

  // Stift
  {
    const pointGeom = new THREE.CircleGeometry(0.1 * r, 16); // Größe ~ r
    const pointMat = new THREE.MeshBasicMaterial({ color: 0xff0000, depthTest: false });
    pointMesh = new THREE.Mesh(pointGeom, pointMat);
    pointMesh.renderOrder = 10; 
    scene.add(pointMesh);
  }

  // Radius-Linie zum Stift
  {
    const geom = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    lineToPoint = new THREE.Line(geom, new THREE.LineBasicMaterial({ color: 0x000000 }));
    lineToPoint.renderOrder = 5; 
    scene.add(lineToPoint);
  }

  updateScene(0);
}

function updateScene(t: number) {
  const k = (R - r) / r;

  // Zentrum des rollenden Kreises
  const center = new THREE.Vector3((R - r) * Math.cos(t), (R - r) * Math.sin(t), -0.01);
  circleLine.position.copy(center);
  circleLine.rotation.z = -k * t;

  // Stiftposition und Linie
  const pos = hypotrochoid(t);
  pointMesh.position.copy(pos);
  (lineToPoint.geometry as THREE.BufferGeometry).setFromPoints([center.clone().setZ(0), pos]);

  // Pfad 0..t
  pathPoints = [];
  for (let u = 0; u <= t; u += tStep) pathPoints.push(hypotrochoid(u));
  const pathGeom = new THREE.BufferGeometry().setFromPoints(pathPoints);
  pathLine.geometry.dispose();
  pathLine.geometry = pathGeom;
}

// Nur bei echtem Canvas-Resize erneut fitten
window.addEventListener('resize', () => {
  didInitialFit = false;
  fitViewportOnce();
  createSceneObjects();
});

// Start
fitViewportOnce();
createSceneObjects();

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// API fürs Widget
(window as any).updateHypotrochoid = (t: number, newR?: number, newr?: number, newd?: number) => {
  if (typeof newR === 'number') R = newR;
  if (typeof newr === 'number') r = newr;
  if (typeof newd === 'number') d = newd;

  // Geometrien neu (Kamera bleibt unverändert)
  createSceneObjects();
  updateScene(t);
};

// Zoom mit Mausrad
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  camera.zoom *= e.deltaY < 0 ? 1.1 : 1 / 1.1;
  camera.updateProjectionMatrix();
});
