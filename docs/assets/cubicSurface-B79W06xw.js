import"./modulepreload-polyfill-B5Qt9EMX.js";import{A as w,E as L,c as m,o as I,p as U,i as V,t as _,b as Y,m as N,s as H,d as O}from"./mat4-uSk0HlBj.js";import{c as C,f as M,d as X,a as z,b as k,n as R,l as K}from"./vec3-DGbGUZ3g.js";function Z(){var r=new w(9);return w!=Float32Array&&(r[1]=0,r[2]=0,r[3]=0,r[5]=0,r[6]=0,r[7]=0),r[0]=1,r[4]=1,r[8]=1,r}function $(){var r=new w(4);return w!=Float32Array&&(r[0]=0,r[1]=0,r[2]=0,r[3]=0),r}function G(r,n){var e=n[0],o=n[1],t=n[2],a=n[3],f=e*e+o*o+t*t+a*a;return f>0&&(f=1/Math.sqrt(f)),r[0]=e*f,r[1]=o*f,r[2]=t*f,r[3]=a*f,r}(function(){var r=$();return function(n,e,o,t,a,f){var c,i;for(e||(e=4),o||(o=0),t?i=Math.min(t*e+o,n.length):i=n.length,c=o;c<i;c+=e)r[0]=n[c],r[1]=n[c+1],r[2]=n[c+2],r[3]=n[c+3],a(r,r,f),n[c]=r[0],n[c+1]=r[1],n[c+2]=r[2],n[c+3]=r[3];return n}})();function h(){var r=new w(4);return w!=Float32Array&&(r[0]=0,r[1]=0,r[2]=0),r[3]=1,r}function T(r,n,e){e=e*.5;var o=Math.sin(e);return r[0]=o*n[0],r[1]=o*n[1],r[2]=o*n[2],r[3]=Math.cos(e),r}function Q(r,n,e){var o=n[0],t=n[1],a=n[2],f=n[3],c=e[0],i=e[1],l=e[2],d=e[3];return r[0]=o*d+f*c+t*l-a*i,r[1]=t*d+f*i+a*c-o*l,r[2]=a*d+f*l+o*i-t*c,r[3]=f*d-o*c-t*i-a*l,r}function A(r,n,e,o){var t=n[0],a=n[1],f=n[2],c=n[3],i=e[0],l=e[1],d=e[2],v=e[3],x,s,y,u,p;return s=t*i+a*l+f*d+c*v,s<0&&(s=-s,i=-i,l=-l,d=-d,v=-v),1-s>L?(x=Math.acos(s),y=Math.sin(x),u=Math.sin((1-o)*x)/y,p=Math.sin(o*x)/y):(u=1-o,p=o),r[0]=u*t+p*i,r[1]=u*a+p*l,r[2]=u*f+p*d,r[3]=u*c+p*v,r}function W(r,n){var e=n[0]+n[4]+n[8],o;if(e>0)o=Math.sqrt(e+1),r[3]=.5*o,o=.5/o,r[0]=(n[5]-n[7])*o,r[1]=(n[6]-n[2])*o,r[2]=(n[1]-n[3])*o;else{var t=0;n[4]>n[0]&&(t=1),n[8]>n[t*3+t]&&(t=2);var a=(t+1)%3,f=(t+2)%3;o=Math.sqrt(n[t*3+t]-n[a*3+a]-n[f*3+f]+1),r[t]=.5*o,o=.5/o,r[3]=(n[a*3+f]-n[f*3+a])*o,r[a]=(n[a*3+t]+n[t*3+a])*o,r[f]=(n[f*3+t]+n[t*3+f])*o}return r}var D=G;(function(){var r=C(),n=M(1,0,0),e=M(0,1,0);return function(o,t,a){var f=X(t,a);return f<-.999999?(z(r,n,t),k(r)<1e-6&&z(r,e,t),R(r,r),T(o,r,Math.PI),o):f>.999999?(o[0]=0,o[1]=0,o[2]=0,o[3]=1,o):(z(r,t,a),o[0]=r[0],o[1]=r[1],o[2]=r[2],o[3]=1+f,D(o,o))}})();(function(){var r=h(),n=h();return function(e,o,t,a,f,c){return A(r,o,f,c),A(n,t,a,c),A(e,r,n,2*c*(1-c)),e}})();(function(){var r=Z();return function(n,e,o,t){return r[0]=o[0],r[3]=o[1],r[6]=o[2],r[1]=t[0],r[4]=t[1],r[7]=t[2],r[2]=-e[0],r[5]=-e[1],r[8]=-e[2],D(n,W(n,r))}})();function F(){var r=new w(2);return w!=Float32Array&&(r[0]=0,r[1]=0),r}function E(r,n,e){return r[0]=n,r[1]=e,r}(function(){var r=F();return function(n,e,o,t,a,f){var c,i;for(e||(e=2),o||(o=0),t?i=Math.min(t*e+o,n.length):i=n.length,c=o;c<i;c+=e)r[0]=n[c],r[1]=n[c+1],a(r,r,f),n[c]=r[0],n[c+1]=r[1];return n}})();const j=`#version 300 es\r
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
`,J=`#version 300 es\r
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
const float EPS = 1e-4;\r
\r
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
  vec4 col = vec4(1.0f, 0.0f, 0.0f, 1.0f);\r
\r
  vec3 p, n;\r
  float lambda;\r
\r
  lambda = cubicSurfaceIntersect(ro, rd, uCoeffs);\r
  if (lambda < 0.0f)\r
    discard;\r
  p = ro + lambda * rd;\r
  n = cubicSurfaceNormal(p, uCoeffs);\r
\r
  // Headlight-/View-Shading\r
  float shade = abs(dot(normalize(rd), normalize(n)));\r
  fColor = vec4(col.rgb * shade, col.a);\r
}\r
`,P=3,rr=.03;function S(r){const n=window.innerWidth,e=window.innerHeight,o=16/9;let t=n,a=n/o;a>e&&(a=e,t=e*o);const f=window.devicePixelRatio||1;r.width=Math.max(1,Math.floor(t*f)),r.height=Math.max(1,Math.floor(a*f)),r.style.width=`${t}px`,r.style.height=`${a}px`}function g(r,n,e){const o=r.createShader(n);if(r.shaderSource(o,e),r.compileShader(o),!r.getShaderParameter(o,r.COMPILE_STATUS))throw new Error(r.getShaderInfoLog(o)||"shader error");return o}function nr(r,n,e){const o=r.createProgram();if(r.attachShader(o,g(r,r.VERTEX_SHADER,n)),r.attachShader(o,g(r,r.FRAGMENT_SHADER,e)),r.linkProgram(o),!r.getProgramParameter(o,r.LINK_STATUS))throw new Error(r.getProgramInfoLog(o)||"link error");return o}function or(r,n){const e=P,o=new Float32Array([-3,-3,-3,e,-3,-3,-3,e,-3,e,e,-3,-3,-3,e,e,-3,e,-3,e,e,e,e,e]),t=new Uint16Array([0,2,1,1,2,3,4,5,6,6,5,7,0,1,5,0,5,4,2,6,7,2,7,3,7,5,1,7,1,3,0,4,6,0,6,2]),a=r.createVertexArray();r.bindVertexArray(a);const f=r.createBuffer();r.bindBuffer(r.ARRAY_BUFFER,f),r.bufferData(r.ARRAY_BUFFER,o,r.STATIC_DRAW);const c=r.getAttribLocation(n,"aPosition");r.enableVertexAttribArray(c),r.vertexAttribPointer(c,3,r.FLOAT,!1,0,0);const i=r.createBuffer();return r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,i),r.bufferData(r.ELEMENT_ARRAY_BUFFER,t,r.STATIC_DRAW),r.bindVertexArray(null),{vao:a,iboSize:t.length}}function er(){var f;const r=document.getElementById("glcanvas");S(r);const n=r.getContext("webgl2"),e=nr(n,j,J);n.useProgram(e);const{vao:o,iboSize:t}=or(n,e),a={gl:n,prog:e,vao:o,iboSize:t,uProjection:n.getUniformLocation(e,"uProjection"),uModelView:n.getUniformLocation(e,"uModelView"),uModelInverse:n.getUniformLocation(e,"uModelInverse"),uOrthographic:n.getUniformLocation(e,"uOrthographic"),uSurface:n.getUniformLocation(e,"uSurface"),uCoeffs:n.getUniformLocation(e,"uCoeffs"),uShowBox:n.getUniformLocation(e,"uShowBox"),uHalf:n.getUniformLocation(e,"uHalf"),uEdgeThickness:n.getUniformLocation(e,"uEdgeThickness"),qRot:h(),zoom:.9,mouseDown:!1,mouse:F(),viewMode:1,surfaceMode:1,showBox:!0,coeffs:new Float32Array([0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,-1])};n.clearColor(1,1,1,1),n.enable(n.DEPTH_TEST),n.enable(n.CULL_FACE),r.addEventListener("mousedown",c=>{a.mouseDown=!0,E(a.mouse,c.clientX,c.clientY)}),r.addEventListener("mouseup",()=>a.mouseDown=!1),r.addEventListener("mousemove",c=>{if(!a.mouseDown)return;const i=r.clientWidth,l=r.clientHeight,d=(y,u)=>{const p=(2*y-i)/i,b=(l-2*u)/l,B=1-p*p-b*b;return M(p,b,B>0?Math.sqrt(B):0)},v=d(a.mouse[0],a.mouse[1]),x=d(c.clientX,c.clientY),s=C();if(z(s,v,x),K(s)>1e-6){R(s,s);const y=Math.acos(Math.max(-1,Math.min(1,X(v,x)))),u=T(h(),s,y);Q(a.qRot,u,a.qRot)}E(a.mouse,c.clientX,c.clientY)}),r.addEventListener("wheel",c=>{c.preventDefault(),a.zoom*=c.deltaY>0?1/1.05:1.05},{passive:!1}),window.addEventListener("resize",()=>S(r)),window.addEventListener("message",c=>{const i=c.data||{};i.type==="coeffs"&&Array.isArray(i.coeffs)&&i.coeffs.length===20?a.coeffs.set(i.coeffs):i.type==="controls"&&(typeof i.viewMode=="number"&&(a.viewMode=i.viewMode|0),typeof i.surfaceMode=="number"&&(a.surfaceMode=i.surfaceMode|0),typeof i.showBox=="boolean"&&(a.showBox=!!i.showBox))});try{(f=window.parent)==null||f.postMessage({type:"ready"},"*")}catch{}return a}function tr(r){const{gl:n}=r;n.viewport(0,0,n.canvas.width,n.canvas.height),n.clear(n.COLOR_BUFFER_BIT|n.DEPTH_BUFFER_BIT),n.useProgram(r.prog),n.bindVertexArray(r.vao),r.uShowBox&&n.uniform1i(r.uShowBox,r.showBox?1:0),n.uniform1f(r.uHalf,P),n.uniform1f(r.uEdgeThickness,rr),n.uniform1i(r.uSurface,r.surfaceMode),n.uniform1fv(r.uCoeffs,r.coeffs),n.uniform1i(r.uOrthographic,r.viewMode===2?1:0);const e=n.canvas.width/n.canvas.height,o=m(),t=m(),a=.1,f=100,c=r.zoom*1.6,i=(l,d)=>{if(d?n.colorMask(...d):n.colorMask(!0,!0,!0,!0),r.viewMode===2){const s=5/r.zoom;I(o,-s*e,s*e,-s,s,a,f)}else U(o,Math.PI/4,e,a,f);V(t),_(t,t,[-l,0,-8]);const v=Y(m(),r.qRot);N(t,t,v),H(t,t,[c,c,c]),n.uniformMatrix4fv(r.uProjection,!1,o),n.uniformMatrix4fv(r.uModelView,!1,t);const x=O(m(),t);n.uniformMatrix4fv(r.uModelInverse,!1,x),n.drawElements(n.TRIANGLES,r.iboSize,n.UNSIGNED_SHORT,0)};r.viewMode===3?(i(-.12,[!0,!1,!1,!0]),n.clear(n.DEPTH_BUFFER_BIT),i(.12,[!1,!0,!0,!0]),n.colorMask(!0,!0,!0,!0)):i(0),n.bindVertexArray(null)}function q(r){tr(r),requestAnimationFrame(()=>q(r))}window.addEventListener("load",()=>{const r=er();q(r)});
