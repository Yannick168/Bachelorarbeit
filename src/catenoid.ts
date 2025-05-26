import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { resizeToMaxViewportPerspective } from './utils/resizeViewport'; // relativ zur Datei



const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// === Kamera ===
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.set(9, 9, 9);
camera.up.set(0, 0, 1);
camera.lookAt(0, 0, 0);

// === Renderer ===
const renderer = new THREE.WebGLRenderer({ antialias: true });
const container = document.getElementById('webgl-container')!;
const canvas = renderer.domElement;
container.appendChild(canvas);


resizeToMaxViewportPerspective(renderer, camera, canvas);

window.addEventListener('resize', () => {
  resizeToMaxViewportPerspective(renderer, camera, canvas);
});


// === OrbitControls ===
const controls = new OrbitControls(camera, canvas);
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
    const g = 1.0 - r;
    const b = 0.1;
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
geometry.center();

// === Zwei Materialien: Vorderseite bunt, Rückseite grau ===
const frontMaterial = new THREE.MeshPhongMaterial({
  vertexColors: true,
  side: THREE.FrontSide
});
const backMaterial = new THREE.MeshPhongMaterial({
  color: 0x888888,
  side: THREE.BackSide
});

const mesh = new THREE.Mesh(geometry, [frontMaterial, backMaterial]);
geometry.clearGroups();
geometry.addGroup(0, indices.length, 0); // Vorderseite
geometry.addGroup(0, indices.length, 1); // Rückseite
scene.add(mesh);

// === Wireframe
const wireframe = new THREE.LineSegments(
  new THREE.WireframeGeometry(geometry),
  new THREE.LineBasicMaterial({ color: 0x000000 })
);
scene.add(wireframe);

// === Licht
scene.add(new THREE.AxesHelper(2));
scene.add(new THREE.AmbientLight(0xffffff));
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(3, 6, 2);
light.lookAt(0, 0, 0);
scene.add(light);

// === Render-Loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
