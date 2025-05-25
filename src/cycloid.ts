import * as THREE from 'three';
import { resizeToMaxViewportOrthographic } from './utils/resizeViewport';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0xffffff);

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-10, 10, 5, -5, 0.1, 100);
camera.position.z = 10;

// HTML-Steuerelemente
const distanceInput = document.getElementById('distanceInput') as HTMLInputElement;
const slider = document.getElementById('slider') as HTMLInputElement;
const tInput = document.getElementById('tInput') as HTMLInputElement;
const angleSlider = document.getElementById('angleSlider') as HTMLInputElement;
const thetaInput = document.getElementById('thetaInput') as HTMLInputElement;

const r = 1;
const maxT = Math.PI * 4;
const tStep = 0.05;
let distanceFactor = parseFloat(distanceInput.value);

let pathLine: THREE.Line;
let circleLine: THREE.Line;
let pointMesh: THREE.Mesh;
let lineToPoint: THREE.Line;
let groundLine: THREE.Line;
let pathPoints: THREE.Vector3[] = [];

function circleCenter(t: number): THREE.Vector3 {
  return new THREE.Vector3(r + r * t, r, -0.01); // linker Rand bei x = 0
}

function createSceneObjects() {
  [pathLine, circleLine, pointMesh, lineToPoint, groundLine].forEach(obj => {
    if (obj) scene.remove(obj);
  });

  distanceFactor = parseFloat(distanceInput.value);
  const sceneWidth = r * (maxT + 2); // +2 für linker + rechter Rand
  resizeToMaxViewportOrthographic(renderer, camera, canvas, sceneWidth);

  // Bodenlinie
  const groundGeom = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(camera.left, 0, 0),
    new THREE.Vector3(camera.right, 0, 0)
  ]);
  groundLine = new THREE.Line(groundGeom, new THREE.LineBasicMaterial({ color: 0x000000 }));
  scene.add(groundLine);

  // Zykloidenpfad
  const pathGeom = new THREE.BufferGeometry().setFromPoints([]);
  pathLine = new THREE.Line(pathGeom, new THREE.LineBasicMaterial({ color: 0x0000ff }));
  scene.add(pathLine);

  // Kreislinie
  const circlePoints: THREE.Vector3[] = [];
  const segments = 64;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    circlePoints.push(new THREE.Vector3(Math.cos(angle) * r, Math.sin(angle) * r, 0));
  }
  const circleGeom = new THREE.BufferGeometry().setFromPoints(circlePoints);
  circleLine = new THREE.LineLoop(circleGeom, new THREE.LineBasicMaterial({ color: 0x000000 }));
  scene.add(circleLine);

  // Roter Punkt
  const pointGeom = new THREE.CircleGeometry(0.1 * r, 16);
  const pointMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  pointMesh = new THREE.Mesh(pointGeom, pointMat);
  scene.add(pointMesh);

  // Linie vom Mittelpunkt zum Punkt
  const lineGeom = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
  lineToPoint = new THREE.Line(lineGeom, new THREE.LineBasicMaterial({ color: 0x000000 }));
  scene.add(lineToPoint);

  // Max-Werte setzen
  slider.max = maxT.toFixed(2);
  tInput.max = maxT.toFixed(2);

  updateScene(parseFloat(slider.value));
}

function updateScene(t: number) {
  const thetaDeg = parseFloat(thetaInput.value);
  const theta = (thetaDeg * Math.PI) / 180;
  distanceFactor = parseFloat(distanceInput.value);

  // Eingaben synchronisieren
  slider.value = t.toFixed(2);
  tInput.value = t.toFixed(2);
  angleSlider.value = thetaDeg.toFixed(0);

  // Kreisposition
  const center = circleCenter(t);
  circleLine.position.copy(center);
  circleLine.rotation.z = -t;

  // Punktposition
  const angle = -t + theta - Math.PI / 2;
  const offset = new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0).multiplyScalar(r * distanceFactor);
  pointMesh.position.copy(center.clone().add(offset));

  // Linie zum Punkt
  const linePoints = [center.clone().setZ(0), pointMesh.position];
  (lineToPoint.geometry as THREE.BufferGeometry).setFromPoints(linePoints);

  // Zykloidenpfad zeichnen
  pathPoints = [];
  for (let currentT = 0; currentT <= t; currentT += tStep) {
    const cx = r + r * currentT;
    const a = -currentT + theta - Math.PI / 2;
    const offset = new THREE.Vector3(Math.cos(a), Math.sin(a), 0).multiplyScalar(r * distanceFactor);
    const pos = new THREE.Vector3(cx, r, 0).add(offset);
    pathPoints.push(pos);
  }
  const pathGeom = new THREE.BufferGeometry().setFromPoints(pathPoints);
  pathLine.geometry.dispose();
  pathLine.geometry = pathGeom;
}

// Event-Handler
slider.addEventListener('input', () => updateScene(parseFloat(slider.value)));
tInput.addEventListener('input', () => updateScene(parseFloat(tInput.value)));
angleSlider.addEventListener('input', () => {
  thetaInput.value = angleSlider.value;
  updateScene(parseFloat(slider.value));
});
thetaInput.addEventListener('input', () => {
  angleSlider.value = thetaInput.value;
  updateScene(parseFloat(slider.value));
});
distanceInput.addEventListener('input', () => updateScene(parseFloat(slider.value)));
window.addEventListener('resize', () => createSceneObjects());

// Start
createSceneObjects();
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();


(window as any).updateCycloid = (t: number, theta: number, distance: number) => {
  distanceInput.value = distance.toString();
  thetaInput.value = theta.toString();
  angleSlider.value = theta.toString();
  slider.value = t.toString();
  tInput.value = t.toString();
  updateScene(t);
};
