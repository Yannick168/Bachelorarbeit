import"./modulepreload-polyfill-B5Qt9EMX.js";import{O as A}from"./OrbitControls-BGrLWSQq.js";import{P as p,O as x,n as h}from"./three.module-Cv04BlQJ.js";import{c as m,s as g,b as C,m as E,i as M}from"./mat4-C5X1qZ4b.js";const S=`#version 300 es\r
precision highp float;\r
\r
layout(location=0) in vec3 aPosition;\r
\r
uniform mat4 uModelView;\r
uniform mat4 uProjection;\r
\r
out vec3 vUV;\r
\r
void main() {\r
    vec4 pos = vec4(aPosition, 1.0);\r
    vUV = pos.xyz;\r
    gl_Position = uProjection * uModelView * pos;\r
}\r
`,B=`#version 300 es\r
precision highp float;\r
\r
in vec3 vUV;\r
\r
uniform mat4  uModelInverse;\r
uniform int   uOrthographic;\r
uniform int   uSurface;          // bleibt vorhanden, falls genutzt\r
uniform float uCoeffs[20];       // deine Kubik-Flächen-Koeffizienten\r
\r
uniform bool  uShowAxes;         // <<< NEU: Achsen an/aus\r
uniform bool  uShowBox;          // (bestehend) Box-Kanten zeigen\r
uniform float uHalf;             // halbe Würfelkantenlänge\r
uniform float uEdgeThickness;    // Kanten-/Linienstärke in Objekt-Einheiten\r
\r
layout(location=0) out vec4 fColor;\r
\r
/* =========================================================\r
   Bestehende Hilfsfunktionen (unverändert gelassen)\r
   ========================================================= */\r
\r
float sgn(float x) {\r
  return x < 0.0f ? -1.0f : 1.0f;\r
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
\r
const float EPS = 1e-4;\r
\r
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
  vec3 n;\r
\r
  n.x = c100 + c101*p.z + c102*pow(p.z, 2.0) + c110*p.y + c111*p.y*p.z + c120*pow(p.y, 2.0) + 2.0*c200*p.x + 2.0*c201*p.x*p.z + 2.0*c210*p.x*p.y + 3.0*c300*pow(p.x, 2.0);\r
  n.y = c010 + c011*p.z + c012*pow(p.z, 2.0) + 2.0*c020*p.y + 2.0*c021*p.y*p.z + 3.0*c030*pow(p.y, 2.0) + c110*p.x + c111*p.x*p.z + 2.0*c120*p.x*p.y + c210*pow(p.x, 2.0);\r
  n.z = c001 + 2.0*c002*p.z + 3.0*c003*pow(p.z, 2.0) + c011*p.y + 2.0*c012*p.y*p.z + c021*pow(p.y, 2.0) + c101*p.x + 2.0*c102*p.x*p.z + c111*p.x*p.y + c201*pow(p.x, 2.0);\r
\r
  return normalize(n);\r
}\r
\r
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
  a[3] =\r
    c003*pow(rd.z,3.0) + c012*rd.y*pow(rd.z,2.0) + c021*pow(rd.y,2.0)*rd.z +\r
    c030*pow(rd.y,3.0) + c102*rd.x*pow(rd.z,2.0) + c111*rd.x*rd.y*rd.z +\r
    c120*rd.x*pow(rd.y,2.0) + c201*pow(rd.x,2.0)*rd.z + c210*pow(rd.x,2.0)*rd.y +\r
    c300*pow(rd.x,3.0);\r
\r
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
  float t = 1e20f;\r
  int n = cubic(a[3], a[2], a[1], a[0], res);\r
\r
  for (int i = 0; i < n; ++i) {\r
    float ti = res[i];\r
    if (ti < 0.0)            continue;\r
    if (ti < tEnter || ti > tExit) continue;\r
    t = min(t, ti);\r
  }\r
\r
  if (t == 1e20f) return -1.0f;\r
  return t;\r
}\r
\r
/* =========================================================\r
   Box-Kanten (bestehende Darstellung)\r
   ========================================================= */\r
\r
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
/* =========================================================\r
   NEU: Achsen-Koeffizienten als Quadriken in 20er-Cubic-Array\r
   Index-Layout (aus deinem Code):\r
   [ c300,c030,c003,c210,c201,c021,c012,c120,c102,c111,\r
     c200,c020,c002,c101,c110,c011,c100,c010,c001,c000 ]\r
   ========================================================= */\r
\r
// alle 20 Einträge auf 0\r
void zeroCoeffs(out float c[20]) {\r
  for (int i=0;i<20;i++) c[i] = 0.0;\r
}\r
\r
// X-Achse: y^2 + z^2 - r^2 = 0  (unabhängig von x)\r
void axisCoeffsX(float r, out float c[20]) {\r
  zeroCoeffs(c);\r
  c[11] = 1.0;        // c020 (y^2)\r
  c[12] = 1.0;        // c002 (z^2)\r
  c[19] = -r*r;       // c000 (Konstante)\r
}\r
\r
// Y-Achse: x^2 + z^2 - r^2 = 0\r
void axisCoeffsY(float r, out float c[20]) {\r
  zeroCoeffs(c);\r
  c[10] = 1.0;        // c200 (x^2)\r
  c[12] = 1.0;        // c002 (z^2)\r
  c[19] = -r*r;\r
}\r
\r
// Z-Achse: x^2 + y^2 - r^2 = 0\r
void axisCoeffsZ(float r, out float c[20]) {\r
  zeroCoeffs(c);\r
  c[10] = 1.0;        // c200 (x^2)\r
  c[11] = 1.0;        // c020 (y^2)\r
  c[19] = -r*r;\r
}\r
\r
void copyCoeffs(in float src[20], out float dst[20]) {\r
  for (int i=0;i<20;i++) dst[i] = src[i];\r
}\r
\r
/* =========================================================\r
   main\r
   ========================================================= */\r
void main() {\r
\r
  // Box-Kanten (falls aktiv) — früher Early-Return\r
  if (uShowBox) {\r
    float d  = edgeDistance(vUV, uHalf);\r
    float aa = fwidth(d);\r
    float m  = 1.0 - smoothstep(uEdgeThickness - aa,\r
                                uEdgeThickness + aa, d);\r
    if (m > 0.0) {\r
      fColor = vec4(0.0f, 0.0f, 0.0f, 1.0f);\r
      return;\r
    }\r
  }\r
\r
  // Ray\r
  vec3 ro = vUV;\r
  vec3 rd = (uOrthographic == 1) ? -uModelInverse[2].xyz\r
                                 : vUV - uModelInverse[3].xyz;\r
  rd = normalize(rd);\r
  ro += 1e-4 * rd;\r
\r
  // 1) Schnitt mit deiner (aktuellen) Kubikfläche\r
  float tCubic = cubicSurfaceIntersect(ro, rd, uCoeffs);\r
\r
  // 2) Achsen als Quadriken in 20er-Array kodieren und mit\r
  //    derselben Intersect-Funktion schneiden\r
  float radius = max(uEdgeThickness, 0.02);\r
  float tX = -1.0, tY = -1.0, tZ = -1.0;\r
\r
  float cx[20]; float cy[20]; float cz[20];\r
  if (uShowAxes) {\r
    axisCoeffsX(radius, cx);\r
    axisCoeffsY(radius, cy);\r
    axisCoeffsZ(radius, cz);\r
    tX = cubicSurfaceIntersect(ro, rd, cx);\r
    tY = cubicSurfaceIntersect(ro, rd, cy);\r
    tZ = cubicSurfaceIntersect(ro, rd, cz);\r
  }\r
\r
  // 3) Nähesten Treffer wählen\r
  bool haveCubic = (tCubic >= 0.0);\r
  bool haveX = (tX >= 0.0);\r
  bool haveY = (tY >= 0.0);\r
  bool haveZ = (tZ >= 0.0);\r
\r
  if (!haveCubic && !haveX && !haveY && !haveZ) {\r
    discard;\r
  }\r
\r
  float tMin = 1e20;\r
  int   which = -1; // 0=X,1=Y,2=Z, 3=Cubic\r
\r
  if (haveX && tX < tMin) { tMin = tX; which = 0; }\r
  if (haveY && tY < tMin) { tMin = tY; which = 1; }\r
  if (haveZ && tZ < tMin) { tMin = tZ; which = 2; }\r
  if (haveCubic && tCubic < tMin) { tMin = tCubic; which = 3; }\r
\r
  vec3 p = ro + tMin * rd;\r
  vec3 n;\r
  vec3 rgb;\r
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
  } else { // 3: deine Kubikfläche\r
    n   = normalize(cubicSurfaceNormal(p, uCoeffs));\r
    rgb = vec3(1.0, 0.1, 0.1); // deine Base-Farbe\r
  }\r
\r
  // Headlight-Shading\r
  float shade = abs(dot(rd, n));\r
  rgb *= max(shade, 0.0);\r
\r
  fColor = vec4(rgb, 1.0);\r
}`,y=3,X=.03;function w(r){const n=window.innerWidth,o=window.innerHeight,t=16/9;let a=n,f=n/t;f>o&&(f=o,a=o*t);const s=window.devicePixelRatio||1;r.width=Math.max(1,Math.floor(a*s)),r.height=Math.max(1,Math.floor(f*s)),r.style.width=`${a}px`,r.style.height=`${f}px`}function v(r,n,o){const t=r.createShader(n);if(r.shaderSource(t,o),r.compileShader(t),!r.getShaderParameter(t,r.COMPILE_STATUS))throw new Error(r.getShaderInfoLog(t)||"shader error");return t}function T(r,n,o){const t=r.createProgram();if(r.attachShader(t,v(r,r.VERTEX_SHADER,n)),r.attachShader(t,v(r,r.FRAGMENT_SHADER,o)),r.linkProgram(t),!r.getProgramParameter(t,r.LINK_STATUS))throw new Error(r.getProgramInfoLog(t)||"link error");return t}function P(r,n){const o=y,t=new Float32Array([-3,-3,-3,o,-3,-3,-3,o,-3,o,o,-3,-3,-3,o,o,-3,o,-3,o,o,o,o,o]),a=new Uint16Array([0,2,1,1,2,3,4,5,6,6,5,7,0,1,5,0,5,4,2,6,7,2,7,3,7,5,1,7,1,3,0,4,6,0,6,2]),f=r.createVertexArray();r.bindVertexArray(f);const s=r.createBuffer();r.bindBuffer(r.ARRAY_BUFFER,s),r.bufferData(r.ARRAY_BUFFER,t,r.STATIC_DRAW);const d=r.getAttribLocation(n,"aPosition");r.enableVertexAttribArray(d),r.vertexAttribPointer(d,3,r.FLOAT,!1,0,0);const c=r.createBuffer();return r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,c),r.bufferData(r.ELEMENT_ARRAY_BUFFER,a,r.STATIC_DRAW),r.bindVertexArray(null),{vao:f,iboSize:a.length}}function I(r){const n=new p(45,r,.1,100);return n.position.set(10,10,15),n.lookAt(0,0,0),n}function z(r,n){const o=new A(r,n);return o.enableDamping=!0,o.dampingFactor=.08,o.rotateSpeed=.9,o.zoomSpeed=1,o.panSpeed=.9,o.target.set(0,0,0),o.update(),o}function U(){var l;const r=document.getElementById("glcanvas");w(r);const n=r.getContext("webgl2"),o=T(n,S,B);n.useProgram(o);const{vao:t,iboSize:a}=P(n,o),f=r.width/r.height;let s=I(f),d=z(s,r);const c={gl:n,prog:o,vao:t,iboSize:a,uProjection:n.getUniformLocation(o,"uProjection"),uModelView:n.getUniformLocation(o,"uModelView"),uModelInverse:n.getUniformLocation(o,"uModelInverse"),uOrthographic:n.getUniformLocation(o,"uOrthographic"),uSurface:n.getUniformLocation(o,"uSurface"),uCoeffs:n.getUniformLocation(o,"uCoeffs"),uShowAxes:n.getUniformLocation(o,"uShowAxes"),uShowBox:n.getUniformLocation(o,"uShowBox"),uHalf:n.getUniformLocation(o,"uHalf"),uEdgeThickness:n.getUniformLocation(o,"uEdgeThickness"),viewMode:1,surfaceMode:1,showAxes:!0,showBox:!0,coeffs:new Float32Array([0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,-1]),camera:s,controls:d};n.clearColor(1,1,1,1),n.enable(n.DEPTH_TEST),n.enable(n.CULL_FACE),window.addEventListener("resize",()=>{w(r);const i=r.width/r.height;if(c.viewMode===2&&c.camera instanceof x){const e=(c.camera.top-c.camera.bottom)*.5;c.camera.left=-e*i,c.camera.right=e*i,c.camera.top=e,c.camera.bottom=-e,c.camera.updateProjectionMatrix()}else c.camera instanceof p&&(c.camera.aspect=i,c.camera.updateProjectionMatrix())}),window.addEventListener("message",i=>{const e=i.data||{};if(e.type==="coeffs"&&Array.isArray(e.coeffs)&&e.coeffs.length===20)c.coeffs.set(e.coeffs);else if(e.type==="controls"){if(typeof e.viewMode=="number"){const u=e.viewMode|0;u!==c.viewMode&&k(c,u)}typeof e.surfaceMode=="number"&&(c.surfaceMode=e.surfaceMode|0),typeof e.showAxes=="boolean"&&(c.showAxes=!!e.showAxes),typeof e.showBox=="boolean"&&(c.showBox=!!e.showBox)}});try{(l=window.parent)==null||l.postMessage({type:"ready"},"*")}catch{}return c}function k(r,n){const o=r.gl.canvas,t=o.width/o.height,a=r.camera,f=r.controls.target.clone(),s=a.position.clone(),d=s.clone().sub(f).length();r.controls.dispose();const c=()=>{if(a instanceof p){const e=h.degToRad(a.fov);return Math.tan(e*.5)*Math.max(d,1e-4)}else return(a.top-a.bottom)*.5},l=()=>{if(a instanceof x){const e=(a.top-a.bottom)*.5,u=2*Math.atan(Math.max(e,1e-4)/Math.max(d,1e-4));return h.clamp(h.radToDeg(u),10,75)}else return a.fov};let i;if(n===2){const e=c();i=new x(-e*t,+e*t,+e,-e,.1,100)}else{const e=l();i=new p(e,t,.1,100)}i.position.copy(s),i.lookAt(f),i.updateProjectionMatrix(),r.camera=i,r.controls=z(r.camera,o),r.controls.target.copy(f),r.controls.update(),r.viewMode=n}function D(r){const{gl:n}=r;n.viewport(0,0,n.canvas.width,n.canvas.height),n.clear(n.COLOR_BUFFER_BIT|n.DEPTH_BUFFER_BIT),n.useProgram(r.prog),n.bindVertexArray(r.vao),r.uShowBox&&n.uniform1i(r.uShowBox,r.showBox?1:0),n.uniform1f(r.uHalf,y),n.uniform1f(r.uEdgeThickness,X),n.uniform1i(r.uSurface,r.surfaceMode),n.uniform1fv(r.uCoeffs,r.coeffs),n.uniform1i(r.uOrthographic,r.viewMode===2?1:0);const o=1.6,t=(a,f)=>{f?n.colorMask(...f):n.colorMask(!0,!0,!0,!0),r.controls.update(),r.camera.updateMatrixWorld(!0),a!==0&&(r.camera.position.x-=a,r.camera.updateMatrixWorld(!0));const s=new Float32Array(r.camera.projectionMatrix.elements);n.uniformMatrix4fv(r.uProjection,!1,s);const d=new Float32Array(r.camera.matrixWorldInverse.elements),c=m();g(c,c,[o,o,o]);const l=C(d),i=m();E(i,l,c),n.uniformMatrix4fv(r.uModelView,!1,i);const e=M(m(),i);n.uniformMatrix4fv(r.uModelInverse,!1,e),n.uniform1i(r.uShowAxes,r.showAxes?1:0),n.drawElements(n.TRIANGLES,r.iboSize,n.UNSIGNED_SHORT,0),a!==0&&(r.camera.position.x+=a,r.camera.updateMatrixWorld(!0))};r.viewMode===3?(t(-.12,[!0,!1,!1,!0]),n.clear(n.DEPTH_BUFFER_BIT),t(.12,[!1,!0,!0,!0]),n.colorMask(!0,!0,!0,!0)):t(0),n.bindVertexArray(null)}function b(r){D(r),requestAnimationFrame(()=>b(r))}window.addEventListener("load",()=>{const r=U();b(r)});
