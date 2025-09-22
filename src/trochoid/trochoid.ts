// Erwartetes Parent-Message-Format (ohne phi):
// frame.contentWindow?.postMessage({ type:'update', theta, d, R }, '*');
//  - theta: roll/position (radians)
//  - d:     absolute distance from center
//  - R:     rolling circle radius

import * as THREE from 'three';
import { resizeToMaxViewportOrthographic } from '../utils/resizeViewport';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0xffffff);

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-10, 10, 5, -5, 0.1, 100);
camera.position.set(0, 0, 10);

// --- Parameter ---
let R = 1;                  // rolling radius (can be changed by parent)
const maxTheta = Math.PI * 4;
const thetaStep = 0.05;

let d = 1;                  // absolute offset from center

// --- Scene Objekte ---
let pathLine: THREE.Line | undefined;        // durchgezogene Bahn
let tracePoints: THREE.Points | undefined;   // Spurpunkte als Punktewolke
let circleLine: THREE.Line | undefined;      // rollender Kreis
let pointMesh: THREE.Mesh | undefined;       // roter Spurpunkt
let dLine: THREE.Line | undefined;           // Gerade d (Radius-Segment)
let groundLine: THREE.Line | undefined;      // Boden y=0

// --- Viewport-Handling ---
let didInitialFit = false;
function fitViewport() {
  const sceneWidth = (maxTheta + 2);     // R-unabhängig!
  resizeToMaxViewportOrthographic(renderer, camera, canvas, sceneWidth, 16 / 9, false);
  camera.updateProjectionMatrix();
}
function fitViewportOnce() {
  if (!didInitialFit) {
    fitViewport();
    didInitialFit = true;
  }
}

// --- Hilfsfunktionen ---
function circleCenter(theta: number): THREE.Vector3 {
  // Rolling on x-axis: center starts at (R, R) and moves by R * theta in x
  return new THREE.Vector3(R + R * theta, R, -0.01);
}

function groundExtentX(): { xmin: number; xmax: number } {
  const margin = Math.max(0.5, 0.1 * R);
  const xmin = 0 - margin;
  const xmax = R * (2 + maxTheta) + margin;
  return { xmin, xmax };
}

function createGroundLine() {
  const { xmin, xmax } = groundExtentX();
  const groundGeom = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(xmin, 0, 0),
    new THREE.Vector3(xmax, 0, 0),
  ]);
  const mat = new THREE.LineBasicMaterial({ color: 0x000000, depthTest: false });
  return new THREE.Line(groundGeom, mat);
}

// --- Geometrie / Szene aufbauen ---
function createSceneObjects() {
  // Alte Objekte entfernen
  [pathLine, tracePoints, circleLine, pointMesh, dLine, groundLine].forEach(obj => {
    if (obj) scene.remove(obj);
  });

  // Viewport NICHT an R koppeln
  fitViewportOnce();

  // Bodenlinie (y=0)
  groundLine = createGroundLine();
  scene.add(groundLine);

  // Pfad (Linie)
  const pathGeom = new THREE.BufferGeometry().setFromPoints([]);
  pathLine = new THREE.Line(
    pathGeom,
    new THREE.LineBasicMaterial({ color: 0x0000ff, depthTest: false })
  );
  scene.add(pathLine);

  // Spurpunkte (Points) – Geometrie wird in updateScene befüllt
  const tpGeom = new THREE.BufferGeometry().setFromPoints([]);
  tracePoints = new THREE.Points(
    tpGeom,
    new THREE.PointsMaterial({
      color: 0x0000ff,
      size: Math.max(0.04 * R, 0.03), // kleine Punkte; skalieren moderat mit R
      sizeAttenuation: false          // ungefähr konstante Pixelwirkung
    })
  );
  (tracePoints.material as THREE.PointsMaterial).depthTest = false;
  scene.add(tracePoints);

  // Rollender Kreis
  const circlePts: THREE.Vector3[] = [];
  const segs = 64;
  for (let i = 0; i <= segs; i++) {
    const a = (i / segs) * Math.PI * 2;
    circlePts.push(new THREE.Vector3(Math.cos(a) * R, Math.sin(a) * R, 0));
  }
  const circleGeom = new THREE.BufferGeometry().setFromPoints(circlePts);
  circleLine = new THREE.LineLoop(
    circleGeom,
    new THREE.LineBasicMaterial({ color: 0x000000 })
  );
  scene.add(circleLine);

  // Roter Spurpunkt
  const pointGeom = new THREE.CircleGeometry(0.1 * R, 16);
  const pointMat = new THREE.MeshBasicMaterial({ color: 0xff0000, depthTest: false });
  pointMesh = new THREE.Mesh(pointGeom, pointMat);
  pointMesh.renderOrder = 10;
  scene.add(pointMesh);

  // Gerade d (Radius-Segment vom Zentrum zum Punkt)
  const dGeom = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
  dLine = new THREE.Line(
    dGeom,
    new THREE.LineBasicMaterial({ color: 0x000000, depthTest: false })
  );
  dLine.renderOrder = 5; 
  scene.add(dLine);

  updateScene(0);
}

