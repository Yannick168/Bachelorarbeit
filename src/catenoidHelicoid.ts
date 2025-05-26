import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { resizeToMaxViewportPerspective } from './utils/resizeViewport';

const scene = new THREE.Scene();
scene.add(new THREE.AxesHelper(2)); // ⬅️ XYZ-Achsen anzeigen

const camera = new THREE.PerspectiveCamera(90, 2, 0.1, 100);
camera.position.set(5, 2, 4); // ⬅️ Catenoid-ähnliche Kameraposition
camera.up.set(0, 0, 1);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(0xffffff); // ⬅️ Weißer Hintergrund
document.body.appendChild(renderer.domElement);
resizeToMaxViewportPerspective(renderer, camera, renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 2, 3);
scene.add(light);
scene.add(new THREE.AmbientLight(0x999999));

const uSegments = 100;
const vSegments = 100;

let geometry: THREE.BufferGeometry;
let mesh: THREE.Mesh;
let wireframe: THREE.LineSegments;

const alphaSlider = document.getElementById('alphaRange') as HTMLInputElement;
let alpha = parseFloat(alphaSlider.value);

alphaSlider.addEventListener('input', () => {
  alpha = parseFloat(alphaSlider.value);
  updateGeometry();
});

function updateGeometry() {
  if (geometry) geometry.dispose();
  if (mesh) scene.remove(mesh);
  if (wireframe) scene.remove(wireframe);

  geometry = new THREE.BufferGeometry();
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  for (let j = 0; j <= vSegments; j++) {
    const v = -2 + 4 * (j / vSegments);
    for (let i = 0; i <= uSegments; i++) {
      const u = 0 + 2 * Math.PI * (i / uSegments);

      const cosα = Math.cos(alpha);
      const sinα = Math.sin(alpha);

      // Parametrisierung
      
      const x = Math.cos(u) * Math.cosh(v) * cosα + v * Math.cos(u) * sinα;
      const y = Math.sin(u) * Math.cosh(v) * cosα + v * Math.sin(u) * sinα;
      const z = v * cosα + 1 * u * sinα;
      

      /*
      const x = Math.cosh(u) * Math.cos(v) * cosα + Math.sinh(u) * Math.sin(u) * sinα;
      const y = Math.cosh(u) * Math.sin(v) * cosα - Math.sinh(u) * Math.cos(v) * sinα;
      const z = u * cosα + v * sinα;
      */

      positions.push(x, y, z);

      const r = (v + 2) / 4;
      colors.push(r, 1.0 - r, 0.5);
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
  geometry.center();

  const material = new THREE.MeshPhongMaterial({ vertexColors: true, side: THREE.DoubleSide });
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  wireframe = new THREE.LineSegments(
    new THREE.WireframeGeometry(geometry),
    new THREE.LineBasicMaterial({ color: 0x000000 })
  );
  scene.add(wireframe);
}

updateGeometry();

window.addEventListener('resize', () => {
  resizeToMaxViewportPerspective(renderer, camera, renderer.domElement);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

window.addEventListener('message', (event) => {
  if (event.data?.type === 'alpha' && typeof event.data.alpha === 'number') {
    alpha = event.data.alpha;
    updateGeometry();
  }
});