 import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

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
      console.log(line)
      if (line === "bodies  /* facets */"){
        mode = null;
        continue;
      }
      const cleanedLine = line.replace(/\/\*.*?\*\//g, '').replace(/^face\s+/i, '').trim();
      const parts = cleanedLine.split(/\s+/);
      console.log(cleanedLine)
      console.log(parts)
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
  console.log(vertices, edges, faces);
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

const fileInput = document.getElementById('fileInput') as HTMLInputElement;
fileInput.addEventListener('change', (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  const reader = new FileReader();
  reader.onload = function (event: ProgressEvent<FileReader>) {
    const content = event.target?.result as string;
    const data = parseFEFile(content);
    const mesh = createMeshFromFEData(data);

    scene.clear();
    scene.add(light1);
    scene.add(new THREE.AmbientLight(0x404040));

    scene.add(mesh);
    controls.reset();
  };
  reader.readAsText(file);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
