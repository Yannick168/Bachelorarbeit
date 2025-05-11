import { createShader, createProgram } from './shader';
import vertexSource from '../shader/parametricSurface_01.vs.glsl?raw';
import fragmentSource from '../shader/parametricSurface_01.fs.glsl?raw';
import { mat4, vec3 } from 'gl-matrix';

// === Initialisierung ===
const canvas = document.getElementById('glCanvas') as HTMLCanvasElement;
const gl = canvas.getContext('webgl2') as WebGL2RenderingContext;
if (!gl) throw new Error('WebGL2 not supported');

gl.enable(gl.DEPTH_TEST);

// === Shader-Setup ===
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
const program = createProgram(gl, vertexShader, fragmentShader);
gl.useProgram(program);

// === Parametrische Fläche generieren ===
function generateParametricSurface(
  uSegments: number,
  vSegments: number,
  uMin: number,
  uMax: number,
  vMin: number,
  vMax: number,
  fn: (u: number, v: number) => [number, number, number]
): { positions: Float32Array; indices: Uint16Array } {
  const positions: number[] = [];
  const indices: number[] = [];

  for (let j = 0; j <= vSegments; j++) {
    const v = vMin + (vMax - vMin) * (j / vSegments);
    for (let i = 0; i <= uSegments; i++) {
      const u = uMin + (uMax - uMin) * (i / uSegments);
      const [x, y, z] = fn(u, v);

      const r = (v - vMin) / (vMax - vMin);
      const g = 0.2;
      const b = 1.0 - r;
      const a = 1.0;

      positions.push(x, y, z, r, g, b, a);
    }
  }

  for (let j = 0; j < vSegments; j++) {
    for (let i = 0; i < uSegments; i++) {
      const row1 = j * (uSegments + 1);
      const row2 = (j + 1) * (uSegments + 1);
      const a = row1 + i;
      const b = row1 + i + 1;
      const c = row2 + i;
      const d = row2 + i + 1;

      indices.push(a, b, d, a, d, c);
    }
  }

  return {
    positions: new Float32Array(positions),
    indices: new Uint16Array(indices),
  };
}

// === Wireframe-Kugel ===
function generateWireSphere(radius = 1.5, segments = 24): { positions: Float32Array, indices: Uint16Array } {
  const positions: number[] = [];
  const indices: number[] = [];

  for (let j = 0; j <= segments; j++) {
    const theta = j * Math.PI / segments;
    for (let i = 0; i <= segments; i++) {
      const phi = i * 2 * Math.PI / segments;
      const x = radius * Math.sin(theta) * Math.cos(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(theta);
      positions.push(x, y, z, 1., 0., 0., 0.3); // halbtransparent
    }
  }

  for (let j = 0; j < segments; j++) {
    for (let i = 0; i < segments; i++) {
      const a = j * (segments + 1) + i;
      const b = a + 1;
      const c = a + (segments + 1);
      indices.push(a, b, a, c);
    }
  }

  return {
    positions: new Float32Array(positions),
    indices: new Uint16Array(indices)
  };
}

// === Fläche und Achsen ===
const surface = generateParametricSurface(
  100, 100,
  0, 2 * Math.PI,
  -2, 2,
  (u, v) => {
    const a = 1;
    return [a * Math.cos(u) * Math.cosh(v), a * Math.sin(u) * Math.cosh(v), v];
  }
);

const axisVertices = new Float32Array([
  0, 0, 0, 1, 0, 0, 1,   2, 0, 0, 1, 0, 0, 1,
  0, 0, 0, 0, 1, 0, 1,   0, 2, 0, 0, 1, 0, 1,
  0, 0, 0, 0, 0, 1, 1,   0, 0, 2, 0, 0, 1, 1
]);

const axisIndices = new Uint16Array([0, 1, 2, 3, 4, 5]);

// === Buffer-Setup ===
function setupVAO(positions: Float32Array, indices: Uint16Array) {
  const vao = gl.createVertexArray()!;
  const vbo = gl.createBuffer()!;
  const ebo = gl.createBuffer()!;

  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 7 * 4, 0);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 7 * 4, 3 * 4);

  gl.bindVertexArray(null);
  return { vao, count: indices.length };
}

