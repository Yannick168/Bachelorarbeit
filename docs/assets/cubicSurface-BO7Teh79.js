import"./modulepreload-polyfill-B5Qt9EMX.js";import{A as w,E as $,c as v,i as F,o as H,b as S,t as B,d as I,s as R,m as C,a as T,e as Z}from"./mat4-DousPgjw.js";import{c as N,f as P,d as D,a as A,b as K,n as _,l as G}from"./vec3-Er0YIGI6.js";function j(){var r=new w(9);return w!=Float32Array&&(r[1]=0,r[2]=0,r[3]=0,r[5]=0,r[6]=0,r[7]=0),r[0]=1,r[4]=1,r[8]=1,r}function Q(){var r=new w(4);return w!=Float32Array&&(r[0]=0,r[1]=0,r[2]=0,r[3]=0),r}function W(r,n){var e=n[0],o=n[1],t=n[2],f=n[3],c=e*e+o*o+t*t+f*f;return c>0&&(c=1/Math.sqrt(c)),r[0]=e*c,r[1]=o*c,r[2]=t*c,r[3]=f*c,r}(function(){var r=Q();return function(n,e,o,t,f,c){var a,d;for(e||(e=4),o||(o=0),t?d=Math.min(t*e+o,n.length):d=n.length,a=o;a<d;a+=e)r[0]=n[a],r[1]=n[a+1],r[2]=n[a+2],r[3]=n[a+3],f(r,r,c),n[a]=r[0],n[a+1]=r[1],n[a+2]=r[2],n[a+3]=r[3];return n}})();function b(){var r=new w(4);return w!=Float32Array&&(r[0]=0,r[1]=0,r[2]=0),r[3]=1,r}function Y(r,n,e){e=e*.5;var o=Math.sin(e);return r[0]=o*n[0],r[1]=o*n[1],r[2]=o*n[2],r[3]=Math.cos(e),r}function J(r,n,e){var o=n[0],t=n[1],f=n[2],c=n[3],a=e[0],d=e[1],i=e[2],s=e[3];return r[0]=o*s+c*a+t*i-f*d,r[1]=t*s+c*d+f*a-o*i,r[2]=f*s+c*i+o*d-t*a,r[3]=c*s-o*a-t*d-f*i,r}function M(r,n,e,o){var t=n[0],f=n[1],c=n[2],a=n[3],d=e[0],i=e[1],s=e[2],x=e[3],l,p,z,m,y;return p=t*d+f*i+c*s+a*x,p<0&&(p=-p,d=-d,i=-i,s=-s,x=-x),1-p>$?(l=Math.acos(p),z=Math.sin(l),m=Math.sin((1-o)*l)/z,y=Math.sin(o*l)/z):(m=1-o,y=o),r[0]=m*t+y*d,r[1]=m*f+y*i,r[2]=m*c+y*s,r[3]=m*a+y*x,r}function rr(r,n){var e=n[0]+n[4]+n[8],o;if(e>0)o=Math.sqrt(e+1),r[3]=.5*o,o=.5/o,r[0]=(n[5]-n[7])*o,r[1]=(n[6]-n[2])*o,r[2]=(n[1]-n[3])*o;else{var t=0;n[4]>n[0]&&(t=1),n[8]>n[t*3+t]&&(t=2);var f=(t+1)%3,c=(t+2)%3;o=Math.sqrt(n[t*3+t]-n[f*3+f]-n[c*3+c]+1),r[t]=.5*o,o=.5/o,r[3]=(n[f*3+c]-n[c*3+f])*o,r[f]=(n[f*3+t]+n[t*3+f])*o,r[c]=(n[c*3+t]+n[t*3+c])*o}return r}var O=W;(function(){var r=N(),n=P(1,0,0),e=P(0,1,0);return function(o,t,f){var c=D(t,f);return c<-.999999?(A(r,n,t),K(r)<1e-6&&A(r,e,t),_(r,r),Y(o,r,Math.PI),o):c>.999999?(o[0]=0,o[1]=0,o[2]=0,o[3]=1,o):(A(r,t,f),o[0]=r[0],o[1]=r[1],o[2]=r[2],o[3]=1+c,O(o,o))}})();(function(){var r=b(),n=b();return function(e,o,t,f,c,a){return M(r,o,c,a),M(n,t,f,a),M(e,r,n,2*a*(1-a)),e}})();(function(){var r=j();return function(n,e,o,t){return r[0]=o[0],r[3]=o[1],r[6]=o[2],r[1]=t[0],r[4]=t[1],r[7]=t[2],r[2]=-e[0],r[5]=-e[1],r[8]=-e[2],O(n,rr(n,r))}})();function k(){var r=new w(2);return w!=Float32Array&&(r[0]=0,r[1]=0),r}function nr(r,n){var e=new w(2);return e[0]=r,e[1]=n,e}function or(r,n){return r[0]=n[0],r[1]=n[1],r}function er(r,n,e){return r[0]=n,r[1]=e,r}(function(){var r=k();return function(n,e,o,t,f,c){var a,d;for(e||(e=2),o||(o=0),t?d=Math.min(t*e+o,n.length):d=n.length,a=o;a<d;a+=e)r[0]=n[a],r[1]=n[a+1],f(r,r,c),n[a]=r[0],n[a+1]=r[1];return n}})();const tr=document.getElementById("coeffContainer"),fr=["x³","y³","z³","x²y","x²z","y²z","yz²","xy²","xz²","xyz","x²","y²","z²","xz","xy","yz","x","y","z","1"],g=[0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,-1],E=[];for(let r=0;r<20;r++){const n=document.createElement("div");n.className="coeff-group";const e=document.createElement("label");e.textContent=`${fr[r]}: `;const o=document.createElement("input");o.type="number",o.value=g[r].toString(),o.step="0.1";const t=document.createElement("input");t.type="range",t.min=(g[r]-10).toString(),t.max=(g[r]+10).toString(),t.step="0.1",t.value=g[r].toString(),o.addEventListener("input",()=>{const f=parseFloat(o.value)||0;t.min=(f-5).toFixed(1),t.max=(f+5).toFixed(1),t.value=f.toString(),U()}),t.addEventListener("input",()=>{o.value=t.value,U()}),n.appendChild(e),n.appendChild(o),n.appendChild(t),tr.appendChild(n),E.push(o)}globalThis.getUserCoeffs=()=>E.map(r=>parseFloat(r.value)||0);globalThis.getUserCoeffs.inputs=E;function U(){var t,f;const r=E.map(c=>parseFloat(c.value)||0),n=(t=window.ctx)==null?void 0:t.gl,e=(f=window.ctx)==null?void 0:f.program,o=n==null?void 0:n.getUniformLocation(e,"uCoeffs");n&&e&&o&&(n.useProgram(e),n.uniform1fv(o,new Float32Array(r)),window.ctx&&window.drawScene&&window.drawScene(window.ctx))}const cr=`#version 300 es\r
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
    vec4 pos = vec4(aPosition,1.0);\r
    vUV = pos.xyz;\r
    gl_Position = uProjection * uModelView * pos;\r
}\r
\r
`,ar=`#version 300 es\r
precision highp float;\r
\r
in vec3 vUV;\r
\r
uniform mat4 uModelInverse;\r
uniform int uOrthographic;\r
uniform int uSurface;\r
uniform float uCoeffs[20];\r
\r
uniform bool  uShowBox;          // per TS toggeln\r
uniform float uHalf;             // = r (z.B. 3.0)\r
uniform float uEdgeThickness;    // Linienstärke in Objektraum-Einheiten (z.B. 0.03)\r
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
  int n = cubic(coeff[3], coeff[2], coeff[1], coeff[0], res);\r
  for(int i = 0; i < n; i++) {\r
    if (res[i] < 0.0f)\r
      continue;\r
    if (res[i] < t) {\r
      vec3 p = ro + res[i] * rd;\r
      if (dot(p,p) > 100.0f)\r
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
const float EPS = 1e-4;\r
\r
\r
// Robuster Ray–AABB-Test (Slab-Methode) für [-h, h]^3\r
bool rayAABB(vec3 ro, vec3 rd, float h, out float tNear, out float tFar) {\r
    vec3 invD = 1.0 / rd;\r
    vec3 t0 = (vec3(-h) - ro) * invD;\r
    vec3 t1 = (vec3( h) - ro) * invD;\r
    vec3 tmin = min(t0, t1);\r
    vec3 tmax = max(t0, t1);\r
    tNear = max(max(tmin.x, tmin.y), tmin.z);\r
    tFar  = min(min(tmax.x, tmax.y), tmax.z);\r
    return tFar > max(tNear, 0.0);\r
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
  return(normalize(n));\r
}\r
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
  float tNear, tFar;\r
  if (!rayAABB(ro, rd, uHalf, tNear, tFar)) return -1.0;\r
  tNear = max(tNear, EPS);\r
\r
  vec3 res;\r
  float t = 1e20f;\r
  int n = cubic(coeff[3],coeff[2],coeff[1],coeff[0], res);\r
  \r
  // Kandidaten filtern auf Intervall\r
  for (int i = 0; i < n; ++i) {\r
    float ti = res[i];\r
    if (ti < 0.0)      continue;\r
    if (ti < tNear || ti > tFar) continue;\r
    t = min(t, ti);\r
  }\r
\r
  if(t == 1e20f)\r
    return (-1.0f);\r
  return (t);\r
}\r
\r
\r
\r
\r
float edgeDistance(vec3 p, float r) {\r
  // Distanz zu den drei Paaren |x|=r, |y|=r, |z|=r\r
  vec3 d = abs(abs(p) - r);      // d.x ~ Distanz zu x=±r, etc.\r
\r
  // „Beide klein“ ~ Nähe zur Kante\r
  float dXY = max(d.x, d.y);\r
  float dXZ = max(d.x, d.z);\r
  float dYZ = max(d.y, d.z);\r
\r
  // Nur werten, wenn die dritte Koordinate innerhalb ist (mit kleiner Toleranz)\r
  float t  = r + uEdgeThickness;\r
  float inX = step(abs(p.x), t);\r
  float inY = step(abs(p.y), t);\r
  float inZ = step(abs(p.z), t);\r
\r
  float BIG = 1e3;\r
  float eXY = mix(BIG, dXY, inZ); // Kanten parallel Z\r
  float eXZ = mix(BIG, dXZ, inY); // Kanten parallel Y\r
  float eYZ = mix(BIG, dYZ, inX); // Kanten parallel X\r
\r
  return min(min(eXY, eXZ), eYZ);\r
}\r
\r
\r
void main() {\r
  // ===== Box-Kanten zuerst prüfen (BEVOR irgendwas discardet wird) =====\r
  // vUV ist hier deine Objektraum-Position auf der Cube-Fläche.\r
  if (uShowBox) {\r
    float d  = edgeDistance(vUV, uHalf);           // Abstand zur nächsten Kante\r
    float aa = fwidth(d);                           // Anti-Aliasing\r
    float m  = 1.0 - smoothstep(uEdgeThickness - aa,\r
                                uEdgeThickness + aa, d);\r
    if (m > 0.0) {\r
      // reine Kante: direkt ausgeben und fertig\r
      fColor = vec4(0.0f, 0.0f, 0.0f, 1.0f);       // Kantenfarbe\r
      return;\r
    }\r
  }\r
\r
  // ===== Dein bisheriger Ray-Setup =====\r
  vec3 ro = vUV;\r
  vec3 rd = (uOrthographic == 1) ? -uModelInverse[2].xyz\r
                                 : vUV - uModelInverse[3].xyz;\r
  rd = normalize(rd);\r
  ro += 1e-4 * rd; // kleiner Push-off gegen Self-Intersection\r
  \r
  vec4 col = vec4(0.0f, 1.0f, 0.0f, 1.0f);\r
\r
  vec3 p, n;\r
  float lambda;\r
\r
  switch(uSurface) {\r
    case 1:\r
      lambda = cubicSurfaceIntersect(ro, rd, uCoeffs);\r
      if (lambda < 0.0f)\r
        discard;\r
      p = ro + lambda * rd;\r
      n = cubicSurfaceNormal(p, uCoeffs);\r
      break;\r
\r
    case 2:\r
      lambda = clebschIntersect(ro, rd);\r
      if (lambda < 0.0f)\r
        discard;\r
      p = ro + lambda * rd;\r
      n = clebschNormal(p);\r
\r
      float lambdro = clebschLineIntersect(ro, rd);\r
      if (lambdro > 0.0f && lambdro < lambda) {\r
        p = ro + lambdro * rd;\r
        n = clebschLineNormal(p);\r
        col = vec4(1.0f, 0.0f, 0.0f, 1.0f);\r
      }\r
      break;\r
  }\r
\r
  // Headlight-/View-Shading\r
  float shade = abs(dot(normalize(rd), normalize(n)));\r
  fColor = vec4(col.rgb * shade, col.a);\r
}\r
`;function X(r){const n=window.innerWidth,e=window.innerHeight,o=16/9;let t=n,f=n/o;f>e&&(f=e,t=e*o),r.width=t*window.devicePixelRatio,r.height=f*window.devicePixelRatio,r.style.width=`${t}px`,r.style.height=`${f}px`,r.style.position="absolute",r.style.top="50%",r.style.left="50%",r.style.transform="translate(-50%, -50%)"}function q(r,n,e){const o=r.createShader(n);if(r.shaderSource(o,e),r.compileShader(o),!r.getShaderParameter(o,r.COMPILE_STATUS))throw new Error(r.getShaderInfoLog(o)||"Shader compile error");return o}function ir(r,n,e){const o=q(r,r.VERTEX_SHADER,n),t=q(r,r.FRAGMENT_SHADER,e),f=r.createProgram();if(r.attachShader(f,o),r.attachShader(f,t),r.linkProgram(f),!r.getProgramParameter(f,r.LINK_STATUS))throw new Error(r.getProgramInfoLog(f)||"Program link error");return f}const u=5;function dr(r,n){const e=new Float32Array([-5,-5,-5,u,-5,-5,-5,u,-5,u,u,-5,-5,-5,u,u,-5,u,-5,u,u,u,u,u]),o=new Uint16Array([0,2,1,1,2,3,4,5,6,6,5,7,0,5,4,0,1,5,2,6,7,2,7,3,7,1,3,7,5,1,0,6,2,0,4,6]),t=r.createVertexArray();r.bindVertexArray(t);const f=r.createBuffer();r.bindBuffer(r.ARRAY_BUFFER,f),r.bufferData(r.ARRAY_BUFFER,e,r.STATIC_DRAW);const c=r.getAttribLocation(n,"aPosition");r.enableVertexAttribArray(c),r.vertexAttribPointer(c,3,r.FLOAT,!1,0,0);const a=r.createBuffer();return r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,a),r.bufferData(r.ELEMENT_ARRAY_BUFFER,o,r.STATIC_DRAW),{vao:t,iboSize:o.length}}function V(r,n){const e=r.canvas,o=e.clientWidth,t=e.clientHeight,f=(2*n[0]-o)/o,c=(t-2*n[1])/t,a=1-f*f-c*c,d=a>0?Math.sqrt(a):0;return P(f,c,d)}function sr(r,n){const e=N();if(A(e,r,n),G(e)<1e-5)return b();_(e,e);const o=Math.max(-1,Math.min(1,D(r,n))),t=Math.acos(o);return Y(b(),e,t)}function L(r){const n=r.gl,e=r.program;n.uniformMatrix4fv(n.getUniformLocation(e,"uProjection"),!1,r.projection),n.uniformMatrix4fv(n.getUniformLocation(e,"uModelView"),!1,r.modelView);const o=Z(v(),r.modelView);n.uniformMatrix4fv(n.getUniformLocation(e,"uModelInverse"),!1,o),n.uniform1i(n.getUniformLocation(e,"uSurface"),r.curSurface),n.uniform1i(n.getUniformLocation(e,"uOrthographic"),r.viewMode===2?1:0),n.uniform1i(n.getUniformLocation(e,"uShowBox"),r.showBox?1:0),n.uniform1f(n.getUniformLocation(e,"uHalf"),u),n.uniform1f(n.getUniformLocation(e,"uEdgeThickness"),.03),n.bindVertexArray(r.cube.vao),n.drawElements(n.TRIANGLES,r.cube.iboSize,n.UNSIGNED_SHORT,0)}function h(r){const n=r.gl;n.viewport(0,0,n.canvas.width,n.canvas.height),n.clear(n.COLOR_BUFFER_BIT|n.DEPTH_BUFFER_BIT);const e=n.canvas.width/n.canvas.height,o=10,t=100,f=30,c=e*f;let a=0,d=0,i=50;if(F(r.projection),F(r.modelView),r.viewMode===2)H(r.projection,-c/2,c/2,-30/2,f/2,o,t);else{const x=o*(-c/2-a)/i,l=o*(c/2-a)/i,p=o*(-30/2-d)/i,z=o*(f/2-d)/i;S(r.projection,x,l,p,z,o,t)}B(r.modelView,r.modelView,[-0,-0,-50]);const s=I(v(),r.qNow);if(R(s,s,[r.zoom*15,r.zoom*15,r.zoom*15]),C(r.modelView,r.modelView,s),L(r),r.viewMode===3){const l=I(v(),r.qNow);R(l,l,[r.zoom*15,r.zoom*15,r.zoom*15]),n.colorMask(!0,!1,!1,!0);const p=v(),z=v();S(p,o*(-c/2-1.5)/i,o*(c/2-1.5)/i,o*(-30/2-d)/i,o*(f/2-d)/i,o,t),B(z,z,[-1.5,-0,-50]),C(r.modelView,z,l),T(r.projection,p),L(r),n.clear(n.DEPTH_BUFFER_BIT),n.colorMask(!1,!0,!0,!0);const m=v(),y=v();S(m,o*(-c/2+1.5)/i,o*(c/2+1.5)/i,o*(-30/2-d)/i,o*(f/2-d)/i,o,t),B(y,y,[1.5,-0,-50]),C(r.modelView,y,l),T(r.projection,m),L(r),n.colorMask(!0,!0,!0,!0)}}window.addEventListener("load",async()=>{var d;const r=document.getElementById("glcanvas"),n=r.getContext("webgl2");X(r),n.viewport(0,0,r.width,r.height);const e=ir(n,cr,ar);n.useProgram(e);const o=n.getUniformLocation(e,"uCoeffs"),t=dr(n,e),f={gl:n,program:e,cube:t,projection:v(),modelView:v(),qNow:b(),mousePos:k(),mousePressed:!1,zoom:.5,viewMode:1,curSurface:1,showBox:!0};window.ctx=f,n.clearColor(1,1,1,1),n.enable(n.DEPTH_TEST),n.enable(n.CULL_FACE);const c=(d=window.getUserCoeffs)==null?void 0:d.call(window);(c==null?void 0:c.length)===20&&n.uniform1fv(o,new Float32Array(c)),r.addEventListener("mousedown",i=>{f.mousePressed=!0,er(f.mousePos,i.clientX,i.clientY)}),r.addEventListener("mouseup",()=>f.mousePressed=!1),r.addEventListener("mousemove",i=>{if(!f.mousePressed)return;const s=nr(i.clientX,i.clientY),x=V(n,f.mousePos),l=V(n,s),p=sr(x,l);J(f.qNow,p,f.qNow),or(f.mousePos,s),h(f)}),r.addEventListener("wheel",i=>{i.preventDefault(),f.zoom*=i.deltaY>0?1/1.1:1.1,h(f)},{passive:!1}),document.getElementById("viewMode").addEventListener("change",i=>{f.viewMode=parseInt(i.target.value),h(f)}),document.getElementById("surfaceMode").addEventListener("change",i=>{f.curSurface=parseInt(i.target.value),h(f)});function a(){h(f),requestAnimationFrame(a)}window.addEventListener("resize",()=>{X(r),n.viewport(0,0,r.width,r.height)}),a()});
