import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import defaultFeUrl from './catenoid_finished.fe?url';

// ====================== Grundsetup ======================
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(2, 2, 3);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.6;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Licht: Headlight an Kamera + weiches Umgebungslicht
const headlight = new THREE.PointLight(0xffffff, 8.0, 0, 2);
camera.add(headlight);
scene.add(camera);
const hemi = new THREE.HemisphereLight(0xffffff, 0x777777, 1.0);
scene.add(hemi);
scene.add(new THREE.AmbientLight(0xffffff, 0.2));

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ====================== Parser (ID-Mapping, Edge-Loop, Triangulation) ======================
type ParsedFace = {
  faceId: number;
  edgeIds: number[];                 // alle signierten Edge-IDs der Facette
  tris: [number, number, number][];  // triangulierte Dreiecke (0-basiert)
};

const SEC_MARK = /^(vertices|edges|faces|facets|bodies)\b/i;
const isInt = (s: string) => /^[+-]?\d+$/.test(s);
const isSignedInt = (s: string) => /^-?\d+$/.test(s);
const isFloat = (s: string) => /^[+-]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][+-]?\d+)?$/.test(s);

// Kommentare (/* ... */) entfernen – NUR für Stellen, wo wir sie nicht brauchen.
// Beim Vertex-Parsing greifen wir vorher auf den Original-String zu!
const stripComment = (s: string) => s.replace(/\/\*.*?\*\//g, '').trim();

// Koordinaten aus Kommentar extrahieren: /* ( x y z ) */
const COORDS_IN_COMMENT =
  /\(\s*([+-]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][+-]?\d+)?)\s+([+-]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][+-]?\d+)?)\s+([+-]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][+-]?\d+)?)\s*\)/;

// Boundary-Nummer in einer Zeile finden (z.B. "boundary 1")
const BOUNDARY_NUM = /boundary\s+(\d+)/i;

