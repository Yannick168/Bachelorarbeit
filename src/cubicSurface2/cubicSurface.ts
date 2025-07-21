import { mat4, vec3 } from "gl-matrix";
import vertexSource from "./cubicSurface.vs.glsl?raw";
import fragmentSource from "./cubicSurface.fs.glsl?raw";

const canvas = document.getElementById("glcanvas") as HTMLCanvasElement;
const gl = canvas.getContext("webgl2")!;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const monomials = [
  "x³", "y³", "z³", "x y z", "x² y", "x² z", "y² z", "y z²", "x y²", "x z²",
  "x²", "y²", "z²", "x y", "x z", "y z", "x", "y", "z", "1"
];

const coeffInputs: HTMLInputElement[] = [];
const controls = document.getElementById("controls")!;
controls.innerHTML = "";

monomials.forEach((label, i) => {
  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";

  const input = document.createElement("input");
  input.type = "number";
  input.step = "0.01";
  input.value = "0";
  wrapper.appendChild(input);

  const span = document.createElement("span");
  span.textContent = label;
  span.style.fontSize = "0.8em";
  span.style.color = "white";
  span.style.textAlign = "center";
  wrapper.appendChild(span);

  controls.appendChild(wrapper);
  coeffInputs.push(input);
});

coeffInputs[0].value = "1";   // x³
coeffInputs[1].value = "1";   // y³
coeffInputs[2].value = "1";   // z³
coeffInputs[19].value = "-1"; // 1

const renderBtn = document.createElement("button");
renderBtn.textContent = "Rendern";
renderBtn.style.gridColumn = "span 5";
renderBtn.style.marginTop = "10px";
controls.appendChild(renderBtn);

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
    throw new Error("Shader link failed");
  }
  return program;
}

const program = createProgram(vertexSource, fragmentSource);
gl.useProgram(program);

const quad = new Float32Array([
  -1, -1, 1, -1, -1, 1,
  -1, 1, 1, -1, 1, 1
]);
const vao = gl.createVertexArray()!;
gl.bindVertexArray(vao);
const vbo = gl.createBuffer()!;
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
gl.enableVertexAttribArray(0);
gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

const uResolution = gl.getUniformLocation(program, "u_resolution");
const uCameraOrigin = gl.getUniformLocation(program, "u_cameraOrigin");
const uCameraMatrix = gl.getUniformLocation(program, "u_cameraMatrix");
const uPolyCoeffs = gl.getUniformLocation(program, "u_polyCoeffs");
const uSurfaceCoeffs = gl.getUniformLocation(program, "u_surfaceCoeffs");

const cameraPos = vec3.fromValues(0, 0, 5);
const cameraDir = vec3.fromValues(0, 0, -1);
const up = vec3.fromValues(0, 1, 0);
const cameraSpeed = 0.1;

let yaw = -90;
let pitch = 0;
let lastX = canvas.width / 2;
let lastY = canvas.height / 2;
let mouseDown = false;

canvas.addEventListener("mousedown", () => { mouseDown = true; });
canvas.addEventListener("mouseup", () => { mouseDown = false; });
canvas.addEventListener("mousemove", (e) => {
  if (!mouseDown) return;
  const sensitivity = 0.1;
  const offsetX = (e.clientX - lastX) * sensitivity;
  const offsetY = (lastY - e.clientY) * sensitivity;
  lastX = e.clientX;
  lastY = e.clientY;

  yaw += offsetX;
  pitch += offsetY;
  pitch = Math.max(-89, Math.min(89, pitch));

  const radYaw = yaw * Math.PI / 180;
  const radPitch = pitch * Math.PI / 180;
  cameraDir[0] = Math.cos(radYaw) * Math.cos(radPitch);
  cameraDir[1] = Math.sin(radPitch);
  cameraDir[2] = Math.sin(radYaw) * Math.cos(radPitch);
  vec3.normalize(cameraDir, cameraDir);
});

const keys: Record<string, boolean> = {};
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

