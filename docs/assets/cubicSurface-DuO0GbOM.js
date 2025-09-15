import"./modulepreload-polyfill-B5Qt9EMX.js";import{O as A}from"./OrbitControls-0F_4tOhn.js";import{P as m,O as y,e as x}from"./three.module-DkuOTbe3.js";import{c as h,s as g,a as E,m as C,i as M}from"./mat4-C4qrYsWx.js";const S=`#version 300 es\r
precision highp float;\r
precision highp int;\r
\r
in vec3 aPosition;\r
\r
uniform mat4 uModelView;\r
uniform mat4 uProjection;\r
\r
out vec3 vUV;   // Objektkoordinate fürs Ray-Setup im FS\r
\r
void main() {\r
  vUV = aPosition;                        // unverändert im Objektraum weiterreichen\r
  gl_Position = uProjection * uModelView * vec4(aPosition, 1.0);\r
}\r
`,B=`#version 300 es\r
precision highp float;\r
\r
in vec3 vUV;\r
\r
uniform mat4  uModelInverse;\r
uniform int   uOrthographic;\r
uniform int   uSurface;          \r
uniform float uCoeffs[20];\r
\r
uniform bool  uShowAxes;\r
uniform bool  uShowBox;\r
uniform float uHalf;\r
uniform float uEdgeThickness;\r
\r
layout(location=0) out vec4 fColor;\r
\r
const float INF = 1.0e30;\r
const float EPS = 1e-4;\r
\r
// -------- helpers (keine pow() für x^2/x^3) ---------------------------------\r
float sqr(float x)  { return x * x; }\r
float cube(float x) { return x * x * x; }\r
\r
// -------- Cubic Solver --------------------------\r
float sgn(float x) {\r
  return x < 0.0f ? -1.0f : 1.0f; // Return 1 for x == 0\r
}\r
\r
int quadratic(float A, float B, float C, out vec2 res) {\r
  float x1, x2;\r
  float b = -0.5f * B;\r
  float q = b * b - A * C;\r
  if(q < 0.0f)\r
    return 0;\r
  float r = b + sgn(b) * sqrt(q);\r
  if(r == 0.0f) {\r
    x1 = C / A;\r
    x2 = -x1;\r
  } else {\r
    x1 = C / r;\r
    x2 = r / A;\r
  }\r
  res = vec2(x1, x2);\r
  return 2;\r
}\r
\r
void eval(\r
  float X,\r
  float A,\r
  float B,\r
  float C,\r
  float D,\r
  out float Q,\r
  out float Q1,\r
  out float B1,\r
  out float C2\r
) {\r
  float q0 = A * X;\r
  B1 = q0 + B;\r
  C2 = B1 * X + C;\r
  Q1 = (q0 + B1) * X + C2;\r
  Q = C2 * X + D;\r
}\r
\r
// Solve: Ax^3 + Bx^2 + Cx + D == 0\r
// Find one real root, then reduce to quadratic.\r
int cubic(float A, float B, float C, float D, out vec3 res) {\r
  float X, b1, c2;\r
  if (A == 0.0f) {\r
    X = 1e8f;\r
    A = B;\r
    b1 = C;\r
    c2 = D;\r
  } else if (D == 0.0f) {\r
    X = 0.0f;\r
    b1 = B;\r
    c2 = C;\r
  } else {\r
    X = -(B / A) / 3.0f;\r
    float t, r, s, q, dq, x0;\r
    eval(X, A, B, C, D, q, dq, b1, c2);\r
    t = q / A;\r
    r = pow(abs(t), 1.0f / 3.0f);\r
    s = sgn(t);\r
    t = -dq / A;\r
    if (t > 0.0f)\r
      r = 1.324718f * max(r, sqrt(t));\r
    x0 = X - s * r;\r
    if (x0 != X) {\r
      for(int i = 0; i < 6; i++) {\r
        X = x0;\r
        eval(X, A, B, C, D, q, dq, b1, c2);\r
        if (dq == 0.0f)\r
          break;\r
        x0 -= (q / dq);\r
      }\r
      if (abs(A) * X * X > abs(D / X)) {\r
        c2 = -D / X;\r
        b1 = (c2 - C) / X;\r
      }\r
    }\r
  }\r
  res.x = X;\r
  return 1 + quadratic(A, b1, c2, res.yz);\r
}\r
// -------- ray / aabb ---------------------------------------------------------\r
bool rayAABB(vec3 ro, vec3 rd, float h, out float tEnter, out float tExit) {\r
  // Inverse Richtungen (für Division durch rd)\r
  vec3 invD = 1.0 / rd;\r
\r
  // Schnittpunkte mit den beiden Ebenen jeder Achse (-h, +h)\r
  vec3 t0 = (vec3(-h) - ro) * invD;\r
  vec3 t1 = (vec3( h) - ro) * invD;\r
\r
  // Für jede Achse das kleinere (tmin) und größere (tmax) nehmen\r
  vec3 tmin = min(t0, t1);\r
  vec3 tmax = max(t0, t1);\r
\r
  // Eintritts- und Austrittsparameter\r
  tEnter = max(max(tmin.x, tmin.y), tmin.z);\r
  tExit  = min(min(tmax.x, tmax.y), tmax.z);\r
\r
  // Ray trifft AABB, wenn Austritt hinter Eintritt liegt und vorwärts (t>0)\r
  return tExit > max(tEnter, 0.0);\r
}\r
// -------- gradient / normals (ohne pow) --------------------------------------\r
vec3 cubicSurfaceNormal(vec3 p, float coeffs[20]) {\r
  float c300 = coeffs[0];\r
  float c030 = coeffs[1];\r
  float c003 = coeffs[2];\r
  float c210 = coeffs[3];\r
  float c201 = coeffs[4];\r
  float c021 = coeffs[5];\r
  float c012 = coeffs[6];\r
  float c120 = coeffs[7];\r
  float c102 = coeffs[8];\r
  float c111 = coeffs[9];\r
  float c200 = coeffs[10];\r
  float c020 = coeffs[11];\r
  float c002 = coeffs[12];\r
  float c101 = coeffs[13];\r
  float c110 = coeffs[14];\r
  float c011 = coeffs[15];\r
  float c100 = coeffs[16];\r
  float c010 = coeffs[17];\r
  float c001 = coeffs[18];\r
  float c000 = coeffs[19];\r
\r
  float x=p.x, y=p.y, z=p.z;\r
\r
  vec3 n;\r
  n.x = c100 + c101*z + c102*sqr(z) + c110*y + c111*y*z + c120*sqr(y)\r
      + 2.0*c200*x + 2.0*c201*x*z + 2.0*c210*x*y + 3.0*c300*cube(x);\r
  n.y = c010 + c011*z + c012*sqr(z) + 2.0*c020*y + 2.0*c021*y*z + 3.0*c030*cube(y)\r
      + c110*x + c111*x*z + 2.0*c120*x*y + c210*sqr(x);\r
  n.z = c001 + 2.0*c002*z + 3.0*c003*cube(z) + c011*y + 2.0*c012*y*z + c021*sqr(y)\r
      + c101*x + 2.0*c102*x*z + c111*x*y + c201*sqr(x);\r
\r
  return normalize(n);\r
}\r
\r
// -------- polynomial along ray (ohne pow) ------------------------------------\r
float cubicSurfaceIntersect(vec3 ro, vec3 rd, float coeffs[20]) {\r
  float c300 = coeffs[0];\r
  float c030 = coeffs[1];\r
  float c003 = coeffs[2];\r
  float c210 = coeffs[3];\r
  float c201 = coeffs[4];\r
  float c021 = coeffs[5];\r
  float c012 = coeffs[6];\r
  float c120 = coeffs[7];\r
  float c102 = coeffs[8];\r
  float c111 = coeffs[9];\r
  float c200 = coeffs[10];\r
  float c020 = coeffs[11];\r
  float c002 = coeffs[12];\r
  float c101 = coeffs[13];\r
  float c110 = coeffs[14];\r
  float c011 = coeffs[15];\r
  float c100 = coeffs[16];\r
  float c010 = coeffs[17];\r
  float c001 = coeffs[18];\r
  float c000 = coeffs[19];\r
\r
  float rx=ro.x, ry=ro.y, rz=ro.z;\r
  float dx=rd.x, dy=rd.y, dz=rd.z;\r
\r
  float dx2 = sqr(dx), dy2 = sqr(dy), dz2 = sqr(dz);\r
  float rx2 = sqr(rx), ry2 = sqr(ry), rz2 = sqr(rz);\r
\r
  float a3 =\r
    c003*cube(dz) + c012*dy*dz2 + c021*dy2*dz +\r
    c030*cube(dy) + c102*dx*dz2 + c111*dx*dy*dz +\r
    c120*dx*dy2 + c201*dx2*dz + c210*dx2*dy +\r
    c300*cube(dx);\r
\r
  float a2 =\r
    rx*c102*dz2 + rx*c111*dy*dz + rx*c120*dy2 +\r
    2.0*rx*c201*dx*dz + 2.0*rx*c210*dx*dy + 3.0*rx*c300*dx2 +\r
    ry*c012*dz2 + 2.0*ry*c021*dy*dz + 3.0*ry*c030*dy2 +\r
    ry*c111*dx*dz + 2.0*ry*c120*dx*dy + ry*c210*dx2 +\r
    3.0*rz*c003*dz2 + 2.0*rz*c012*dy*dz + rz*c021*dy2 +\r
    2.0*rz*c102*dx*dz + rz*c111*dx*dy + rz*c201*dx2 +\r
    c002*dz2 + c011*dy*dz + c020*dy2 +\r
    c101*dx*dz + c110*dx*dy + c200*dx2;\r
\r
  float a1 =\r
    rx2*c201*dz + rx2*c210*dy + 3.0*rx2*c300*dx +\r
    rx*ry*c111*dz + 2.0*rx*ry*c120*dy + 2.0*rx*ry*c210*dx +\r
    2.0*rx*rz*c102*dz + rx*rz*c111*dy + 2.0*rx*rz*c201*dx +\r
    rx*c101*dz + rx*c110*dy + 2.0*rx*c200*dx +\r
    ry2*c021*dz + 3.0*ry2*c030*dy + ry2*c120*dx +\r
    2.0*ry*rz*c012*dz + 2.0*ry*rz*c021*dy + ry*rz*c111*dx +\r
    ry*c011*dz + 2.0*ry*c020*dy + ry*c110*dx +\r
    3.0*rz2*c003*dz + rz2*c012*dy + rz2*c102*dx +\r
    2.0*rz*c002*dz + rz*c011*dy + rz*c101*dx +\r
    c001*dz + c010*dy + c100*dx;\r
\r
  float a0 =\r
    cube(rx)*c300 + rx2*ry*c210 + rx2*rz*c201 + rx2*c200 +\r
    rx*ry2*c120 + rx*ry*rz*c111 + rx*ry*c110 +\r
    rx*rz2*c102 + rx*rz*c101 + rx*c100 +\r
    cube(ry)*c030 + ry2*rz*c021 + ry2*c020 +\r
    ry*rz2*c012 + ry*rz*c011 + ry*c010 +\r
    cube(rz)*c003 + rz2*c002 + rz*c001 + c000;\r
\r
  float tEnter, tExit;\r
  if (!rayAABB(ro, rd, uHalf, tEnter, tExit)) return -1.0;\r
  tEnter = max(tEnter, EPS);\r
\r
  vec3 roots;\r
  float t = INF;\r
  int n = cubic(a3, a2, a1, a0, roots);\r
\r
  // kleinste gültige Wurzel im [tEnter, tExit]\r
  for (int i = 0; i < n; ++i) {\r
    float ti = roots[i];\r
    if (ti < 0.0)               continue;\r
    if (ti < tEnter || ti > tExit) continue;\r
    t = min(t, ti);\r
  }\r
\r
  return (t == INF) ? -1.0 : t;\r
}\r
\r
// -------- box edges & axes-as-quadrics ---------------------------------------\r
float edgeDistance(vec3 p, float r) {\r
  vec3 d = abs(abs(p) - r);\r
  float dXY = max(d.x, d.y);\r
  float dXZ = max(d.x, d.z);\r
  float dYZ = max(d.y, d.z);\r
\r
  float t  = r + uEdgeThickness;\r
  float inX = step(abs(p.x), t);\r
  float inY = step(abs(p.y), t);\r
  float inZ = step(abs(p.z), t);\r
\r
  float BIG = 1e3;\r
  float eXY = mix(BIG, dXY, inZ);\r
  float eXZ = mix(BIG, dXZ, inY);\r
  float eYZ = mix(BIG, dYZ, inX);\r
\r
  return min(min(eXY, eXZ), eYZ);\r
}\r
\r
void zeroCoeffs(out float c[20]) { for (int i=0;i<20;i++) c[i] = 0.0; }\r
\r
void axisCoeffsX(float r, out float c[20]) {\r
  zeroCoeffs(c);\r
  c[11] = 1.0; // y^2\r
  c[12] = 1.0; // z^2\r
  c[19] = -r*r;\r
}\r
void axisCoeffsY(float r, out float c[20]) {\r
  zeroCoeffs(c);\r
  c[10] = 1.0; // x^2\r
  c[12] = 1.0; // z^2\r
  c[19] = -r*r;\r
}\r
void axisCoeffsZ(float r, out float c[20]) {\r
  zeroCoeffs(c);\r
  c[10] = 1.0; // x^2\r
  c[11] = 1.0; // y^2\r
  c[19] = -r*r;\r
}\r
\r
// -------- main ----------------------------------------------------------------\r
void main() {\r
  // Box-Kanten overlay\r
  if (uShowBox) {\r
    float d  = edgeDistance(vUV, uHalf);\r
    float aa = fwidth(d);\r
    float m  = 1.0 - smoothstep(uEdgeThickness - aa, uEdgeThickness + aa, d);\r
    if (m > 0.0) {\r
      fColor = vec4(0.0, 0.0, 0.0, 1.0);\r
      return;\r
    }\r
  }\r
\r
  // stabiler Ray im Objektraum\r
  vec3 ro = vUV;\r
\r
  // Kamera: Position (w=1) und -Z Richtung (w=0) in Objektraum\r
  vec3 camPos = (uModelInverse * vec4(0.0, 0.0, 0.0, 1.0)).xyz;\r
  vec3 rd = (uOrthographic == 1)\r
    ? normalize((uModelInverse * vec4(0.0, 0.0, -1.0, 0.0)).xyz)\r
    : normalize(ro - camPos);\r
\r
  ro += EPS * rd;\r
\r
  // 1) Hauptfläche\r
  float tCubic = cubicSurfaceIntersect(ro, rd, uCoeffs);\r
\r
  // 2) Achsen (als Quadriken in demselben 20er-Layout)\r
  float radius = max(uEdgeThickness, 0.02);\r
  float tX = -1.0, tY = -1.0, tZ = -1.0;\r
  float cx[20]; float cy[20]; float cz[20];\r
\r
  if (uShowAxes) {\r
    axisCoeffsX(radius, cx);\r
    axisCoeffsY(radius, cy);\r
    axisCoeffsZ(radius, cz);\r
    tX = cubicSurfaceIntersect(ro, rd, cx);\r
    tY = cubicSurfaceIntersect(ro, rd, cy);\r
    tZ = cubicSurfaceIntersect(ro, rd, cz);\r
  }\r
\r
  bool haveCubic = (tCubic >= 0.0);\r
  bool haveX = (tX >= 0.0);\r
  bool haveY = (tY >= 0.0);\r
  bool haveZ = (tZ >= 0.0);\r
\r
  if (!haveCubic && !haveX && !haveY && !haveZ) {\r
    discard;\r
  }\r
\r
  float tMin = INF;\r
  int   which = -1; // 0=X,1=Y,2=Z, 3=Cubic\r
\r
  if (haveX && tX < tMin) { tMin = tX; which = 0; }\r
  if (haveY && tY < tMin) { tMin = tY; which = 1; }\r
  if (haveZ && tZ < tMin) { tMin = tZ; which = 2; }\r
  if (haveCubic && tCubic < tMin) { tMin = tCubic; which = 3; }\r
\r
  vec3 p = ro + tMin * rd;\r
  vec3 n, rgb;\r
\r
  if (which == 0) {\r
    n   = normalize(cubicSurfaceNormal(p, cx));\r
    rgb = vec3(1.0, 0.0, 0.0);\r
  } else if (which == 1) {\r
    n   = normalize(cubicSurfaceNormal(p, cy));\r
    rgb = vec3(0.0, 1.0, 0.0);\r
  } else if (which == 2) {\r
    n   = normalize(cubicSurfaceNormal(p, cz));\r
    rgb = vec3(0.0, 0.0, 1.0);\r
  } else {\r
    n   = normalize(cubicSurfaceNormal(p, uCoeffs));\r
    rgb = vec3(1.0, 0.1, 0.1);\r
  }\r
\r
  // Headlight-Shading\r
  float shade = abs(dot(rd, n));\r
  rgb *= max(shade, 0.0);\r
\r
  fColor = vec4(rgb, 1.0);\r
}\r
`,z=3,X=.03;function v(r){const n=window.innerWidth,e=window.innerHeight,t=16/9;let c=n,f=n/t;f>e&&(f=e,c=e*t);const s=window.devicePixelRatio||1;r.width=Math.max(1,Math.floor(c*s)),r.height=Math.max(1,Math.floor(f*s)),r.style.width=`${c}px`,r.style.height=`${f}px`}function b(r,n,e){const t=r.createShader(n);if(r.shaderSource(t,e),r.compileShader(t),!r.getShaderParameter(t,r.COMPILE_STATUS))throw new Error(r.getShaderInfoLog(t)||"shader error");return t}function P(r,n,e){const t=r.createProgram();if(r.attachShader(t,b(r,r.VERTEX_SHADER,n)),r.attachShader(t,b(r,r.FRAGMENT_SHADER,e)),r.linkProgram(t),!r.getProgramParameter(t,r.LINK_STATUS))throw new Error(r.getProgramInfoLog(t)||"link error");return t}function q(r,n,e){const t=new Float32Array([-3,-3,-3,e,-3,-3,-3,e,-3,e,e,-3,-3,-3,e,e,-3,e,-3,e,e,e,e,e]),c=new Uint16Array([0,2,1,1,2,3,4,5,6,6,5,7,0,1,5,0,5,4,2,6,7,2,7,3,7,5,1,7,1,3,0,4,6,0,6,2]),f=r.createVertexArray();r.bindVertexArray(f);const s=r.createBuffer();r.bindBuffer(r.ARRAY_BUFFER,s),r.bufferData(r.ARRAY_BUFFER,t,r.STATIC_DRAW);const d=r.getAttribLocation(n,"aPosition");r.enableVertexAttribArray(d),r.vertexAttribPointer(d,3,r.FLOAT,!1,0,0);const a=r.createBuffer();return r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,a),r.bufferData(r.ELEMENT_ARRAY_BUFFER,c,r.STATIC_DRAW),r.bindVertexArray(null),{vao:f,iboSize:c.length}}function T(r){const n=new m(45,r,.1,100);return n.position.set(10,10,15),n.lookAt(0,0,0),n}function p(r,n){const e=new A(r,n);return e.enableDamping=!0,e.dampingFactor=.08,e.rotateSpeed=.9,e.zoomSpeed=1,e.panSpeed=.9,e.target.set(0,0,0),e.update(),e}function F(){var l;const r=document.getElementById("glcanvas");v(r);const n=r.getContext("webgl2"),e=P(n,S,B);n.useProgram(e);const{vao:t,iboSize:c}=q(n,e,z),f=r.width/r.height;let s=T(f),d=p(s,r);const a={gl:n,prog:e,vao:t,iboSize:c,uProjection:n.getUniformLocation(e,"uProjection"),uModelView:n.getUniformLocation(e,"uModelView"),uModelInverse:n.getUniformLocation(e,"uModelInverse"),uOrthographic:n.getUniformLocation(e,"uOrthographic"),uSurface:n.getUniformLocation(e,"uSurface"),uCoeffs:n.getUniformLocation(e,"uCoeffs"),uShowAxes:n.getUniformLocation(e,"uShowAxes"),uShowBox:n.getUniformLocation(e,"uShowBox"),uHalf:n.getUniformLocation(e,"uHalf"),uEdgeThickness:n.getUniformLocation(e,"uEdgeThickness"),viewMode:1,surfaceMode:1,showAxes:!0,showBox:!0,coeffs:new Float32Array([0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,-1]),camera:s,controls:d};n.clearColor(1,1,1,1),n.enable(n.DEPTH_TEST),n.enable(n.CULL_FACE),window.addEventListener("resize",()=>{v(r);const i=r.width/r.height;if(a.viewMode===2&&a.camera instanceof y){const o=(a.camera.top-a.camera.bottom)*.5;a.camera.left=-o*i,a.camera.right=o*i,a.camera.top=o,a.camera.bottom=-o,a.camera.updateProjectionMatrix()}else a.camera instanceof m&&(a.camera.aspect=i,a.camera.updateProjectionMatrix())}),window.addEventListener("message",i=>{const o=i.data||{};if(o.type==="coeffs"&&Array.isArray(o.coeffs)&&o.coeffs.length===20)a.coeffs.set(o.coeffs);else if(o.type==="controls"){if(typeof o.viewMode=="number"){const u=o.viewMode|0;u!==a.viewMode&&I(a,u)}typeof o.surfaceMode=="number"&&(a.surfaceMode=o.surfaceMode|0),typeof o.showAxes=="boolean"&&(a.showAxes=!!o.showAxes),typeof o.showBox=="boolean"&&(a.showBox=!!o.showBox)}});try{(l=window.parent)==null||l.postMessage({type:"ready"},"*")}catch{}return a}function I(r,n){const e=r.gl.canvas,t=e.width/e.height,c=r.camera,f=r.controls.target.clone(),s=c.position.clone(),d=s.clone().sub(f).length();r.controls.dispose();const a=()=>{if(c instanceof m){const o=x.degToRad(c.fov);return Math.tan(o*.5)*Math.max(d,1e-4)}else return(c.top-c.bottom)*.5},l=()=>{if(c instanceof y){const o=(c.top-c.bottom)*.5,u=2*Math.atan(Math.max(o,1e-4)/Math.max(d,1e-4));return x.clamp(x.radToDeg(u),10,75)}else return c.fov};let i;if(n===2){const o=a();i=new y(-o*t,+o*t,+o,-o,.1,100)}else{const o=l();i=new m(o,t,.1,100)}i.position.copy(s),i.lookAt(f),i.updateProjectionMatrix(),r.camera=i,r.controls=p(r.camera,e),r.controls.target.copy(f),r.controls.update(),r.viewMode=n}function R(r){const{gl:n}=r;n.viewport(0,0,n.canvas.width,n.canvas.height),n.clear(n.COLOR_BUFFER_BIT|n.DEPTH_BUFFER_BIT),n.useProgram(r.prog),n.bindVertexArray(r.vao),r.uShowBox&&n.uniform1i(r.uShowBox,r.showBox?1:0),n.uniform1f(r.uHalf,z),n.uniform1f(r.uEdgeThickness,X),n.uniform1i(r.uSurface,r.surfaceMode),n.uniform1fv(r.uCoeffs,r.coeffs),n.uniform1i(r.uOrthographic,r.viewMode===2?1:0);const e=1.6,t=(c,f)=>{f?n.colorMask(...f):n.colorMask(!0,!0,!0,!0),r.controls.update(),r.camera.updateMatrixWorld(!0),c!==0&&(r.camera.position.x-=c,r.camera.updateMatrixWorld(!0));const s=new Float32Array(r.camera.projectionMatrix.elements);n.uniformMatrix4fv(r.uProjection,!1,s);const d=new Float32Array(r.camera.matrixWorldInverse.elements),a=h();g(a,a,[e,e,e]);const l=E(d),i=h();C(i,l,a),n.uniformMatrix4fv(r.uModelView,!1,i);const o=M(h(),i);n.uniformMatrix4fv(r.uModelInverse,!1,o),n.uniform1i(r.uShowAxes,r.showAxes?1:0),n.drawElements(n.TRIANGLES,r.iboSize,n.UNSIGNED_SHORT,0),c!==0&&(r.camera.position.x+=c,r.camera.updateMatrixWorld(!0))};r.viewMode===3?(t(-.12,[!0,!1,!1,!0]),n.clear(n.DEPTH_BUFFER_BIT),t(.12,[!1,!0,!0,!0]),n.colorMask(!0,!0,!0,!0)):t(0),n.bindVertexArray(null)}function w(r){R(r),requestAnimationFrame(()=>w(r))}window.addEventListener("load",()=>{const r=F();w(r)});