const surfaceVAO = setupVAO(surface.positions, surface.indices);
const axisVAO = setupVAO(axisVertices, axisIndices);
const trackballData = generateWireSphere(2.5); // Sichtbare Trackball-Kugel
const trackballVAO = setupVAO(trackballData.positions, trackballData.indices);

// === MVP ===
const uMVP = gl.getUniformLocation(program, 'uMVP');
const model = mat4.create();
const view = mat4.create();
const proj = mat4.create();
const mvp = mat4.create();
const trackballRotationMatrix = mat4.create();

mat4.lookAt(view, [8, 2, 8], [0, 0, 0], [0, 1, 0]);
mat4.perspective(proj, Math.PI / 4, canvas.width / canvas.height, 0.1, 100);

// === Arcball Hilfsfunktionen ===
const TRACKBALL_RADIUS = 1.0;
function projectToSphere(x: number, y: number, radius: number): vec3 {
  const pt = vec3.fromValues(x, y, 0);
  const d = x * x + y * y;
  if (d <= radius * radius) {
    pt[2] = Math.sqrt(radius * radius - d);
  } else {
    const length = Math.sqrt(d);
    pt[0] *= radius / length;
    pt[1] *= radius / length;
  }
  return pt;
}

function getNormalizedMousePos(e: MouseEvent): [number, number] {
  const rect = canvas.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  const y = ((rect.bottom - e.clientY) / rect.height) * 2 - 1;
  return [x, y];
}

// === Mausinteraktion (Arcball) ===
let isDragging = false;
let showTrackball = false;
let lastVec: vec3 | null = null;

canvas.addEventListener('mousedown', (e) => {
  isDragging = true;
  showTrackball = true;
  const [nx, ny] = getNormalizedMousePos(e);
  lastVec = projectToSphere(nx, ny, TRACKBALL_RADIUS);
});

canvas.addEventListener('mouseup', () => {
  isDragging = false;
  showTrackball = false;
  lastVec = null;
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDragging || !lastVec) return;
  const [nx, ny] = getNormalizedMousePos(e);
  const currVec = projectToSphere(nx, ny, TRACKBALL_RADIUS);

  const axis = vec3.create();
  vec3.cross(axis, lastVec, currVec);

  if (vec3.length(axis) < 1e-5) return;

  const dot = vec3.dot(lastVec, currVec);
  const clampedDot = Math.min(1, Math.max(-1, dot));
  const angle = Math.acos(clampedDot);

  const rot = mat4.create();
  vec3.normalize(axis, axis);
  mat4.fromRotation(rot, angle, axis);
  mat4.multiply(trackballRotationMatrix, rot, trackballRotationMatrix);

  lastVec = currVec;
});

// === Render-Loop ===
function render() {
  mat4.copy(model, trackballRotationMatrix);
  mat4.multiply(mvp, view, model);
  mat4.multiply(mvp, proj, mvp);

  gl.clearColor(1, 1, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(program);
  gl.uniformMatrix4fv(uMVP, false, mvp);

  if (showTrackball) {
    gl.bindVertexArray(trackballVAO.vao);
    gl.drawElements(gl.LINES, trackballVAO.count, gl.UNSIGNED_SHORT, 0);
  }

  gl.bindVertexArray(axisVAO.vao);
  gl.drawElements(gl.LINES, axisVAO.count, gl.UNSIGNED_SHORT, 0);

  gl.bindVertexArray(surfaceVAO.vao);
  gl.drawElements(gl?.TRIANGLES, surfaceVAO.count, gl.UNSIGNED_SHORT, 0);

  requestAnimationFrame(render);
}

render();
