import * as THREE from 'three';
import { resizeToMaxViewportOrthographic } from '../utils/resizeViewport';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0xffffff);

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-10, 10, 5, -5, 0.1, 100);
camera.position.z = 10;

// ---- Parameter (werden von außen gesetzt) ----
let R = 1;
let r = 1;
let d = 1;
const tStep = 0.05;

// ---- Szene-Objekte ----
let pathLine: THREE.Line;
let circleLine: THREE.Line;     // rollender kleiner Kreis (r)
let bigCircleLine: THREE.Line;  // fixer großer Kreis (R)
let pointMesh: THREE.Mesh;
let lineToPoint: THREE.Line;
let pathPoints: THREE.Vector3[] = [];

// ==== WICHTIG: Viewport NICHT an R,r,d koppeln ====
// Nutze die Slider-Maxima aus deinem Widget (R ≤ 5, r ≤ 3, d ≤ 2r ≤ 6)
const MAX_R = 5.0;
const MAX_r = 3.0;
const MAX_d = 2 * MAX_r; // = 6.0
const MAX_VISIBLE_RADIUS = (MAX_R + MAX_r + MAX_d) * 1.1; // kleiner Puffer
let didInitialFit = false;

function fitViewportOnce() {
  if (didInitialFit) return;
  // Setze eine feste Szenenbreite (Durchmesser), unabhängig von aktuellen Parametern
  const sceneWidth = MAX_VISIBLE_RADIUS * 2;
  resizeToMaxViewportOrthographic(renderer, camera, canvas, sceneWidth, 16 / 9, true);
  camera.updateProjectionMatrix();
  didInitialFit = true;
}

// ---- Kurvenfunktion (Epitrochoid) ----
function epitrochoid(theta: number): THREE.Vector3 {
  const k = R / r;
  const x = (R + r) * Math.cos(theta) - d * Math.cos((1 + k) * theta);
  const y = (R + r) * Math.sin(theta) - d * Math.sin((1 + k) * theta);
  return new THREE.Vector3(x, y, 0);
}

function createSceneObjects() {
  [pathLine, circleLine, bigCircleLine, pointMesh, lineToPoint].forEach(obj => {
    if (obj) scene.remove(obj);
  });

  // Nur EINMAL fitten – NICHT bei Parameteränderungen
  fitViewportOnce();

  const segments = 128;

  // Großer fixer Kreis (Radius R)
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

  // Rollender kleiner Kreis (Radius r)
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
    const pointGeom = new THREE.CircleGeometry(0.1 * r, 16); // Größe ~ r (das ist gewollt)
    const pointMat = new THREE.MeshBasicMaterial({ color: 0xff0000, depthTest: false  });
    pointMesh = new THREE.Mesh(pointGeom, pointMat);
    pointMesh.renderOrder = 10;
    scene.add(pointMesh);
  }

  // Linie vom Kreiszentrum zum Stift
  {
    const geom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(), new THREE.Vector3()
    ]);
    lineToPoint = new THREE.Line(geom, new THREE.LineBasicMaterial({ color: 0x000000 }));
    lineToPoint.renderOrder = 5;
    scene.add(lineToPoint);
  }

  updateScene(0);
}

function updateScene(theta: number) {
  const k = R / r;

  // Zentrum des rollenden Kreises auf dem großen Kreis
  const center = new THREE.Vector3((R + r) * Math.cos(theta), (R + r) * Math.sin(theta), -0.01);
  circleLine.position.copy(center);
  circleLine.rotation.z = -(1 + k) * theta;

  // Stiftposition
  const pos = epitrochoid(theta);
  pointMesh.position.copy(pos);

  // Linie zum Stift
  const linePoints = [center.clone().setZ(0), pos];
  (lineToPoint.geometry as THREE.BufferGeometry).setFromPoints(linePoints);

  // Pfad bis theta
  pathPoints = [];
  for (let t = 0; t <= theta; t += tStep) {
    pathPoints.push(epitrochoid(t));
  }
  const pathGeom = new THREE.BufferGeometry().setFromPoints(pathPoints);
  pathLine.geometry.dispose();
  pathLine.geometry = pathGeom;
}

// Nur bei *echtem* Canvas-Resize erneut fitten
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

// Public API (wird vom Widget aufgerufen)
(window as any).updateEpitrochoid = (theta: number, newR?: number, newr?: number, newd?: number) => {
  if (typeof newR === 'number') R = newR;
  if (typeof newr === 'number') r = newr;
  if (typeof newd === 'number') d = newd;

  // Nur Geometrie neu aufbauen; Kamera-Viewport bleibt unverändert
  createSceneObjects();
  updateScene(theta);
};

// Zoom mit Mausrad (rein/raus), ändert nur die Kamera-Zoom-Eigenschaft
canvas.addEventListener('wheel', (event) => {
  event.preventDefault();
  camera.zoom *= event.deltaY < 0 ? 1.1 : 1 / 1.1;
  camera.updateProjectionMatrix();
});
