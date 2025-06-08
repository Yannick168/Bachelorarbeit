import * as THREE from 'three';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import { resizeToMaxViewportPerspective } from '../utils/resizeViewport.js';

// Renderer setup
const renderer = new THREE.WebGLRenderer();
document.body.style.margin = '0';
document.body.appendChild(renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);

// Scene and Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(3, 1.5, 4); // Position mit gutem Blick auf Spitze

// Controls
const controls = new TrackballControls(camera, renderer.domElement);
controls.target.set(0, 1.5, 0);         // 🎯 Ziel: Spitze des Kegels
controls.noPan = true;                  // 🔒 Deaktiviert Verschiebung
controls.staticMoving = true;          // Stabilisiert Bewegung
controls.update();

// Fullscreen quad geometry
const geometry = new THREE.PlaneGeometry(2, 2);

// Shader uniforms
const uniforms = {
  iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  iCameraPosition: { value: new THREE.Vector3() },
  iViewMatrix: { value: new THREE.Matrix4() },
  iProjectionMatrix: { value: new THREE.Matrix4() }
};

// Vertex Shader
const vertexShader = `
void main() {
  gl_Position = vec4(position, 1.0);
}`;

// Fragment Shader (unverändert außer ggf. MAX_DIST/MAX_STEPS)
const fragmentShader = `
precision highp float;
uniform vec2 iResolution;
uniform vec3 iCameraPosition;
uniform mat4 iViewMatrix;
uniform mat4 iProjectionMatrix;

#define MAX_STEPS 200
#define MAX_DIST 1000.0
#define SURF_DIST 0.001

float sdCone(vec3 p, float h, float r) {
  p.y += h / 2.0;
  float tanTheta = r / h;
  float q = length(p.xz);
  float side = dot(vec2(tanTheta, -1.0), vec2(q, p.y));
  float base = -p.y;
  return max(side / sqrt(tanTheta * tanTheta + 1.0), base);
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
  vec4 rayClip = vec4(uv, -1.0, 1.0);
  vec4 rayEye = inverse(iProjectionMatrix) * rayClip;
  rayEye.z = -1.0;
  rayEye.w = 0.0;
  vec4 rayWorld = inverse(iViewMatrix) * rayEye;
  return normalize(rayWorld.xyz);
}

void main() {
  vec2 uv = (gl_FragCoord.xy / iResolution.xy) * 2.0 - 1.0;
  uv.x *= iResolution.x / iResolution.y;

  vec3 ro = iCameraPosition;
  vec3 rd = getRayDir(uv);

  float dist = raymarch(ro, rd);
  vec3 col = vec3(1.0); // weißer Hintergrund

  if (dist > 0.0 && dist < MAX_DIST) {
    vec3 p = ro + rd * dist;
    vec3 n = getNormal(p);
    float lighting = -dot(rd, n);
    if (abs(n.y - 1.0) < 0.1) {
      col = vec3(0.0, 0.3, 1.0); // blauer Boden
    } else {
      col = vec3(lighting);
    }
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
  uniforms.iProjectionMatrix.value.copy(camera.projectionMatrix);
  renderer.render(scene, camera);
}
animate();
