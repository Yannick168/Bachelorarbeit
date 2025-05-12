import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(4, 2, 6);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Kegel-Geometrie
const radius = 1;         // Radius der Basis
const height = 2;         // Höhe des Kegels
const radialSegments = 32;

const geometry = new THREE.ConeGeometry(radius, height, radialSegments);
geometry.center(); // zentriert den Kegel auf (0, 0, 0)

const material = new THREE.MeshPhongMaterial({ color: 0xff5522, flatShading: true });
const cone = new THREE.Mesh(geometry, material);
scene.add(cone);

// Wireframe (optional)
const wire = new THREE.LineSegments(
  new THREE.WireframeGeometry(geometry),
  new THREE.LineBasicMaterial({ color: 0x000000 })
);
scene.add(wire);

// Licht und Achsen
scene.add(new THREE.AxesHelper(2));
scene.add(new THREE.AmbientLight(0x888888));
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

// Resize
window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
});

// Render-Loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
