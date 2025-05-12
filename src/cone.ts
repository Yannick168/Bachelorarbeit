import * as THREE from 'three';
// @ts-ignore
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// === Kamera ===
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.6, 5);
camera.lookAt(0, 0, 0);

// === Renderer ===
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// === Controls (Maussteuerung) ===
const controls = new PointerLockControls(camera, document.body);
scene.add(controls.getObject());

const overlay = document.getElementById('overlay')!;
controls.addEventListener('lock', () => {
  overlay.style.display = 'none';
});
controls.addEventListener('unlock', () => {
  overlay.style.display = 'flex';
});

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

// === Tastatureingaben ===
const keys = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  up: false,
  down: false
};

window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyW') keys.forward = true;
  if (e.code === 'KeyS') keys.backward = true;
  if (e.code === 'KeyA') keys.left = true;
  if (e.code === 'KeyD') keys.right = true;
  if (e.code === 'Space') keys.up = true;
  if (e.code === 'ShiftLeft') keys.down = true;
});

window.addEventListener('keyup', (e) => {
  if (e.code === 'KeyW') keys.forward = false;
  if (e.code === 'KeyS') keys.backward = false;
  if (e.code === 'KeyA') keys.left = false;
  if (e.code === 'KeyD') keys.right = false;
  if (e.code === 'Space') keys.up = false;
  if (e.code === 'ShiftLeft') keys.down = false;
});

// === Bewegung ===
const speed = 5.0;
let prevTime = performance.now();
const moveDirection = new THREE.Vector3();
const moveVertical = new THREE.Vector3();
const forward = new THREE.Vector3();
const right = new THREE.Vector3();

function animate() {
  requestAnimationFrame(animate);
  const time = performance.now();
  const delta = (time - prevTime) / 1000;
  prevTime = time;

  if (controls.isLocked) {
    moveDirection.set(0, 0, 0);
    moveVertical.set(0, 0, 0);

    if (keys.forward) moveDirection.z -= 1;
    if (keys.backward) moveDirection.z += 1;
    if (keys.left) moveDirection.x -= 1;
    if (keys.right) moveDirection.x += 1;
    if (keys.up) moveVertical.y += 1;
    if (keys.down) moveVertical.y -= 1;

    const player = controls.getObject();

    if (moveDirection.lengthSq() > 0) {
      moveDirection.normalize();

      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();

      right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

      const move = new THREE.Vector3();
      move.addScaledVector(forward, -moveDirection.z); // W/S
      move.addScaledVector(right, moveDirection.x);    // A/D

      move.normalize().multiplyScalar(speed * delta);
      player.position.add(move);
    }

    if (moveVertical.lengthSq() > 0) {
      moveVertical.normalize().multiplyScalar(speed * delta);
      player.position.add(moveVertical);
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
