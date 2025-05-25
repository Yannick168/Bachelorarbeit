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

// === FlyCam Steuerung ===
let cameraPos = [0, 1.5, 4];
let yaw = -Math.PI / 2;
let pitch = 0;
let forwardVec = [0, 0, -1];

let keys: Record<string, boolean> = {};
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

let lastMouseX = 0, lastMouseY = 0, isMouseDown = false;
canvas.addEventListener('mousedown', () => isMouseDown = true);
canvas.addEventListener('mouseup', () => isMouseDown = false);
canvas.addEventListener('mousemove', e => {
  if (!isMouseDown) return;
  const dx = e.movementX || e.clientX - lastMouseX;
  const dy = e.movementY || e.clientY - lastMouseY;
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;

  const sensitivity = 0.002;
  yaw += dx * sensitivity;
  pitch -= dy * sensitivity;
  pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, pitch));

  forwardVec = [
    Math.cos(pitch) * Math.cos(yaw),
    Math.sin(pitch),
    Math.cos(pitch) * Math.sin(yaw)
  ];
});

function updateCamera(dt: number) {
  const speed = 2.5;
  const right = [
    Math.sin(yaw - Math.PI / 2),
    0,
    Math.cos(yaw - Math.PI / 2)
  ];
  const up = [0, 1, 0];
  const fwd = forwardVec;

  if (keys['w']) for (let i = 0; i < 3; i++) cameraPos[i] += fwd[i] * speed * dt;
  if (keys['s']) for (let i = 0; i < 3; i++) cameraPos[i] -= fwd[i] * speed * dt;
  if (keys['a']) for (let i = 0; i < 3; i++) cameraPos[i] -= right[i] * speed * dt;
  if (keys['d']) for (let i = 0; i < 3; i++) cameraPos[i] += right[i] * speed * dt;
  if (keys['q']) for (let i = 0; i < 3; i++) cameraPos[i] -= up[i] * speed * dt;
  if (keys['e']) for (let i = 0; i < 3; i++) cameraPos[i] += up[i] * speed * dt;
}

let lastTime = 0;
function render(time: number) {
  time *= 0.001;
  const dt = time - lastTime;
  lastTime = time;
  updateCamera(dt);

  const cameraPosition = new Float32Array(cameraPos);
  const len = Math.hypot(...forwardVec);
  const cameraForward = new Float32Array(forwardVec.map(c => c / len));

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  gl.uniform2f(uResolution, canvas.width, canvas.height);
  gl.uniform1f(uTime, time);
  gl.uniform3fv(uCameraPosition, cameraPosition);
  gl.uniform3fv(uCameraForward, cameraForward);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
  requestAnimationFrame(render);
}

requestAnimationFrame(render);
