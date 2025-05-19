import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-10, 10, 5, -5, 0.1, 100);
camera.position.z = 10;

const canvas = document.getElementById('webgl') as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0xffffff);

// HTML Elemente
const distanceInput = document.getElementById('distanceInput') as HTMLInputElement;
const slider = document.getElementById('slider') as HTMLInputElement;
const tInput = document.getElementById('tInput') as HTMLInputElement;
const angleSlider = document.getElementById('angleSlider') as HTMLInputElement;
const thetaInput = document.getElementById('thetaInput') as HTMLInputElement;

const r = 1;
let distanceFactor = parseFloat(distanceInput.value);
const maxT = Math.PI * 4;
const tStep = 0.05;

function circleCenter(t: number): THREE.Vector3 {
  return new THREE.Vector3(r * t, r, -0.01);
}

let pathLine: THREE.Line;
let circleLine: THREE.Line;
let pointMesh: THREE.Mesh;
let lineToPoint: THREE.Line;
let groundLine: THREE.Line;
let pathPoints: THREE.Vector3[] = [];

function createSceneObjects() {
  [pathLine, circleLine, pointMesh, lineToPoint, groundLine].forEach(obj => {
    if (obj) scene.remove(obj);
  });

  // Kamera an Seitenverhältnis anpassen
  const aspect = window.innerWidth / window.innerHeight;
  const sceneWidth = r * (maxT + 1); // Zykloidenbreite + Puffer
  const sceneHeight = sceneWidth / aspect;

camera.left = camera.left = -r * 2;
camera.right = sceneWidth;
;
  camera.right = sceneWidth;
  camera.top = sceneHeight / 2;
  camera.bottom = -sceneHeight / 2;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Bodenlinie
  const groundGeom = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(camera.left, 0, 0),
    new THREE.Vector3(sceneWidth, 0, 0)
  ]);
  groundLine = new THREE.Line(groundGeom, new THREE.LineBasicMaterial({ color: 0x000000 }));
  scene.add(groundLine);

  // Dynamische Pfadlinie
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

  const center = circleCenter(t);
  circleLine.position.copy(center);
  circleLine.rotation.z = -t;

  // 0° soll oben sein → -π/2 verschieben
  const angle = -t + theta - Math.PI / 2;
  const offset = new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0).multiplyScalar(r * distanceFactor);
  pointMesh.position.copy(center.clone().add(offset));

  const linePoints = [center.clone().setZ(0), pointMesh.position];
  (lineToPoint.geometry as THREE.BufferGeometry).setFromPoints(linePoints);

  // Zykloidenpfad aktualisieren
  pathPoints = [];
  for (let currentT = 0; currentT <= t; currentT += tStep) {
    const cx = r * currentT;
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
function updateFromSlider() {
  updateScene(parseFloat(slider.value));
}
function updateFromTInput() {
  updateScene(parseFloat(tInput.value));
}
function updateFromThetaSlider() {
  thetaInput.value = angleSlider.value;
  updateScene(parseFloat(slider.value));
}
function updateFromThetaInput() {
  angleSlider.value = thetaInput.value;
  updateScene(parseFloat(slider.value));
}

// Event-Listener
slider.addEventListener('input', updateFromSlider);
tInput.addEventListener('input', updateFromTInput);
angleSlider.addEventListener('input', updateFromThetaSlider);
thetaInput.addEventListener('input', updateFromThetaInput);
distanceInput.addEventListener('input', () => updateScene(parseFloat(slider.value)));
window.addEventListener('resize', () => createSceneObjects());

// Initialisierung
createSceneObjects();
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
