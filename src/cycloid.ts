
import * as THREE from 'three';

// Szene & Kamera
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-10, 10, 5, -5, 0.1, 100);
camera.position.z = 10;

// Renderer
const canvas = document.getElementById('webgl') as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

// Cycloid-Gleichung
const r = 1;
function cycloid(t: number): THREE.Vector3 {
  return new THREE.Vector3(r * (t - Math.sin(t)), r * (1 - Math.cos(t)), 0);
}

// Kreisobjekt
const circleGeometry = new THREE.CircleGeometry(0.1, 32);
const circleMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const circle = new THREE.Mesh(circleGeometry, circleMaterial);
scene.add(circle);

// Cycloid-Linie zeichnen
const pathPoints: THREE.Vector3[] = [];
for (let t = 0; t <= 20; t += 0.1) {
  pathPoints.push(cycloid(t));
}
const pathGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
const pathMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
const path = new THREE.Line(pathGeometry, pathMaterial);
scene.add(path);

// Slider
const slider = document.getElementById('slider') as HTMLInputElement;
slider.addEventListener('input', () => {
  const t = parseFloat(slider.value);
  const pos = cycloid(t);
  circle.position.copy(pos);
});

// Render-Loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
