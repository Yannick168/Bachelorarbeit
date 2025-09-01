import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import defaultFeUrl from './catenoid_finished.fe?url';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(2, 2, 3);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff); // Hintergrund Weiß
// >>> Helligkeit / Farbraum / Tonemapping
//renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.6; // deutlich heller
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// ==== Licht ====
// Headlight (hängt an der Kamera)
const headlight = new THREE.PointLight(0xffffff, 8.0, 0, 2);
// intensity=8.0, distance=0 (kein Abfall), decay=2 (irrelevant bei distance=0)
camera.add(headlight);
scene.add(camera);

// Weiches Umgebungslicht (Himmel/Boden)
const hemi = new THREE.HemisphereLight(0xffffff, 0x777777, 1.0); // intensiver als Ambient
scene.add(hemi);

// Optional zusätzlich leichtes Ambient (kannst du weglassen, wenn zu hell)
scene.add(new THREE.AmbientLight(0xffffff, 0.2));

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ----------------------------------
// FE-PARSER
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

function createMeshFromFEData(data: { vertices: number[][], faces: number[][] }): THREE.Group {
  const geometry = new THREE.BufferGeometry();
  const positions: number[] = [];

  for (const face of data.faces) {
    if (!Array.isArray(face) || face.length !== 3) continue;
    for (const i of face) {
      const v = data.vertices[i];
      if (!v) { console.warn(`Fehlender Vertex für Index ${i}`); continue; }
      positions.push(v[0], v[1], v[2]);
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();

  // Vorderseiten GRÜN
  const frontMaterial = new THREE.MeshStandardMaterial({
    color: 0x45f542,
    side: THREE.FrontSide,
    metalness: 0.0,
    roughness: 0.35,
  });

  // Rückseiten ROT
  const backMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    side: THREE.BackSide,
    metalness: 0.0,
    roughness: 0.35,
  });

  const frontMesh = new THREE.Mesh(geometry, frontMaterial);
  const backMesh  = new THREE.Mesh(geometry, backMaterial);

  // Schwarzes Wireframe-Overlay
  const wireframe = new THREE.LineSegments(
    new THREE.WireframeGeometry(geometry),
    new THREE.LineBasicMaterial({ color: 0x000000 })
  );

  const group = new THREE.Group();
  group.add(frontMesh);
  group.add(backMesh);
  group.add(wireframe);
  return group;
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

  const feUrl = feParam ? (import.meta.env.BASE_URL + feParam) : defaultFeUrl;

  const res = await fetch(feUrl);
  if (!res.ok) throw new Error(`Konnte ${feUrl} nicht laden (${res.status})`);
  const content = await res.text();

  const data = parseFEFile(content);
  const mesh = createMeshFromFEData(data);

  // Szene leeren und Grundsetup neu hinzufügen
  scene.clear();
  scene.add(camera);         // Kamera (mit Headlight)
  scene.add(hemi);           // HemisphereLight wieder rein
  scene.add(new THREE.AmbientLight(0xffffff, 0.2)); // leichtes Ambient

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
