import { mat4, vec3 } from "gl-matrix";
import vertexSource from "./cubicSurface.vs.glsl?raw";
import fragmentSource from "./cubicSurface.fs.glsl?raw";

const canvas = document.getElementById("glcanvas") as HTMLCanvasElement;
const gl = canvas.getContext("webgl2")!;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

canvas.requestPointerLock = canvas.requestPointerLock || (canvas as any).mozRequestPointerLock;
canvas.onclick = () => canvas.requestPointerLock();

// Shader-Kompilierung und -Setup wie gehabt ...
function compileShader(type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    throw new Error("Shader compile failed");
  }
  return shader;
}

function createProgram(vsSource: string, fsSource: string): WebGLProgram {
  const vs = compileShader(gl.VERTEX_SHADER, vsSource);
  const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    throw new Error("Program link failed");
  }
  return program;
}

const program = createProgram(vertexSource, fragmentSource);
gl.useProgram(program);

// Fullscreen Quad
const quad = new Float32Array([
  -1, -1, 1, -1, -1, 1,
  -1, 1, 1, -1, 1, 1,
]);
const vao = gl.createVertexArray()!;
gl.bindVertexArray(vao);
const vbo = gl.createBuffer()!;
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
gl.enableVertexAttribArray(0);
gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

// === Kamera-Setup ===
const uResolution = gl.getUniformLocation(program, "u_resolution");
const uCameraOrigin = gl.getUniformLocation(program, "u_cameraOrigin");
const uCameraMatrix = gl.getUniformLocation(program, "u_cameraMatrix");

const cameraPos = vec3.fromValues(2, 2, 3);
let yaw = -90;
let pitch = 0;
const cameraFront = vec3.create();
const cameraUp = vec3.fromValues(0, 1, 0);
const cameraRight = vec3.create();
const worldUp = vec3.fromValues(0, 1, 0);

const keys: Record<string, boolean> = {};
window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

document.addEventListener("mousemove", e => {
  if (document.pointerLockElement === canvas) {
    yaw += e.movementX * 0.1;
    pitch -= e.movementY * 0.1;
    pitch = Math.max(-89, Math.min(89, pitch));
    updateCameraVectors();
  }
});

function updateCameraVectors() {
  const yawRad = yaw * Math.PI / 180;
  const pitchRad = pitch * Math.PI / 180;
  cameraFront[0] = Math.cos(pitchRad) * Math.cos(yawRad);
  cameraFront[1] = Math.sin(pitchRad);
  cameraFront[2] = Math.cos(pitchRad) * Math.sin(yawRad);
  vec3.normalize(cameraFront, cameraFront);

  vec3.cross(cameraRight, cameraFront, worldUp);
  vec3.normalize(cameraRight, cameraRight);
  vec3.cross(cameraUp, cameraRight, cameraFront);
}

updateCameraVectors();

function handleInput(deltaTime: number) {
  const speed = 2.0 * deltaTime;
  const move = vec3.create();

  if (keys["w"]) vec3.scaleAndAdd(move, move, cameraFront, speed);
  if (keys["s"]) vec3.scaleAndAdd(move, move, cameraFront, -speed);
  if (keys["a"]) vec3.scaleAndAdd(move, move, cameraRight, -speed);
  if (keys["d"]) vec3.scaleAndAdd(move, move, cameraRight, speed);
  if (keys["q"]) vec3.scaleAndAdd(move, move, cameraUp, -speed);
  if (keys["e"]) vec3.scaleAndAdd(move, move, cameraUp, speed);

  vec3.add(cameraPos, cameraPos, move);
}

// === Render-Loop ===
let lastTime = performance.now();
function render() {
  const now = performance.now();
  const deltaTime = (now - lastTime) / 1000;
  lastTime = now;

  handleInput(deltaTime);

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  const target = vec3.add(vec3.create(), cameraPos, cameraFront);
  const view = mat4.lookAt(mat4.create(), cameraPos, target, cameraUp);
  const proj = mat4.perspective(mat4.create(), Math.PI / 4, canvas.width / canvas.height, 0.1, 100);
  const vp = mat4.multiply(mat4.create(), proj, view);
  const invVP = mat4.invert(mat4.create(), vp)!;

  gl.uniform2f(uResolution, canvas.width, canvas.height);
  gl.uniform3fv(uCameraOrigin, cameraPos);
  gl.uniformMatrix4fv(uCameraMatrix, false, invVP);

  gl.bindVertexArray(vao);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  requestAnimationFrame(render);
}
render();