function parseFEFile(content: string): {
  vertices: number[][];
  faces: ParsedFace[];
  vertexIdToIndex: Record<number, number>;
} {
  const rawLines = content.split(/\r?\n/);
  const lines = rawLines.map(l => l.trim());

  // ---- Globale Parameter (für Boundary-Fallback) ----
  let RMAX = 1;
  let ZMAX = 0.55;

  for (const l of lines) {
    const mR = l.match(/^\s*PARAMETER\s+RMAX\s*=\s*([^\s]+)/i);
    if (mR && isFloat(mR[1])) RMAX = parseFloat(mR[1]);
    const mZ = l.match(/^\s*PARAMETER\s+ZMAX\s*=\s*([^\s]+)/i);
    if (mZ && isFloat(mZ[1])) ZMAX = parseFloat(mZ[1]);
  }

  // ---- Sektionen indexieren ----
  const indices: Record<string, number[]> = { vertices: [], edges: [], faces: [], facets: [] };
  for (let i = 0; i < lines.length; i++) {
    if (SEC_MARK.test(lines[i])) {
      const key = lines[i].toLowerCase().split(/\s+/)[0];
      if (key in indices) indices[key].push(i);
    }
  }
  const sliceBlock = (startIdx: number) => {
    let end = lines.length;
    for (let j = startIdx + 1; j < lines.length; j++) {
      if (SEC_MARK.test(lines[j])) { end = j; break; }
    }
    return rawLines.slice(startIdx + 1, end); // ACHTUNG: rohe Zeilen für Vertex-Parsing
  };

  // ---- Vertices: Original-IDs -> kompakte Indizes ----
  const vertices: number[][] = [];
  const vertexIdToIndex: Record<number, number> = {};
  const addVertex = (origId: number, x: number, y: number, z: number) => {
    if (vertexIdToIndex[origId] !== undefined) return;
    const idx = vertices.length;
    vertexIdToIndex[origId] = idx;
    vertices.push([x, y, z]);
  };

  if (indices.vertices.length) {
    const vblock = sliceBlock(indices.vertices[0]);
    for (const raw of vblock) {
      if (!raw.trim()) continue;

      // 1) Versuche "<id> <x> <y> <z> ..." aus der kommentarlosen Version
      const noCom = stripComment(raw);
      if (noCom) {
        const p = noCom.split(/\s+/);
        if (p.length >= 4 && isInt(p[0]) && isFloat(p[1]) && isFloat(p[2]) && isFloat(p[3])) {
          addVertex(parseInt(p[0], 10), parseFloat(p[1]), parseFloat(p[2]), parseFloat(p[3]));
          continue;
        }
      }

      // 2) Koordinaten aus Kommentar: /* ( x y z ) */
      const idMatch = raw.match(/^\s*(\d+)\b/);
      const cm = raw.match(COORDS_IN_COMMENT);
      if (idMatch && cm) {
        const id = parseInt(idMatch[1], 10);
        const x = parseFloat(cm[1]), y = parseFloat(cm[2]), z = parseFloat(cm[3]);
        addVertex(id, x, y, z);
        continue;
      }

      // 3) Boundary-Fallback (wenn Kommentar fehlt)
      const noCom2 = stripComment(raw);
      if (noCom2) {
        const p = noCom2.split(/\s+/);
        if (p.length >= 2 && isInt(p[0]) && isFloat(p[1])) {
          const id = parseInt(p[0], 10);
          const ang = parseFloat(p[1]);
          const bMatch = raw.match(BOUNDARY_NUM);
          if (bMatch) {
            const bnum = parseInt(bMatch[1], 10);
            const x = RMAX * Math.cos(ang);
            const y = RMAX * Math.sin(ang);
            const z = (bnum === 1) ? ZMAX : (bnum === 2 ? -ZMAX : 0);
            addVertex(id, x, y, z);
            continue;
          }
        }
      }
    }
  } else {
    // Heuristik (für Dumps ohne 'vertices'-Header)
    for (const raw of rawLines) {
      if (!raw.trim()) continue;
      const noCom = stripComment(raw);
      const p = noCom.split(/\s+/);
      if (p.length >= 4 && isInt(p[0]) && isFloat(p[1]) && isFloat(p[2]) && isFloat(p[3])) {
        addVertex(parseInt(p[0], 10), parseFloat(p[1]), parseFloat(p[2]), parseFloat(p[3]));
        continue;
      }
      const idMatch = raw.match(/^\s*(\d+)\b/);
      const cm = raw.match(COORDS_IN_COMMENT);
      if (idMatch && cm) {
        const id = parseInt(idMatch[1], 10);
        addVertex(id, parseFloat(cm[1]), parseFloat(cm[2]), parseFloat(cm[3]));
      }
    }
  }

  // ---- Edges: aus ALLEN 'edges'-Sektionen sammeln ----
  const edgesById: Record<number, [number, number]> = {};
  const parseEdgesBlock = (block: string[]) => {
    for (const raw of block) {
      const ln = stripComment(raw);
      if (!ln) continue;
      const p = ln.split(/\s+/);
      // "<edgeId> <v1Id> <v2Id> ..."
      if (p.length >= 3 && isInt(p[0]) && isInt(p[1]) && isInt(p[2])) {
        const eid = parseInt(p[0], 10);
        const v1Id = parseInt(p[1], 10);
        const v2Id = parseInt(p[2], 10);
        const v1 = vertexIdToIndex[v1Id];
        const v2 = vertexIdToIndex[v2Id];
        if (v1 === undefined || v2 === undefined) {
          continue;
        }
        edgesById[eid] = [v1, v2];
      }
    }
  };

  if (indices.edges.length) {
    for (const idx of indices.edges) {
      parseEdgesBlock(sliceBlock(idx));
    }
  } else {
    // Heuristik: Bereich vor faces/facets
    const facesIdx = indices.faces[0] ?? indices.facets[0] ?? lines.length;
    let start = 0;
    for (let i = facesIdx - 1; i >= 0; i--) { if (SEC_MARK.test(lines[i])) { start = i; break; } }
    const region = rawLines.slice(start, facesIdx);
    const edgeLines: string[] = [];
    for (const raw of region) {
      const ln = stripComment(raw);
      const p = ln.split(/\s+/);
      if (p.length >= 3 && isInt(p[0]) && isInt(p[1]) && isInt(p[2])) {
        if (p.length >= 4 && isInt(p[3])) continue; // Matrix-Zeilen ausschließen
        edgeLines.push(ln);
      }
    }
    parseEdgesBlock(edgeLines);
  }

  // ---- Faces: robust + „Catenoid-kompatibler“ Dreiecksmodus ----
  const faces: ParsedFace[] = [];
  const faceStarts = [...(indices.faces || []), ...(indices.facets || [])];

  function edgeKey(a: number, b: number) { return `${a}->${b}`; }

  for (const fs of faceStarts) {
    const fblock = sliceBlock(fs);
    for (const raw of fblock) {
      const ln = stripComment(raw);
      if (!ln) continue;
      const p = ln.split(/\s+/);
      // "<faceId> <e1> <e2> <e3> [<e4> ...]"   (e_i sind signierte Edge-IDs)
      if (p.length >= 4 && isInt(p[0]) && isSignedInt(p[1]) && isSignedInt(p[2]) && isSignedInt(p[3])) {
        const faceId = parseInt(p[0], 10);

        // ALLE signierten Edge-IDs einsammeln
        const signed: number[] = [];
        for (let k = 1; k < p.length; k++) {
          if (isSignedInt(p[k])) signed.push(parseInt(p[k], 10));
          else break; // ab hier 'area', 'original', ...
        }
        if (signed.length < 3) continue;

        // orientierte Kanten (unter Berücksichtigung des Vorzeichens)
        const oriented: Array<[number, number]> = [];
        const basePairs: Array<[number, number]> = [];
        let ok = true;
        for (const sid of signed) {
          const base = Math.abs(sid);
          const e = edgesById[base];
          if (!e) { ok = false; break; }
          basePairs.push([e[0], e[1]]);
          oriented.push(sid < 0 ? [e[1], e[0]] : [e[0], e[1]]);
        }
        if (!ok || !oriented.length) continue;

        // ====== 1) Schneller Weg für Dreiecke (wie in surfaceEvolverCatenoid.ts) ======
        // „Startvertex“ jeder orientierten Kante = erstes Element des Paares
        if (signed.length === 3) {
          const triCandidate: [number, number, number] = [
            oriented[0][0],
            oriented[1][0],
            oriented[2][0],
          ];
          if (new Set(triCandidate).size === 3) {
            faces.push({ faceId, edgeIds: signed, tris: [triCandidate] });
            continue; // fertig
          }
          // falls degeneriert, unten weiter mit dem robusten Modus
        }

        // ====== 2) Robuster Modus ======
        // Anzahl verschiedener Vertices bestimmen
        const vertsSet = new Set<number>();
        for (const [a, b] of oriented) { vertsSet.add(a); vertsSet.add(b); }
        const uniqueVerts = [...vertsSet];

        // a) genau 3 verschiedene Vertices -> bestmögliche Orientierung wählen
        if (uniqueVerts.length === 3) {
          // Undirected adjacency
          const adj = new Map<number, Set<number>>();
          for (const [a, b] of basePairs) {
            if (!adj.has(a)) adj.set(a, new Set());
            if (!adj.has(b)) adj.set(b, new Set());
            adj.get(a)!.add(b); adj.get(b)!.add(a);
          }
          const v0 = uniqueVerts[0];
          const ns = [...(adj.get(v0) ?? [])];
          if (ns.length !== 2) continue;
          const [n1, n2] = ns;

          // An den gerichteten Kanten ausrichten
          const oset = new Set(oriented.map(([a, b]) => edgeKey(a, b)));
          const cand1: [number, number, number] = [v0, n1, n2];
          const cand2: [number, number, number] = [v0, n2, n1];
          const score = (tri: [number, number, number]) =>
            (oset.has(edgeKey(tri[0], tri[1])) ? 1 : 0) +
            (oset.has(edgeKey(tri[1], tri[2])) ? 1 : 0) +
            (oset.has(edgeKey(tri[2], tri[0])) ? 1 : 0);

          faces.push({ faceId, edgeIds: signed, tris: [score(cand2) > score(cand1) ? cand2 : cand1] });
          continue;
        }

        // b) Polygon (>3 Kanten) -> Kettenbildung (Multi-Map) und Fan-Triangulation
        const nextMulti = new Map<number, number[]>();
        const inDeg = new Map<number, number>();
        const outDeg = new Map<number, number>();

        for (const [s, t] of oriented) {
          if (!nextMulti.has(s)) nextMulti.set(s, []);
          nextMulti.get(s)!.push(t);
          outDeg.set(s, (outDeg.get(s) ?? 0) + 1);
          inDeg.set(t, (inDeg.get(t) ?? 0) + 1);
          if (!inDeg.has(s)) inDeg.set(s, inDeg.get(s) ?? 0);
          if (!outDeg.has(t)) outDeg.set(t, outDeg.get(t) ?? 0);
        }

        // Startknoten mit outDeg>inDeg bevorzugen
        let startV = uniqueVerts[0];
        for (const v of uniqueVerts) {
          const inde = inDeg.get(v) ?? 0;
          const out = outDeg.get(v) ?? 0;
          if (out > inde) { startV = v; break; }
        }

        const seq: number[] = [startV];
        let cur = startV;
        const totalEdges = oriented.length;
        let steps = 0;

        while (steps++ < totalEdges + 5) {
          const outs = nextMulti.get(cur) ?? [];
          if (outs.length) {
            const nxt = outs.shift()!;
            seq.push(nxt);
            cur = nxt;
            if (cur === startV) break;
          } else {
            // letzter Ausweg: Kante umdrehen, um den Loop schließen zu können
            let fixed = false;
            for (const [k, arr] of nextMulti) {
              const j = arr.indexOf(cur);
              if (j >= 0) {
                arr.splice(j, 1);
                if (!nextMulti.has(cur)) nextMulti.set(cur, []);
                nextMulti.get(cur)!.push(k);
                const nxt = k;
                seq.push(nxt);
                cur = nxt;
                fixed = true;
                break;
              }
            }
            if (!fixed) break;
          }
        }

        if (seq.length >= 2 && seq[0] === seq[seq.length - 1]) seq.pop();
        if (new Set(seq).size < 3) continue;

        const tris: [number, number, number][] = [];
        for (let i = 1; i < seq.length - 1; i++) {
          const t: [number, number, number] = [seq[0], seq[i], seq[i + 1]];
          if (new Set(t).size === 3) tris.push(t);
        }
        if (!tris.length) continue;

        faces.push({ faceId, edgeIds: signed, tris });
      }
    }
  }

  // Parser-Status
  let triCount = 0;
  for (const f of faces) triCount += f.tris.length;

  console.group('%cFE-Parser', 'color:#06b; font-weight:bold;');
  console.log('RMAX, ZMAX:', RMAX, ZMAX);
  console.log('Vertices:', vertices.length);
  console.log('Edges:', Object.keys(edgesById).length);
  console.log('Faces (Loops):', faces.length, '→ Triangles:', triCount);
  console.groupEnd();

  return { vertices, faces, vertexIdToIndex };
}