function updateCamera() {
  const right = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), cameraDir, up));
  const forward = vec3.normalize(vec3.create(), cameraDir);

  if (keys["w"]) vec3.scaleAndAdd(cameraPos, cameraPos, forward, cameraSpeed);
  if (keys["s"]) vec3.scaleAndAdd(cameraPos, cameraPos, forward, -cameraSpeed);
  if (keys["a"]) vec3.scaleAndAdd(cameraPos, cameraPos, right, -cameraSpeed);
  if (keys["d"]) vec3.scaleAndAdd(cameraPos, cameraPos, right, cameraSpeed);

  const target = vec3.add(vec3.create(), cameraPos, cameraDir);
  console.log("Camera Position:", cameraPos, "Direction:", cameraDir);
  return mat4.lookAt(mat4.create(), cameraPos, target, up);
}

function draw() {
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT);

  const view = updateCamera();
  const proj = mat4.perspective(mat4.create(), Math.PI / 4, canvas.width / canvas.height, 0.1, 100);
  const vp = mat4.multiply(mat4.create(), proj, view);
  const invVP = mat4.invert(mat4.create(), vp)!;

  const c = coeffInputs.map(input => parseFloat(input.value));


  /*
  c300 c[0]  x³, 
  c030 c[1]  y³, 
  c003 c[2]  z³, 
  c111 c[3]  x y z, 
  c210 c[4]  x² y, 
  c201 c[5]  x² z, 
  c021 c[6]  y² z, 
  c012 c[7]  y z², 
  c120 c[8]  x y², 
  c102 c[9]  x z²,
  c200 c[10] x², 
  c020 c[11] y², 
  c002 c[12] z², 
  c110 c[13] x y, 
  c101 c[14] x z, 
  c011 c[15] y z, 
  c100 c[16] x, 
  c010 c[17] y, 
  c001 c[18] z, 
  c000 c[19] 1

  
  c3 = a1*c102*d3**2 + a1*c111*d2*d3 + a1*c120*d2**2 + 2*a1*c201*d1*d3 + 2*a1*c210*d1*d2 + 3*a1*c300*d1**2 + a2*c012*d3**2 + 2*a2*c021*d2*d3 + 3*a2*c030*d2**2 + a2*c111*d1*d3 + 2*a2*c120*d1*d2 + a2*c210*d1**2 + 3*a3*c003*d3**2 + 2*a3*c012*d2*d3 + a3*c021*d2**2 + 2*a3*c102*d1*d3 + a3*c111*d1*d2 + a3*c201*d1**2 + c002*d3**2 + c011*d2*d3 + c020*d2**2 + c101*d1*d3 + c110*d1*d2 + c200*d1**2       
  
  c2 = a1**2*c201*d3 + a1**2*c210*d2 + 3*a1**2*c300*d1 + a1*a2*c111*d3 + 2*a1*a2*c120*d2 + 2*a1*a2*c210*d1 + 2*a1*a3*c102*d3 + a1*a3*c111*d2 + 2*a1*a3*c201*d1 + a1*c101*d3 + a1*c110*d2 + 2*a1*c200*d1 + a2**2*c021*d3 + 3*a2**2*c030*d2 + a2**2*c120*d1 + 2*a2*a3*c012*d3 + 2*a2*a3*c021*d2 + a2*a3*c111*d1 + a2*c011*d3 + 2*a2*c020*d2 + a2*c110*d1 + 3*a3**2*c003*d3 + a3**2*c012*d2 + a3**2*c102*d1 + 2*a3*c002*d3 + a3*c011*d2 + a3*c101*d1 + c001*d3 + c010*d2 + c100*d1
  
  c1 = a1**3*c300 + a1**2*a2*c210 + a1**2*a3*c201 + a1**2*c200 + a1*a2**2*c120 + a1*a2*a3*c111 + a1*a2*c110 + a1*a3**2*c102 + a1*a3*c101 + a1*c100 + a2**3*c030 + a2**2*a3*c021 + a2**2*c020 + a2*a3**2*c012 + a2*a3*c011 + a2*c010 + a3**3*c003 + a3**2*c002 + a3*c001 + c000
  
  c0 = c100 + c101*z + c102*z**2 + c110*y + c111*y*z + c120*y**2 + 2*c200*x + 2*c201*x*z + 2*c210*x*y + 012 + a2*a3*c011 + a2*c010 + a3**3*c003 + a3**2*c002 + a3*c001 + c000
  */

  const o = cameraPos;
  const d = vec3.normalize(vec3.create(), cameraDir);
  const a1 = o[0], a2 = o[1], a3 = o[2];
  const d1 = d[0], d2 = d[1], d3 = d[2];

  const c3 = c[3]*d3**3 + c[6]*d2*d3**2 + c[8]*d2**2*d3 + c[9]*d2**3 +
             c[12]*d1*d3**2 + c[14]*d1*d2*d3 + c[15]*d1*d2**2 +
             c[17]*d1**2*d3 + c[18]*d1**2*d2 + c[19]*d1**3;

  const c2 = a1*c[12]*d3**2 + a1*c[14]*d2*d3 + a1*c[15]*d2**2 + 2*a1*c[17]*d1*d3 + 2*a1*c[18]*d1*d2 + 3*a1*c[19]*d1**2 +
             a2*c[6]*d3**2 + 2*a2*c[8]*d2*d3 + 3*a2*c[9]*d2**2 + a2*c[14]*d1*d3 + 2*a2*c[15]*d1*d2 + a2*c[18]*d1**2 +
             3*a3*c[3]*d3**2 + 2*a3*c[6]*d2*d3 + a3*c[8]*d2**2 + 2*a3*c[12]*d1*d3 + a3*c[14]*d1*d2 + a3*c[17]*d1**2 +
             c[2]*d3**2 + c[5]*d2*d3 + c[7]*d2**2 + c[11]*d1*d3 + c[13]*d1*d2 + c[16]*d1**2;

  const c1 = a1**2*c[17]*d3 + a1**2*c[18]*d2 + 3*a1**2*c[19]*d1 + a1*a2*c[14]*d3 + 2*a1*a2*c[15]*d2 + 2*a1*a2*c[18]*d1 +
             2*a1*a3*c[12]*d3 + a1*a3*c[14]*d2 + 2*a1*a3*c[17]*d1 + a1*c[11]*d3 + a1*c[13]*d2 + 2*a1*c[16]*d1 +
             a2**2*c[8]*d3 + 3*a2**2*c[9]*d2 + a2**2*c[15]*d1 + 2*a2*a3*c[6]*d3 + 2*a2*a3*c[8]*d2 + a2*a3*c[14]*d1 +
             a2*c[5]*d3 + 2*a2*c[7]*d2 + a2*c[13]*d1 + 3*a3**2*c[3]*d3 + a3**2*c[6]*d2 + a3**2*c[12]*d1 +
             2*a3*c[2]*d3 + a3*c[5]*d2 + a3*c[11]*d1 + c[1]*d3 + c[4]*d2 + c[10]*d1;

  const c0 = a1**3*c[19] + a1**2*a2*c[18] + a1**2*a3*c[17] + a1**2*c[16] + a1*a2**2*c[15] + a1*a2*a3*c[14] + a1*a2*c[13] +
             a1*a3**2*c[12] + a1*a3*c[11] + a1*c[10] + a2**3*c[9] + a2**2*a3*c[8] + a2**2*c[7] + a2*a3**2*c[6] +
             a2*a3*c[5] + a2*c[4] + a3**3*c[3] + a3**2*c[2] + a3*c[1] + c[0];

  const polyCoeffs = new Float32Array([c0, c1, c2, c3]);
  gl.uniform2f(uResolution, canvas.width, canvas.height);
  gl.uniform3fv(uCameraOrigin, cameraPos);
  gl.uniformMatrix4fv(uCameraMatrix, false, invVP);
  gl.uniform1fv(uPolyCoeffs, polyCoeffs);
  gl.uniform1fv(uSurfaceCoeffs, new Float32Array(c));

  gl.bindVertexArray(vao);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  requestAnimationFrame(draw);
  console.log("Coeff:", c3,c2,c1,c0);
}

renderBtn.onclick = () => draw();
requestAnimationFrame(draw);
