import * as THREE from 'three';
// @ts-ignore
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// === Kamera & Maussteuerung ===
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.6, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// === Controls (Mauslook) ===
const controls = new PointerLockControls(camera, document.body);
scene.add(controls.getObject());

// === Klick zum Aktivieren ===
document.body.addEventListener('click', () => {
  controls.lock();
});

// === Licht ===
scene.add(new THREE.AmbientLight(0x888888));
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

// === Kegel ===
const coneGeometry = new THREE.ConeGeometry(1, 2, 32);
coneGeometry.center();
const coneMaterial = new THREE.MeshPhongMaterial({ color: 0xff5522 });
const cone = new THREE.Mesh(coneGeometry, coneMaterial);
scene.add(cone);

// === Boden ===
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshBasicMaterial({ color: 0xf0f0f0, side: THREE.DoubleSide })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// === Achsenlinien ===
const axisLength = 5;
const axisVertices = new Float32Array([
  0, 0, 0,  axisLength, 0, 0,
  0, 0, 0,  0, axisLength, 0,
  0, 0, 0,  0, 0, axisLength
]);
const axisColors = new Float32Array([
  1, 0, 0,  1, 0, 0,
  0, 1, 0,  0, 1, 0,
  0, 0, 1,  0, 0, 1
]);
const axisGeom = new THREE.BufferGeometry();
axisGeom.setAttribute('position', new THREE.BufferAttribute(axisVertices, 3));
axisGeom.setAttribute('color', new THREE.BufferAttribute(axisColors, 3));
const axisMat = new THREE.LineBasicMaterial({ vertexColors: true });
const axes = new THREE.LineSegments(axisGeom, axisMat);
scene.add(axes);

// === Tastatursteuerung ===
const keys = { forward: false, backward: false, left: false, right: false };
window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyW') keys.forward = true;
  if (e.code === 'KeyS') keys.backward = true;
  if (e.code === 'KeyA') keys.left = true;
  if (e.code === 'KeyD') keys.right = true;
});
window.addEventListener('keyup', (e) => {
  if (e.code === 'KeyW') keys.forward = false;
  if (e.code === 'KeyS') keys.backward = false;
  if (e.code === 'KeyA') keys.left = false;
  if (e.code === 'KeyD') keys.right = false;
});

// === Bewegung in Blickrichtung ===
const speed = 5.0;
let prevTime = performance.now();
const move = new THREE.Vector3();

function animate() {
  requestAnimationFrame(animate);

  const time = performance.now();
  const delta = (time - prevTime) / 1000;
  prevTime = time;

  if (controls.isLocked) {
    move.set(0, 0, 0);
    if (keys.forward) move.z -= 1;
    if (keys.backward) move.z += 1;
    if (keys.left) move.x -= 1;
    if (keys.right) move.x += 1;

    if (move.lengthSq() > 0) {
      move.normalize();
      move.applyQuaternion(camera.quaternion); // Blickrichtung
      move.y = 0; // Nur am Boden bewegen
      move.multiplyScalar(speed * delta);
      controls.getObject().position.add(move);
    }
  }

  renderer.render(scene, camera);
}
animate();

// === Resize ===
window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
});
