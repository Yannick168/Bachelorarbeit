import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { resizeToMaxViewportPerspective } from './utils/resizeViewport';

// Szene und Kamera
const scene = new THREE.Scene();
scene.add(new THREE.AxesHelper(2));

const camera = new THREE.PerspectiveCamera(45, 2, 0.1, 100);
camera.position.set(8, 2, 5);
camera.lookAt(0, 0, 0);
camera.up.set(0, 0, 1);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('canvas') as HTMLCanvasElement,
  antialias: true
});
renderer.setClearColor(0xffffff);
resizeToMaxViewportPerspective(renderer, camera, renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Licht
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 2, 3);
scene.add(light);
scene.add(new THREE.AmbientLight(0x999999));

// Parameter
const uSegments = 100;
const vSegments = 100;
let alpha = 0.0;

// Buffer-Große Variablen
let geometry: THREE.BufferGeometry;
let mesh: THREE.Mesh;
let wireframe: THREE.LineSegments;
let positionAttr: THREE.BufferAttribute;
let colorAttr: THREE.BufferAttribute;

// Initiale Geometrie einmal erzeugen
function createInitialGeometry() {
  geometry = new THREE.BufferGeometry();

  const vertexCount = (uSegments + 1) * (vSegments + 1);
  const positions = new Float32Array(vertexCount * 3);
  const colors = new Float32Array(vertexCount * 3);
  const indices: number[] = [];

  // Indices für Triangles
  for (let j = 0; j < vSegments; j++) {
    for (let i = 0; i < uSegments; i++) {
      const a = j * (uSegments + 1) + i;
      const b = a + 1;
      const c = a + (uSegments + 1);
      const d = c + 1;
      indices.push(a, b, d, a, d, c);
    }
  }

  positionAttr = new THREE.BufferAttribute(positions, 3);
  colorAttr = new THREE.BufferAttribute(colors, 3);

  geometry.setAttribute('position', positionAttr);
  geometry.setAttribute('color', colorAttr);
  geometry.setIndex(indices);

  const material = new THREE.MeshPhongMaterial({
    vertexColors: true,
    side: THREE.DoubleSide
  });

  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  wireframe = new THREE.LineSegments(
    new THREE.WireframeGeometry(geometry),
    new THREE.LineBasicMaterial({ color: 0x000000 })
  );
  scene.add(wireframe);

  updateGeometry(); // Initial befüllen
}

// Nur Buffer aktualisieren
function updateGeometry() {
  const positions = positionAttr.array as Float32Array;
  const colors = colorAttr.array as Float32Array;

  for (let j = 0; j <= vSegments; j++) {
    const v = -2 + 4 * (j / vSegments);
    for (let i = 0; i <= uSegments; i++) {
      const u = 2 * Math.PI * (i / uSegments);
      const index = (j * (uSegments + 1) + i) * 3;

      const cosα = Math.cos(alpha);
      const sinα = Math.sin(alpha);

      //const x = Math.cos(u) * Math.cosh(v) * cosα + v * Math.cos(u) * sinα;
      //const y = Math.sin(u) * Math.cosh(v) * cosα + v * Math.sin(u) * sinα;
      //const z = v * cosα + 0.5 * u * sinα;

      //const x = Math.cos(v) * Math.cosh(u) * cosα + Math.sin(v) * Math.sinh(u) * sinα;
      //const y = Math.sin(v) * Math.cosh(u) * cosα - Math.cos(v) * Math.sinh(u) * sinα;
      //const z = u * cosα + v * sinα;

      const x = Math.cos(u) * Math.cosh(v) * cosα + Math.sin(u) * Math.sinh(v) * sinα;
      const y = Math.sin(u) * Math.cosh(v) * cosα - Math.cos(u) * Math.sinh(v) * sinα;
      const z = v * cosα + u * sinα;

      positions[index + 0] = x;
      positions[index + 1] = y;
      positions[index + 2] = z;

      const r = (v + 2) / 4;
      colors[index + 0] = r;
      colors[index + 1] = 1.0 - r;
      colors[index + 2] = 0.5;
    }
  }

  positionAttr.needsUpdate = true;
  colorAttr.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.center();
}

//  externe Anbindung für Jimdo-Slider
(window as any).updateCatenoidHelicoid = (newAlpha: number) => {
  alpha = newAlpha;
  updateGeometry();
};

// Init
createInitialGeometry();

// Resize
window.addEventListener('resize', () => {
  resizeToMaxViewportPerspective(renderer, camera, renderer.domElement);
});

// Render-Loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
