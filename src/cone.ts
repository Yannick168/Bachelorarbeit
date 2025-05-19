// === cone.ts ===
import vertexSource from './shader/cone.vs.glsl?raw'; 
import fragmentSource from './shader/cone.fs.glsl?raw';

const canvas = document.getElementById('glcanvas') as HTMLCanvasElement;
const gl = canvas.getContext('webgl2')!;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext, vsSource: string, fsSource: string) {
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSource)!;
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource)!;
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    return null;
  }
  return program;
}

const program = createProgram(gl, vertexSource, fragmentSource)!;
const positionBuffer = gl.createBuffer()!;
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
    -1,  1,
     1, -1,
     1,  1]),
  gl.STATIC_DRAW
);

const positionLocation = gl.getAttribLocation(program, "a_position");
const uResolution = gl.getUniformLocation(program, "u_resolution");
const uTime = gl.getUniformLocation(program, "u_time");
const uCameraPosition = gl.getUniformLocation(program, "cameraPosition");
const uCameraForward = gl.getUniformLocation(program, "cameraForward");

// Trackball Parameter (inkl. Zoom)
let theta = Math.PI / 4;
let phi = Math.PI / 4;
let radius = 4.0;

let isDragging = false;
let lastX = 0, lastY = 0;

canvas.addEventListener('mousedown', (e) => {
  isDragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
});
canvas.addEventListener('mouseup', () => isDragging = false);
canvas.addEventListener('mouseleave', () => isDragging = false);
canvas.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  lastX = e.clientX;
  lastY = e.clientY;
  theta -= dx * 0.01;
  phi -= dy * 0.01;
  phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi));
});

// Mausrad-Zoom mit Begrenzung
canvas.addEventListener('wheel', (e) => {
  radius += e.deltaY * 0.01;
  radius = Math.max(2.0, Math.min(10.0, radius));
});

function render(time: number) {
  time *= 0.001;

  const camX = radius * Math.sin(phi) * Math.sin(theta);
  const camY = radius * Math.cos(phi);
  const camZ = radius * Math.sin(phi) * Math.cos(theta);
  const cameraPosition = new Float32Array([camX, camY, camZ]);

  const target = [0, 0.5, 0];
  const forward = new Float32Array([
    target[0] - camX,
    target[1] - camY,
    target[2] - camZ,
  ]);
  const len = Math.hypot(...forward);
  for (let i = 0; i < 3; i++) forward[i] /= len;

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  gl.uniform2f(uResolution, canvas.width, canvas.height);
  gl.uniform1f(uTime, time);
  gl.uniform3fv(uCameraPosition, cameraPosition);
  gl.uniform3fv(uCameraForward, forward);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
  requestAnimationFrame(render);
}

requestAnimationFrame(render);