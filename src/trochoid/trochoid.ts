// Erwartetes Parent-Message-Format:
// frame.contentWindow?.postMessage({ type:'update', theta, phi, d, R }, '*');
//  - theta: roll/position (radians)
//  - phi:   point offset on wheel (degrees)
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

let R = 1;                  // rolling radius (can be changed by parent)
const maxTheta = Math.PI * 4;
const thetaStep = 0.05;

let d = 1;                  // absolute offset from center
let currentPhiDeg = 0;      // point offset on wheel (degrees)

let pathLine: THREE.Line | undefined;
let circleLine: THREE.Line | undefined;
let pointMesh: THREE.Mesh | undefined;
let lineToPoint: THREE.Line | undefined;
let groundLine: THREE.Line | undefined;

function circleCenter(theta: number): THREE.Vector3 {
  // Rolling on x-axis: center starts at (R, R) and moves by R * theta in x
  return new THREE.Vector3(R + R * theta, R, -0.01);
}

function createSceneObjects() {
  // Remove old objects
  [pathLine, circleLine, pointMesh, lineToPoint, groundLine].forEach(obj => {
    if (obj) scene.remove(obj);
  });

  // Fit viewport to current R
  const sceneWidth = R * (maxTheta + 2);
  resizeToMaxViewportOrthographic(renderer, camera, canvas, sceneWidth, 16 / 9, false);

  // Ground line (y=0) across current view
  const groundGeom = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(camera.left, 0, 0),
    new THREE.Vector3(camera.right, 0, 0),
  ]);
  groundLine = new THREE.Line(groundGeom, new THREE.LineBasicMaterial({ color: 0x000000 }));
  scene.add(groundLine);

  // Empty path line (we'll fill in updateScene)
  const pathGeom = new THREE.BufferGeometry().setFromPoints([]);
  pathLine = new THREE.Line(pathGeom, new THREE.LineBasicMaterial({ color: 0x0000ff }));
  scene.add(pathLine);

  // Rolling circle of radius R at origin (will be positioned in updateScene)
  const circlePts: THREE.Vector3[] = [];
  const segs = 64;
  for (let i = 0; i <= segs; i++) {
    const a = (i / segs) * Math.PI * 2;
    circlePts.push(new THREE.Vector3(Math.cos(a) * R, Math.sin(a) * R, 0));
  }
  const circleGeom = new THREE.BufferGeometry().setFromPoints(circlePts);
  circleLine = new THREE.LineLoop(circleGeom, new THREE.LineBasicMaterial({ color: 0x000000 }));
  scene.add(circleLine);

  // Red point on the rolling circle
  const pointGeom = new THREE.CircleGeometry(0.1 * R, 16);
  const pointMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  pointMesh = new THREE.Mesh(pointGeom, pointMat);
  scene.add(pointMesh);

  // Line from center to point
  const lpGeom = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
  lineToPoint = new THREE.Line(lpGeom, new THREE.LineBasicMaterial({ color: 0x000000 }));
  scene.add(lineToPoint);

  updateScene(0);
}

function updateScene(thetaRoll: number) {
  if (!circleLine || !pointMesh || !lineToPoint || !pathLine) return;

  const phiRad = (currentPhiDeg * Math.PI) / 180;

  // Rolling circle transform
  const center = circleCenter(thetaRoll);
  circleLine.position.copy(center);
  circleLine.rotation.z = -thetaRoll;

  // Point on circle (start at top when phi=0)
  const angle = -thetaRoll + phiRad + Math.PI / 2;
  const offset = new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0).multiplyScalar(d);
  pointMesh.position.copy(center.clone().add(offset));

  // Line from center to point (z=0 for a crisp line)
  const linePts = [center.clone().setZ(0), pointMesh.position];
  (lineToPoint.geometry as THREE.BufferGeometry).setFromPoints(linePts);

  // Trace path from 0 to thetaRoll
  const pathPts: THREE.Vector3[] = [];
  const start = Math.min(0, thetaRoll);
  const end = Math.max(0, thetaRoll);
  for (let th = start; th <= end + 1e-9; th += thetaStep) {
    const cx = R + R * th;
    const a = -th + phiRad + Math.PI / 2;
    const off = new THREE.Vector3(Math.cos(a), Math.sin(a), 0).multiplyScalar(d);
    pathPts.push(new THREE.Vector3(cx, R, 0).add(off));
  }
  const newPathGeom = new THREE.BufferGeometry().setFromPoints(pathPts);
  pathLine.geometry.dispose();
  pathLine.geometry = newPathGeom;
}

// Resize handling
window.addEventListener('resize', () => createSceneObjects());

// Start
createSceneObjects();
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// Public API for parent -> iframe postMessage
// Matches: { theta, phi, d, R }
(window as any).updateTrochoid = (
  theta: number,   // roll/position, radians
  phiDeg: number,  // point offset, degrees
  dAbs: number,    // absolute distance
  newR?: number    // optional new rolling radius
) => {
  if (typeof newR === 'number' && isFinite(newR) && newR > 0) {
    R = newR;
  }
  currentPhiDeg = phiDeg;
  d = dAbs;

  // Recreate geometry with new R (viewport etc.)
  createSceneObjects();
  updateScene(theta);
};

// Simple zoom with mouse wheel
canvas.addEventListener('wheel', (event) => {
  event.preventDefault();
  if (event.deltaY < 0) camera.zoom *= 1.1; else camera.zoom /= 1.1;
  camera.updateProjectionMatrix();
});
