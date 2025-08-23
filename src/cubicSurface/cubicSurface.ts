import { mat4, vec2, vec3, quat } from 'gl-matrix';
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

  uShowBox: WebGLUniformLocation | null;
  uHalf: WebGLUniformLocation | null;
  uEdgeThickness: WebGLUniformLocation | null;

  // Kamera/Interaktion
  qRot: quat;
  zoom: number;
  mouseDown: boolean;
  mouse: vec2;

  // Controls
  viewMode: number;   // 1=persp, 2=ortho, 3=stereo
  surfaceMode: number;

  coeffs: Float32Array;
};

const HALF = 3.0;             // muss mit Shader-Uniform uHalf und Boxgeometrie übereinstimmen
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

function init(): Ctx {
  const canvas = document.getElementById('glcanvas') as HTMLCanvasElement;
  resizeCanvas(canvas);
  const gl = canvas.getContext('webgl2')!;
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
    uShowBox: gl.getUniformLocation(prog, 'uShowBox'),
    uHalf: gl.getUniformLocation(prog, 'uHalf'),
    uEdgeThickness: gl.getUniformLocation(prog, 'uEdgeThickness'),
    qRot: quat.create(),
    zoom: 0.9,
    mouseDown: false,
    mouse: vec2.create(),
    viewMode: 1,
    surfaceMode: 1,
    // Start: Kugel x^2 + y^2 + z^2 - 1 = 0
    coeffs: new Float32Array([ 0,0,0, 0,0,0,0,0,0,0, 1,1,1, 0,0,0, 0,0,0, -1 ])
  };

  gl.clearColor(1,1,1,1);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  // User-Interaktion (Arcball)
  canvas.addEventListener('mousedown', e => { ctx.mouseDown = true; vec2.set(ctx.mouse, e.clientX, e.clientY); });
  canvas.addEventListener('mouseup', () => ctx.mouseDown = false);
  canvas.addEventListener('mousemove', e => {
    if (!ctx.mouseDown) return;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    const map = (x:number,y:number) => {
      const X = (2*x - w)/w, Y = (h - 2*y)/h;
      const zz = 1 - X*X - Y*Y;
      return vec3.fromValues(X, Y, zz>0?Math.sqrt(zz):0);
    };
    const p0 = map(ctx.mouse[0], ctx.mouse[1]);
    const p1 = map(e.clientX, e.clientY);
    const axis = vec3.create(); vec3.cross(axis, p0, p1);
    if (vec3.length(axis) > 1e-6){
      vec3.normalize(axis, axis);
      const ang = Math.acos(Math.max(-1, Math.min(1, vec3.dot(p0, p1))));
      const dq = quat.setAxisAngle(quat.create(), axis, ang);
      quat.multiply(ctx.qRot, dq, ctx.qRot);
    }
    vec2.set(ctx.mouse, e.clientX, e.clientY);
  });
  canvas.addEventListener('wheel', e => { e.preventDefault(); ctx.zoom *= (e.deltaY>0) ? 1/1.05 : 1.05; }, { passive:false });
  window.addEventListener('resize', () => resizeCanvas(canvas));

  // Messaging vom Widget
  window.addEventListener('message', (e: MessageEvent<any>) => {
    const d = e.data || {};
    if (d.type === 'coeffs' && Array.isArray(d.coeffs) && d.coeffs.length === 20){
      ctx.coeffs.set(d.coeffs);
    } else if (d.type === 'controls') {
      if (typeof d.viewMode === 'number') ctx.viewMode = d.viewMode|0;
      if (typeof d.surfaceMode === 'number') ctx.surfaceMode = d.surfaceMode|0;
    }
  });

  // ready -> Widget
  try { window.parent?.postMessage({ type: 'ready' }, '*'); } catch {}

  return ctx;
}

function draw(ctx: Ctx){
  const { gl } = ctx;
  gl.viewport(0,0,gl.canvas.width, gl.canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // gemeinsame Einstellungen
  gl.useProgram(ctx.prog);
  gl.bindVertexArray(ctx.vao);
  gl.uniform1i(ctx.uShowBox, 1);
  gl.uniform1f(ctx.uHalf, HALF);
  gl.uniform1f(ctx.uEdgeThickness, EDGE_THICK);
  gl.uniform1i(ctx.uSurface, ctx.surfaceMode);
  gl.uniform1fv(ctx.uCoeffs, ctx.coeffs);
  gl.uniform1i(ctx.uOrthographic, (ctx.viewMode===2) ? 1 : 0);

  // Kamera/Model-View
  const aspect = gl.canvas.width / gl.canvas.height;
  const proj = mat4.create();
  const mv = mat4.create();

  const near = 0.1, far = 100.0;
  const dist = 8.0;
  const baseScale = ctx.zoom * 1.6;

  const applyPass = (eyeOffsetX: number, colorMask?: [boolean,boolean,boolean,boolean]) => {
    if (colorMask) gl.colorMask(...colorMask); else gl.colorMask(true,true,true,true);

    // Projection
    if (ctx.viewMode === 2) {
      const size = 5.0 / ctx.zoom;
      mat4.ortho(proj, -size*aspect, size*aspect, -size, size, near, far);
    } else {
      mat4.perspective(proj, Math.PI/4, aspect, near, far);
    }

    // ModelView
    mat4.identity(mv);
    // Kamera leicht versetzen für Stereo
    mat4.translate(mv, mv, [ -eyeOffsetX, 0, -dist ]);
    const rot = mat4.fromQuat(mat4.create(), ctx.qRot);
    mat4.multiply(mv, mv, rot);
    mat4.scale(mv, mv, [baseScale, baseScale, baseScale]);

    // Uniforms setzen
    gl.uniformMatrix4fv(ctx.uProjection, false, proj);
    gl.uniformMatrix4fv(ctx.uModelView, false, mv);

    // Inverse(ModelView) -> Fragment nutzt uModelInverse für Ray-Build
    const invMV = mat4.invert(mat4.create(), mv)!;
    gl.uniformMatrix4fv(ctx.uModelInverse, false, invMV);

    // draw
    gl.drawElements(gl.TRIANGLES, ctx.iboSize, gl.UNSIGNED_SHORT, 0);
  };

  if (ctx.viewMode === 3) {
    // Stereo (Rot/Cyan)
    applyPass(-0.12, [true,false,false,true]);        // links rot
    gl.clear(gl.DEPTH_BUFFER_BIT);
    applyPass(+0.12, [false,true,true,true]);        // rechts cyan
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

window.addEventListener('load', () => {
  const ctx = init();
  loop(ctx);
});
