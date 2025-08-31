// cubicSurface.ts — Trackball-Version ohne three.js
import { mat4, vec2, vec3, quat } from 'gl-matrix';

import vsSource from './cubicSurface.vs.glsl?raw';
import fsSource from './cubicSurface.fs.glsl?raw';

type GL = WebGL2RenderingContext;

type Ctx = {
  gl: GL;
  prog: WebGLProgram;
  vao: WebGLVertexArrayObject;
  iboSize: number;

  // Uniforms
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

  // Trackball-Status
  qNow: quat;
  mousePos: vec2;
  mousePressed: boolean;
  zoom: number;

  // UI/State
  viewMode: number;     // 1=persp, 2=ortho, 3=stereo
  surfaceMode: number;
  showAxes: boolean;
  showBox: boolean;
  coeffs: Float32Array;
};

// Einstellungen
const HALF = 3.0;         // muss mit Shader & Box-Geom übereinstimmen
const EDGE_THICK = 0.03;

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
  canvas.style.position = 'absolute';
  canvas.style.left = '50%';
  canvas.style.top = '50%';
  canvas.style.transform = 'translate(-50%, -50%)';
}

function shader(gl: GL, type: number, src: string){
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(s) || 'shader error');
  }
  return s;
}
function program(gl: GL, vs: string, fs: string){
  const p = gl.createProgram()!;
  gl.attachShader(p, shader(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(p, shader(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(p) || 'link error');
  }
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

// Trackball-Helfer
function mouseToTrackball(gl: GL, pos: vec2): vec3 {
  const canvas = gl.canvas as HTMLCanvasElement;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const x = (2 * pos[0] - w) / w;
  const y = (h - 2 * pos[1]) / h;
  const z2 = 1 - x*x - y*y;
  const z = z2 > 0 ? Math.sqrt(z2) : 0;
  return vec3.fromValues(x, y, z);
}
function trackball(p1: vec3, p2: vec3): quat {
  const axis = vec3.create();
  vec3.cross(axis, p1, p2);
  if (vec3.length(axis) < 1e-5) return quat.create();
  vec3.normalize(axis, axis);
  const dot = Math.max(-1, Math.min(1, vec3.dot(p1, p2)));
  const angle = Math.acos(dot);
  return quat.setAxisAngle(quat.create(), axis, angle);
}

// Initialisierung
function init(): Ctx {
  const canvas = document.getElementById('glcanvas') as HTMLCanvasElement;
  resizeCanvas(canvas);
  const gl = canvas.getContext('webgl2')!;
  if (!gl) throw new Error('WebGL2 not available');
  const prog = program(gl, vsSource, fsSource);
  gl.useProgram(prog);

  const { vao, iboSize } = createCube(gl, prog);

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

    qNow: quat.create(),
    mousePos: vec2.create(),
    mousePressed: false,
    zoom: 0.5,

    viewMode: 1,
    surfaceMode: 1,
    showAxes: true,
    showBox: true,
    coeffs: new Float32Array([ 0,0,0, 0,0,0,0,0,0,0, 1,1,1, 0,0,0, 0,0,0, -1 ]),
  };

  gl.clearColor(1,1,1,1);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  // Widget/Message-Brücke (optional – wie in deinem Projekt)
  window.addEventListener('message', (e: MessageEvent<any>) => {
    const d = e.data || {};
    if (d.type === 'coeffs' && Array.isArray(d.coeffs) && d.coeffs.length === 20){
      ctx.coeffs.set(d.coeffs);
    } else if (d.type === 'controls') {
      if (typeof d.viewMode === 'number') ctx.viewMode = d.viewMode|0;
      if (typeof d.surfaceMode !== 'undefined') {
        if (typeof d.surfaceMode === 'number') ctx.surfaceMode = d.surfaceMode|0;
        else if (typeof d.surfaceMode === 'string') {
          const map: Record<string, number> = {
            sphere:1, clebsch:2, cayley:3, monkeySaddle:4, cylinder:5, crosspropeller:6, custom:7
          };
          ctx.surfaceMode = map[d.surfaceMode] ?? ctx.surfaceMode;
        }
      }
      if (typeof d.showAxes === 'boolean') ctx.showAxes = !!d.showAxes;
      if (typeof d.showBox  === 'boolean') ctx.showBox  = !!d.showBox;
    }
  });
  try { window.parent?.postMessage({ type: 'ready' }, '*'); } catch {}

  // Maus/Scroll — Trackball
  canvas.addEventListener('mousedown', e => {
    ctx.mousePressed = true;
    vec2.set(ctx.mousePos, e.clientX, e.clientY);
  });
  canvas.addEventListener('mouseup',   () => { ctx.mousePressed = false; });
  canvas.addEventListener('mouseleave',() => { ctx.mousePressed = false; });
  canvas.addEventListener('mousemove', e => {
    if (!ctx.mousePressed) return;
    const newPos = vec2.fromValues(e.clientX, e.clientY);
    const p0 = mouseToTrackball(gl, ctx.mousePos);
    const p1 = mouseToTrackball(gl, newPos);
    const rot = trackball(p0, p1);
    quat.multiply(ctx.qNow, rot, ctx.qNow);
    vec2.copy(ctx.mousePos, newPos);
  });
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    ctx.zoom *= e.deltaY > 0 ? 1/1.1 : 1.1;
  }, { passive:false });

  // UI-Dropdowns (falls vorhanden)
  document.getElementById('viewMode')?.addEventListener('change', e => {
    ctx.viewMode = parseInt((e.target as HTMLSelectElement).value);
  });
  document.getElementById('surfaceMode')?.addEventListener('change', e => {
    ctx.surfaceMode = parseInt((e.target as HTMLSelectElement).value);
  });

  // Resize
  window.addEventListener('resize', () => {
    resizeCanvas(canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
  });

  return ctx;
}

// Einmal zeichnen
function draw(ctx: Ctx){
  const { gl } = ctx;
  gl.viewport(0,0,gl.canvas.width, gl.canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.useProgram(ctx.prog);
  gl.bindVertexArray(ctx.vao);

  // Uniforms, die pro Frame gleich bleiben
  if (ctx.uShowBox) gl.uniform1i(ctx.uShowBox, ctx.showBox ? 1 : 0);
  if (ctx.uShowAxes) gl.uniform1i(ctx.uShowAxes, ctx.showAxes ? 1 : 0);
  if (ctx.uHalf) gl.uniform1f(ctx.uHalf, HALF);
  if (ctx.uEdgeThickness) gl.uniform1f(ctx.uEdgeThickness, EDGE_THICK);
  if (ctx.uSurface) gl.uniform1i(ctx.uSurface, ctx.surfaceMode);
  if (ctx.uCoeffs) gl.uniform1fv(ctx.uCoeffs, ctx.coeffs);
  if (ctx.uOrthographic) gl.uniform1i(ctx.uOrthographic, (ctx.viewMode===2) ? 1 : 0);

  // Kamera/Projektion wie im alten Code
  const aspect = gl.canvas.width / gl.canvas.height;
  const mynear = 10, myfar = 100;
  const displayHeight = 30;
  const displayWidth = aspect * displayHeight;
  const camX = 0, camY = 0, camZ = 50;

  // Projektion
  const P = mat4.create();
  if (ctx.viewMode === 2) {
    mat4.ortho(P, -displayWidth/2, displayWidth/2, -displayHeight/2, displayHeight/2, mynear, myfar);
  } else {
    const l = mynear * (-displayWidth / 2 - camX) / camZ;
    const r = mynear * ( displayWidth / 2 - camX) / camZ;
    const b = mynear * (-displayHeight / 2 - camY) / camZ;
    const t = mynear * ( displayHeight / 2 - camY) / camZ;
    mat4.frustum(P, l, r, b, t, mynear, myfar);
  }
  gl.uniformMatrix4fv(ctx.uProjection, false, P);

  // ModelView = View * Model
  const V = mat4.create();
  mat4.translate(V, V, [-camX, -camY, -camZ]);

  const R = mat4.fromQuat(mat4.create(), ctx.qNow);
  const S = mat4.create();
  const baseScale = 15 * ctx.zoom;
  mat4.scale(S, S, [baseScale, baseScale, baseScale]);

  const M = mat4.create();
  mat4.multiply(M, R, S);        // M = R*S

  const MV = mat4.create();
  mat4.multiply(MV, V, M);       // MV = V*M
  gl.uniformMatrix4fv(ctx.uModelView, false, MV);

  const invMV = mat4.invert(mat4.create(), MV)!;
  gl.uniformMatrix4fv(ctx.uModelInverse, false, invMV);

  // Stereo?
  if (ctx.viewMode === 3) {
    const eyeOffset = 1.5;

    // Linkes Auge – Rot
    gl.colorMask(true, false, false, true);
    {
      const PLeft = mat4.create();
      mat4.frustum(
        PLeft,
        mynear * (-displayWidth/2 - eyeOffset) / camZ,
        mynear * ( displayWidth/2 - eyeOffset) / camZ,
        mynear * (-displayHeight/2 - camY) / camZ,
        mynear * ( displayHeight/2 - camY) / camZ,
        mynear, myfar
      );
      const MLeft = mat4.create();
      mat4.translate(MLeft, MLeft, [-eyeOffset, -camY, -camZ]);
      const MVLeft = mat4.create();
      const MR = mat4.create(); mat4.multiply(MR, R, S);
      mat4.multiply(MVLeft, MLeft, MR);
      gl.uniformMatrix4fv(ctx.uProjection, false, PLeft);
      gl.uniformMatrix4fv(ctx.uModelView, false, MVLeft);
      const invMVLeft = mat4.invert(mat4.create(), MVLeft)!;
      gl.uniformMatrix4fv(ctx.uModelInverse, false, invMVLeft);
      gl.drawElements(gl.TRIANGLES, ctx.iboSize, gl.UNSIGNED_SHORT, 0);
    }

    // Rechtes Auge – Cyan
    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.colorMask(false, true, true, true);
    {
      const PRight = mat4.create();
      mat4.frustum(
        PRight,
        mynear * (-displayWidth/2 + eyeOffset) / camZ,
        mynear * ( displayWidth/2 + eyeOffset) / camZ,
        mynear * (-displayHeight/2 - camY) / camZ,
        mynear * ( displayHeight/2 - camY) / camZ,
        mynear, myfar
      );
      const MRight = mat4.create();
      mat4.translate(MRight, MRight, [eyeOffset, -camY, -camZ]);
      const MVRight = mat4.create();
      const MR = mat4.create(); mat4.multiply(MR, R, S);
      mat4.multiply(MVRight, MRight, MR);
      gl.uniformMatrix4fv(ctx.uProjection, false, PRight);
      gl.uniformMatrix4fv(ctx.uModelView, false, MVRight);
      const invMVRight = mat4.invert(mat4.create(), MVRight)!;
      gl.uniformMatrix4fv(ctx.uModelInverse, false, invMVRight);
      gl.drawElements(gl.TRIANGLES, ctx.iboSize, gl.UNSIGNED_SHORT, 0);
    }

    gl.colorMask(true, true, true, true);
  } else {
    // normaler Pass
    gl.drawElements(gl.TRIANGLES, ctx.iboSize, gl.UNSIGNED_SHORT, 0);
  }

  gl.bindVertexArray(null);
}

function loop(ctx: Ctx){
  draw(ctx);
  requestAnimationFrame(() => loop(ctx));
}

window.addEventListener('load', () => {
  const canvas = document.getElementById('glcanvas') as HTMLCanvasElement;
  const ctx = init();
  const gl = ctx.gl;
  gl.viewport(0,0,canvas.width,canvas.height);
  loop(ctx);
});
