// test.ts
import vertexSource from './test.vs.glsl?raw';
import fragmentTemplate from './test.fs.glsl?raw';
import * as THREE from 'three';

const canvas = document.createElement('canvas');
canvas.width = 800;
canvas.height = 600;
document.body.appendChild(canvas);

const gl = canvas.getContext('webgl2')!;
if (!gl) throw new Error('WebGL2 nicht unterstützt');

const renderer = new THREE.WebGLRenderer({ canvas });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.1, 10000);
camera.position.set(0, 0, 3);

// =====================
// Eingabesteuerung
// =====================
const keysPressed = new Set<string>();
let yaw = 0;
let pitch = 0;
let isMouseDown = false;

document.addEventListener('keydown', e => keysPressed.add(e.key.toLowerCase()));
document.addEventListener('keyup', e => keysPressed.delete(e.key.toLowerCase()));

canvas.requestPointerLock = canvas.requestPointerLock || (canvas as any).mozRequestPointerLock;
document.exitPointerLock = document.exitPointerLock || (document as any).mozExitPointerLock;

canvas.addEventListener("click", () => {
  canvas.requestPointerLock();
});

document.addEventListener("pointerlockchange", () => {
  isMouseDown = document.pointerLockElement === canvas;
});

document.addEventListener("mousemove", (e) => {
  if (!isMouseDown) return;
  const dx = e.movementX || 0;
  const dy = e.movementY || 0;
  yaw -= dx * 0.002;
  pitch -= dy * 0.002;
  pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, pitch));
});

// =====================
// UI
// =====================
const inputsDiv = document.createElement('div');
const variableNames = [
  'x³', 'y³', 'z³',
  'x²y', 'x²z', 'y²x', 'y²z', 'z²x', 'z²y',
  'xyz',
  'x²', 'y²', 'z²',
  'xy', 'xz', 'yz',
  'x', 'y', 'z',
  '1'
];
inputsDiv.className = 'coeff-inputs';
for (let i = 0; i < 20; i++) {
  const wrapper = document.createElement('div');
  wrapper.className = 'coeff-group';
  const label = document.createElement('label');
  label.textContent = `${variableNames[i]}\n(a${i})`;
  const input = document.createElement('input');
  input.type = 'number';
  input.value = '0';
  input.id = `a${i}`;
  wrapper.appendChild(label);
  wrapper.appendChild(input);
  inputsDiv.appendChild(wrapper);
}

const button = document.createElement('button');
button.textContent = 'Render';

const coeffOutput = document.createElement('pre');
coeffOutput.style.marginTop = '1em';
coeffOutput.style.background = '#222';
coeffOutput.style.color = '#0f0';
coeffOutput.style.padding = '0.5em';
coeffOutput.style.fontSize = '0.9em';
coeffOutput.style.maxWidth = '600px';
coeffOutput.style.whiteSpace = 'pre-wrap';

document.body.appendChild(inputsDiv);
document.body.appendChild(button);
document.body.appendChild(coeffOutput);

function getCoefficients(): number[] {
  const coeffs: number[] = [];
  for (let i = 0; i < 20; i++) {
    const input = document.getElementById(`a${i}`) as HTMLInputElement;
    coeffs.push(parseFloat(input.value));
  }
  return coeffs;
}

function generateGLSLRootsCode(coeffs: number[]): string {
  const toFloat = (v: number) => Number.isInteger(v) ? `${v}.0` : v.toString();
  return `
float cubic(float c0, float c1, float c2, float c3) {
  float a = c3, b = c2, c = c1, d = c0;
  float A = b/a, B = c/a, C = d/a;
  float Q = (3.0*B - A*A)/9.0;
  float R = (9.0*A*B - 27.0*C - 2.0*A*A*A)/54.0;
  float D = Q*Q*Q + R*R;
  if (D >= 0.0) {
    float sqrtD = sqrt(D);
    float S = cbrt(R + sqrtD);
    float T = cbrt(R - sqrtD);
    return -A/3.0 + (S + T);
  } else {
    float th = acos(R / sqrt(-Q*Q*Q));
    return 2.0 * sqrt(-Q) * cos(th / 3.0) - A/3.0;
  }
}

float evalCubic(vec3 ro, vec3 rd) {
  float x = ro.x, y = ro.y, z = ro.z;
  float dx = rd.x, dy = rd.y, dz = rd.z;
  float l = 1.0; // dummy for codegen placeholder
  float c0 =
    ${toFloat(coeffs[0])}*x*x*x + ${toFloat(coeffs[1])}*y*y*y + ${toFloat(coeffs[2])}*z*z*z +
    ${toFloat(coeffs[3])}*x*x*y + ${toFloat(coeffs[4])}*x*x*z + ${toFloat(coeffs[5])}*y*y*x +
    ${toFloat(coeffs[6])}*y*y*z + ${toFloat(coeffs[7])}*z*z*x + ${toFloat(coeffs[8])}*z*z*y +
    ${toFloat(coeffs[9])}*x*y*z +
    ${toFloat(coeffs[10])}*x*x + ${toFloat(coeffs[11])}*y*y + ${toFloat(coeffs[12])}*z*z +
    ${toFloat(coeffs[13])}*x*y + ${toFloat(coeffs[14])}*x*z + ${toFloat(coeffs[15])}*y*z +
    ${toFloat(coeffs[16])}*x + ${toFloat(coeffs[17])}*y + ${toFloat(coeffs[18])}*z +
    ${toFloat(coeffs[19])};
  // TODO: add full polynomial expansion for c1, c2, c3 if needed
  float c1 = 1.0, c2 = 0.0, c3 = 0.0; // dummy values
  return cubic(c0, c1, c2, c3);
}`;
}

