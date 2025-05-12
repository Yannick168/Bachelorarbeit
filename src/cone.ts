// Three.js Fly Camera mit Quaternion-Rotation und Bewegung in Blickrichtung
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
document.body.appendChild(renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);

// Kamera Startposition
camera.position.set(0, 0, 5);

// Variablen für Steuerung
let isMouseDown = false;
let lastMouse = new THREE.Vector2();
const euler = new THREE.Euler(0, 0, 0, 'YXZ');

const keys = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  up: false,
  down: false
};

// Geschwindigkeit
const speed = 1.0;

// === Event Listener ===
window.addEventListener('mousedown', e => {
  isMouseDown = true;
  lastMouse.set(e.clientX, e.clientY);
});

window.addEventListener('mouseup', () => {
  isMouseDown = false;
});

window.addEventListener('mousemove', e => {
  if (!isMouseDown) return;
  const dx = e.clientX - lastMouse.x;
  const dy = e.clientY - lastMouse.y;
  lastMouse.set(e.clientX, e.clientY);

  const sensitivity = 0.002;
  euler.setFromQuaternion(camera.quaternion);
  euler.y -= dx * sensitivity;
  euler.x -= dy * sensitivity;
  euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));
  camera.quaternion.setFromEuler(euler);
});

window.addEventListener('keydown', e => {
  if (e.code === 'KeyW') keys.forward = true;
  if (e.code === 'KeyS') keys.backward = true;
  if (e.code === 'KeyA') keys.left = true;
  if (e.code === 'KeyD') keys.right = true;
  if (e.code === 'Space') keys.up = true;
  if (e.code === 'ShiftLeft') keys.down = true;
});

window.addEventListener('keyup', e => {
  if (e.code === 'KeyW') keys.forward = false;
  if (e.code === 'KeyS') keys.backward = false;
  if (e.code === 'KeyA') keys.left = false;
  if (e.code === 'KeyD') keys.right = false;
  if (e.code === 'Space') keys.up = false;
  if (e.code === 'ShiftLeft') keys.down = false;
});

// === Szene-Objekte ===
const box = new THREE.Mesh(
  new THREE.BoxGeometry(),
  new THREE.MeshNormalMaterial()
);
scene.add(box);

const grid = new THREE.GridHelper(100, 100);
scene.add(grid);

// === Animation ===
let prevTime = performance.now();

function animate() {
  requestAnimationFrame(animate);

  const time = performance.now();
  const delta = (time - prevTime) / 1000;
  prevTime = time;

  const direction = new THREE.Vector3();
  const right = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);

  camera.getWorldDirection(direction);
  direction.normalize();
  right.crossVectors(direction, up).normalize();

  const velocity = new THREE.Vector3();

  if (keys.forward) velocity.sub(direction);
  if (keys.backward) velocity.add(direction);
  if (keys.left) velocity.sub(right);
  if (keys.right) velocity.add(right);
  if (keys.up) velocity.y += 1;
  if (keys.down) velocity.y -= 1;

  if (velocity.lengthSq() > 0) {
    velocity.normalize().multiplyScalar(speed * delta);
    camera.position.add(velocity);
  }

  renderer.render(scene, camera);
}
animate();

// === Resize ===
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
