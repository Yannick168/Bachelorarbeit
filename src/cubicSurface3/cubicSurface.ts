function resizeCanvas(canvas: HTMLCanvasElement) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const aspectRatio = 16 / 9;

  let width = vw;
  let height = vw / aspectRatio;

  if (height > vh) {
    height = vh;
    width = vh * aspectRatio;
  }

  canvas.width = width * window.devicePixelRatio;
  canvas.height = height * window.devicePixelRatio;

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.style.position = "absolute";
  canvas.style.top = "50%";
  canvas.style.left = "50%";
  canvas.style.transform = "translate(-50%, -50%)";
}

import { mat4, vec2, vec3, quat } from 'gl-matrix';

type UnitCube = {
  vao: WebGLVertexArrayObject;
  iboSize: number;
};

type AppContext = {
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  cube: UnitCube;
  projection: mat4;
  modelView: mat4;
  qNow: quat;
  mousePos: vec2;
  mousePressed: boolean;
  zoom: number;
  viewMode: number;
  curSurface: number;
};

async function loadShaderSource(url: string): Promise<string> {
  const response = await fetch(url);
  return await response.text();
}

function createShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) || 'Shader compile error');
  }
  return shader;
}

function compileShaderProgram(gl: WebGL2RenderingContext, vsSource: string, fsSource: string): WebGLProgram {
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) || 'Program link error');
  }
  return program;
}

function createUnitCube(gl: WebGL2RenderingContext, program: WebGLProgram): UnitCube {
  const vbo = new Float32Array([
    -1, -1, -1, 1, -1, -1, -1, 1, -1, 1, 1, -1,
    -1, -1,  1, 1, -1,  1, -1, 1,  1, 1, 1,  1
  ]);
  const ibo = new Uint16Array([
    0,2,1, 1,2,3, 4,5,6, 6,5,7, 0,5,4, 0,1,5,
    2,6,7, 2,7,3, 7,1,3, 7,5,1, 0,6,2, 0,4,6
  ]);
  const vao = gl.createVertexArray()!;
  gl.bindVertexArray(vao);
  const vboBuffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, vboBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vbo, gl.STATIC_DRAW);
  const posLoc = gl.getAttribLocation(program, 'aPosition');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
  const iboBuffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, ibo, gl.STATIC_DRAW);
  return { vao, iboSize: ibo.length };
}

function mouseToTrackball(gl: WebGL2RenderingContext, pos: vec2): vec3 {
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
  if (vec3.length(axis) < 1e-5) return quat.create(); // keine Rotation
  vec3.normalize(axis, axis);
  const dot = Math.max(-1, Math.min(1, vec3.dot(p1, p2))); // Clamp
  const angle = Math.acos(dot);
  return quat.setAxisAngle(quat.create(), axis, angle);
}

function drawCube(ctx: AppContext) {
  const gl = ctx.gl;
  const program = ctx.program;

  gl.uniformMatrix4fv(gl.getUniformLocation(program, 'uProjection'), false, ctx.projection);
  gl.uniformMatrix4fv(gl.getUniformLocation(program, 'uModelView'), false, ctx.modelView);

  const invModel = mat4.invert(mat4.create(), ctx.modelView);
  gl.uniformMatrix4fv(gl.getUniformLocation(program, 'uModelInverse'), false, invModel);
  console.log(ctx.curSurface)
  gl.uniform1i(gl.getUniformLocation(program, 'uSurface'), ctx.curSurface);
  gl.uniform1i(gl.getUniformLocation(program, 'uOrthographic'), ctx.viewMode === 2 ? 1 : 0);

  gl.bindVertexArray(ctx.cube.vao);
  gl.drawElements(gl.TRIANGLES, ctx.cube.iboSize, gl.UNSIGNED_SHORT, 0);
}