function updateScene(thetaRoll: number) {
  if (!circleLine || !pointMesh || !dLine || !pathLine || !tracePoints) return;

  // Mittelpunkt des rollenden Kreises
  const center = circleCenter(thetaRoll);

  // Kreis-Transform (Position + Rotation im Uhrzeigersinn)
  circleLine.position.copy(center);
  circleLine.rotation.z = -thetaRoll;

  // Spurpunkt-Offset (ohne π/2):
  // Δ(θ) = (-d sin θ, -d cos θ)
  const s = Math.sin(thetaRoll);
  const c = Math.cos(thetaRoll);
  const offset = new THREE.Vector3(-d * s, -d * c, 0);

  // Spurpunkt-Position
  pointMesh.position.copy(center.clone().add(offset));

  // Radius-Segment (d-Linie) vom Mittelpunkt zum Spurpunkt
  const dPts = [center.clone().setZ(0), pointMesh.position.clone().setZ(0)];
  (dLine.geometry as THREE.BufferGeometry).setFromPoints(dPts);

  // Spurkurve 0 .. thetaRoll (Linie + Spurpunkte)
  const pathPts: THREE.Vector3[] = [];
  const start = Math.min(0, thetaRoll);
  const end = Math.max(0, thetaRoll);

  for (let th = start; th <= end + 1e-9; th += thetaStep) {
    const cx = R + R * th;            // Mittelpunkt x = R + R*θ
    const sy = Math.sin(th);
    const cy = Math.cos(th);
    const off = new THREE.Vector3(-d * sy, -d * cy, 0); // Δ(th)
    pathPts.push(new THREE.Vector3(cx, R, 0).add(off));
  }

  // Linie aktualisieren
  {
    const newPathGeom = new THREE.BufferGeometry().setFromPoints(pathPts);
    pathLine.geometry.dispose();
    pathLine.geometry = newPathGeom;
  }

  // Spurpunkte aktualisieren
  {
    const tpGeom = new THREE.BufferGeometry().setFromPoints(pathPts);
    tracePoints.geometry.dispose();
    tracePoints.geometry = tpGeom;
  }
}


// Resize-Handling
window.addEventListener('resize', () => {
  didInitialFit = false;  // beim nächsten createSceneObjects() wieder fitten
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

// Public API für parent -> iframe postMessage
// Neuer Aufruf: { theta, d, R }
(window as any).updateTrochoid = (
  theta: number,   // roll/position, radians
  dAbs: number,    // absolute distance
  newR?: number    // optional new rolling radius
) => {
  if (typeof newR === 'number' && isFinite(newR) && newR > 0) {
    R = newR;
  }
  d = dAbs;

  // Boden an neues R anpassen
  if (groundLine) {
    const { xmin, xmax } = groundExtentX();
    const g = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(xmin, 0, 0),
      new THREE.Vector3(xmax, 0, 0),
    ]);
    groundLine.geometry.dispose();
    groundLine.geometry = g;
  }

  // Geometrie mit neuem R rekonstruieren (Kamera bleibt R-unabhängig)
  createSceneObjects();
  updateScene(theta);
};

// Einfaches Zoom mit Maus
canvas.addEventListener('wheel', (event) => {
  event.preventDefault();
  if (event.deltaY < 0) camera.zoom *= 1.1; else camera.zoom /= 1.1;
  camera.updateProjectionMatrix();
});
