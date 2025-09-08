import * as THREE from 'three';
import { resizeToMaxViewportOrthographic } from '../utils/resizeViewport';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0xffffff);

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-10, 10, 5, -5, 0.1, 100);
camera.position.z = 10;

let R = 1;
let r = 1;
let d = 1;
const tStep = 0.05;

let pathLine: THREE.Line;
let circleLine: THREE.Line;
let bigCircleLine: THREE.Line;
let pointMesh: THREE.Mesh;
let lineToPoint: THREE.Line;
let pathPoints: THREE.Vector3[] = [];

function epitrochoid(t: number): THREE.Vector3 {
  const k = R / r;
  const x = (R + r) * Math.cos(t) - d * Math.cos((1 + k) * t);
  const y = (R + r) * Math.sin(t) - d * Math.sin((1 + k) * t);
  return new THREE.Vector3(x, y, 0);
}

function createSceneObjects() {
  [pathLine, circleLine, bigCircleLine, pointMesh, lineToPoint].forEach(obj => {
    if (obj) scene.remove(obj);
  });

  const curveMaxRadius = R + d + r;
  const margin = 0.2;
  const visibleRadius = curveMaxRadius * (1 + margin);
  resizeToMaxViewportOrthographic(renderer, camera, canvas, visibleRadius * 2, 16 / 9, true);

  const segments = 128;

  // Großer Kreis
  const bigCirclePoints: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    bigCirclePoints.push(new THREE.Vector3(Math.cos(angle) * R, Math.sin(angle) * R, 0));
  }
  const bigCircleGeom = new THREE.BufferGeometry().setFromPoints(bigCirclePoints);
  bigCircleLine = new THREE.LineLoop(bigCircleGeom, new THREE.LineBasicMaterial({ color: 0xaaaaaa }));
  scene.add(bigCircleLine);

  // Rollender Kreis
  const circlePoints: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    circlePoints.push(new THREE.Vector3(Math.cos(angle) * r, Math.sin(angle) * r, 0));
  }
  const circleGeom = new THREE.BufferGeometry().setFromPoints(circlePoints);
  circleLine = new THREE.LineLoop(circleGeom, new THREE.LineBasicMaterial({ color: 0x000000 }));
  scene.add(circleLine);

  // Pfad
  const pathGeom = new THREE.BufferGeometry().setFromPoints([]);
  pathLine = new THREE.Line(pathGeom, new THREE.LineBasicMaterial({ color: 0x0000ff }));
  scene.add(pathLine);

  // Zeichenstift
  const pointGeom = new THREE.CircleGeometry(0.1 * r, 16);
  const pointMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  pointMesh = new THREE.Mesh(pointGeom, pointMat);
  scene.add(pointMesh);

  // Linie zum Zeichenstift
  const lineGeom = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(), new THREE.Vector3()
  ]);
  lineToPoint = new THREE.Line(lineGeom, new THREE.LineBasicMaterial({ color: 0x000000 }));
  scene.add(lineToPoint);

  updateScene(0);
}

function updateScene(t: number) {
  const k = R / r;

  const center = new THREE.Vector3((R + r) * Math.cos(t), (R + r) * Math.sin(t), -0.01);
  circleLine.position.copy(center);
  circleLine.rotation.z = -(1 + k) * t;

  const pos = epitrochoid(t);
  pointMesh.position.copy(pos);

  const linePoints = [center.clone().setZ(0), pos];
  (lineToPoint.geometry as THREE.BufferGeometry).setFromPoints(linePoints);

  pathPoints = [];
  for (let currentT = 0; currentT <= t; currentT += tStep) {
    pathPoints.push(epitrochoid(currentT));
  }
  const pathGeom = new THREE.BufferGeometry().setFromPoints(pathPoints);
  pathLine.geometry.dispose();
  pathLine.geometry = pathGeom;
}

window.addEventListener('resize', () => createSceneObjects());

createSceneObjects();

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

(window as any).updateEpitrochoid = (t: number, newR?: number, newr?: number, newd?: number) => {
  if (typeof newR === 'number') R = newR;
  if (typeof newr === 'number') r = newr;
  if (typeof newd === 'number') d = newd;
  createSceneObjects();
  updateScene(t);
};

// Zoom mit Mausrad
canvas.addEventListener('wheel', (event) => {
  event.preventDefault();

  if (event.deltaY < 0) {
    camera.zoom *= 1.1; // reinzoomen
  } else {
    camera.zoom /= 1.1; // rauszoomen
  }

  camera.updateProjectionMatrix();
});
