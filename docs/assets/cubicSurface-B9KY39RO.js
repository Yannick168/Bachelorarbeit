import"./modulepreload-polyfill-B5Qt9EMX.js";import{c as k,a as S,s as U,f as V,m as D,b as Y,d as _}from"./vec2-DADnB5pl.js";import{f as N,c as F,a as q,l as H,n as Z,d as O}from"./vec3-Cv4cOPFR.js";import{c as s,o as G,b as M,t as A,d as K,s as W,m as w,i as g}from"./mat4-BUOhX8_y.js";const j=`#version 300 es\r
precision highp float;\r
\r
in vec3 aPosition;       // aus VBO\r
out vec3 vUV;            // Modelraum-Position\r
\r
uniform mat4 uProjection;\r
uniform mat4 uModelView;\r
\r
void main() {\r
  vUV = aPosition; // wir bleiben im Modelraum (wie früher)\r
  gl_Position = uProjection * uModelView * vec4(aPosition, 1.0);\r
}\r
`,$=`#version 300 es\r
precision highp float;\r
\r
in vec3 vUV;\r
\r
uniform mat4 uModelInverse; // = inverse(uModelView), NICHT inverse(uModel)\r
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
bool rayAABB(vec3 ro, vec3 rd, float h, out float tEnter, out float tExit)\r
{\r
  const float INF = 1e30;\r
  const float EPS_DIR = 1e-8;\r
\r
  float tmin = -INF;\r
  float tmax =  INF;\r
\r
  // X\r
  if (abs(rd.x) < EPS_DIR) {\r
    if (ro.x < -h || ro.x > h) return false; // parallel & außerhalb\r
    // sonst: keine Einschränkung durch x-Slab\r
  } else {\r
    float ood = 1.0 / rd.x;\r
    float t0 = (-h - ro.x) * ood;\r
    float t1 = ( h - ro.x) * ood;\r
    if (t0 > t1) { float s=t0; t0=t1; t1=s; }\r
    tmin = max(tmin, t0);\r
    tmax = min(tmax, t1);\r
    if (tmax < tmin) return false;\r
  }\r
\r
  // Y\r
  if (abs(rd.y) < EPS_DIR) {\r
    if (ro.y < -h || ro.y > h) return false;\r
  } else {\r
    float ood = 1.0 / rd.y;\r
    float t0 = (-h - ro.y) * ood;\r
    float t1 = ( h - ro.y) * ood;\r
    if (t0 > t1) { float s=t0; t0=t1; t1=s; }\r
    tmin = max(tmin, t0);\r
    tmax = min(tmax, t1);\r
    if (tmax < tmin) return false;\r
  }\r
\r
  // Z\r
  if (abs(rd.z) < EPS_DIR) {\r
    if (ro.z < -h || ro.z > h) return false;\r
  } else {\r
    float ood = 1.0 / rd.z;\r
    float t0 = (-h - ro.z) * ood;\r
    float t1 = ( h - ro.z) * ood;\r
    if (t0 > t1) { float s=t0; t0=t1; t1=s; }\r
    tmin = max(tmin, t0);\r
    tmax = min(tmax, t1);\r
    if (tmax < tmin) return false;\r
  }\r
\r
  tEnter = tmin;\r
  tExit  = tmax;\r
  // inklusiv vergleichen (tangent ok) und Hits vor der Kamera zulassen,\r
  // denn der Aufrufer klemmt danach ohnehin auf EPS.\r
  return tExit >= max(tEnter, 0.0);\r
}\r
\r
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
\r
\r
  a[3] =\r
    c003*pow(rd.z,3.0) + c012*rd.y*pow(rd.z,2.0) + c021*pow(rd.y,2.0)*rd.z +\r
    c030*pow(rd.y,3.0) + c102*rd.x*pow(rd.z,2.0) + c111*rd.x*rd.y*rd.z +\r
    c120*rd.x*pow(rd.y,2.0) + c201*pow(rd.x,2.0)*rd.z + c210*pow(rd.x,2.0)*rd.y +\r
    c300*pow(rd.x,3.0);\r
\r
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
  tEnter = max(tEnter, EPS);   // bei Startpunkt in der Box wird tEnter < 0\r
\r
  //tEnter = EPS;          // praktisch "ab Kamera"\r
  //tExit  = 100;          // großer Wert\r
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
// uModelInverse = inverse(View * Model)\r
vec3 camPos_model = (uModelInverse * vec4(0.0, 0.0, 0.0, 1.0)).xyz;\r
\r
// WICHTIG: -Z ist "vorwärts"\r
vec3 camFwd_model = normalize((uModelInverse * vec4(0.0, 0.0, -1.0, 0.0)).xyz);\r
\r
  vec3 ro = vUV;\r
  vec3 rd = (uOrthographic == 1) ? -uModelInverse[2].xyz : vUV - uModelInverse[3].xyz;\r
\r
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
}\r
`,L=3,Q=.03;function I(r){const n=window.innerWidth,o=window.innerHeight,e=16/9;let i=n,t=n/e;t>o&&(t=o,i=o*e);const f=window.devicePixelRatio||1;r.width=Math.max(1,Math.floor(i*f)),r.height=Math.max(1,Math.floor(t*f)),r.style.width=`${i}px`,r.style.height=`${t}px`,r.style.position="absolute",r.style.left="50%",r.style.top="50%",r.style.transform="translate(-50%, -50%)"}function P(r,n,o){const e=r.createShader(n);if(r.shaderSource(e,o),r.compileShader(e),!r.getShaderParameter(e,r.COMPILE_STATUS))throw new Error(r.getShaderInfoLog(e)||"shader error");return e}function J(r,n,o){const e=r.createProgram();if(r.attachShader(e,P(r,r.VERTEX_SHADER,n)),r.attachShader(e,P(r,r.FRAGMENT_SHADER,o)),r.linkProgram(e),!r.getProgramParameter(e,r.LINK_STATUS))throw new Error(r.getProgramInfoLog(e)||"link error");return e}function rr(r,n){const o=L,e=new Float32Array([-3,-3,-3,o,-3,-3,-3,o,-3,o,o,-3,-3,-3,o,o,-3,o,-3,o,o,o,o,o]),i=new Uint16Array([0,2,1,1,2,3,4,5,6,6,5,7,0,1,5,0,5,4,2,6,7,2,7,3,7,5,1,7,1,3,0,4,6,0,6,2]),t=r.createVertexArray();r.bindVertexArray(t);const f=r.createBuffer();r.bindBuffer(r.ARRAY_BUFFER,f),r.bufferData(r.ARRAY_BUFFER,e,r.STATIC_DRAW);const l=r.getAttribLocation(n,"aPosition");r.enableVertexAttribArray(l),r.vertexAttribPointer(l,3,r.FLOAT,!1,0,0);const d=r.createBuffer();return r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,d),r.bufferData(r.ELEMENT_ARRAY_BUFFER,i,r.STATIC_DRAW),r.bindVertexArray(null),{vao:t,iboSize:i.length}}function X(r,n){const o=r.canvas,e=o.clientWidth,i=o.clientHeight,t=(2*n[0]-e)/e,f=(i-2*n[1])/i,l=1-t*t-f*f,d=l>0?Math.sqrt(l):0;return N(t,f,d)}function nr(r,n){const o=F();if(q(o,r,n),H(o)<1e-5)return S();Z(o,o);const e=Math.max(-1,Math.min(1,O(r,n))),i=Math.acos(e);return _(S(),o,i)}function or(){var f,l,d;const r=document.getElementById("glcanvas");I(r);const n=r.getContext("webgl2");if(!n)throw new Error("WebGL2 not available");const o=J(n,j,$);n.useProgram(o);const{vao:e,iboSize:i}=rr(n,o),t={gl:n,prog:o,vao:e,iboSize:i,uProjection:n.getUniformLocation(o,"uProjection"),uModelView:n.getUniformLocation(o,"uModelView"),uModelInverse:n.getUniformLocation(o,"uModelInverse"),uOrthographic:n.getUniformLocation(o,"uOrthographic"),uSurface:n.getUniformLocation(o,"uSurface"),uCoeffs:n.getUniformLocation(o,"uCoeffs"),uShowAxes:n.getUniformLocation(o,"uShowAxes"),uShowBox:n.getUniformLocation(o,"uShowBox"),uHalf:n.getUniformLocation(o,"uHalf"),uEdgeThickness:n.getUniformLocation(o,"uEdgeThickness"),qNow:S(),mousePos:k(),mousePressed:!1,zoom:.5,viewMode:1,surfaceMode:1,showAxes:!0,showBox:!0,coeffs:new Float32Array([0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,-1])};n.clearColor(1,1,1,1),n.enable(n.DEPTH_TEST),n.enable(n.CULL_FACE),window.addEventListener("message",a=>{const c=a.data||{};if(c.type==="coeffs"&&Array.isArray(c.coeffs)&&c.coeffs.length===20)t.coeffs.set(c.coeffs);else if(c.type==="controls"){if(typeof c.viewMode=="number"&&(t.viewMode=c.viewMode|0),typeof c.surfaceMode<"u"){if(typeof c.surfaceMode=="number")t.surfaceMode=c.surfaceMode|0;else if(typeof c.surfaceMode=="string"){const m={sphere:1,clebsch:2,cayley:3,monkeySaddle:4,cylinder:5,crosspropeller:6,custom:7};t.surfaceMode=m[c.surfaceMode]??t.surfaceMode}}typeof c.showAxes=="boolean"&&(t.showAxes=!!c.showAxes),typeof c.showBox=="boolean"&&(t.showBox=!!c.showBox)}});try{(f=window.parent)==null||f.postMessage({type:"ready"},"*")}catch{}return r.addEventListener("mousedown",a=>{t.mousePressed=!0,U(t.mousePos,a.clientX,a.clientY)}),r.addEventListener("mouseup",()=>{t.mousePressed=!1}),r.addEventListener("mouseleave",()=>{t.mousePressed=!1}),r.addEventListener("mousemove",a=>{if(!t.mousePressed)return;const c=V(a.clientX,a.clientY),m=X(n,t.mousePos),y=X(n,c),x=nr(m,y);D(t.qNow,x,t.qNow),Y(t.mousePos,c)}),r.addEventListener("wheel",a=>{a.preventDefault(),t.zoom*=a.deltaY>0?1/1.1:1.1},{passive:!1}),(l=document.getElementById("viewMode"))==null||l.addEventListener("change",a=>{t.viewMode=parseInt(a.target.value)}),(d=document.getElementById("surfaceMode"))==null||d.addEventListener("change",a=>{t.surfaceMode=parseInt(a.target.value)}),window.addEventListener("resize",()=>{I(r),n.viewport(0,0,r.width,r.height)}),t}function er(r){const{gl:n}=r;n.viewport(0,0,n.canvas.width,n.canvas.height),n.clear(n.COLOR_BUFFER_BIT|n.DEPTH_BUFFER_BIT),n.useProgram(r.prog),n.bindVertexArray(r.vao),r.uShowBox&&n.uniform1i(r.uShowBox,r.showBox?1:0),r.uShowAxes&&n.uniform1i(r.uShowAxes,r.showAxes?1:0),r.uHalf&&n.uniform1f(r.uHalf,L),r.uEdgeThickness&&n.uniform1f(r.uEdgeThickness,Q),r.uSurface&&n.uniform1i(r.uSurface,r.surfaceMode),r.uCoeffs&&n.uniform1fv(r.uCoeffs,r.coeffs),r.uOrthographic&&n.uniform1i(r.uOrthographic,r.viewMode===2?1:0);const o=n.canvas.width/n.canvas.height,e=10,i=100,t=30,f=o*t,l=0,d=0,a=50,c=s();if(r.viewMode===2)G(c,-f/2,f/2,-30/2,t/2,e,i);else{const B=e*(-f/2-l)/a,p=e*(f/2-l)/a,u=e*(-30/2-d)/a,h=e*(t/2-d)/a;M(c,B,p,u,h,e,i)}n.uniformMatrix4fv(r.uProjection,!1,c);const m=s();A(m,m,[-0,-0,-50]);const y=K(s(),r.qNow),x=s(),z=15*r.zoom;W(x,x,[z,z,z]);const C=s();w(C,y,x);const b=s();w(b,m,C),n.uniformMatrix4fv(r.uModelView,!1,b);const R=g(s(),b);if(n.uniformMatrix4fv(r.uModelInverse,!1,R),r.viewMode===3){n.colorMask(!0,!1,!1,!0);{const p=s();M(p,e*(-f/2-1.5)/a,e*(f/2-1.5)/a,e*(-30/2-d)/a,e*(t/2-d)/a,e,i);const u=s();A(u,u,[-1.5,-0,-50]);const h=s(),v=s();w(v,y,x),w(h,u,v),n.uniformMatrix4fv(r.uProjection,!1,p),n.uniformMatrix4fv(r.uModelView,!1,h);const E=g(s(),h);n.uniformMatrix4fv(r.uModelInverse,!1,E),n.drawElements(n.TRIANGLES,r.iboSize,n.UNSIGNED_SHORT,0)}n.clear(n.DEPTH_BUFFER_BIT),n.colorMask(!1,!0,!0,!0);{const p=s();M(p,e*(-f/2+1.5)/a,e*(f/2+1.5)/a,e*(-30/2-d)/a,e*(t/2-d)/a,e,i);const u=s();A(u,u,[1.5,-0,-50]);const h=s(),v=s();w(v,y,x),w(h,u,v),n.uniformMatrix4fv(r.uProjection,!1,p),n.uniformMatrix4fv(r.uModelView,!1,h);const E=g(s(),h);n.uniformMatrix4fv(r.uModelInverse,!1,E),n.drawElements(n.TRIANGLES,r.iboSize,n.UNSIGNED_SHORT,0)}n.colorMask(!0,!0,!0,!0)}else n.drawElements(n.TRIANGLES,r.iboSize,n.UNSIGNED_SHORT,0);n.bindVertexArray(null)}function T(r){er(r),requestAnimationFrame(()=>T(r))}window.addEventListener("load",()=>{const r=document.getElementById("glcanvas"),n=or();n.gl.viewport(0,0,r.width,r.height),T(n)});
