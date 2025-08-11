import"./modulepreload-polyfill-B5Qt9EMX.js";import{A as m,E as H,c as w,i as q,o as Q,b as E,t as S,d as R,s as F,m as M,a as I,e as W}from"./mat4-DousPgjw.js";import{c as _,f as B,d as D,a as A,b as j,n as N,l as k}from"./vec3-Er0YIGI6.js";function G(){var r=new m(9);return m!=Float32Array&&(r[1]=0,r[2]=0,r[3]=0,r[5]=0,r[6]=0,r[7]=0),r[0]=1,r[4]=1,r[8]=1,r}function K(){var r=new m(4);return m!=Float32Array&&(r[0]=0,r[1]=0,r[2]=0,r[3]=0),r}function Z(r,o){var e=o[0],n=o[1],f=o[2],t=o[3],c=e*e+n*n+f*f+t*t;return c>0&&(c=1/Math.sqrt(c)),r[0]=e*c,r[1]=n*c,r[2]=f*c,r[3]=t*c,r}(function(){var r=K();return function(o,e,n,f,t,c){var a,i;for(e||(e=4),n||(n=0),f?i=Math.min(f*e+n,o.length):i=o.length,a=n;a<i;a+=e)r[0]=o[a],r[1]=o[a+1],r[2]=o[a+2],r[3]=o[a+3],t(r,r,c),o[a]=r[0],o[a+1]=r[1],o[a+2]=r[2],o[a+3]=r[3];return o}})();function h(){var r=new m(4);return m!=Float32Array&&(r[0]=0,r[1]=0,r[2]=0),r[3]=1,r}function O(r,o,e){e=e*.5;var n=Math.sin(e);return r[0]=n*o[0],r[1]=n*o[1],r[2]=n*o[2],r[3]=Math.cos(e),r}function J(r,o,e){var n=o[0],f=o[1],t=o[2],c=o[3],a=e[0],i=e[1],d=e[2],s=e[3];return r[0]=n*s+c*a+f*d-t*i,r[1]=f*s+c*i+t*a-n*d,r[2]=t*s+c*d+n*i-f*a,r[3]=c*s-n*a-f*i-t*d,r}function L(r,o,e,n){var f=o[0],t=o[1],c=o[2],a=o[3],i=e[0],d=e[1],s=e[2],x=e[3],l,p,z,v,u;return p=f*i+t*d+c*s+a*x,p<0&&(p=-p,i=-i,d=-d,s=-s,x=-x),1-p>H?(l=Math.acos(p),z=Math.sin(l),v=Math.sin((1-n)*l)/z,u=Math.sin(n*l)/z):(v=1-n,u=n),r[0]=v*f+u*i,r[1]=v*t+u*d,r[2]=v*c+u*s,r[3]=v*a+u*x,r}function rr(r,o){var e=o[0]+o[4]+o[8],n;if(e>0)n=Math.sqrt(e+1),r[3]=.5*n,n=.5/n,r[0]=(o[5]-o[7])*n,r[1]=(o[6]-o[2])*n,r[2]=(o[1]-o[3])*n;else{var f=0;o[4]>o[0]&&(f=1),o[8]>o[f*3+f]&&(f=2);var t=(f+1)%3,c=(f+2)%3;n=Math.sqrt(o[f*3+f]-o[t*3+t]-o[c*3+c]+1),r[f]=.5*n,n=.5/n,r[3]=(o[t*3+c]-o[c*3+t])*n,r[t]=(o[t*3+f]+o[f*3+t])*n,r[c]=(o[c*3+f]+o[f*3+c])*n}return r}var $=Z;(function(){var r=_(),o=B(1,0,0),e=B(0,1,0);return function(n,f,t){var c=D(f,t);return c<-.999999?(A(r,o,f),j(r)<1e-6&&A(r,e,f),N(r,r),O(n,r,Math.PI),n):c>.999999?(n[0]=0,n[1]=0,n[2]=0,n[3]=1,n):(A(r,f,t),n[0]=r[0],n[1]=r[1],n[2]=r[2],n[3]=1+c,$(n,n))}})();(function(){var r=h(),o=h();return function(e,n,f,t,c,a){return L(r,n,c,a),L(o,f,t,a),L(e,r,o,2*a*(1-a)),e}})();(function(){var r=G();return function(o,e,n,f){return r[0]=n[0],r[3]=n[1],r[6]=n[2],r[1]=f[0],r[4]=f[1],r[7]=f[2],r[2]=-e[0],r[5]=-e[1],r[8]=-e[2],$(o,rr(o,r))}})();function Y(){var r=new m(2);return m!=Float32Array&&(r[0]=0,r[1]=0),r}function or(r,o){var e=new m(2);return e[0]=r,e[1]=o,e}function nr(r,o){return r[0]=o[0],r[1]=o[1],r}function er(r,o,e){return r[0]=o,r[1]=e,r}(function(){var r=Y();return function(o,e,n,f,t,c){var a,i;for(e||(e=2),n||(n=0),f?i=Math.min(f*e+n,o.length):i=o.length,a=n;a<i;a+=e)r[0]=o[a],r[1]=o[a+1],t(r,r,c),o[a]=r[0],o[a+1]=r[1];return o}})();const fr=document.getElementById("coeffContainer"),tr=["x³","y³","z³","x²y","x²z","y²z","yz²","xy²","xz²","xyz","x²","y²","z²","xz","xy","yz","x","y","z","1"],C=[0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,-1],g=[];for(let r=0;r<20;r++){const o=document.createElement("div");o.className="coeff-group";const e=document.createElement("label");e.textContent=`${tr[r]}: `;const n=document.createElement("input");n.type="number",n.value=C[r].toString(),n.step="0.1";const f=document.createElement("input");f.type="range",f.min=(C[r]-10).toString(),f.max=(C[r]+10).toString(),f.step="0.1",f.value=C[r].toString(),n.addEventListener("input",()=>{const t=parseFloat(n.value)||0;f.min=(t-5).toFixed(1),f.max=(t+5).toFixed(1),f.value=t.toString(),U()}),f.addEventListener("input",()=>{n.value=f.value,U()}),o.appendChild(e),o.appendChild(n),o.appendChild(f),fr.appendChild(o),g.push(n)}globalThis.getUserCoeffs=()=>g.map(r=>parseFloat(r.value)||0);globalThis.getUserCoeffs.inputs=g;function U(){var f,t;const r=g.map(c=>parseFloat(c.value)||0),o=(f=window.ctx)==null?void 0:f.gl,e=(t=window.ctx)==null?void 0:t.program,n=o==null?void 0:o.getUniformLocation(e,"uCoeffs");o&&e&&n&&(o.useProgram(e),o.uniform1fv(n,new Float32Array(r)),window.ctx&&window.drawScene&&window.drawScene(window.ctx))}const cr=`#version 300 es\r
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
\r
`;function T(r){const o=window.innerWidth,e=window.innerHeight,n=16/9;let f=o,t=o/n;t>e&&(t=e,f=e*n),r.width=f*window.devicePixelRatio,r.height=t*window.devicePixelRatio,r.style.width=`${f}px`,r.style.height=`${t}px`,r.style.position="absolute",r.style.top="50%",r.style.left="50%",r.style.transform="translate(-50%, -50%)"}function V(r,o,e){const n=r.createShader(o);if(r.shaderSource(n,e),r.compileShader(n),!r.getShaderParameter(n,r.COMPILE_STATUS))throw new Error(r.getShaderInfoLog(n)||"Shader compile error");return n}function dr(r,o,e){const n=V(r,r.VERTEX_SHADER,o),f=V(r,r.FRAGMENT_SHADER,e),t=r.createProgram();if(r.attachShader(t,n),r.attachShader(t,f),r.linkProgram(t),!r.getProgramParameter(t,r.LINK_STATUS))throw new Error(r.getProgramInfoLog(t)||"Program link error");return t}const y=3;function ir(r,o){const e=new Float32Array([-3,-3,-3,y,-3,-3,-3,y,-3,y,y,-3,-3,-3,y,y,-3,y,-3,y,y,y,y,y]),n=new Uint16Array([0,2,1,1,2,3,4,5,6,6,5,7,0,5,4,0,1,5,2,6,7,2,7,3,7,1,3,7,5,1,0,6,2,0,4,6]),f=r.createVertexArray();r.bindVertexArray(f);const t=r.createBuffer();r.bindBuffer(r.ARRAY_BUFFER,t),r.bufferData(r.ARRAY_BUFFER,e,r.STATIC_DRAW);const c=r.getAttribLocation(o,"aPosition");r.enableVertexAttribArray(c),r.vertexAttribPointer(c,3,r.FLOAT,!1,0,0);const a=r.createBuffer();return r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,a),r.bufferData(r.ELEMENT_ARRAY_BUFFER,n,r.STATIC_DRAW),{vao:f,iboSize:n.length}}function X(r,o){const e=r.canvas,n=e.clientWidth,f=e.clientHeight,t=(2*o[0]-n)/n,c=(f-2*o[1])/f,a=1-t*t-c*c,i=a>0?Math.sqrt(a):0;return B(t,c,i)}function sr(r,o){const e=_();if(A(e,r,o),k(e)<1e-5)return h();N(e,e);const n=Math.max(-1,Math.min(1,D(r,o))),f=Math.acos(n);return O(h(),e,f)}function P(r){const o=r.gl,e=r.program;o.uniformMatrix4fv(o.getUniformLocation(e,"uProjection"),!1,r.projection),o.uniformMatrix4fv(o.getUniformLocation(e,"uModelView"),!1,r.modelView);const n=W(w(),r.modelView);o.uniformMatrix4fv(o.getUniformLocation(e,"uModelInverse"),!1,n),o.uniform1i(o.getUniformLocation(e,"uSurface"),r.curSurface),o.uniform1i(o.getUniformLocation(e,"uOrthographic"),r.viewMode===2?1:0),o.bindVertexArray(r.cube.vao),o.drawElements(o.TRIANGLES,r.cube.iboSize,o.UNSIGNED_SHORT,0)}function b(r){const o=r.gl;o.viewport(0,0,o.canvas.width,o.canvas.height),o.clear(o.COLOR_BUFFER_BIT|o.DEPTH_BUFFER_BIT);const e=o.canvas.width/o.canvas.height,n=10,f=100,t=30,c=e*t;let a=0,i=0,d=50;if(q(r.projection),q(r.modelView),r.viewMode===2)Q(r.projection,-c/2,c/2,-30/2,t/2,n,f);else{const x=n*(-c/2-a)/d,l=n*(c/2-a)/d,p=n*(-30/2-i)/d,z=n*(t/2-i)/d;E(r.projection,x,l,p,z,n,f)}S(r.modelView,r.modelView,[-0,-0,-50]);const s=R(w(),r.qNow);if(F(s,s,[r.zoom*15,r.zoom*15,r.zoom*15]),M(r.modelView,r.modelView,s),P(r),r.viewMode===3){const l=R(w(),r.qNow);F(l,l,[r.zoom*15,r.zoom*15,r.zoom*15]),o.colorMask(!0,!1,!1,!0);const p=w(),z=w();E(p,n*(-c/2-1.5)/d,n*(c/2-1.5)/d,n*(-30/2-i)/d,n*(t/2-i)/d,n,f),S(z,z,[-1.5,-0,-50]),M(r.modelView,z,l),I(r.projection,p),P(r),o.clear(o.DEPTH_BUFFER_BIT),o.colorMask(!1,!0,!0,!0);const v=w(),u=w();E(v,n*(-c/2+1.5)/d,n*(c/2+1.5)/d,n*(-30/2-i)/d,n*(t/2-i)/d,n,f),S(u,u,[1.5,-0,-50]),M(r.modelView,u,l),I(r.projection,v),P(r),o.colorMask(!0,!0,!0,!0)}}window.addEventListener("load",async()=>{var i;const r=document.getElementById("glcanvas"),o=r.getContext("webgl2");T(r),o.viewport(0,0,r.width,r.height);const e=dr(o,cr,ar);o.useProgram(e);const n=o.getUniformLocation(e,"uCoeffs"),f=ir(o,e),t={gl:o,program:e,cube:f,projection:w(),modelView:w(),qNow:h(),mousePos:Y(),mousePressed:!1,zoom:.5,viewMode:1,curSurface:1};window.ctx=t,o.clearColor(.5,.5,.5,1),o.enable(o.DEPTH_TEST),o.enable(o.CULL_FACE);const c=(i=window.getUserCoeffs)==null?void 0:i.call(window);(c==null?void 0:c.length)===20&&o.uniform1fv(n,new Float32Array(c)),r.addEventListener("mousedown",d=>{t.mousePressed=!0,er(t.mousePos,d.clientX,d.clientY)}),r.addEventListener("mouseup",()=>t.mousePressed=!1),r.addEventListener("mousemove",d=>{if(!t.mousePressed)return;const s=or(d.clientX,d.clientY),x=X(o,t.mousePos),l=X(o,s),p=sr(x,l);J(t.qNow,p,t.qNow),nr(t.mousePos,s),b(t)}),r.addEventListener("wheel",d=>{t.zoom*=d.deltaY>0?1/1.1:1.1,b(t)}),document.getElementById("viewMode").addEventListener("change",d=>{t.viewMode=parseInt(d.target.value),b(t)}),document.getElementById("surfaceMode").addEventListener("change",d=>{t.curSurface=parseInt(d.target.value),b(t)});function a(){b(t),requestAnimationFrame(a)}window.addEventListener("resize",()=>{T(r),o.viewport(0,0,r.width,r.height)}),a()});