// ====================== Mesh + Wireframe ======================
function createMeshFromFEData(data: { vertices: number[][]; faces: ParsedFace[] }): THREE.Group {
  const geometry = new THREE.BufferGeometry();
  const positions: number[] = [];

  for (const f of data.faces) {
    for (const tri of f.tris) {
      for (const vi of tri) {
        const v = data.vertices[vi];
        if (!v) continue;
        positions.push(v[0], v[1], v[2]);
      }
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();

  const frontMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0000,            // Front: Rot
    side: THREE.FrontSide,
    metalness: 0.0,
    roughness: 0.35,
  });
  const backMaterial = new THREE.MeshStandardMaterial({
    color: 0x666666,            // Back: Grau
    side: THREE.BackSide,
    metalness: 0.0,
    roughness: 0.35,
  });

  const frontMesh = new THREE.Mesh(geometry, frontMaterial);
  const backMesh  = new THREE.Mesh(geometry, backMaterial);

  const wireframe = new THREE.LineSegments(
    new THREE.WireframeGeometry(geometry),
    new THREE.LineBasicMaterial({ color: 0x000000 }) // Schwarz
  );

  const group = new THREE.Group();
  group.add(frontMesh, backMesh, wireframe);
  return group;
}

// ====================== Framing ======================
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