function drawScene(ctx: AppContext) {
  const gl = ctx.gl;
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const aspect = gl.canvas.width / gl.canvas.height;
  const mynear = 10, myfar = 100;
  const displayHeight = 30;
  const displayWidth = aspect * displayHeight;
  let camX = 0, camY = 0, camZ = 50;

  mat4.identity(ctx.projection);
  mat4.identity(ctx.modelView);

  if (ctx.viewMode === 2) {  // Orthographic
    mat4.ortho(ctx.projection, -displayWidth/2, displayWidth/2, -displayHeight/2, displayHeight/2, mynear, myfar);
  } 
  
  else if (ctx.viewMode === 1) {  // Perspective
    const l = mynear * (-displayWidth / 2 - camX) / camZ;
    const r = mynear * (displayWidth / 2 - camX) / camZ;
    const b = mynear * (-displayHeight / 2 - camY) / camZ;
    const t = mynear * (displayHeight / 2 - camY) / camZ;
    mat4.frustum(ctx.projection, l, r, b, t, mynear, myfar);
  }

  mat4.translate(ctx.modelView, ctx.modelView, [-camX, -camY, -camZ]);

  if (ctx.viewMode === 3) {
    const rotation = mat4.fromQuat(mat4.create(), ctx.qNow);
    mat4.scale(rotation, rotation, [ctx.zoom * 15, ctx.zoom * 15, ctx.zoom * 15]);

    for (const offset of [-3, 3]) {
      const l = mynear * (-displayWidth / 2 - offset) / camZ;
      const r = mynear * (displayWidth / 2 - offset) / camZ;
      const b = mynear * (-displayHeight / 2 - camY) / camZ;
      const t = mynear * (displayHeight / 2 - camY) / camZ;
      const proj = mat4.create();
      mat4.frustum(proj, l, r, b, t, mynear, myfar);
      const mv = mat4.create();
      mat4.translate(mv, mv, [-offset, -camY, -camZ]);
      mat4.multiply(ctx.modelView, mv, rotation);
      mat4.copy(ctx.projection, proj);
      gl.colorMask(offset < 0, offset > 0, offset > 0, true);
      if (offset > -3) gl.clear(gl.DEPTH_BUFFER_BIT);
      drawCube(ctx);
    }

    gl.colorMask(true, true, true, true);
  } else {
    const rotation = mat4.fromQuat(mat4.create(), ctx.qNow);
    mat4.scale(rotation, rotation, [ctx.zoom * 15, ctx.zoom * 15, ctx.zoom * 15]);
    mat4.multiply(ctx.modelView, ctx.modelView, rotation);
    drawCube(ctx);
  }
}

window.addEventListener('load', async () => {
  const canvas = document.getElementById('glcanvas') as HTMLCanvasElement;
  const gl = canvas.getContext('webgl2')!;
  resizeCanvas(canvas);
  gl.viewport(0, 0, canvas.width, canvas.height);

  const vsSource = await loadShaderSource('cubicSurface.vs.glsl');
  const fsSource = await loadShaderSource('cubicSurface.fs.glsl');
  const program = compileShaderProgram(gl, vsSource, fsSource);
  gl.useProgram(program);

  const coeffLoc = gl.getUniformLocation(program, "uCoeffs");

  document.getElementById("applyCoeffs")!.addEventListener("click", () => {
    const coeffs = (window as any).getUserCoeffs();
    if (coeffs.length !== 20) {
      alert("Bitte genau 20 Koeffizienten eingeben.");
      return;
    }
    gl.useProgram(program);
    gl.uniform1fv(coeffLoc, new Float32Array(coeffs));
    drawScene(ctx);
  });


  const cube = createUnitCube(gl, program);
  const ctx: AppContext = {
    gl, program, cube,
    projection: mat4.create(),
    modelView: mat4.create(),
    qNow: quat.create(),
    mousePos: vec2.create(),
    mousePressed: false,
    zoom: 1.0,
    viewMode: 1,
    curSurface: 1,
  };

  gl.clearColor(0.5, 0.5, 0.5, 1);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  canvas.addEventListener('mousedown', e => {
    ctx.mousePressed = true;
    vec2.set(ctx.mousePos, e.clientX, e.clientY);
  });

  canvas.addEventListener('mouseup', () => ctx.mousePressed = false);
  canvas.addEventListener('mousemove', e => {
    if (!ctx.mousePressed) return;
    const newPos = vec2.fromValues(e.clientX, e.clientY);
    const p0 = mouseToTrackball(gl, ctx.mousePos);
    const p1 = mouseToTrackball(gl, newPos);
    const rot = trackball(p0, p1);
    quat.multiply(ctx.qNow, rot, ctx.qNow);  // ← alternativ: ctx.qNow * rot
    vec2.copy(ctx.mousePos, newPos);
    drawScene(ctx);
  });

  canvas.addEventListener('wheel', e => {
    ctx.zoom *= e.deltaY > 0 ? 1/1.1 : 1.1;
    drawScene(ctx);
  });

  document.getElementById('viewMode')!.addEventListener('change', e => {
    ctx.viewMode = parseInt((e.target as HTMLSelectElement).value);
    drawScene(ctx);
  });

  document.getElementById('surfaceMode')!.addEventListener('change', e => {
    ctx.curSurface = parseInt((e.target as HTMLSelectElement).value);
    drawScene(ctx);
  });

  function renderLoop() {
    drawScene(ctx);
    requestAnimationFrame(renderLoop);
  }
  window.addEventListener('resize', () => {
    resizeCanvas(canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
  });

  renderLoop();
});
