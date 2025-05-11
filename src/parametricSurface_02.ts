import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(8, 2, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// === Parametrische Fläche ===
const uSegments = 100;
const vSegments = 100;
const geometry = new THREE.BufferGeometry();
const positions: number[] = [];
const colors: number[] = [];
const indices: number[] = [];

for (let j = 0; j <= vSegments; j++) {
  const v = -2 + 4 * (j / vSegments);
  for (let i = 0; i <= uSegments; i++) {
    const u = 0 + 2 * Math.PI * (i / uSegments);
    const x = Math.cos(u) * Math.cosh(v);
    const y = Math.sin(u) * Math.cosh(v);
    const z = v;

    positions.push(x, y, z);
    const r = (v + 2) / 4;
    const g = 0.2;
    const b = 1.0 - r;
    colors.push(r, g, b);
  }
}

for (let j = 0; j < vSegments; j++) {
  for (let i = 0; i < uSegments; i++) {
    const a = j * (uSegments + 1) + i;
    const b = a + 1;
    const c = a + (uSegments + 1);
    const d = c + 1;
    indices.push(a, b, d, a, d, c);
  }
}

geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
geometry.setIndex(indices);
geometry.computeVertexNormals();

const material = new THREE.MeshPhongMaterial({
  vertexColors: true,
  side: THREE.DoubleSide
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// === Achsen ===
const axes = new THREE.AxesHelper(2);
scene.add(axes);

// === Licht ===
scene.add(new THREE.AmbientLight(0x888888));
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

// === Animation ===
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
