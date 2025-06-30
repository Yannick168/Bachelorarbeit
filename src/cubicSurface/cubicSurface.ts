import * as THREE from "three";

declare const math: any; // weil wir math.js über CDN laden

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let mesh: THREE.Points | undefined;

init();
renderIsosurface();

document.getElementById("formulaInput")!.addEventListener("change", () => {
  renderIsosurface();
});

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(5, 5, 5);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setClearColor(0xffffff);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function renderIsosurface() {
  if (mesh) scene.remove(mesh);

  const formula = (document.getElementById("formulaInput") as HTMLInputElement).value;
  const expr = math.compile(formula);

  const size = 32;
  const positions: number[] = [];

  const grid: number[][][] = [];
  for (let x = 0; x < size; x++) {
    grid[x] = [];
    for (let y = 0; y < size; y++) {
      grid[x][y] = [];
      for (let z = 0; z < size; z++) {
        const xp = (x / size - 0.5) * 4;
        const yp = (y / size - 0.5) * 4;
        const zp = (z / size - 0.5) * 4;
        grid[x][y][z] = expr.evaluate({ x: xp, y: yp, z: zp });
      }
    }
  }

  // Vorzeichenwechsel als Punkte visualisieren
  for (let x = 0; x < size - 1; x++) {
    for (let y = 0; y < size - 1; y++) {
      for (let z = 0; z < size - 1; z++) {
        const v0 = grid[x][y][z];
        const v1 = grid[x + 1][y][z];
        const v2 = grid[x][y + 1][z];
        const v3 = grid[x][y][z + 1];

        const xp = (x / size - 0.5) * 4;
        const yp = (y / size - 0.5) * 4;
        const zp = (z / size - 0.5) * 4;

        if (v0 * v1 < 0 || v0 * v2 < 0 || v0 * v3 < 0) {
          positions.push(xp, yp, zp);
        }
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0xff0000, size: 0.05 });
  mesh = new THREE.Points(geometry, material);
  scene.add(mesh);

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
