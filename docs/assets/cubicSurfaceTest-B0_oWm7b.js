import"./modulepreload-polyfill-B5Qt9EMX.js";import{c as F,a as S,s as T,f as V,m as X,b as _,d as D}from"./vec2-DADnB5pl.js";import{c as l,e as L,o as N,b as h,t as C,d as P,s as B,m as g,a as M,i as O}from"./mat4-BUOhX8_y.js";import{f as j,c as k,a as $,l as H,n as Y,d as W}from"./vec3-Cv4cOPFR.js";const Q=document.getElementById("coeffContainer"),G=["x³","y³","z³","x²y","x²z","y²z","yz²","xy²","xz²","xyz","x²","y²","z²","xz","xy","yz","x","y","z","1"],w=[0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,-1],v=[];for(let r=0;r<20;r++){const o=document.createElement("div");o.className="coeff-group";const f=document.createElement("label");f.textContent=`${G[r]}: `;const n=document.createElement("input");n.type="number",n.value=w[r].toString(),n.step="0.1";const t=document.createElement("input");t.type="range",t.min=(w[r]-10).toString(),t.max=(w[r]+10).toString(),t.step="0.1",t.value=w[r].toString(),n.addEventListener("input",()=>{const e=parseFloat(n.value)||0;t.min=(e-5).toFixed(1),t.max=(e+5).toFixed(1),t.value=e.toString(),q()}),t.addEventListener("input",()=>{n.value=t.value,q()}),o.appendChild(f),o.appendChild(n),o.appendChild(t),Q.appendChild(o),v.push(n)}globalThis.getUserCoeffs=()=>v.map(r=>parseFloat(r.value)||0);globalThis.getUserCoeffs.inputs=v;function q(){var t,e;const r=v.map(a=>parseFloat(a.value)||0),o=(t=window.ctx)==null?void 0:t.gl,f=(e=window.ctx)==null?void 0:e.program,n=o==null?void 0:o.getUniformLocation(f,"uCoeffs");o&&f&&n&&(o.useProgram(f),o.uniform1fv(n,new Float32Array(r)),window.ctx&&window.drawScene&&window.drawScene(window.ctx))}const K=`#version 300 es\r
precision highp float;\r
\r
in vec3 aPosition;      // Würfel-Position (Modelraum)\r
out vec3 vUV;           // an FS weiterreichen\r
\r
uniform mat4 uProjection;\r
uniform mat4 uModelView;\r
\r
void main() {\r
  vUV = aPosition;                              // im Modelraum bleiben\r
  gl_Position = uProjection * uModelView * vec4(aPosition, 1.0);\r
}\r
`,Z=`#version 300 es\r
precision highp float;\r
\r
in vec3 vUV;\r
\r
uniform mat4 uModelInverse;\r
uniform int uOrthographic;\r
uniform int uSurface;\r
uniform float uCoeffs[20];\r
\r
\r
out vec4 fColor;\r
\r
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
\r
\r
// Clebsch's Surface\r
float clebschIntersect(vec3 ro, vec3 rd) {\r
\r
  float coeff[4];\r
  vec3 res;\r
  float t = 1e20f;\r
\r
  coeff[3] = 81.0f*rd.x*rd.x*rd.x - 189.0f*rd.x*rd.x*rd.y - 189.0f*rd.x*rd.x*rd.z - 189.0f*rd.x*rd.y*rd.y + 54.0f*rd.x*rd.y*rd.z \r
            - 189.0f*rd.x*rd.z*rd.z + 81.0f*rd.y*rd.y*rd.y - 189.0f*rd.y*rd.y*rd.z - 189.0f*rd.y*rd.z*rd.z + 81.0f*rd.z*rd.z*rd.z;\r
  coeff[2] = 243.0f*ro.x*rd.x*rd.x - 378.0f*ro.x*rd.x*rd.y - 378.0f*ro.x*rd.x*rd.z - 189.0f*ro.x*rd.y*rd.y + 54.0f*ro.x*rd.y*rd.z \r
            - 189.0f*ro.x*rd.z*rd.z - 189.0f*ro.y*rd.x*rd.x - 378.0f*ro.y*rd.x*rd.y + 54.0f*ro.y*rd.x*rd.z + 243.0f*ro.y*rd.y*rd.y \r
            - 378.0f*ro.y*rd.y*rd.z - 189.0f*ro.y*rd.z*rd.z - 189.0f*ro.z*rd.x*rd.x + 54.0f*ro.z*rd.x*rd.y - 378.0f*ro.z*rd.x*rd.z \r
            - 189.0f*ro.z*rd.y*rd.y - 378.0f*ro.z*rd.y*rd.z + 243.0f*ro.z*rd.z*rd.z - 9.0f*rd.x*rd.x + 126.0f*rd.x*rd.y + 126.0f*rd.x*rd.z \r
            - 9.0f*rd.y*rd.y + 126.0f*rd.y*rd.z - 9.0f*rd.z*rd.z;\r
  coeff[1] = 243.0f*ro.x*ro.x*rd.x - 189.0f*ro.x*ro.x*rd.y - 189.0f*ro.x*ro.x*rd.z - 378.0f*ro.x*ro.y*rd.x - 378.0f*ro.x*ro.y*rd.y \r
             + 54.0f*ro.x*ro.y*rd.z - 378.0f*ro.x*ro.z*rd.x + 54.0f*ro.x*ro.z*rd.y - 378.0f*ro.x*ro.z*rd.z - 18.0f*ro.x*rd.x + 126.0f*ro.x*rd.y \r
             + 126.0f*ro.x*rd.z - 189.0f*ro.y*ro.y*rd.x + 243.0f*ro.y*ro.y*rd.y - 189.0f*ro.y*ro.y*rd.z + 54.0f*ro.y*ro.z*rd.x \r
             - 378.0f*ro.y*ro.z*rd.y - 378.0f*ro.y*ro.z*rd.z + 126.0f*ro.y*rd.x - 18.0f*ro.y*rd.y + 126.0f*ro.y*rd.z - 189.0f*ro.z*ro.z*rd.x \r
             - 189.0f*ro.z*ro.z*rd.y + 243.0f*ro.z*ro.z*rd.z + 126.0f*ro.z*rd.x + 126.0f*ro.z*rd.y - 18.0f*ro.z*rd.z - 9.0f*rd.x - 9.0f*rd.y \r
             - 9.0f*rd.z;\r
  coeff[0] = 81.0f*ro.x*ro.x*ro.x - 189.0f*ro.x*ro.x*ro.y - 189.0f*ro.x*ro.x*ro.z - 9.0f*ro.x*ro.x - 189.0f*ro.x*ro.y*ro.y + 54.0f*ro.x*ro.y*ro.z\r
             + 126.0f*ro.x*ro.y - 189.0f*ro.x*ro.z*ro.z + 126.0f*ro.x*ro.z - 9.0f*ro.x + 81.0f*ro.y*ro.y*ro.y - 189.0f*ro.y*ro.y*ro.z \r
             - 9.0f*ro.y*ro.y - 189.0f*ro.y*ro.z*ro.z + 126.0f*ro.y*ro.z - 9.0f*ro.y + 81.0f*ro.z*ro.z*ro.z - 9.0f*ro.z*ro.z - 9.0f*ro.z + 1.0f;\r
  \r
  int n = cubic(coeff[3],coeff[2],coeff[1],coeff[0],res);\r
  for(int i = 0; i < n; i++) {\r
    if (res[i] < 0.0f)\r
      continue;\r
    if (res[i] < t) {\r
      vec3 p = ro + res[i] * rd;\r
      if (dot(p,p) > 1.0f)\r
        continue;\r
      t = res[i];\r
    }\r
  }\r
\r
  if(t == 1e20f)\r
    return (-1.0f);\r
  return (t);\r
}\r
\r
\r
float clebschLineIntersect(vec3 ro, vec3 rd) {\r
  vec3 a = vec3(0.0f,0.0f,-1.0/3.0f);\r
  vec3 b = vec3(1.0f,-1.0f,0.0f);\r
  float coeff[3];\r
  float rad = 0.01f;\r
\r
  vec3 bxrd = cross(b,rd);\r
  vec3 bxroa = cross(b,ro-a);\r
  coeff[2] = dot(bxrd,bxrd);\r
  coeff[1] = 2.0f*dot(bxrd,bxroa);\r
  coeff[0] = dot(bxroa,bxroa)-dot(b,b)*rad*rad;\r
\r
  vec2 res;\r
  int s = quadratic(coeff[2],coeff[1],coeff[0],res);\r
  if (s == 0) return(-1.0f);\r
  if (res[0] < 0.0f && res[1] < 0.0f) return(-1.0f);\r
  float t = min(res[0],res[1]);\r
  vec3 p = ro + t * rd;\r
  if (dot(p,p) > 1.0f) return(-1.0f);\r
  return(t);\r
}\r
\r
vec3 clebschNormal(vec3 p) {\r
  vec3 n;\r
\r
  n.x = 243.0f*p.x*p.x - 378.0f*p.x*(p.y + p.z) - 18.0f*p.x - 189.0f*p.y*p.y + 54.0f*p.y*p.z + 126.0f*p.y - 189.0f*p.z*p.z + 126.0f*p.z - 9.0f;\r
  n.y = -189.0f*p.x*p.x + 54.0f*p.x*p.z + 126.0f*p.x + 243.0f*p.y*p.y - 378.0f*p.y*(p.x + p.z) - 18.0f*p.y - 189.0f*p.z*p.z + 126.0f*p.z - 9.0f;\r
  n.z = -189.0f*p.x*p.x + 54.0f*p.x*p.y + 126.0f*p.x - 189.0f*p.y*p.y + 126.0f*p.y + 243.0f*p.z*p.z - 378.0f*p.z*(p.x + p.y) - 18.0f*p.z - 9.0f;\r
  return(normalize(n));\r
}\r
\r
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
  float coeff[4];\r
  vec3 res;\r
  float t = 1e20f;\r
\r
  coeff[3] =\r
    c003*pow(rd.z,3.0) + c012*rd.y*pow(rd.z,2.0) + c021*pow(rd.y,2.0)*rd.z +\r
    c030*pow(rd.y,3.0) + c102*rd.x*pow(rd.z,2.0) + c111*rd.x*rd.y*rd.z +\r
    c120*rd.x*pow(rd.y,2.0) + c201*pow(rd.x,2.0)*rd.z + c210*pow(rd.x,2.0)*rd.y +\r
    c300*pow(rd.x,3.0);\r
\r
  coeff[2] =\r
    ro.x*c102*pow(rd.z,2.0) + ro.x*c111*rd.y*rd.z + ro.x*c120*pow(rd.y,2.0) +\r
    2.0*ro.x*c201*rd.x*rd.z + 2.0*ro.x*c210*rd.x*rd.y + 3.0*ro.x*c300*pow(rd.x,2.0) +\r
    ro.y*c012*pow(rd.z,2.0) + 2.0*ro.y*c021*rd.y*rd.z + 3.0*ro.y*c030*pow(rd.y,2.0) +\r
    ro.y*c111*rd.x*rd.z + 2.0*ro.y*c120*rd.x*rd.y + ro.y*c210*pow(rd.x,2.0) +\r
    3.0*ro.z*c003*pow(rd.z,2.0) + 2.0*ro.z*c012*rd.y*rd.z + ro.z*c021*pow(rd.y,2.0) +\r
    2.0*ro.z*c102*rd.x*rd.z + ro.z*c111*rd.x*rd.y + ro.z*c201*pow(rd.x,2.0) +\r
    c002*pow(rd.z,2.0) + c011*rd.y*rd.z + c020*pow(rd.y,2.0) +\r
    c101*rd.x*rd.z + c110*rd.x*rd.y + c200*pow(rd.x,2.0);\r
\r
  coeff[1] =\r
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
  coeff[0] =\r
    pow(ro.x,3.0)*c300 + pow(ro.x,2.0)*ro.y*c210 + pow(ro.x,2.0)*ro.z*c201 + pow(ro.x,2.0)*c200 +\r
    ro.x*pow(ro.y,2.0)*c120 + ro.x*ro.y*ro.z*c111 + ro.x*ro.y*c110 +\r
    ro.x*pow(ro.z,2.0)*c102 + ro.x*ro.z*c101 + ro.x*c100 +\r
    pow(ro.y,3.0)*c030 + pow(ro.y,2.0)*ro.z*c021 + pow(ro.y,2.0)*c020 +\r
    ro.y*pow(ro.z,2.0)*c012 + ro.y*ro.z*c011 + ro.y*c010 +\r
    pow(ro.z,3.0)*c003 + pow(ro.z,2.0)*c002 + ro.z*c001 + c000;\r
\r
  \r
  int n = cubic(coeff[3],coeff[2],coeff[1],coeff[0],res);\r
  for(int i = 0; i < n; i++) {\r
    if (res[i] < 0.0f)\r
      continue;\r
    if (res[i] < t) {\r
      vec3 p = ro + res[i] * rd;\r
      if (dot(p,p) > 10.0f)\r
        continue;\r
      t = res[i];\r
    }\r
  }\r
\r
  if(t == 1e20f)\r
    return (-1.0f);\r
  return (t);\r
}\r
\r
\r
vec3 cubicSurfaceNormal(vec3 p, float coeffs[20]) {\r
  float c300 = uCoeffs[0];\r
  float c030 = uCoeffs[1];\r
  float c003 = uCoeffs[2];\r
  float c210 = uCoeffs[3];\r
  float c201 = uCoeffs[4];\r
  float c021 = uCoeffs[5];\r
  float c012 = uCoeffs[6];\r
  float c120 = uCoeffs[7];\r
  float c102 = uCoeffs[8];\r
  float c111 = uCoeffs[9];\r
  float c200 = uCoeffs[10];\r
  float c020 = uCoeffs[11];\r
  float c002 = uCoeffs[12];\r
  float c101 = uCoeffs[13];\r
  float c110 = uCoeffs[14];\r
  float c011 = uCoeffs[15];\r
  float c100 = uCoeffs[16];\r
  float c010 = uCoeffs[17];\r
  float c001 = uCoeffs[18];\r
  float c000 = uCoeffs[19];\r
  vec3 n;\r
\r
  n.x = c100 + c101*p.z + c102*pow(p.z, 2.0) + c110*p.y + c111*p.y*p.z + c120*pow(p.y, 2.0) + 2.0*c200*p.x + 2.0*c201*p.x*p.z + 2.0*c210*p.x*p.y + 3.0*c300*pow(p.x, 2.0);\r
  n.y = c010 + c011*p.z + c012*pow(p.z, 2.0) + 2.0*c020*p.y + 2.0*c021*p.y*p.z + 3.0*c030*pow(p.y, 2.0) + c110*p.x + c111*p.x*p.z + 2.0*c120*p.x*p.y + c210*pow(p.x, 2.0);\r
  n.z = c001 + 2.0*c002*p.z + 3.0*c003*pow(p.z, 2.0) + c011*p.y + 2.0*c012*p.y*p.z + c021*pow(p.y, 2.0) + c101*p.x + 2.0*c102*p.x*p.z + c111*p.x*p.y + c201*pow(p.x, 2.0);\r
\r
  return(normalize(n));\r
}\r
\r
\r
\r
vec3 clebschLineNormal(vec3 p) {\r
  vec3 a = vec3(0.0f,0.0f,-1.0/3.0f);\r
  vec3 b = vec3(1.0f,-1.0f,0.0f);\r
  vec3 n = cross(b,cross(b,p-a));\r
  return(normalize(n));\r
}\r
\r
\r
\r
void main() {\r
  vec3 ro = vUV;\r
  vec3 rd = (uOrthographic == 1) ? -uModelInverse[2].xyz : vUV - uModelInverse[3].xyz;\r
  rd = normalize(rd);\r
  vec4 col = vec4(1.0f, 1.0f, 1.0f, 1.0f);\r
\r
  vec3 p, n;\r
  float lambda;\r
\r
  switch(uSurface) {\r
    case 1:\r
      lambda = cubicSurfaceIntersect(ro, rd, uCoeffs);\r
      if(lambda < 0.0f)\r
        discard;\r
      p = ro + lambda * rd;\r
      n = cubicSurfaceNormal(p, uCoeffs);\r
      break;\r
\r
    case 2:\r
      lambda = clebschIntersect(ro, rd);\r
      if(lambda < 0.0f)\r
        discard;\r
      p = ro + lambda * rd;\r
      n = clebschNormal(p);\r
      float lambdro = clebschLineIntersect(ro,rd);\r
      if (lambdro > 0.0f && lambdro < lambda) {\r
        p = ro + lambdro * rd;\r
        n = clebschLineNormal(p);\r
        col = vec4(1.0f,0.0f,0.0f,1.0f);\r
      }\r
      break;\r
  }\r
  fColor = abs(dot(rd, n)) * col;\r
}\r
`;function R(r){const o=window.innerWidth,f=window.innerHeight,n=16/9;let t=o,e=o/n;e>f&&(e=f,t=f*n),r.width=t*window.devicePixelRatio,r.height=e*window.devicePixelRatio,r.style.width=`${t}px`,r.style.height=`${e}px`,r.style.position="absolute",r.style.top="50%",r.style.left="50%",r.style.transform="translate(-50%, -50%)"}function I(r,o,f){const n=r.createShader(o);if(r.shaderSource(n,f),r.compileShader(n),!r.getShaderParameter(n,r.COMPILE_STATUS))throw new Error(r.getShaderInfoLog(n)||"Shader compile error");return n}function J(r,o,f){const n=I(r,r.VERTEX_SHADER,o),t=I(r,r.FRAGMENT_SHADER,f),e=r.createProgram();if(r.attachShader(e,n),r.attachShader(e,t),r.linkProgram(e),!r.getProgramParameter(e,r.LINK_STATUS))throw new Error(r.getProgramInfoLog(e)||"Program link error");return e}const d=3;function rr(r,o){const f=new Float32Array([-3,-3,-3,d,-3,-3,-3,d,-3,d,d,-3,-3,-3,d,d,-3,d,-3,d,d,d,d,d]),n=new Uint16Array([0,2,1,1,2,3,4,5,6,6,5,7,0,5,4,0,1,5,2,6,7,2,7,3,7,1,3,7,5,1,0,6,2,0,4,6]),t=r.createVertexArray();r.bindVertexArray(t);const e=r.createBuffer();r.bindBuffer(r.ARRAY_BUFFER,e),r.bufferData(r.ARRAY_BUFFER,f,r.STATIC_DRAW);const a=r.getAttribLocation(o,"aPosition");r.enableVertexAttribArray(a),r.vertexAttribPointer(a,3,r.FLOAT,!1,0,0);const i=r.createBuffer();return r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,i),r.bufferData(r.ELEMENT_ARRAY_BUFFER,n,r.STATIC_DRAW),{vao:t,iboSize:n.length}}function U(r,o){const f=r.canvas,n=f.clientWidth,t=f.clientHeight,e=(2*o[0]-n)/n,a=(t-2*o[1])/t,i=1-e*e-a*a,s=i>0?Math.sqrt(i):0;return j(e,a,s)}function or(r,o){const f=k();if($(f,r,o),H(f)<1e-5)return S();Y(f,f);const n=Math.max(-1,Math.min(1,W(r,o))),t=Math.acos(n);return D(S(),f,t)}function A(r){const o=r.gl,f=r.program;o.uniformMatrix4fv(o.getUniformLocation(f,"uProjection"),!1,r.projection),o.uniformMatrix4fv(o.getUniformLocation(f,"uModelView"),!1,r.modelView);const n=O(l(),r.modelView);o.uniformMatrix4fv(o.getUniformLocation(f,"uModelInverse"),!1,n),o.uniform1i(o.getUniformLocation(f,"uSurface"),r.curSurface),o.uniform1i(o.getUniformLocation(f,"uOrthographic"),r.viewMode===2?1:0),o.bindVertexArray(r.cube.vao),o.drawElements(o.TRIANGLES,r.cube.iboSize,o.UNSIGNED_SHORT,0)}function z(r){const o=r.gl;o.viewport(0,0,o.canvas.width,o.canvas.height),o.clear(o.COLOR_BUFFER_BIT|o.DEPTH_BUFFER_BIT);const f=o.canvas.width/o.canvas.height,n=10,t=100,e=30,a=f*e;let i=0,s=0,c=50;if(L(r.projection),L(r.modelView),r.viewMode===2)N(r.projection,-a/2,a/2,-30/2,e/2,n,t);else{const m=n*(-a/2-i)/c,p=n*(a/2-i)/c,y=n*(-30/2-s)/c,x=n*(e/2-s)/c;h(r.projection,m,p,y,x,n,t)}C(r.modelView,r.modelView,[-0,-0,-50]);const u=P(l(),r.qNow);if(B(u,u,[r.zoom*15,r.zoom*15,r.zoom*15]),g(r.modelView,r.modelView,u),A(r),r.viewMode===3){const p=P(l(),r.qNow);B(p,p,[r.zoom*15,r.zoom*15,r.zoom*15]),o.colorMask(!0,!1,!1,!0);const y=l(),x=l();h(y,n*(-a/2-1.5)/c,n*(a/2-1.5)/c,n*(-30/2-s)/c,n*(e/2-s)/c,n,t),C(x,x,[-1.5,-0,-50]),g(r.modelView,x,p),M(r.projection,y),A(r),o.clear(o.DEPTH_BUFFER_BIT),o.colorMask(!1,!0,!0,!0);const E=l(),b=l();h(E,n*(-a/2+1.5)/c,n*(a/2+1.5)/c,n*(-30/2-s)/c,n*(e/2-s)/c,n,t),C(b,b,[1.5,-0,-50]),g(r.modelView,b,p),M(r.projection,E),A(r),o.colorMask(!0,!0,!0,!0)}}window.addEventListener("load",async()=>{var s;const r=document.getElementById("glcanvas"),o=r.getContext("webgl2");R(r),o.viewport(0,0,r.width,r.height);const f=J(o,K,Z);o.useProgram(f);const n=o.getUniformLocation(f,"uCoeffs"),t=rr(o,f),e={gl:o,program:f,cube:t,projection:l(),modelView:l(),qNow:S(),mousePos:F(),mousePressed:!1,zoom:.5,viewMode:1,curSurface:1};window.ctx=e,o.clearColor(.5,.5,.5,1),o.enable(o.DEPTH_TEST),o.enable(o.CULL_FACE);const a=(s=window.getUserCoeffs)==null?void 0:s.call(window);(a==null?void 0:a.length)===20&&o.uniform1fv(n,new Float32Array(a)),r.addEventListener("mousedown",c=>{e.mousePressed=!0,T(e.mousePos,c.clientX,c.clientY)}),r.addEventListener("mouseup",()=>e.mousePressed=!1),r.addEventListener("mousemove",c=>{if(!e.mousePressed)return;const u=V(c.clientX,c.clientY),m=U(o,e.mousePos),p=U(o,u),y=or(m,p);X(e.qNow,y,e.qNow),_(e.mousePos,u),z(e)}),r.addEventListener("wheel",c=>{c.preventDefault(),e.zoom*=c.deltaY>0?1/1.1:1.1,z(e)},{passive:!1}),document.getElementById("viewMode").addEventListener("change",c=>{e.viewMode=parseInt(c.target.value),z(e)}),document.getElementById("surfaceMode").addEventListener("change",c=>{e.curSurface=parseInt(c.target.value),z(e)});function i(){z(e),requestAnimationFrame(i)}window.addEventListener("resize",()=>{R(r),o.viewport(0,0,r.width,r.height)}),i()});