function createProgram(vsSource: string, fsSource: string): WebGLProgram {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program)!);
  }
  return program;
}

const quadVerts = new Float32Array([
  -1, -1, 1, -1, -1, 1,
   1, -1, 1, 1, -1, 1
]);

const vao = gl.createVertexArray();
gl.bindVertexArray(vao);
const vbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(gl.ARRAY_BUFFER, quadVerts, gl.STATIC_DRAW);
gl.enableVertexAttribArray(0);
gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0, 0, 0, 1);
gl.enable(gl.DEPTH_TEST);
gl.getExtension('EXT_color_buffer_float');
gl.getExtension('OES_texture_float_linear');

let currentProgram: WebGLProgram | null = null;

button.onclick = () => {
  const coeffs = getCoefficients();
  const rootCode = generateGLSLRootsCode(coeffs);
  const finalFrag = fragmentTemplate.replace('__CUBIC_SOLVER__', rootCode);
  const program = createProgram(vertexSource, finalFrag);
  gl.useProgram(program);
  currentProgram = program;

  const terms = [
    'x^3', 'y^3', 'z^3', 'x^2*y', 'x^2*z', 'y^2*x', 'y^2*z', 'z^2*x', 'z^2*y',
    'x*y*z', 'x^2', 'y^2', 'z^2', 'x*y', 'x*z', 'y*z', 'x', 'y', 'z', '1'
  ];
  const formula = coeffs.map((val, i) => {
    if (val === 0) return null;
    const term = terms[i];
    if (val === 1) return `${term}`;
    if (val === -1) return `-${term}`;
    return `${val}*${term}`;
  }).filter(Boolean).join(' + ').replace(/\+\s\-/g, '- ');

  coeffOutput.textContent = `Formel:\nf(x, y, z) = ${formula}\n\nKoeffizienten:\n` +
    coeffs.map((val, i) => `a${i.toString().padStart(2, '0')} = ${val}`).join(', ');
};

function animate() {
  requestAnimationFrame(animate);
  renderer.clear();

  const dir = new THREE.Vector3(
    Math.cos(pitch) * Math.sin(yaw),
    Math.sin(pitch),
    Math.cos(pitch) * Math.cos(yaw)
  );
  const speed = 0.05;
  const forward = dir.clone();
  const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
  const up = new THREE.Vector3(0, 1, 0);

  if (keysPressed.has('w')) camera.position.add(forward.clone().multiplyScalar(speed));
  if (keysPressed.has('s')) camera.position.add(forward.clone().multiplyScalar(-speed));
  if (keysPressed.has('a')) camera.position.add(right.clone().multiplyScalar(-speed));
  if (keysPressed.has('d')) camera.position.add(right.clone().multiplyScalar(speed));
  if (keysPressed.has('q')) camera.position.add(up.clone().multiplyScalar(-speed));
  if (keysPressed.has('e')) camera.position.add(up.clone().multiplyScalar(speed));

  camera.lookAt(camera.position.clone().add(dir));

  if (!currentProgram) return;
  gl.useProgram(currentProgram);

  const look = new THREE.Vector3();
  camera.getWorldDirection(look);
  const target = camera.position.clone().add(look);
  const f = new THREE.Vector3().subVectors(target, camera.position).normalize();
  const r = new THREE.Vector3().crossVectors(f, camera.up).normalize();
  const u = new THREE.Vector3().crossVectors(r, f);

  const rot = new Float32Array([
    r.x, r.y, r.z,
    u.x, u.y, u.z,
   -f.x, -f.y, -f.z
  ]);

  const camPosLoc = gl.getUniformLocation(currentProgram, 'camPos');
  const camRotLoc = gl.getUniformLocation(currentProgram, 'camRot');
  gl.uniform3fv(camPosLoc, camera.position.toArray());
  gl.uniformMatrix3fv(camRotLoc, false, rot);

  gl.bindVertexArray(vao);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

animate();
