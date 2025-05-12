import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.6, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// === Kegel ===
const coneGeometry = new THREE.ConeGeometry(1, 2, 32);
coneGeometry.center();
const coneMaterial = new THREE.MeshPhongMaterial({ color: 0xff5522 });
const cone = new THREE.Mesh(coneGeometry, coneMaterial);
scene.add(cone);

// === Eigene dicke Achsenlinien ===
const axisLength = 5;
const axisVertices = new Float32Array([
  0, 0, 0,  axisLength, 0, 0,  // X-Achse rot
  0, 0, 0,  0, axisLength, 0,  // Y-Achse grün
  0, 0, 0,  0, 0, axisLength   // Z-Achse blau
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

// === Licht ===
scene.add(new THREE.AmbientLight(0x888888));
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

// === WASD Steuerung ===
const keys = { forward: false, backward: false, left: false, right: false };
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const speed = 5.0;
let prevTime = performance.now();

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

// === Resize ===
window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
});

// === Animate ===
function animate() {
  requestAnimationFrame(animate);
  const time = performance.now();
  const delta = (time - prevTime) / 1000;

  direction.set(0, 0, 0);
  if (keys.forward) direction.z -= 1;
  if (keys.backward) direction.z += 1;
  if (keys.left) direction.x -= 1;
  if (keys.right) direction.x += 1;

  direction.normalize();
  direction.applyEuler(camera.rotation);
  velocity.copy(direction).multiplyScalar(speed * delta);
  camera.position.add(velocity);

  renderer.render(scene, camera);
  prevTime = time;
}
animate();
