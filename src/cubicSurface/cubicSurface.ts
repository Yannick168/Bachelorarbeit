// file: cubicSurfaceApp.ts
import { mat4 } from 'gl-matrix';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import vsSource from './cubicSurface.vs.glsl?raw';
import fsSource from './cubicSurface.fs.glsl?raw';

type GL = WebGL2RenderingContext;

type Ctx = {
  gl: GL;
  prog: WebGLProgram;
  vao: WebGLVertexArrayObject;
  iboSize: number;

  uProjection: WebGLUniformLocation | null;
  uModelView: WebGLUniformLocation | null;
  uModelInverse: WebGLUniformLocation | null;

  uOrthographic: WebGLUniformLocation | null;
  uSurface: WebGLUniformLocation | null;
  uCoeffs: WebGLUniformLocation | null;

  uShowAxes: WebGLUniformLocation | null;

  uShowBox: WebGLUniformLocation | null;
  uHalf: WebGLUniformLocation | null;
  uEdgeThickness: WebGLUniformLocation | null;

  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  controls: OrbitControls;

  viewMode: number;   // 1=persp, 2=ortho, 3=stereo
  surfaceMode: number;
  showAxes: boolean;
  showBox: boolean;
  coeffs: Float32Array;
};

const HALF = 3.0;
const EDGE_THICK = 0.03;

// --- helpers ---------------------------------------------------
function resizeCanvas(canvas: HTMLCanvasElement){
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const aspect = 16/9;
  let w = vw, h = vw/aspect;
  if (h > vh) { h = vh; w = vh*aspect; }
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(w*dpr));
  canvas.height = Math.max(1, Math.floor(h*dpr));
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
}

function shader(gl: GL, type: number, src: string){
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader error');
  return s;
}
function program(gl: GL, vs: string, fs: string){
  const p = gl.createProgram()!;
  gl.attachShader(p, shader(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(p, shader(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || 'link error');
  return p;
}

function createCube(gl: GL, prog: WebGLProgram){
  const r = HALF;
  const v = new Float32Array([
    -r,-r,-r,  r,-r,-r,  -r, r,-r,   r, r,-r,
    -r,-r, r,  r,-r, r,  -r, r, r,   r, r, r
  ]);
  const i = new Uint16Array([
    0,2,1, 1,2,3,   // -Z
    4,5,6, 6,5,7,   // +Z
    0,1,5, 0,5,4,   // -Y
    2,6,7, 2,7,3,   // +Y
    7,5,1, 7,1,3,   // +X
    0,4,6, 0,6,2    // -X
  ]);
  const vao = gl.createVertexArray()!;
  gl.bindVertexArray(vao);

  const vbo = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, v, gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'aPosition');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);

  const ibo = gl.createBuffer()!;
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, i, gl.STATIC_DRAW);

  gl.bindVertexArray(null);
  return { vao, iboSize: i.length };
}

