import"./modulepreload-polyfill-B5Qt9EMX.js";import{A as m,E as O,c as w,i as L,o as $,b as C,t as M,d as B,s as q,m as E,a as R,e as Y}from"./mat4-DousPgjw.js";import{c as F,f as P,d as U,a as A,b as H,n as X,l as Q}from"./vec3-Er0YIGI6.js";function W(){var r=new m(9);return m!=Float32Array&&(r[1]=0,r[2]=0,r[3]=0,r[5]=0,r[6]=0,r[7]=0),r[0]=1,r[4]=1,r[8]=1,r}function j(){var r=new m(4);return m!=Float32Array&&(r[0]=0,r[1]=0,r[2]=0,r[3]=0),r}function k(r,o){var f=o[0],n=o[1],e=o[2],c=o[3],t=f*f+n*n+e*e+c*c;return t>0&&(t=1/Math.sqrt(t)),r[0]=f*t,r[1]=n*t,r[2]=e*t,r[3]=c*t,r}(function(){var r=j();return function(o,f,n,e,c,t){var a,d;for(f||(f=4),n||(n=0),e?d=Math.min(e*f+n,o.length):d=o.length,a=n;a<d;a+=f)r[0]=o[a],r[1]=o[a+1],r[2]=o[a+2],r[3]=o[a+3],c(r,r,t),o[a]=r[0],o[a+1]=r[1],o[a+2]=r[2],o[a+3]=r[3];return o}})();function h(){var r=new m(4);return m!=Float32Array&&(r[0]=0,r[1]=0,r[2]=0),r[3]=1,r}function _(r,o,f){f=f*.5;var n=Math.sin(f);return r[0]=n*o[0],r[1]=n*o[1],r[2]=n*o[2],r[3]=Math.cos(f),r}function G(r,o,f){var n=o[0],e=o[1],c=o[2],t=o[3],a=f[0],d=f[1],i=f[2],s=f[3];return r[0]=n*s+t*a+e*i-c*d,r[1]=e*s+t*d+c*a-n*i,r[2]=c*s+t*i+n*d-e*a,r[3]=t*s-n*a-e*d-c*i,r}function S(r,o,f,n){var e=o[0],c=o[1],t=o[2],a=o[3],d=f[0],i=f[1],s=f[2],l=f[3],y,p,z,v,x;return p=e*d+c*i+t*s+a*l,p<0&&(p=-p,d=-d,i=-i,s=-s,l=-l),1-p>O?(y=Math.acos(p),z=Math.sin(y),v=Math.sin((1-n)*y)/z,x=Math.sin(n*y)/z):(v=1-n,x=n),r[0]=v*e+x*d,r[1]=v*c+x*i,r[2]=v*t+x*s,r[3]=v*a+x*l,r}function K(r,o){var f=o[0]+o[4]+o[8],n;if(f>0)n=Math.sqrt(f+1),r[3]=.5*n,n=.5/n,r[0]=(o[5]-o[7])*n,r[1]=(o[6]-o[2])*n,r[2]=(o[1]-o[3])*n;else{var e=0;o[4]>o[0]&&(e=1),o[8]>o[e*3+e]&&(e=2);var c=(e+1)%3,t=(e+2)%3;n=Math.sqrt(o[e*3+e]-o[c*3+c]-o[t*3+t]+1),r[e]=.5*n,n=.5/n,r[3]=(o[c*3+t]-o[t*3+c])*n,r[c]=(o[c*3+e]+o[e*3+c])*n,r[t]=(o[t*3+e]+o[e*3+t])*n}return r}var D=k;(function(){var r=F(),o=P(1,0,0),f=P(0,1,0);return function(n,e,c){var t=U(e,c);return t<-.999999?(A(r,o,e),H(r)<1e-6&&A(r,f,e),X(r,r),_(n,r,Math.PI),n):t>.999999?(n[0]=0,n[1]=0,n[2]=0,n[3]=1,n):(A(r,e,c),n[0]=r[0],n[1]=r[1],n[2]=r[2],n[3]=1+t,D(n,n))}})();(function(){var r=h(),o=h();return function(f,n,e,c,t,a){return S(r,n,t,a),S(o,e,c,a),S(f,r,o,2*a*(1-a)),f}})();(function(){var r=W();return function(o,f,n,e){return r[0]=n[0],r[3]=n[1],r[6]=n[2],r[1]=e[0],r[4]=e[1],r[7]=e[2],r[2]=-f[0],r[5]=-f[1],r[8]=-f[2],D(o,K(o,r))}})();function N(){var r=new m(2);return m!=Float32Array&&(r[0]=0,r[1]=0),r}function Z(r,o){var f=new m(2);return f[0]=r,f[1]=o,f}function J(r,o){return r[0]=o[0],r[1]=o[1],r}function rr(r,o,f){return r[0]=o,r[1]=f,r}(function(){var r=N();return function(o,f,n,e,c,t){var a,d;for(f||(f=2),n||(n=0),e?d=Math.min(e*f+n,o.length):d=o.length,a=n;a<d;a+=f)r[0]=o[a],r[1]=o[a+1],c(r,r,t),o[a]=r[0],o[a+1]=r[1];return o}})();const or=`#version 300 es\r
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
`,nr=`#version 300 es\r
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
`;function I(r){const o=window.innerWidth,f=window.innerHeight,n=16/9;let e=o,c=o/n;c>f&&(c=f,e=f*n),r.width=e*window.devicePixelRatio,r.height=c*window.devicePixelRatio,r.style.width=`${e}px`,r.style.height=`${c}px`,r.style.position="absolute",r.style.top="50%",r.style.left="50%",r.style.transform="translate(-50%, -50%)"}function T(r,o,f){const n=r.createShader(o);if(r.shaderSource(n,f),r.compileShader(n),!r.getShaderParameter(n,r.COMPILE_STATUS))throw new Error(r.getShaderInfoLog(n)||"Shader compile error");return n}function er(r,o,f){const n=T(r,r.VERTEX_SHADER,o),e=T(r,r.FRAGMENT_SHADER,f),c=r.createProgram();if(r.attachShader(c,n),r.attachShader(c,e),r.linkProgram(c),!r.getProgramParameter(c,r.LINK_STATUS))throw new Error(r.getProgramInfoLog(c)||"Program link error");return c}const u=3;function fr(r,o){const f=new Float32Array([-3,-3,-3,u,-3,-3,-3,u,-3,u,u,-3,-3,-3,u,u,-3,u,-3,u,u,u,u,u]),n=new Uint16Array([0,2,1,1,2,3,4,5,6,6,5,7,0,5,4,0,1,5,2,6,7,2,7,3,7,1,3,7,5,1,0,6,2,0,4,6]),e=r.createVertexArray();r.bindVertexArray(e);const c=r.createBuffer();r.bindBuffer(r.ARRAY_BUFFER,c),r.bufferData(r.ARRAY_BUFFER,f,r.STATIC_DRAW);const t=r.getAttribLocation(o,"aPosition");r.enableVertexAttribArray(t),r.vertexAttribPointer(t,3,r.FLOAT,!1,0,0);const a=r.createBuffer();return r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,a),r.bufferData(r.ELEMENT_ARRAY_BUFFER,n,r.STATIC_DRAW),{vao:e,iboSize:n.length}}function V(r,o){const f=r.canvas,n=f.clientWidth,e=f.clientHeight,c=(2*o[0]-n)/n,t=(e-2*o[1])/e,a=1-c*c-t*t,d=a>0?Math.sqrt(a):0;return P(c,t,d)}function cr(r,o){const f=F();if(A(f,r,o),Q(f)<1e-5)return h();X(f,f);const n=Math.max(-1,Math.min(1,U(r,o))),e=Math.acos(n);return _(h(),f,e)}function g(r){const o=r.gl,f=r.program;o.uniformMatrix4fv(o.getUniformLocation(f,"uProjection"),!1,r.projection),o.uniformMatrix4fv(o.getUniformLocation(f,"uModelView"),!1,r.modelView);const n=Y(w(),r.modelView);o.uniformMatrix4fv(o.getUniformLocation(f,"uModelInverse"),!1,n),o.uniform1i(o.getUniformLocation(f,"uSurface"),r.curSurface),o.uniform1i(o.getUniformLocation(f,"uOrthographic"),r.viewMode===2?1:0),o.bindVertexArray(r.cube.vao),o.drawElements(o.TRIANGLES,r.cube.iboSize,o.UNSIGNED_SHORT,0)}function b(r){const o=r.gl;o.viewport(0,0,o.canvas.width,o.canvas.height),o.clear(o.COLOR_BUFFER_BIT|o.DEPTH_BUFFER_BIT);const f=o.canvas.width/o.canvas.height,n=10,e=100,c=30,t=f*c;let a=0,d=0,i=50;if(L(r.projection),L(r.modelView),r.viewMode===2)$(r.projection,-t/2,t/2,-30/2,c/2,n,e);else{const l=n*(-t/2-a)/i,y=n*(t/2-a)/i,p=n*(-30/2-d)/i,z=n*(c/2-d)/i;C(r.projection,l,y,p,z,n,e)}M(r.modelView,r.modelView,[-0,-0,-50]);const s=B(w(),r.qNow);if(q(s,s,[r.zoom*15,r.zoom*15,r.zoom*15]),E(r.modelView,r.modelView,s),g(r),r.viewMode===3){const y=B(w(),r.qNow);q(y,y,[r.zoom*15,r.zoom*15,r.zoom*15]),o.colorMask(!0,!1,!1,!0);const p=w(),z=w();C(p,n*(-t/2-1.5)/i,n*(t/2-1.5)/i,n*(-30/2-d)/i,n*(c/2-d)/i,n,e),M(z,z,[-1.5,-0,-50]),E(r.modelView,z,y),R(r.projection,p),g(r),o.clear(o.DEPTH_BUFFER_BIT),o.colorMask(!1,!0,!0,!0);const v=w(),x=w();C(v,n*(-t/2+1.5)/i,n*(t/2+1.5)/i,n*(-30/2-d)/i,n*(c/2-d)/i,n,e),M(x,x,[1.5,-0,-50]),E(r.modelView,x,y),R(r.projection,v),g(r),o.colorMask(!0,!0,!0,!0)}}window.addEventListener("load",()=>{var a,d,i;const r=document.getElementById("glcanvas"),o=r.getContext("webgl2");I(r),o.viewport(0,0,r.width,r.height);const f=er(o,or,nr);o.useProgram(f);const n=fr(o,f),e={gl:o,program:f,cube:n,projection:w(),modelView:w(),qNow:h(),mousePos:N(),mousePressed:!1,zoom:.5,viewMode:1,curSurface:1};window.ctx=e,window.drawScene=b,o.clearColor(.5,.5,.5,1),o.enable(o.DEPTH_TEST),o.enable(o.CULL_FACE),r.addEventListener("mousedown",s=>{e.mousePressed=!0,rr(e.mousePos,s.clientX,s.clientY)}),r.addEventListener("mouseup",()=>e.mousePressed=!1),r.addEventListener("mousemove",s=>{if(!e.mousePressed)return;const l=Z(s.clientX,s.clientY),y=V(o,e.mousePos),p=V(o,l),z=cr(y,p);G(e.qNow,z,e.qNow),J(e.mousePos,l),b(e)}),r.addEventListener("wheel",s=>{s.preventDefault(),e.zoom*=s.deltaY>0?1/1.1:1.1,b(e)},{passive:!1}),(a=document.getElementById("viewMode"))==null||a.addEventListener("change",s=>{e.viewMode=parseInt(s.target.value),b(e)}),(d=document.getElementById("surfaceMode"))==null||d.addEventListener("change",s=>{e.curSurface=parseInt(s.target.value),b(e)}),window.addEventListener("resize",()=>{I(r),o.viewport(0,0,r.width,r.height)});const c=o.getUniformLocation(f,"uCoeffs");window.addEventListener("message",s=>{const l=s.data;if(!(!l||l.type!=="coeffs"||!Array.isArray(l.coeffs)||l.coeffs.length!==20))try{o.useProgram(f),o.uniform1fv(c,new Float32Array(l.coeffs)),b(e)}catch(y){console.error("Failed to apply coeffs from parent:",y)}}),(i=window.parent)==null||i.postMessage({type:"ready"},"*");function t(){b(e),requestAnimationFrame(t)}t()});
