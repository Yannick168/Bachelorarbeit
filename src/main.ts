import vertexSource from './shader/parametricSurface_01.vs.glsl?raw';
import fragmentSource from './shader/parametricSurface_01.fs.glsl?raw';
import { mat4, vec3 } from 'gl-matrix';

// === Hilfsfunktionen ===
function createShader(gl: WebGL2RenderingContext, type: GLenum, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    throw new Error('Shader compile error');
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext, vs: WebGLShader, fs: WebGLShader) {
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    throw new Error('Program link error');
  }
  return program;
}

// === Setup ===
const canvas = document.getElementById('glCanvas') as HTMLCanvasElement;
const gl = canvas.getContext('webgl2');
if (!gl) throw new Error('WebGL2 wird nicht unterstützt');

const vs = createShader(gl, gl.VERTEX_SHADER, vertexSource);
const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
const program = createProgram(gl, vs, fs);

gl.useProgram(program);
gl.enable(gl.DEPTH_TEST);

// === Dummy-Geometrie: Einfache Fläche als Beispiel ===
const vertices = new Float32Array([
  -1, -1, 0, 1, 0, 0, 1,
   1, -1, 0, 0, 1, 0, 1,
   0,  1, 0, 0, 0, 1, 1,
]);

const indices = new Uint16Array([0, 1, 2]);

// === VAO/VBO Setup ===
const vao = gl.createVertexArray()!;
gl.bindVertexArray(vao);

const vbo = gl.createBuffer()!;
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const ebo = gl.createBuffer()!;
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

// Position
gl.enableVertexAttribArray(0);
gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 7 * 4, 0);
// Farbe
gl.enableVertexAttribArray(1);
gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 7 * 4, 3 * 4);

gl.bindVertexArray(null);

// === MVP-Matrix
const uMVP = gl.getUniformLocation(program, 'uMVP');
const model = mat4.create();
const view = mat4.create();
const proj = mat4.create();
const mvp = mat4.create();

mat4.lookAt(view, [2, 2, 2], [0, 0, 0], [0, 1, 0]);
mat4.perspective(proj, Math.PI / 4, canvas.width / canvas.height, 0.1, 100);
mat4.multiply(mvp, proj, mat4.multiply(mvp, view, model));
gl.uniformMatrix4fv(uMVP, false, mvp);

// === Render-Loop ===
function render() {
  gl.clearColor(1, 1, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.useProgram(program);
  gl.bindVertexArray(vao);
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
  requestAnimationFrame(render);
}

render();
