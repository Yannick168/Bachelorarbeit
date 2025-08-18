import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import defaultFeUrl from './test.fe?url';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(2, 2, 3);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff); // Weiß
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const light1 = new THREE.DirectionalLight(0xffffff, 0.8);
light1.position.set(3, 3, 3);
scene.add(light1);
scene.add(new THREE.AmbientLight(0x404040));

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ----------------------------------
// FE-PARSER (deine Logik übernommen)
// ----------------------------------
function parseFEFile(content: string): { vertices: number[][], faces: number[][] } {
  const lines = content.split('\n');

  const vertices: number[][] = [];
  const edges: [number, number][] = [];
  const faces: number[][] = [];
  let mode: 'vertices' | 'edges' | 'faces' | null = null;

  for (let line of lines) {
    line = line.trim();

    if (line === '' || line.startsWith('//')){
      mode = null;
      continue;
    }

    if (/^vertices\b/i.test(line)) {
      mode = 'vertices';
      continue;
    }
    if (/^edges\b/i.test(line)) {
      mode = 'edges';
      continue;
    }
    if (/^(faces|facets)\b/i.test(line)) {
      mode = 'faces';
      continue;
    }

    if (mode === 'vertices') {
      const commentMatch = line.match(/\(\s*([\-\d.eE+]+)\s+([\-\d.eE+]+)\s+([\-\d.eE+]+)\s*\)/);
      if (commentMatch) {
        const x = parseFloat(commentMatch[1]);
        const y = parseFloat(commentMatch[2]);
        const z = parseFloat(commentMatch[3]);
        if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
          vertices.push([x, y, z]);
          continue;
        }
      }
      const parts = line.split(/\s+/);
      if (parts.length >= 4) {
        const x = parseFloat(parts[1]);
        const y = parseFloat(parts[2]);
        const z = parseFloat(parts[3]);
        if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
          vertices.push([x, y, z]);
        }
      }
    }

    if (mode === 'edges') {
      const parts = line.split(/\s+/);
      if (parts.length >= 3) {
        const v1 = parseInt(parts[1]) - 1;
        const v2 = parseInt(parts[2]) - 1;
        if (!isNaN(v1) && !isNaN(v2)) {
          edges.push([v1, v2]);
        }
      }
    }

    if (mode === 'faces') {
      if (line === "bodies  /* facets */"){
        mode = null;
        continue;
      }
      const cleanedLine = line.replace(/\/\*.*?\*\//g, '').replace(/^face\s+/i, '').trim();
      const parts = cleanedLine.split(/\s+/);
      const faceIndices: number[]  = [parseInt(parts[1]), parseInt(parts[2]), parseInt(parts[3])];
      let face: number[] = [];

      for (let faceIndex of faceIndices) {
        let edgeIndex = Math.abs(faceIndex) - 1;
        if (faceIndex < 0){
          face.push(edges[edgeIndex][1]);
        }
        else {
          face.push(edges[edgeIndex][0]);
        }
      }
      faces.push(face);
    }
  }
  return { vertices, faces };
}

function createMeshFromFEData(data: { vertices: number[][], faces: number[][] }): THREE.Mesh {
  const geometry = new THREE.BufferGeometry();
  const positions: number[] = [];

  for (const face of data.faces) {
    if (!Array.isArray(face) || face.length !== 3) continue;

    for (const i of face) {
      const vertex = data.vertices[i];
      if (!vertex) {
        console.warn(`Fehlender Vertex für Index ${i}`);
        continue;
      }
      const [x, y, z] = vertex;
      positions.push(x, y, z);
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    color: 0x6699cc,
    side: THREE.DoubleSide,
    flatShading: false,
  });

  return new THREE.Mesh(geometry, material);
}

// Framing (damit das Modell im Bild ist)
function frameObject(obj: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const radius = Math.max(size.x, size.y, size.z) * 0.6 + 1e-6;
  const distance = radius / Math.tan((camera.fov * Math.PI) / 360);

  camera.position.copy(center.clone().add(new THREE.Vector3(distance, distance, distance)));
  camera.near = Math.max(0.01, distance * 0.01);
  camera.far = Math.max(1000, distance * 10);
  camera.updateProjectionMatrix();

  controls.target.copy(center);
  controls.update();
}

// ----------------------------
// Auto-Load beim Start
// ----------------------------
async function loadFEAtStart() {
  const params = new URLSearchParams(location.search);
  const feParam = params.get('fe');

  // Wenn ?fe= gesetzt ist, erwarten wir die Datei unter BASE_URL (-> public/ oder statisch kopiert).
  // Sonst nehmen wir die gebundelte Default-Datei aus src.
  const feUrl = feParam ? (import.meta.env.BASE_URL + feParam) : defaultFeUrl;

  const res = await fetch(feUrl);
  if (!res.ok) throw new Error(`Konnte ${feUrl} nicht laden (${res.status})`);
  const content = await res.text();

  const data = parseFEFile(content);
  const mesh = createMeshFromFEData(data);

  // Szene leeren und Lichter neu hinzufügen
  scene.clear();
  scene.add(light1);
  scene.add(new THREE.AmbientLight(0x404040));

  scene.add(mesh);
  frameObject(mesh);
}

// gleich starten
loadFEAtStart().catch(err => console.error(err));

// Render-Loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