// --- three camera/controls ---------------
function makePerspective(aspect: number) {
  const cam = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
  cam.position.set(10, 10, 15);
  cam.lookAt(0, 0, 0);
  return cam;
}
function makeControls(camera: THREE.Camera, canvas: HTMLCanvasElement){
  const controls = new OrbitControls(camera as any, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.rotateSpeed = 0.9;
  controls.zoomSpeed = 1.0;
  controls.panSpeed = 0.9;
  controls.target.set(0, 0, 0);
  controls.update();
  return controls;
}

// --- init --------------------------------
function init(): Ctx {
  const canvas = document.getElementById('glcanvas') as HTMLCanvasElement;
  resizeCanvas(canvas);
  const gl = canvas.getContext('webgl2')!;
  const prog = program(gl, vsSource, fsSource);
  gl.useProgram(prog);

  const { vao, iboSize } = createCube(gl, prog);

  const aspect = canvas.width / canvas.height;
  let camera: THREE.PerspectiveCamera | THREE.OrthographicCamera = makePerspective(aspect);
  let controls = makeControls(camera, canvas);

  const ctx: Ctx = {
    gl, prog, vao, iboSize,
    uProjection: gl.getUniformLocation(prog, 'uProjection'),
    uModelView: gl.getUniformLocation(prog, 'uModelView'),
    uModelInverse: gl.getUniformLocation(prog, 'uModelInverse'),
    uOrthographic: gl.getUniformLocation(prog, 'uOrthographic'),
    uSurface: gl.getUniformLocation(prog, 'uSurface'),
    uCoeffs: gl.getUniformLocation(prog, 'uCoeffs'),
    uShowAxes: gl.getUniformLocation(prog, 'uShowAxes'),
    uShowBox: gl.getUniformLocation(prog, 'uShowBox'),
    uHalf: gl.getUniformLocation(prog, 'uHalf'),
    uEdgeThickness: gl.getUniformLocation(prog, 'uEdgeThickness'),
    viewMode: 1,
    surfaceMode: 1,
    showAxes: true,
    showBox: true,
    coeffs: new Float32Array([
      0, 0, 0, 
      0, 0, 0, 0, 0, 0, 0,
      1, 1, 1,
      0, 0, 0,
      0, 0, 0, -1
    ]),
    camera, controls
  };

  gl.clearColor(1,1,1,1);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  // resize
  window.addEventListener('resize', () => {
    resizeCanvas(canvas);
    const aspect = canvas.width / canvas.height;
    if (ctx.viewMode === 2 && ctx.camera instanceof THREE.OrthographicCamera) {
      const halfHeight = (ctx.camera.top - ctx.camera.bottom) * 0.5;
      ctx.camera.left   = -halfHeight * aspect;
      ctx.camera.right  =  halfHeight * aspect;
      ctx.camera.top    =  halfHeight;
      ctx.camera.bottom = -halfHeight;
      ctx.camera.updateProjectionMatrix();
    } else if (ctx.camera instanceof THREE.PerspectiveCamera) {
      ctx.camera.aspect = aspect;
      ctx.camera.updateProjectionMatrix();
    }
  });

  // widget messaging
  window.addEventListener('message', (e: MessageEvent<any>) => {
    const d = e.data || {};
    if (d.type === 'coeffs' && Array.isArray(d.coeffs) && d.coeffs.length === 20){
      ctx.coeffs.set(d.coeffs);
    } else if (d.type === 'controls') {
      if (typeof d.viewMode === 'number') {
        const newMode = d.viewMode|0;
        if (newMode !== ctx.viewMode) switchCamera(ctx, newMode);
      }
      if (typeof d.surfaceMode === 'number') ctx.surfaceMode = d.surfaceMode|0;
      if (typeof d.showAxes === 'boolean') ctx.showAxes = !!d.showAxes;
      if (typeof d.showBox === 'boolean') ctx.showBox = !!d.showBox;
    }
  });

  try { window.parent?.postMessage({ type: 'ready' }, '*'); } catch {}

  return ctx;
}

function switchCamera(ctx: Ctx, newMode: number){
  const canvas = ctx.gl.canvas as HTMLCanvasElement;
  const aspect = canvas.width / canvas.height;

  const oldCam = ctx.camera;
  const oldTarget = ctx.controls.target.clone();
  const oldPos = (oldCam as any).position.clone();
  const dist = oldPos.clone().sub(oldTarget).length();

  ctx.controls.dispose();

  const getHalfHeightFromOld = () => {
    if (oldCam instanceof THREE.PerspectiveCamera) {
      const fovRad = THREE.MathUtils.degToRad(oldCam.fov);
      return Math.tan(fovRad * 0.5) * Math.max(dist, 1e-4);
    } else {
      return (oldCam.top - oldCam.bottom) * 0.5;
    }
  };
  const getFovFromOld = () => {
    if (oldCam instanceof THREE.OrthographicCamera) {
      const hh = (oldCam.top - oldCam.bottom) * 0.5;
      const fovRad = 2 * Math.atan(Math.max(hh, 1e-4) / Math.max(dist, 1e-4));
      return THREE.MathUtils.clamp(THREE.MathUtils.radToDeg(fovRad), 10, 75);
    } else {
      return (oldCam as THREE.PerspectiveCamera).fov;
    }
  };

  let newCam: THREE.PerspectiveCamera | THREE.OrthographicCamera;

  if (newMode === 2) {
    const halfHeight = getHalfHeightFromOld();
    newCam = new THREE.OrthographicCamera(
      -halfHeight * aspect, +halfHeight * aspect,
      +halfHeight, -halfHeight,
      0.1, 100
    );
  } else {
    const fovDeg = getFovFromOld();
    newCam = new THREE.PerspectiveCamera(fovDeg, aspect, 0.1, 100);
  }

  newCam.position.copy(oldPos);
  newCam.lookAt(oldTarget);
  newCam.updateProjectionMatrix();

  ctx.camera = newCam;
  ctx.controls = makeControls(ctx.camera, canvas);
  ctx.controls.target.copy(oldTarget);
  ctx.controls.update();

  ctx.viewMode = newMode;
}

// --- draw/loop ---------------------------
function draw(ctx: Ctx){
  const { gl } = ctx;
  gl.viewport(0,0,gl.canvas.width, gl.canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.useProgram(ctx.prog);
  gl.bindVertexArray(ctx.vao);
  if (ctx.uShowBox) gl.uniform1i(ctx.uShowBox, ctx.showBox ? 1 : 0);
  gl.uniform1f(ctx.uHalf, HALF);
  gl.uniform1f(ctx.uEdgeThickness, EDGE_THICK);
  gl.uniform1i(ctx.uSurface, ctx.surfaceMode);
  gl.uniform1fv(ctx.uCoeffs, ctx.coeffs);
  gl.uniform1i(ctx.uOrthographic, (ctx.viewMode===2) ? 1 : 0);

  const baseScale = 1.6;

  const applyPass = (eyeOffsetX: number, colorMask?: [boolean,boolean,boolean,boolean]) => {
    if (colorMask) gl.colorMask(...colorMask); else gl.colorMask(true,true,true,true);

    ctx.controls.update();
    ctx.camera.updateMatrixWorld(true);

    if (eyeOffsetX !== 0) {
      ctx.camera.position.x -= eyeOffsetX;
      ctx.camera.updateMatrixWorld(true);
    }

    const projArr = new Float32Array((ctx.camera.projectionMatrix as THREE.Matrix4).elements);
    gl.uniformMatrix4fv(ctx.uProjection, false, projArr);

    const viewArr = new Float32Array((ctx.camera.matrixWorldInverse as THREE.Matrix4).elements);

    const model = mat4.create();
    mat4.scale(model, model, [baseScale, baseScale, baseScale]);

    const view = mat4.clone(viewArr as unknown as Float32Array);
    const mv = mat4.create();
    mat4.multiply(mv, view, model);
    gl.uniformMatrix4fv(ctx.uModelView, false, mv);

    const invMV = mat4.invert(mat4.create(), mv)!;
    gl.uniformMatrix4fv(ctx.uModelInverse, false, invMV);

    gl.uniform1i(ctx.uShowAxes, ctx.showAxes ? 1 : 0);

    gl.drawElements(gl.TRIANGLES, ctx.iboSize, gl.UNSIGNED_SHORT, 0);

    if (eyeOffsetX !== 0) {
      ctx.camera.position.x += eyeOffsetX;
      ctx.camera.updateMatrixWorld(true);
    }
  };

  if (ctx.viewMode === 3) {
    applyPass(-0.12, [true,false,false,true]);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    applyPass(+0.12, [false,true,true,true]);
    gl.colorMask(true,true,true,true);
  } else {
    applyPass(0.0);
  }

  gl.bindVertexArray(null);
}

function loop(ctx: Ctx){
  draw(ctx);
  requestAnimationFrame(() => loop(ctx));
}

// --- boot --------------------------------
window.addEventListener('load', () => {
  const ctx = init();
  loop(ctx);
});
