import vertexSource from './shader/triangle.vs.glsl?raw';
import fragmentSource from './shader/triangle.fs.glsl?raw';
import { mat4 } from 'gl-matrix';

// === Hilfsfunktionen ===
function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
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
const gl = canvas.getContext('webgl2') as WebGL2RenderingContext;

const vs = createShader(gl, gl.VERTEX_SHADER, vertexSource);
const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
const program = createProgram(gl, vs, fs);

gl.useProgram(program);
gl.enable(gl.DEPTH_TEST);

// === Dummy-Geometrie
const vertices = new Float32Array([
  // x, y, z,    r, g, b, a
  -1, -1, 0,    1, 0, 0, 1,
   1, -1, 0,    0, 1, 0, 1,
   0,  1, 0,    0, 0, 1, 1,
]);

const indices = new Uint16Array([0, 1, 2]);

const vao = gl.createVertexArray()!;
gl.bindVertexArray(vao);

const vbo = gl.createBuffer()!;
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const ebo = gl.createBuffer()!;
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

gl.enableVertexAttribArray(0);
gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 7 * 4, 0);
gl.enableVertexAttribArray(1);
gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 7 * 4, 3 * 4);

gl.bindVertexArray(null);

// === MVP
const uMVP = gl.getUniformLocation(program, 'uMVP');
const model = mat4.create();
const view = mat4.create();
const proj = mat4.create();
const mvp = mat4.create();

mat4.lookAt(view, [2, 2, 3], [0, 0, 0], [0, 1, 0]);
mat4.perspective(proj, Math.PI / 4, canvas.width / canvas.height, 0.1, 100);
mat4.multiply(mvp, proj, mat4.multiply(mvp, view, model));
gl.uniformMatrix4fv(uMVP, false, mvp);

// === Render
function render() {
  gl.clearColor(1, 1, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(program);
  gl.bindVertexArray(vao);
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
  requestAnimationFrame(render);
}
render();
