import * as THREE from 'three';
import { resizeToMaxViewportOrthographic } from '../utils/resizeViewport';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0xffffff);

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-10, 10, 5, -5, 0.1, 100);
camera.position.z = 10;

let R = 1;                  // war: const r = 1;
const maxT = Math.PI * 4;
const tStep = 0.05;
let d = 1;                  // ABSOLUTER Abstand (nicht Faktor)
let currentTheta = 0;

let pathLine: THREE.Line;
let circleLine: THREE.Line;
let pointMesh: THREE.Mesh;
let lineToPoint: THREE.Line;
let groundLine: THREE.Line;
let pathPoints: THREE.Vector3[] = [];

function circleCenter(t: number): THREE.Vector3 {
  // Start bei x=R, dann rollt der Mittelpunkt mit x = R + R*t
  return new THREE.Vector3(R + R * t, R, -0.01);
}

function createSceneObjects() {
  [pathLine, circleLine, pointMesh, lineToPoint, groundLine].forEach(obj => {
    if (obj) scene.remove(obj);
  });

  const sceneWidth = R * (maxT + 2);
  resizeToMaxViewportOrthographic(renderer, camera, canvas, sceneWidth, 16/9, false);

  // Bodenlinie
  const groundGeom = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(camera.left, 0, 0),
    new THREE.Vector3(camera.right, 0, 0)
  ]);
  groundLine = new THREE.Line(groundGeom, new THREE.LineBasicMaterial({ color: 0x000000 }));
  scene.add(groundLine);

  // Pfadlinie
  const pathGeom = new THREE.BufferGeometry().setFromPoints([]);
  pathLine = new THREE.Line(pathGeom, new THREE.LineBasicMaterial({ color: 0x0000ff }));
  scene.add(pathLine);

  // Kreis (Radius R)
  const circlePoints: THREE.Vector3[] = [];
  const segments = 64;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    circlePoints.push(new THREE.Vector3(Math.cos(angle) * R, Math.sin(angle) * R, 0));
  }
  const circleGeom = new THREE.BufferGeometry().setFromPoints(circlePoints);
  circleLine = new THREE.LineLoop(circleGeom, new THREE.LineBasicMaterial({ color: 0x000000 }));
  scene.add(circleLine);

  // roter Punkt
  const pointGeom = new THREE.CircleGeometry(0.1 * R, 16);
  const pointMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  pointMesh = new THREE.Mesh(pointGeom, pointMat);
  scene.add(pointMesh);

  // Linie vom Mittelpunkt zum Punkt
  const lineGeom = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
  lineToPoint = new THREE.Line(lineGeom, new THREE.LineBasicMaterial({ color: 0x000000 }));
  scene.add(lineToPoint);

  updateScene(0);
}

function updateScene(t: number) {
  const theta = (currentTheta * Math.PI) / 180;

  // Kreisposition
  const center = circleCenter(t);
  circleLine.position.copy(center);
  circleLine.rotation.z = -t;

  // Punktposition (Start oben)
  const angle = -t + theta + Math.PI / 2;
  const offset = new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0).multiplyScalar(d);
  pointMesh.position.copy(center.clone().add(offset));

  // Linie zum Punkt
  const linePoints = [center.clone().setZ(0), pointMesh.position];
  (lineToPoint.geometry as THREE.BufferGeometry).setFromPoints(linePoints);

  // Pfad berechnen
  pathPoints = [];
  for (let currentT = 0; currentT <= t; currentT += tStep) {
    const cx = R + R * currentT;
    const a = -currentT + theta + Math.PI / 2;
    const off = new THREE.Vector3(Math.cos(a), Math.sin(a), 0).multiplyScalar(d);
    const pos = new THREE.Vector3(cx, R, 0).add(off);
    pathPoints.push(pos);
  }

  const newPathGeom = new THREE.BufferGeometry().setFromPoints(pathPoints);
  pathLine.geometry.dispose();
  pathLine.geometry = newPathGeom;
}

// Resize-Handling
window.addEventListener('resize', () => createSceneObjects());

// Start
createSceneObjects();
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// Globale Methode für postMessage
(window as any).updateCycloid = (t: number, thetaDeg: number, distanceAbs: number, newR?: number) => {
  if (typeof newR === 'number' && isFinite(newR) && newR > 0) {
    R = newR;
  }
  currentTheta = thetaDeg;
  d = distanceAbs; // absolut
  createSceneObjects();
  updateScene(t);
};

// Zoom mit Mausrad
canvas.addEventListener('wheel', (event) => {
  event.preventDefault();
  if (event.deltaY < 0) camera.zoom *= 1.1; else camera.zoom /= 1.1;
  camera.updateProjectionMatrix();
});
