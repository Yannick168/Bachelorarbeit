import * as THREE from 'three';
// @ts-ignore
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// === Kamera ===
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.6, 5);

// === Renderer ===
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// === Controls ===
const controls = new PointerLockControls(camera, document.body);
scene.add(controls.getObject());

const overlay = document.getElementById('overlay')!;
controls.addEventListener('lock', () => overlay.style.display = 'none');
controls.addEventListener('unlock', () => overlay.style.display = 'flex');
document.body.addEventListener('click', () => controls.lock());

// === Licht ===
scene.add(new THREE.AmbientLight(0x888888));
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

// === Kegel ===
const cone = new THREE.Mesh(
  new THREE.ConeGeometry(1, 2, 32).center(),
  new THREE.MeshPhongMaterial({ color: 0xff5522 })
);
scene.add(cone);

// === Boden ===
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshBasicMaterial({ color: 0xf0f0f0, side: THREE.DoubleSide })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// === Achsenlinien ===
const axisVertices = new Float32Array([
  0, 0, 0, 5, 0, 0, // x
  0, 0, 0, 0, 5, 0, // y
  0, 0, 0, 0, 0, 5  // z
]);
const axisColors = new Float32Array([
  1, 0, 0, 1, 0, 0,
  0, 1, 0, 0, 1, 0,
  0, 0, 1, 0, 0, 1
]);
const axisGeom = new THREE.BufferGeometry();
axisGeom.setAttribute('position', new THREE.BufferAttribute(axisVertices, 3));
axisGeom.setAttribute('color', new THREE.BufferAttribute(axisColors, 3));
const axes = new THREE.LineSegments(axisGeom, new THREE.LineBasicMaterial({ vertexColors: true }));
scene.add(axes);

// === Tastatursteuerung ===
const keys = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  up: false,
  down: false
};
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

// === Bewegung ===
const speed = 5;
let prevTime = performance.now();
const forward = new THREE.Vector3();
const right = new THREE.Vector3();
const movement = new THREE.Vector3();
const vertical = new THREE.Vector3();

function animate() {
  requestAnimationFrame(animate);
  const time = performance.now();
  const delta = (time - prevTime) / 1000;
  prevTime = time;

  if (controls.isLocked) {
    movement.set(0, 0, 0);
    vertical.set(0, 0, 0);

    if (keys.forward) movement.z -= 1;
    if (keys.backward) movement.z += 1;
    if (keys.left) movement.x -= 1;
    if (keys.right) movement.x += 1;
    if (keys.up) vertical.y += 1;
    if (keys.down) vertical.y -= 1;

    const player = controls.getObject();

    if (movement.lengthSq() > 0) {
      movement.normalize();

      // Blickrichtung inkl. Pitch verwenden
      camera.getWorldDirection(forward);
      forward.normalize();

      // Rechts-Vektor (quer zur Blickrichtung)
      right.crossVectors(forward, camera.up).normalize();

      const move = new THREE.Vector3();
      move.addScaledVector(forward, movement.z);
      move.addScaledVector(right, movement.x);
      move.multiplyScalar(speed * delta);
      player.position.add(move);
    }

    if (vertical.lengthSq() > 0) {
      vertical.normalize().multiplyScalar(speed * delta);
      player.position.add(vertical);
    }
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
