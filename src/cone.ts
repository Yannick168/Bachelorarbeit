import * as THREE from 'three';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import { resizeToMaxViewportPerspective } from './utils/resizeViewport.js';

// Renderer setup
const renderer = new THREE.WebGLRenderer();
document.body.style.margin = '0';
document.body.appendChild(renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);

// Scene and Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 3); // Center view on origin

// Controls
const controls = new TrackballControls(camera, renderer.domElement);
controls.target.set(0, 0.75, 0); // Look at center of cone (1.5 / 2)
controls.update();

// Fullscreen quad geometry
const geometry = new THREE.PlaneGeometry(2, 2);

// Shader uniforms
const uniforms = {
  iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  iCameraPosition: { value: new THREE.Vector3() },
  iCameraMatrix: { value: new THREE.Matrix4() },
  iViewMatrix: { value: new THREE.Matrix4() }
};

// Vertex Shader
const vertexShader = `
void main() {
  gl_Position = vec4(position, 1.0);
}`;

// Fragment Shader
const fragmentShader = `
precision highp float;
uniform vec2 iResolution;
uniform vec3 iCameraPosition;
uniform mat4 iViewMatrix;

#define MAX_STEPS 100
#define MAX_DIST 100.0
#define SURF_DIST 0.001

float sdCone(vec3 p, float h, float r) {
  p.y -= h / 2.0; // Shift cone center to origin
  float q = length(p.xz);
  return max(dot(vec2(r, -h), vec2(q, p.y)) / sqrt(r*r + h*h), -p.y);
}

float map(vec3 p) {
  return sdCone(p, 1.5, 1.0);
}

float raymarch(vec3 ro, vec3 rd) {
  float d = 0.0;
  for (int i = 0; i < MAX_STEPS; i++) {
    vec3 p = ro + rd * d;
    float dist = map(p);
    if (dist < SURF_DIST) return d;
    d += dist;
    if (d > MAX_DIST) break;
  }
  return -1.0;
}

vec3 getNormal(vec3 p) {
  float eps = 0.001;
  vec2 e = vec2(1.0, -1.0) * 0.5773 * eps;
  return normalize(
    e.xyy * map(p + e.xyy) +
    e.yyx * map(p + e.yyx) +
    e.yxy * map(p + e.yxy) +
    e.xxx * map(p + e.xxx)
  );
}

vec3 getRayDir(vec2 uv) {
  vec3 forward = normalize((inverse(iViewMatrix) * vec4(0.0, 0.0, -1.0, 0.0)).xyz);
  vec3 right   = normalize((inverse(iViewMatrix) * vec4(1.0, 0.0, 0.0, 0.0)).xyz);
  vec3 up      = normalize((inverse(iViewMatrix) * vec4(0.0, 1.0, 0.0, 0.0)).xyz);
  return normalize(uv.x * right + uv.y * up + forward);
}

void main() {
  vec2 uv = (gl_FragCoord.xy / iResolution.xy) * 2.0 - 1.0;
  uv.x *= iResolution.x / iResolution.y;

  vec3 ro = iCameraPosition;
  vec3 rd = getRayDir(uv);

  float dist = raymarch(ro, rd);
  vec3 col = vec3(1.0); // Hintergrund weiß

  if (dist > 0.0 && dist < MAX_DIST) {
    vec3 p = ro + rd * dist;
    vec3 n = getNormal(p);
    float lighting = -dot(rd, n);
    col = vec3(lighting);
  }

  gl_FragColor = vec4(col, 1.0);
}`;

// Material and mesh
const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms
});
const quad = new THREE.Mesh(geometry, material);
scene.add(quad);

// Initial resize
resizeToMaxViewportPerspective(renderer, camera, renderer.domElement);
uniforms.iResolution.value.set(renderer.domElement.width, renderer.domElement.height);

// Resize handler
window.addEventListener('resize', () => {
  resizeToMaxViewportPerspective(renderer, camera, renderer.domElement);
  uniforms.iResolution.value.set(renderer.domElement.width, renderer.domElement.height);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  uniforms.iCameraPosition.value.copy(camera.position);
  uniforms.iViewMatrix.value.copy(camera.matrixWorldInverse);
  renderer.render(scene, camera);
}
animate();