// ====================== Auto-Load ======================
async function loadFEAtStart() {
  const params = new URLSearchParams(location.search);
  const feParam = params.get('fe');
  const feUrl = feParam ? (import.meta.env.BASE_URL + feParam) : defaultFeUrl;

  const res = await fetch(feUrl);
  if (!res.ok) throw new Error(`Konnte ${feUrl} nicht laden (${res.status})`);
  const content = await res.text();

  const data = parseFEFile(content);

  // Debug: Übersicht
  let triCount = 0;
  for (const f of data.faces) triCount += f.tris.length;

  console.clear();
  console.group('%cFE-Daten', 'color:#0a6; font-weight:bold;');
  console.log('Vertices:', data.vertices.length);
  console.log('Faces (Loops):', data.faces.length, '→ Triangles:', triCount);
  console.table(
    data.faces.slice(0, 50).map(f => ({
      faceId: f.faceId,
      edges: f.edgeIds.join(' '),
      tris: f.tris.map(t => t.join(',')).join(' | '),
    }))
  );
  console.groupEnd();

  const mesh = createMeshFromFEData({ vertices: data.vertices, faces: data.faces });

  scene.clear();
  scene.add(camera);
  scene.add(hemi);
  scene.add(new THREE.AmbientLight(0xffffff, 0.2));
  scene.add(mesh);
  frameObject(mesh);
}

loadFEAtStart().catch(err => console.error(err));

// ====================== Render-Loop ======================
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
