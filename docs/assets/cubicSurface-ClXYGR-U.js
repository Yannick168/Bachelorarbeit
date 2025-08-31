import"./modulepreload-polyfill-B5Qt9EMX.js";import{O as A}from"./OrbitControls-BGrLWSQq.js";import{P as p,O as v,n as m}from"./three.module-Cv04BlQJ.js";import{c as h,s as g,b as M,m as E,i as S}from"./mat4-C5X1qZ4b.js";const C=`#version 300 es\r
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
uniform int   uSurface;\r
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
// ---------------------------------------------------------\r
// robust quadratic & cubic\r
// ---------------------------------------------------------\r
float cbrt_safe(float x) { return (x >= 0.0) ? pow(x, 1.0/3.0) : -pow(-x, 1.0/3.0); }\r
\r
void sort3(inout vec3 v) {\r
  if (v.x > v.y) { float t=v.x; v.x=v.y; v.y=t; }\r
  if (v.y > v.z) { float t=v.y; v.y=v.z; v.z=t; }\r
  if (v.x > v.y) { float t=v.x; v.x=v.y; v.y=t; }\r
}\r
\r
int quadratic(float A, float B, float C, out vec2 r) {\r
  float scale = max(max(abs(A), abs(B)), abs(C));\r
  float eps = 1e-6 * (scale + 1.0);\r
  r = vec2(INF);\r
\r
  if (abs(A) < eps) {\r
    if (abs(B) < eps) return 0;   // degeneriert\r
    r.x = -C / B;                  // linear\r
    return 1;\r
  }\r
\r
  float disc = B*B - 4.0*A*C;\r
  if (disc < -eps) return 0;\r
\r
  if (abs(disc) <= eps) {\r
    r.x = -0.5*B / A;\r
    return 1;\r
  }\r
\r
  float s = sqrt(max(disc, 0.0));\r
  float q = -0.5 * (B + sign(B) * s);\r
  float r1 = q / A;\r
  float r2 = C / q;\r
  if (r1 <= r2) r = vec2(r1, r2); else r = vec2(r2, r1);\r
  return 2;\r
}\r
\r
int cubic(float A, float B, float C, float D, out vec3 res) {\r
  float scale = max(max(abs(A), abs(B)), max(abs(C), abs(D)));\r
  float eps = 1e-6 * (scale + 1.0);\r
  res = vec3(INF);\r
\r
  // Fast-Quadratik (t^3 ~ 0)\r
  if (abs(A) < eps) {\r
    vec2 q; int nq = quadratic(B, C, D, q);\r
    if (nq == 2) res = vec3(q.x, q.y, INF);\r
    else if (nq == 1) res = vec3(q.x, INF, INF);\r
    return nq;\r
  }\r
\r
  // t ~ 0\r
  if (abs(D) < eps) {\r
    vec2 q; int nq = quadratic(A, B, C, q);\r
    if (nq == 2) res = vec3(0.0, q.x, q.y);\r
    else if (nq == 1) res = vec3(0.0, q.x, INF);\r
    else res = vec3(0.0, INF, INF);\r
    sort3(res);\r
    return 1 + nq;\r
  }\r
\r
  // monisch: t^3 + a t^2 + b t + c = 0\r
  float a = B / A, b = C / A, c = D / A;\r
\r
  // depressiert: y^3 + p y + q = 0, t = y - a/3\r
  float a3 = a / 3.0;\r
  float p  = b - a*a/3.0;\r
  float q  = 2.0*a*a*a/27.0 - a*b/3.0 + c;\r
\r
  float half_q  = 0.5 * q;\r
  float third_p = p / 3.0;\r
  float disc = half_q*half_q + third_p*third_p*third_p;\r
\r
  if (disc > eps) {\r
    float s = sqrt(disc);\r
    float u = cbrt_safe(-half_q + s);\r
    float v = cbrt_safe(-half_q - s);\r
    res = vec3((u + v) - a3, INF, INF);\r
    return 1;\r
  }\r
\r
  if (abs(disc) <= eps) {\r
    if (abs(p) <= eps && abs(q) <= eps) {\r
      res = vec3(-a3, INF, INF);\r
      return 1;\r
    } else {\r
      float u = cbrt_safe(-half_q);\r
      float t1 =  2.0*u - a3;\r
      float t2 = -u     - a3;\r
      if (t1 <= t2) res = vec3(t1, t2, INF); else res = vec3(t2, t1, INF);\r
      return 2;\r
    }\r
  }\r
\r
  // drei reelle\r
  float r = 2.0 * sqrt(-third_p);\r
  float arg = clamp(-half_q / sqrt(-third_p*third_p*third_p), -1.0, 1.0);\r
  float phi = acos(arg);\r
\r
  float t1 =  r * cos(        phi / 3.0) - a3;\r
  float t2 =  r * cos((phi + 2.0*3.14159265) / 3.0) - a3;\r
  float t3 =  r * cos((phi + 4.0*3.14159265) / 3.0) - a3;\r
\r
  res = vec3(t1, t2, t3);\r
  sort3(res);\r
  return 3;\r
}\r
\r
// ---------------------------------------------------------\r
// ray / aabb\r
// ---------------------------------------------------------\r
bool rayAABB(vec3 ro, vec3 rd, float h, out float tEnter, out float tExit) {\r
  vec3 invD = 1.0 / rd;\r
  vec3 t0 = (vec3(-h) - ro) * invD;\r
  vec3 t1 = (vec3( h) - ro) * invD;\r
  vec3 tmin = min(t0, t1);\r
  vec3 tmax = max(t0, t1);\r
  tEnter = max(max(tmin.x, tmin.y), tmin.z);\r
  tExit  = min(min(tmax.x, tmax.y), tmax.z);\r
  return tExit > max(tEnter, 0.0);\r
}\r
\r
// ---------------------------------------------------------\r
// gradient / normals\r
// ---------------------------------------------------------\r
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
  vec3 n;\r
  n.x = c100 + c101*p.z + c102*pow(p.z, 2.0) + c110*p.y + c111*p.y*p.z + c120*pow(p.y, 2.0)\r
      + 2.0*c200*p.x + 2.0*c201*p.x*p.z + 2.0*c210*p.x*p.y + 3.0*c300*pow(p.x, 2.0);\r
  n.y = c010 + c011*p.z + c012*pow(p.z, 2.0) + 2.0*c020*p.y + 2.0*c021*p.y*p.z + 3.0*c030*pow(p.y, 2.0)\r
      + c110*p.x + c111*p.x*p.z + 2.0*c120*p.x*p.y + c210*pow(p.x, 2.0);\r
  n.z = c001 + 2.0*c002*p.z + 3.0*c003*pow(p.z, 2.0) + c011*p.y + 2.0*c012*p.y*p.z + c021*pow(p.y, 2.0)\r
      + c101*p.x + 2.0*c102*p.x*p.z + c111*p.x*p.y + c201*pow(p.x, 2.0);\r
\r
  return normalize(n);\r
}\r
\r
// ---------------------------------------------------------\r
// build polynomial along ray & intersect\r
// ---------------------------------------------------------\r
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
  float a[4];\r
\r
  // t^3\r
  a[3] =\r
    c003*pow(rd.z,3.0) + c012*rd.y*pow(rd.z,2.0) + c021*pow(rd.y,2.0)*rd.z +\r
    c030*pow(rd.y,3.0) + c102*rd.x*pow(rd.z,2.0) + c111*rd.x*rd.y*rd.z +\r
    c120*rd.x*pow(rd.y,2.0) + c201*pow(rd.x,2.0)*rd.z + c210*pow(rd.x,2.0)*rd.y +\r
    c300*pow(rd.x,3.0);\r
\r
  // t^2\r
  a[2] =\r
    ro.x*c102*pow(rd.z,2.0) + ro.x*c111*rd.y*rd.z + ro.x*c120*pow(rd.y,2.0) +\r
    2.0*ro.x*c201*rd.x*rd.z + 2.0*ro.x*c210*rd.x*rd.y + 3.0*ro.x*c300*pow(rd.x,2.0) +\r
    ro.y*c012*pow(rd.z,2.0) + 2.0*ro.y*c021*rd.y*rd.z + 3.0*ro.y*c030*pow(rd.y,2.0) +\r
    ro.y*c111*rd.x*rd.z + 2.0*ro.y*c120*rd.x*rd.y + ro.y*c210*pow(rd.x,2.0) +\r
    3.0*ro.z*c003*pow(rd.z,2.0) + 2.0*ro.z*c012*rd.y*rd.z + ro.z*c021*pow(rd.y,2.0) +\r
    2.0*ro.z*c102*rd.x*rd.z + ro.z*c111*rd.x*rd.y + ro.z*c201*pow(rd.x,2.0) +\r
    c002*pow(rd.z,2.0) + c011*rd.y*rd.z + c020*pow(rd.y,2.0) +\r
    c101*rd.x*rd.z + c110*rd.x*rd.y + c200*pow(rd.x,2.0);\r
\r
  // t^1\r
  a[1] =\r
    pow(ro.x,2.0)*c201*rd.z + pow(ro.x,2.0)*c210*rd.y + 3.0*pow(ro.x,2.0)*c300*rd.x +\r
    ro.x*ro.y*c111*rd.z + 2.0*ro.x*ro.y*c120*rd.y + 2.0*ro.x*ro.y*c210*rd.x +\r
    2.0*ro.x*ro.z*c102*rd.z + ro.x*ro.z*c111*rd.y + 2.0*ro.x*ro.z*c201*rd.x +\r
    ro.x*c101*rd.z + ro.x*c110*rd.y + 2.0*ro.x*c200*rd.x +\r
    pow(ro.y,2.0)*c021*rd.z + 3.0*pow(ro.y,2.0)*c030*rd.y + pow(ro.y,2.0)*c120*rd.x +\r
    2.0*ro.y*ro.z*c012*rd.z + 2.0*ro.y*ro.z*c021*rd.y + ro.y*ro.z*c111*rd.x +\r
    ro.y*c011*rd.z + 2.0*ro.y*c020*rd.y + ro.y*c110*rd.x +\r
    3.0*pow(ro.z,2.0)*c003*rd.z + pow(ro.z,2.0)*c012*rd.y + pow(ro.z,2.0)*c102*rd.x +\r
    2.0*ro.z*c002*rd.z + ro.z*c011*rd.y + ro.z*c101*rd.x +\r
    c001*rd.z + c010*rd.y + c100*rd.x;\r
\r
  // t^0\r
  a[0] =\r
    pow(ro.x,3.0)*c300 + pow(ro.x,2.0)*ro.y*c210 + pow(ro.x,2.0)*ro.z*c201 + pow(ro.x,2.0)*c200 +\r
    ro.x*pow(ro.y,2.0)*c120 + ro.x*ro.y*ro.z*c111 + ro.x*ro.y*c110 +\r
    ro.x*pow(ro.z,2.0)*c102 + ro.x*ro.z*c101 + ro.x*c100 +\r
    pow(ro.y,3.0)*c030 + pow(ro.y,2.0)*ro.z*c021 + pow(ro.y,2.0)*c020 +\r
    ro.y*pow(ro.z,2.0)*c012 + ro.y*ro.z*c011 + ro.y*c010 +\r
    pow(ro.z,3.0)*c003 + pow(ro.z,2.0)*c002 + ro.z*c001 + c000;\r
\r
  float tEnter, tExit;\r
  if (!rayAABB(ro, rd, uHalf, tEnter, tExit)) return -1.0;\r
  tEnter = max(tEnter, EPS);\r
\r
  vec3 res;\r
  float t = INF;\r
  int n = cubic(a[3], a[2], a[1], a[0], res);\r
\r
  for (int i = 0; i < n; ++i) {\r
    float ti = res[i];\r
    if (ti < 0.0)               continue;\r
    if (ti < tEnter || ti > tExit) continue;\r
    t = min(t, ti);\r
  }\r
\r
  if (t == INF) return -1.0;\r
  return t;\r
}\r
\r
// ---------------------------------------------------------\r
// box edges & axes-as-quadrics\r
// ---------------------------------------------------------\r
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
// ---------------------------------------------------------\r
// main\r
// ---------------------------------------------------------\r
void main() {\r
  // box edges (overlay)\r
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
  // stable ray setup in object space\r
  vec3 ro = vUV;\r
\r
  // camera at origin in camera space -> transform to object space (w=1)\r
  vec3 camPos = (uModelInverse * vec4(0.0, 0.0, 0.0, 1.0)).xyz;\r
\r
  // camera -Z direction in camera space -> object space (w=0)\r
  vec3 rd = (uOrthographic == 1)\r
    ? normalize((uModelInverse * vec4(0.0, 0.0, -1.0, 0.0)).xyz)\r
    : normalize(ro - camPos);\r
\r
  ro += EPS * rd;\r
\r
  float tCubic = cubicSurfaceIntersect(ro, rd, uCoeffs);\r
\r
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
  // Headlight shading (view-abhängig, wie gewünscht)\r
  float shade = abs(dot(rd, n));\r
  rgb *= max(shade, 0.0);\r
\r
  fColor = vec4(rgb, 1.0);\r
}\r
`,y=3,F=.03;function x(r){const o=window.innerWidth,n=window.innerHeight,t=16/9;let c=o,i=o/t;i>n&&(i=n,c=n*t);const s=window.devicePixelRatio||1;r.width=Math.max(1,Math.floor(c*s)),r.height=Math.max(1,Math.floor(i*s)),r.style.width=`${c}px`,r.style.height=`${i}px`}function w(r,o,n){const t=r.createShader(o);if(r.shaderSource(t,n),r.compileShader(t),!r.getShaderParameter(t,r.COMPILE_STATUS))throw new Error(r.getShaderInfoLog(t)||"shader error");return t}function I(r,o,n){const t=r.createProgram();if(r.attachShader(t,w(r,r.VERTEX_SHADER,o)),r.attachShader(t,w(r,r.FRAGMENT_SHADER,n)),r.linkProgram(t),!r.getProgramParameter(t,r.LINK_STATUS))throw new Error(r.getProgramInfoLog(t)||"link error");return t}function q(r,o){const n=y,t=new Float32Array([-3,-3,-3,n,-3,-3,-3,n,-3,n,n,-3,-3,-3,n,n,-3,n,-3,n,n,n,n,n]),c=new Uint16Array([0,2,1,1,2,3,4,5,6,6,5,7,0,1,5,0,5,4,2,6,7,2,7,3,7,5,1,7,1,3,0,4,6,0,6,2]),i=r.createVertexArray();r.bindVertexArray(i);const s=r.createBuffer();r.bindBuffer(r.ARRAY_BUFFER,s),r.bufferData(r.ARRAY_BUFFER,t,r.STATIC_DRAW);const d=r.getAttribLocation(o,"aPosition");r.enableVertexAttribArray(d),r.vertexAttribPointer(d,3,r.FLOAT,!1,0,0);const a=r.createBuffer();return r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,a),r.bufferData(r.ELEMENT_ARRAY_BUFFER,c,r.STATIC_DRAW),r.bindVertexArray(null),{vao:i,iboSize:c.length}}function _(r){const o=new p(45,r,.1,100);return o.position.set(10,10,15),o.lookAt(0,0,0),o}function b(r,o){const n=new A(r,o);return n.enableDamping=!0,n.dampingFactor=.08,n.rotateSpeed=.9,n.zoomSpeed=1,n.panSpeed=.9,n.target.set(0,0,0),n.update(),n}function P(){var l;const r=document.getElementById("glcanvas");x(r);const o=r.getContext("webgl2"),n=I(o,C,B);o.useProgram(n);const{vao:t,iboSize:c}=q(o,n),i=r.width/r.height;let s=_(i),d=b(s,r);const a={gl:o,prog:n,vao:t,iboSize:c,uProjection:o.getUniformLocation(n,"uProjection"),uModelView:o.getUniformLocation(n,"uModelView"),uModelInverse:o.getUniformLocation(n,"uModelInverse"),uOrthographic:o.getUniformLocation(n,"uOrthographic"),uSurface:o.getUniformLocation(n,"uSurface"),uCoeffs:o.getUniformLocation(n,"uCoeffs"),uShowAxes:o.getUniformLocation(n,"uShowAxes"),uShowBox:o.getUniformLocation(n,"uShowBox"),uHalf:o.getUniformLocation(n,"uHalf"),uEdgeThickness:o.getUniformLocation(n,"uEdgeThickness"),viewMode:1,surfaceMode:1,showAxes:!0,showBox:!0,coeffs:new Float32Array([0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,-1]),camera:s,controls:d};o.clearColor(1,1,1,1),o.enable(o.DEPTH_TEST),o.enable(o.CULL_FACE),window.addEventListener("resize",()=>{x(r);const f=r.width/r.height;if(a.viewMode===2&&a.camera instanceof v){const e=(a.camera.top-a.camera.bottom)*.5;a.camera.left=-e*f,a.camera.right=e*f,a.camera.top=e,a.camera.bottom=-e,a.camera.updateProjectionMatrix()}else a.camera instanceof p&&(a.camera.aspect=f,a.camera.updateProjectionMatrix())}),window.addEventListener("message",f=>{const e=f.data||{};if(e.type==="coeffs"&&Array.isArray(e.coeffs)&&e.coeffs.length===20)a.coeffs.set(e.coeffs);else if(e.type==="controls"){if(typeof e.viewMode=="number"){const u=e.viewMode|0;u!==a.viewMode&&T(a,u)}typeof e.surfaceMode=="number"&&(a.surfaceMode=e.surfaceMode|0),typeof e.showAxes=="boolean"&&(a.showAxes=!!e.showAxes),typeof e.showBox=="boolean"&&(a.showBox=!!e.showBox)}});try{(l=window.parent)==null||l.postMessage({type:"ready"},"*")}catch{}return a}function T(r,o){const n=r.gl.canvas,t=n.width/n.height,c=r.camera,i=r.controls.target.clone(),s=c.position.clone(),d=s.clone().sub(i).length();r.controls.dispose();const a=()=>{if(c instanceof p){const e=m.degToRad(c.fov);return Math.tan(e*.5)*Math.max(d,1e-4)}else return(c.top-c.bottom)*.5},l=()=>{if(c instanceof v){const e=(c.top-c.bottom)*.5,u=2*Math.atan(Math.max(e,1e-4)/Math.max(d,1e-4));return m.clamp(m.radToDeg(u),10,75)}else return c.fov};let f;if(o===2){const e=a();f=new v(-e*t,+e*t,+e,-e,.1,100)}else{const e=l();f=new p(e,t,.1,100)}f.position.copy(s),f.lookAt(i),f.updateProjectionMatrix(),r.camera=f,r.controls=b(r.camera,n),r.controls.target.copy(i),r.controls.update(),r.viewMode=o}function N(r){const{gl:o}=r;o.viewport(0,0,o.canvas.width,o.canvas.height),o.clear(o.COLOR_BUFFER_BIT|o.DEPTH_BUFFER_BIT),o.useProgram(r.prog),o.bindVertexArray(r.vao),r.uShowBox&&o.uniform1i(r.uShowBox,r.showBox?1:0),o.uniform1f(r.uHalf,y),o.uniform1f(r.uEdgeThickness,F),o.uniform1i(r.uSurface,r.surfaceMode),o.uniform1fv(r.uCoeffs,r.coeffs),o.uniform1i(r.uOrthographic,r.viewMode===2?1:0);const n=1.6,t=(c,i)=>{i?o.colorMask(...i):o.colorMask(!0,!0,!0,!0),r.controls.update(),r.camera.updateMatrixWorld(!0),c!==0&&(r.camera.position.x-=c,r.camera.updateMatrixWorld(!0));const s=new Float32Array(r.camera.projectionMatrix.elements);o.uniformMatrix4fv(r.uProjection,!1,s);const d=new Float32Array(r.camera.matrixWorldInverse.elements),a=h();g(a,a,[n,n,n]);const l=M(d),f=h();E(f,l,a),o.uniformMatrix4fv(r.uModelView,!1,f);const e=S(h(),f);o.uniformMatrix4fv(r.uModelInverse,!1,e),o.uniform1i(r.uShowAxes,r.showAxes?1:0),o.drawElements(o.TRIANGLES,r.iboSize,o.UNSIGNED_SHORT,0),c!==0&&(r.camera.position.x+=c,r.camera.updateMatrixWorld(!0))};r.viewMode===3?(t(-.12,[!0,!1,!1,!0]),o.clear(o.DEPTH_BUFFER_BIT),t(.12,[!1,!0,!0,!0]),o.colorMask(!0,!0,!0,!0)):t(0),o.bindVertexArray(null)}function z(r){N(r),requestAnimationFrame(()=>z(r))}window.addEventListener("load",()=>{const r=P();z(r)});
