import"./modulepreload-polyfill-B5Qt9EMX.js";import{A as m,E as X,c as h,b as L,o as Y,f as F,t as M,d as S,s as P,m as B,e as N,i as j}from"./mat4-C4qrYsWx.js";function G(){var r=new m(9);return m!=Float32Array&&(r[1]=0,r[2]=0,r[3]=0,r[5]=0,r[6]=0,r[7]=0),r[0]=1,r[4]=1,r[8]=1,r}function I(){var r=new m(3);return m!=Float32Array&&(r[0]=0,r[1]=0,r[2]=0),r}function U(r){var n=r[0],t=r[1],e=r[2];return Math.hypot(n,t,e)}function q(r,n,t){var e=new m(3);return e[0]=r,e[1]=n,e[2]=t,e}function V(r,n){var t=n[0],e=n[1],o=n[2],c=t*t+e*e+o*o;return c>0&&(c=1/Math.sqrt(c)),r[0]=n[0]*c,r[1]=n[1]*c,r[2]=n[2]*c,r}function D(r,n){return r[0]*n[0]+r[1]*n[1]+r[2]*n[2]}function A(r,n,t){var e=n[0],o=n[1],c=n[2],a=t[0],i=t[1],f=t[2];return r[0]=o*f-c*i,r[1]=c*a-e*f,r[2]=e*i-o*a,r}var K=U;(function(){var r=I();return function(n,t,e,o,c,a){var i,f;for(t||(t=3),e||(e=0),o?f=Math.min(o*t+e,n.length):f=n.length,i=e;i<f;i+=t)r[0]=n[i],r[1]=n[i+1],r[2]=n[i+2],c(r,r,a),n[i]=r[0],n[i+1]=r[1],n[i+2]=r[2];return n}})();function Q(){var r=new m(4);return m!=Float32Array&&(r[0]=0,r[1]=0,r[2]=0,r[3]=0),r}function Z(r,n){var t=n[0],e=n[1],o=n[2],c=n[3],a=t*t+e*e+o*o+c*c;return a>0&&(a=1/Math.sqrt(a)),r[0]=t*a,r[1]=e*a,r[2]=o*a,r[3]=c*a,r}(function(){var r=Q();return function(n,t,e,o,c,a){var i,f;for(t||(t=4),e||(e=0),o?f=Math.min(o*t+e,n.length):f=n.length,i=e;i<f;i+=t)r[0]=n[i],r[1]=n[i+1],r[2]=n[i+2],r[3]=n[i+3],c(r,r,a),n[i]=r[0],n[i+1]=r[1],n[i+2]=r[2],n[i+3]=r[3];return n}})();function w(){var r=new m(4);return m!=Float32Array&&(r[0]=0,r[1]=0,r[2]=0),r[3]=1,r}function O(r,n,t){t=t*.5;var e=Math.sin(t);return r[0]=e*n[0],r[1]=e*n[1],r[2]=e*n[2],r[3]=Math.cos(t),r}function J(r,n,t){var e=n[0],o=n[1],c=n[2],a=n[3],i=t[0],f=t[1],s=t[2],l=t[3];return r[0]=e*l+a*i+o*s-c*f,r[1]=o*l+a*f+c*i-e*s,r[2]=c*l+a*s+e*f-o*i,r[3]=a*l-e*i-o*f-c*s,r}function E(r,n,t,e){var o=n[0],c=n[1],a=n[2],i=n[3],f=t[0],s=t[1],l=t[2],p=t[3],u,d,z,x,y;return d=o*f+c*s+a*l+i*p,d<0&&(d=-d,f=-f,s=-s,l=-l,p=-p),1-d>X?(u=Math.acos(d),z=Math.sin(u),x=Math.sin((1-e)*u)/z,y=Math.sin(e*u)/z):(x=1-e,y=e),r[0]=x*o+y*f,r[1]=x*c+y*s,r[2]=x*a+y*l,r[3]=x*i+y*p,r}function rr(r,n){var t=n[0]+n[4]+n[8],e;if(t>0)e=Math.sqrt(t+1),r[3]=.5*e,e=.5/e,r[0]=(n[5]-n[7])*e,r[1]=(n[6]-n[2])*e,r[2]=(n[1]-n[3])*e;else{var o=0;n[4]>n[0]&&(o=1),n[8]>n[o*3+o]&&(o=2);var c=(o+1)%3,a=(o+2)%3;e=Math.sqrt(n[o*3+o]-n[c*3+c]-n[a*3+a]+1),r[o]=.5*e,e=.5/e,r[3]=(n[c*3+a]-n[a*3+c])*e,r[c]=(n[c*3+o]+n[o*3+c])*e,r[a]=(n[a*3+o]+n[o*3+a])*e}return r}var $=Z;(function(){var r=I(),n=q(1,0,0),t=q(0,1,0);return function(e,o,c){var a=D(o,c);return a<-.999999?(A(r,n,o),K(r)<1e-6&&A(r,t,o),V(r,r),O(e,r,Math.PI),e):a>.999999?(e[0]=0,e[1]=0,e[2]=0,e[3]=1,e):(A(r,o,c),e[0]=r[0],e[1]=r[1],e[2]=r[2],e[3]=1+a,$(e,e))}})();(function(){var r=w(),n=w();return function(t,e,o,c,a,i){return E(r,e,a,i),E(n,o,c,i),E(t,r,n,2*i*(1-i)),t}})();(function(){var r=G();return function(n,t,e,o){return r[0]=e[0],r[3]=e[1],r[6]=e[2],r[1]=o[0],r[4]=o[1],r[7]=o[2],r[2]=-t[0],r[5]=-t[1],r[8]=-t[2],$(n,rr(n,r))}})();function W(){var r=new m(2);return m!=Float32Array&&(r[0]=0,r[1]=0),r}function nr(r,n){var t=new m(2);return t[0]=r,t[1]=n,t}function er(r,n){return r[0]=n[0],r[1]=n[1],r}function tr(r,n,t){return r[0]=n,r[1]=t,r}(function(){var r=W();return function(n,t,e,o,c,a){var i,f;for(t||(t=2),e||(e=0),o?f=Math.min(o*t+e,n.length):f=n.length,i=e;i<f;i+=t)r[0]=n[i],r[1]=n[i+1],c(r,r,a),n[i]=r[0],n[i+1]=r[1];return n}})();const cr=document.getElementById("coeffContainer"),or=["x³","y³","z³","x²y","x²z","y²z","yz²","xy²","xz²","xyz","x²","y²","z²","xz","xy","yz","x","y","z","1"],g=[1,0,0,0,0,0,0,-3,0,0,0,0,0,0,0,0,0,0,-1,0],_=[];for(let r=0;r<20;r++){const n=document.createElement("div");n.className="coeff-group";const t=document.createElement("label");t.textContent=`${or[r]}: `;const e=document.createElement("input");e.type="number",e.value=g[r].toString(),e.step="0.1";const o=document.createElement("input");o.type="range",o.min=(g[r]-10).toString(),o.max=(g[r]+10).toString(),o.step="0.1",o.value=g[r].toString(),e.addEventListener("input",()=>{const c=parseFloat(e.value)||0;o.min=(c-5).toFixed(1),o.max=(c+5).toFixed(1),o.value=c.toString(),R()}),o.addEventListener("input",()=>{e.value=o.value,R()}),n.appendChild(t),n.appendChild(e),n.appendChild(o),cr.appendChild(n),_.push(e)}globalThis.getUserCoeffs=()=>_.map(r=>parseFloat(r.value)||0);globalThis.getUserCoeffs.inputs=_;function R(){var o,c;const r=_.map(a=>parseFloat(a.value)||0),n=(o=window.ctx)==null?void 0:o.gl,t=(c=window.ctx)==null?void 0:c.program,e=n==null?void 0:n.getUniformLocation(t,"uCoeffs");n&&t&&e&&(n.useProgram(t),n.uniform1fv(e,new Float32Array(r)),window.ctx&&window.drawScene&&window.drawScene(window.ctx))}const ar=`#version 300 es\r
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
`,ir=`#version 300 es\r
precision highp float;\r
\r
in vec3 vUV;                // Eintrittspunkt auf der Frontface des Würfels im Objektraum\r
out vec4 fColor;\r
\r
uniform mat4 uModelInverse; // Inverse Model-Matrix (Welt -> Objekt)\r
uniform int  uOrthographic; // 1 = Ortho, 0 = Perspective\r
uniform float uCoeffs[20];  // c300,c030,c003,c210,c201,c021,c012,c120,c102,c111,c200,c020,c002,c101,c110,c011,c100,c010,c001,c000\r
\r
// -----------------------------------------------------------------------------\r
// Hilfsfunktionen\r
// -----------------------------------------------------------------------------\r
const float PI = 3.1415926535897932384626433832795;\r
const float INF = 1.0e30;\r
const float BOX_HALF = 3.0;      // Würfel [-3,3]^3\r
\r
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
    if (abs(B) < eps) return 0;\r
    r.x = -C / B;\r
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
// Robuster kubischer Löser: gibt Anzahl reeller Wurzeln zurück; res enthält aufsteigend sortierte Wurzeln,\r
// nicht benutzte Slots sind INF.\r
int cubic(float A, float B, float C, float D, out vec3 res) {\r
  float scale = max(max(abs(A), abs(B)), max(abs(C), abs(D)));\r
  float eps = 1e-6 * (scale + 1.0);\r
  res = vec3(INF);\r
\r
  // Fast-Quadratik (A ~ 0)\r
  if (abs(A) < eps) {\r
    vec2 q; int nq = quadratic(B, C, D, q);\r
    if (nq == 2) res = vec3(q.x, q.y, INF);\r
    else if (nq == 1) res = vec3(q.x, INF, INF);\r
    return nq;\r
  }\r
\r
  // t ~ 0 Wurzel (D ~ 0) explizit\r
  if (abs(D) < eps) {\r
    vec2 q; int nq = quadratic(A, B, C, q);\r
    if (nq == 2) res = vec3(0.0, q.x, q.y);\r
    else if (nq == 1) res = vec3(0.0, q.x, INF);\r
    else res = vec3(0.0, INF, INF);\r
    sort3(res);\r
    return 1 + nq;\r
  }\r
\r
  // Monische Form: t^3 + a t^2 + b t + c\r
  float a = B / A;\r
  float b = C / A;\r
  float c = D / A;\r
\r
  // Depressierte Kubik: y^3 + p y + q = 0 mit t = y - a/3\r
  float a3 = a / 3.0;\r
  float p  = b - a*a/3.0;\r
  float q  = 2.0*a*a*a/27.0 - a*b/3.0 + c;\r
\r
  float half_q = 0.5 * q;\r
  float third_p = p / 3.0;\r
  float disc = half_q*half_q + third_p*third_p*third_p;\r
\r
  if (disc > eps) {\r
    // 1 reelle, 2 komplexe\r
    float s = sqrt(disc);\r
    float u = cbrt_safe(-half_q + s);\r
    float v = cbrt_safe(-half_q - s);\r
    float t = (u + v) - a3;\r
    res = vec3(t, INF, INF);\r
    return 1;\r
  }\r
\r
  if (abs(disc) <= eps) {\r
    // zwei reelle (eine doppelte) oder dreifache\r
    if (abs(p) <= eps && abs(q) <= eps) {\r
      float t = -a3;               // dreifach\r
      res = vec3(t, INF, INF);\r
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
  // drei reelle (trigonometrisch)\r
  float r = 2.0 * sqrt(-third_p);\r
  float arg = clamp(-half_q / sqrt(-third_p*third_p*third_p), -1.0, 1.0);\r
  float phi = acos(arg);\r
\r
  float t1 =  r * cos(        phi / 3.0) - a3;\r
  float t2 =  r * cos((phi + 2.0*PI) / 3.0) - a3;\r
  float t3 =  r * cos((phi + 4.0*PI) / 3.0) - a3;\r
\r
  res = vec3(t1, t2, t3);\r
  sort3(res);\r
  return 3;\r
}\r
\r
// -----------------------------------------------------------------------------\r
// Polynom, Gradient, Hessian-Einträge (für allgemeine Kubik)\r
// -----------------------------------------------------------------------------\r
void unpackCoeffs(in float c[20],\r
                  out float c300, out float c030, out float c003,\r
                  out float c210, out float c201, out float c021, out float c012,\r
                  out float c120, out float c102, out float c111,\r
                  out float c200, out float c020, out float c002,\r
                  out float c101, out float c110, out float c011,\r
                  out float c100, out float c010, out float c001,\r
                  out float c000) {\r
  c300=c[0];  c030=c[1];  c003=c[2];\r
  c210=c[3];  c201=c[4];  c021=c[5];  c012=c[6];\r
  c120=c[7];  c102=c[8];  c111=c[9];\r
  c200=c[10]; c020=c[11]; c002=c[12];\r
  c101=c[13]; c110=c[14]; c011=c[15];\r
  c100=c[16]; c010=c[17]; c001=c[18];\r
  c000=c[19];\r
}\r
\r
float cubicEval(in vec3 p, in float coeffs[20]) {\r
  float c300,c030,c003,c210,c201,c021,c012,c120,c102,c111,c200,c020,c002,c101,c110,c011,c100,c010,c001,c000;\r
  unpackCoeffs(coeffs, c300,c030,c003,c210,c201,c021,c012,c120,c102,c111,c200,c020,c002,c101,c110,c011,c100,c010,c001,c000);\r
  float x=p.x, y=p.y, z=p.z;\r
  return\r
    c300*x*x*x + c030*y*y*y + c003*z*z*z +\r
    c210*x*x*y + c201*x*x*z + c021*y*y*z + c012*y*z*z +\r
    c120*x*y*y + c102*x*z*z + c111*x*y*z +\r
    c200*x*x + c020*y*y + c002*z*z +\r
    c101*x*z + c110*x*y + c011*y*z +\r
    c100*x + c010*y + c001*z + c000;\r
}\r
\r
vec3 cubicGrad(in vec3 p, in float coeffs[20]) {\r
  float c300,c030,c003,c210,c201,c021,c012,c120,c102,c111,c200,c020,c002,c101,c110,c011,c100,c010,c001,c000;\r
  unpackCoeffs(coeffs, c300,c030,c003,c210,c201,c021,c012,c120,c102,c111,c200,c020,c002,c101,c110,c011,c100,c010,c001,c000);\r
  float x=p.x, y=p.y, z=p.z;\r
\r
  float fx =\r
    3.0*c300*x*x + 2.0*c210*x*y + 2.0*c201*x*z + c120*y*y + c102*z*z + c111*y*z +\r
    2.0*c200*x + c101*z + c110*y + c100;\r
\r
  float fy =\r
    3.0*c030*y*y + c210*x*x + 2.0*c021*y*z + c012*z*z + 2.0*c120*x*y + c111*x*z +\r
    2.0*c020*y + c110*x + c011*z + c010;\r
\r
  float fz =\r
    3.0*c003*z*z + c201*x*x + 2.0*c102*x*z + 2.0*c012*y*z + c021*y*y + c111*x*y +\r
    2.0*c002*z + c101*x + c011*y + c001;\r
\r
  return vec3(fx, fy, fz);\r
}\r
\r
// Einzelne Hessian-Einträge am Punkt p (nur was wir brauchen)\r
void cubicHessianAt(in vec3 p, in float coeffs[20],\r
                    out float f_xx, out float f_yy, out float f_zz,\r
                    out float f_xy, out float f_xz, out float f_yz) {\r
  float c300,c030,c003,c210,c201,c021,c012,c120,c102,c111,c200,c020,c002,c101,c110,c011,c100,c010,c001,c000;\r
  unpackCoeffs(coeffs, c300,c030,c003,c210,c201,c021,c012,c120,c102,c111,c200,c020,c002,c101,c110,c011,c100,c010,c001,c000);\r
  float x=p.x, y=p.y, z=p.z;\r
\r
  f_xx = 6.0*c300*x + 2.0*c210*y + 2.0*c201*z + 2.0*c200;\r
  f_yy = 6.0*c030*y + 2.0*c021*z + 2.0*c120*x + 2.0*c020;\r
  f_zz = 6.0*c003*z + 2.0*c102*x + 2.0*c012*y + 2.0*c002;\r
\r
  f_xy = 2.0*c210*x + 2.0*c120*y + c111*z + c110;\r
  f_xz = 2.0*c201*x + 2.0*c102*z + c111*y + c101;\r
  f_yz = 2.0*c021*y + 2.0*c012*z + c111*x + c011;\r
}\r
\r
// Leitkoeffizient A über 3. Ableitungs-Tensor (positionsunabhängig)\r
float cubicLeadingA(in vec3 rd, in float coeffs[20]) {\r
  float c300,c030,c003,c210,c201,c021,c012,c120,c102,c111,c200,c020,c002,c101,c110,c011,c100,c010,c001,c000;\r
  unpackCoeffs(coeffs, c300,c030,c003,c210,c201,c021,c012,c120,c102,c111,c200,c020,c002,c101,c110,c011,c100,c010,c001,c000);\r
  float dx=rd.x, dy=rd.y, dz=rd.z;\r
\r
  return\r
    c300*dx*dx*dx + c030*dy*dy*dy + c003*dz*dz*dz +\r
    c210*dx*dx*dy + c201*dx*dx*dz + c120*dx*dy*dy +\r
    c021*dy*dy*dz + c012*dy*dz*dz + c102*dx*dz*dz +\r
    c111*dx*dy*dz;\r
}\r
\r
// Liefert die t-Koeffizienten (A,B,C,D) von f(ro + t*rd) = 0\r
void cubicRayCoeffs(in vec3 ro, in vec3 rd, in float coeffs[20],\r
                    out float A, out float B, out float C, out float D) {\r
  // D = f(ro)\r
  D = cubicEval(ro, coeffs);\r
\r
  // C = grad f(ro) ⋅ rd\r
  vec3 g = cubicGrad(ro, coeffs);\r
  C = dot(g, rd);\r
\r
  // B = 0.5 * rd^T H(ro) rd\r
  float f_xx,f_yy,f_zz,f_xy,f_xz,f_yz;\r
  cubicHessianAt(ro, coeffs, f_xx,f_yy,f_zz,f_xy,f_xz,f_yz);\r
  B = 0.5 * ( f_xx*rd.x*rd.x + f_yy*rd.y*rd.y + f_zz*rd.z*rd.z\r
             + 2.0*f_xy*rd.x*rd.y + 2.0*f_xz*rd.x*rd.z + 2.0*f_yz*rd.y*rd.z );\r
\r
  // A = (1/6) * D^3_richtung (Kontraktion mit 3.-Ableitungs-Tensor)  -> kompakt via closed form:\r
  A = cubicLeadingA(rd, coeffs);\r
}\r
\r
// Ray/AABB-Schnitt (Slab-Methode). Rückgabe: true wenn Hit; gibt tNear/tFar aus.\r
bool rayBox(vec3 ro, vec3 rd, vec3 bmin, vec3 bmax, out float tNear, out float tFar) {\r
  vec3 inv = 1.0 / rd;\r
  vec3 t1 = (bmin - ro) * inv;\r
  vec3 t2 = (bmax - ro) * inv;\r
  vec3 tmin = min(t1, t2);\r
  vec3 tmax = max(t1, t2);\r
  tNear = max(max(tmin.x, tmin.y), tmin.z);\r
  tFar  = min(min(tmax.x, tmax.y), tmax.z);\r
  return tFar >= max(tNear, 0.0);\r
}\r
\r
// Normale = ∇f / ||∇f||\r
vec3 cubicSurfaceNormal(vec3 p, float coeffs[20]) {\r
  vec3 n = cubicGrad(p, coeffs);\r
  return normalize(n);\r
}\r
\r
// -----------------------------------------------------------------------------\r
// Hauptprogramm\r
// -----------------------------------------------------------------------------\r
void main() {\r
  // Ray aufbauen (Objektraum)\r
  vec3 ro = vUV;\r
  vec3 camPos = (uModelInverse * vec4(0.0, 0.0, 0.0, 1.0)).xyz;\r
\r
  vec3 rd = (uOrthographic == 1)\r
    ? normalize(mat3(uModelInverse) * vec3(0.0, 0.0, -1.0))\r
    : normalize(ro - camPos);\r
\r
  // AABB-Check (feste Box)\r
  float tN, tF;\r
  if (!rayBox(ro, rd, vec3(-BOX_HALF), vec3(BOX_HALF), tN, tF)) {\r
    discard;\r
  }\r
\r
  // Polynom-Koeffizienten von f(ro + t*rd)\r
  float A, B, C, D;\r
  cubicRayCoeffs(ro, rd, uCoeffs, A, B, C, D);\r
\r
  // Wurzeln bestimmen\r
  vec3 roots;\r
  int nRoots = cubic(A, B, C, D, roots);\r
\r
  // gültigste (kleinste) Wurzel im Box-Intervall wählen\r
  float tHit = INF;\r
  float tMin = max(tN, 1.0e-4); // leicht vorziehen, um Selbsttreffer zu vermeiden\r
  float tMax = tF;\r
\r
  if (nRoots >= 1 && roots.x >= tMin && roots.x <= tMax) tHit = min(tHit, roots.x);\r
  if (nRoots >= 2 && roots.y >= tMin && roots.y <= tMax) tHit = min(tHit, roots.y);\r
  if (nRoots >= 3 && roots.z >= tMin && roots.z <= tMax) tHit = min(tHit, roots.z);\r
\r
  if (tHit == INF) {\r
    discard;\r
  }\r
\r
  vec3 p = ro + tHit * rd;\r
\r
  // Sicherheits-Clip an den Würfel (verhindert Richtungs-Artefakte)\r
  if (abs(p.x) > BOX_HALF + 0.001 || abs(p.y) > BOX_HALF + 0.001 || abs(p.z) > BOX_HALF + 0.001) {\r
    discard;\r
  }\r
\r
  // Normale & Shading\r
  vec3 n = normalize(cubicSurfaceNormal(p, uCoeffs));\r
\r
  // Blickrichtungs-Term (hell = frontal, dunkel = seitlich)\r
  float k = clamp(abs(dot(normalize(rd), n)), 0.0, 1.0);\r
\r
  // gleiche Farbgebung wie zuvor, nur mit k statt Lichtquelle\r
  vec3 base = 0.5 + 0.5 * n;          // Normal-Visualisierung\r
  vec3 col  = mix(0.15*base, base, k); // Kontrast über view-Term\r
\r
  fColor = vec4(col, 1.0);\r
}\r
`;function T(r){const n=window.innerWidth,t=window.innerHeight,e=16/9;let o=n,c=n/e;c>t&&(c=t,o=t*e),r.width=o*window.devicePixelRatio,r.height=c*window.devicePixelRatio,r.style.width=`${o}px`,r.style.height=`${c}px`,r.style.position="absolute",r.style.top="50%",r.style.left="50%",r.style.transform="translate(-50%, -50%)"}function H(r,n,t){const e=r.createShader(n);if(r.shaderSource(e,t),r.compileShader(e),!r.getShaderParameter(e,r.COMPILE_STATUS))throw new Error(r.getShaderInfoLog(e)||"Shader compile error");return e}function fr(r,n,t){const e=H(r,r.VERTEX_SHADER,n),o=H(r,r.FRAGMENT_SHADER,t),c=r.createProgram();if(r.attachShader(c,e),r.attachShader(c,o),r.linkProgram(c),!r.getProgramParameter(c,r.LINK_STATUS))throw new Error(r.getProgramInfoLog(c)||"Program link error");return c}const v=3;function sr(r,n){const t=new Float32Array([-3,-3,-3,v,-3,-3,-3,v,-3,v,v,-3,-3,-3,v,v,-3,v,-3,v,v,v,v,v]),e=new Uint16Array([0,2,1,1,2,3,4,5,6,6,5,7,0,5,4,0,1,5,2,6,7,2,7,3,7,1,3,7,5,1,0,6,2,0,4,6]),o=r.createVertexArray();r.bindVertexArray(o);const c=r.createBuffer();r.bindBuffer(r.ARRAY_BUFFER,c),r.bufferData(r.ARRAY_BUFFER,t,r.STATIC_DRAW);const a=r.getAttribLocation(n,"aPosition");r.enableVertexAttribArray(a),r.vertexAttribPointer(a,3,r.FLOAT,!1,0,0);const i=r.createBuffer();return r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,i),r.bufferData(r.ELEMENT_ARRAY_BUFFER,e,r.STATIC_DRAW),{vao:o,iboSize:e.length}}function k(r,n){const t=r.canvas,e=t.clientWidth,o=t.clientHeight,c=(2*n[0]-e)/e,a=(o-2*n[1])/o,i=1-c*c-a*a,f=i>0?Math.sqrt(i):0;return q(c,a,f)}function lr(r,n){const t=I();if(A(t,r,n),U(t)<1e-5)return w();V(t,t);const e=Math.max(-1,Math.min(1,D(r,n))),o=Math.acos(e);return O(w(),t,o)}function C(r){const n=r.gl,t=r.program;n.uniformMatrix4fv(n.getUniformLocation(t,"uProjection"),!1,r.projection),n.uniformMatrix4fv(n.getUniformLocation(t,"uModelView"),!1,r.modelView);const e=j(h(),r.modelView);n.uniformMatrix4fv(n.getUniformLocation(t,"uModelInverse"),!1,e),n.uniform1i(n.getUniformLocation(t,"uSurface"),r.curSurface),n.uniform1i(n.getUniformLocation(t,"uOrthographic"),r.viewMode===2?1:0),n.bindVertexArray(r.cube.vao),n.drawElements(n.TRIANGLES,r.cube.iboSize,n.UNSIGNED_SHORT,0)}function b(r){const n=r.gl;n.viewport(0,0,n.canvas.width,n.canvas.height),n.clear(n.COLOR_BUFFER_BIT|n.DEPTH_BUFFER_BIT);const t=n.canvas.width/n.canvas.height,e=10,o=100,c=30,a=t*c;let i=0,f=0,s=50;if(L(r.projection),L(r.modelView),r.viewMode===2)Y(r.projection,-a/2,a/2,-30/2,c/2,e,o);else{const p=e*(-a/2-i)/s,u=e*(a/2-i)/s,d=e*(-30/2-f)/s,z=e*(c/2-f)/s;F(r.projection,p,u,d,z,e,o)}M(r.modelView,r.modelView,[-0,-0,-50]);const l=S(h(),r.qNow);if(P(l,l,[r.zoom*15,r.zoom*15,r.zoom*15]),B(r.modelView,r.modelView,l),C(r),r.viewMode===3){const u=S(h(),r.qNow);P(u,u,[r.zoom*15,r.zoom*15,r.zoom*15]),n.colorMask(!0,!1,!1,!0);const d=h(),z=h();F(d,e*(-a/2-1.5)/s,e*(a/2-1.5)/s,e*(-30/2-f)/s,e*(c/2-f)/s,e,o),M(z,z,[-1.5,-0,-50]),B(r.modelView,z,u),N(r.projection,d),C(r),n.clear(n.DEPTH_BUFFER_BIT),n.colorMask(!1,!0,!0,!0);const x=h(),y=h();F(x,e*(-a/2+1.5)/s,e*(a/2+1.5)/s,e*(-30/2-f)/s,e*(c/2-f)/s,e,o),M(y,y,[1.5,-0,-50]),B(r.modelView,y,u),N(r.projection,x),C(r),n.colorMask(!0,!0,!0,!0)}}window.addEventListener("load",async()=>{var f;const r=document.getElementById("glcanvas"),n=r.getContext("webgl2");T(r),n.viewport(0,0,r.width,r.height);const t=fr(n,ar,ir);n.useProgram(t);const e=n.getUniformLocation(t,"uCoeffs"),o=sr(n,t),c={gl:n,program:t,cube:o,projection:h(),modelView:h(),qNow:w(),mousePos:W(),mousePressed:!1,zoom:.5,viewMode:1,curSurface:1};window.ctx=c,n.clearColor(.5,.5,.5,1),n.enable(n.DEPTH_TEST),n.enable(n.CULL_FACE);const a=(f=window.getUserCoeffs)==null?void 0:f.call(window);(a==null?void 0:a.length)===20&&n.uniform1fv(e,new Float32Array(a)),r.addEventListener("mousedown",s=>{c.mousePressed=!0,tr(c.mousePos,s.clientX,s.clientY)}),r.addEventListener("mouseup",()=>c.mousePressed=!1),r.addEventListener("mousemove",s=>{if(!c.mousePressed)return;const l=nr(s.clientX,s.clientY),p=k(n,c.mousePos),u=k(n,l),d=lr(p,u);J(c.qNow,d,c.qNow),er(c.mousePos,l),b(c)}),r.addEventListener("wheel",s=>{s.preventDefault(),c.zoom*=s.deltaY>0?1/1.1:1.1,b(c)},{passive:!1}),document.getElementById("viewMode").addEventListener("change",s=>{c.viewMode=parseInt(s.target.value),b(c)}),document.getElementById("surfaceMode").addEventListener("change",s=>{c.curSurface=parseInt(s.target.value),b(c)});function i(){b(c),requestAnimationFrame(i)}window.addEventListener("resize",()=>{T(r),n.viewport(0,0,r.width,r.height)}),i()});
