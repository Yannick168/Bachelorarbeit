import"./modulepreload-polyfill-B5Qt9EMX.js";import{O as E}from"./OrbitControls-C5UR_-od.js";import{P as w,O as y}from"./three.module-Dzl-6arX.js";import{c as u,s as S,b as B,m as g,i as C}from"./mat4-DI7TqCbi.js";const M=`#version 300 es\r
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
\r
`,P=`#version 300 es\r
precision highp float;\r
\r
in vec3 vUV;\r
\r
uniform mat4 uModelInverse;\r
uniform int uOrthographic;\r
uniform int uSurface;\r
uniform float uCoeffs[20];\r
\r
uniform bool  uShowAxes;        // <— NEU: Achsen anzeigen?\r
uniform bool  uShowBox;         // (bestehend)\r
uniform float uHalf;            // Würfel-Halbe\r
uniform float uEdgeThickness;   // Linien-/Kantenstärke in Objektraum-Einheiten\r
\r
\r
\r
 \r
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
  \r
  float tEnter, tExit;\r
  if (!rayAABB(ro, rd, uHalf, tEnter, tExit)) return -1.0;\r
  tEnter = max(tEnter, EPS);\r
\r
  vec3 res;\r
  float t = 1e20f;\r
  int n = cubic(a[3], a[2], a[1], a[0], res);\r
  \r
  // Kandidaten filtern auf Intervall\r
  for (int i = 0; i < n; ++i) {\r
    float ti = res[i];\r
    if (ti < 0.0)      continue;\r
    if (ti < tEnter || ti > tExit) continue;\r
    t = min(t, ti);\r
  }\r
\r
  if(t == 1e20f)\r
    return (-1.0f);\r
  return (t);\r
}\r
\r
\r
vec3 axisColorInsideCube(vec3 P, float halfSize, float thickness){\r
    // Nähe zur X-Achse: (y,z) nahe 0 und |x| innerhalb des Würfels\r
    if (abs(P.x) <= halfSize && length(P.yz) < thickness) return vec3(1.0, 0.0, 0.0); // X rot\r
    // Nähe zur Y-Achse\r
    if (abs(P.y) <= halfSize && length(P.xz) < thickness) return vec3(0.0, 1.0, 0.0); // Y grün\r
    // Nähe zur Z-Achse\r
    if (abs(P.z) <= halfSize && length(P.xy) < thickness) return vec3(0.0, 0.0, 1.0); // Z blau\r
    return vec3(0.0);\r
}\r
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
layout(location=0) out vec4 fColor;\r
\r
\r
\r
\r
void main() {\r
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
  // Ray Setup (wie gehabt)\r
  vec3 ro = vUV;\r
  vec3 rd = (uOrthographic == 1) ? -uModelInverse[2].xyz\r
                                 : vUV - uModelInverse[3].xyz;\r
  rd = normalize(rd);\r
  ro += 1e-4 * rd; // kleiner Push-off gegen Self-Intersection\r
\r
  // Grundfarbe (du kannst das wie gehabt variieren)\r
  vec4 col = vec4(1.0, 0.0, 0.0, 1.0);\r
\r
  vec3 p, n;\r
  float lambda;\r
\r
  // Schnitt mit F(x,y,z)=0 suchen\r
  lambda = cubicSurfaceIntersect(ro, rd, uCoeffs);\r
  if (lambda < 0.0)\r
    discard;\r
\r
  // Trefferpunkt + Normale\r
  p = ro + lambda * rd;\r
  n = cubicSurfaceNormal(p, uCoeffs);\r
\r
  // Headlight/View-Shading (wie gehabt)\r
  float shade = abs(dot(normalize(rd), normalize(n)));\r
\r
  // Basisfarbe (vor Axen-Overlay)\r
  vec3 baseRGB = col.rgb * shade;\r
\r
  // ======= NEU: Achsen-Overlay innerhalb des Würfels =======\r
  if (uShowAxes) {\r
    // Nutze deine EdgeThickness (mit Mindestwert), so wirken Achsen visuell konsistent\r
    float thickness = max(uEdgeThickness, 0.02);\r
    vec3 axis = axisColorInsideCube(p, uHalf, thickness);\r
    if (axis != vec3(0.0)) {\r
      baseRGB = axis; // hartes Overlay; alternativ könntest du weich einblenden\r
    }\r
  }\r
\r
  fColor = vec4(baseRGB, col.a);\r
}`,v=3,k=.03;function m(r){const n=window.innerWidth,o=window.innerHeight,e=16/9;let c=n,f=n/e;f>o&&(f=o,c=o*e);const i=window.devicePixelRatio||1;r.width=Math.max(1,Math.floor(c*i)),r.height=Math.max(1,Math.floor(f*i)),r.style.width=`${c}px`,r.style.height=`${f}px`}function h(r,n,o){const e=r.createShader(n);if(r.shaderSource(e,o),r.compileShader(e),!r.getShaderParameter(e,r.COMPILE_STATUS))throw new Error(r.getShaderInfoLog(e)||"shader error");return e}function T(r,n,o){const e=r.createProgram();if(r.attachShader(e,h(r,r.VERTEX_SHADER,n)),r.attachShader(e,h(r,r.FRAGMENT_SHADER,o)),r.linkProgram(e),!r.getProgramParameter(e,r.LINK_STATUS))throw new Error(r.getProgramInfoLog(e)||"link error");return e}function I(r,n){const o=v,e=new Float32Array([-3,-3,-3,o,-3,-3,-3,o,-3,o,o,-3,-3,-3,o,o,-3,o,-3,o,o,o,o,o]),c=new Uint16Array([0,2,1,1,2,3,4,5,6,6,5,7,0,1,5,0,5,4,2,6,7,2,7,3,7,5,1,7,1,3,0,4,6,0,6,2]),f=r.createVertexArray();r.bindVertexArray(f);const i=r.createBuffer();r.bindBuffer(r.ARRAY_BUFFER,i),r.bufferData(r.ARRAY_BUFFER,e,r.STATIC_DRAW);const d=r.getAttribLocation(n,"aPosition");r.enableVertexAttribArray(d),r.vertexAttribPointer(d,3,r.FLOAT,!1,0,0);const t=r.createBuffer();return r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,t),r.bufferData(r.ELEMENT_ARRAY_BUFFER,c,r.STATIC_DRAW),r.bindVertexArray(null),{vao:f,iboSize:c.length}}function z(r){const n=new w(45,r,.1,100);return n.position.set(0,0,8),n.lookAt(0,0,0),n}const p=5;function R(r){const n=p,o=new y(-5*r,n*r,n,-5,.1,100);return o.position.set(0,0,8),o.lookAt(0,0,0),o}function b(r,n){const o=new E(r,n);return o.enableDamping=!0,o.dampingFactor=.08,o.rotateSpeed=.9,o.zoomSpeed=1,o.panSpeed=.9,o.target.set(0,0,0),o.update(),o}function X(){var l;const r=document.getElementById("glcanvas");m(r);const n=r.getContext("webgl2"),o=T(n,M,P);n.useProgram(o);const{vao:e,iboSize:c}=I(n,o),f=r.width/r.height;let i=z(f),d=b(i,r);const t={gl:n,prog:o,vao:e,iboSize:c,uProjection:n.getUniformLocation(o,"uProjection"),uModelView:n.getUniformLocation(o,"uModelView"),uModelInverse:n.getUniformLocation(o,"uModelInverse"),uOrthographic:n.getUniformLocation(o,"uOrthographic"),uSurface:n.getUniformLocation(o,"uSurface"),uCoeffs:n.getUniformLocation(o,"uCoeffs"),uShowAxes:n.getUniformLocation(o,"uShowAxes"),uShowBox:n.getUniformLocation(o,"uShowBox"),uHalf:n.getUniformLocation(o,"uHalf"),uEdgeThickness:n.getUniformLocation(o,"uEdgeThickness"),viewMode:1,surfaceMode:1,showAxes:!0,showBox:!0,coeffs:new Float32Array([0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,-1]),camera:i,controls:d};n.clearColor(1,1,1,1),n.enable(n.DEPTH_TEST),n.enable(n.CULL_FACE),window.addEventListener("resize",()=>{m(r);const s=r.width/r.height;t.viewMode===2&&t.camera instanceof y?(t.camera.left=-5*s,t.camera.right=p*s,t.camera.top=p,t.camera.bottom=-5,t.camera.updateProjectionMatrix()):t.camera instanceof w&&(t.camera.aspect=s,t.camera.updateProjectionMatrix())}),window.addEventListener("message",s=>{const a=s.data||{};if(a.type==="coeffs"&&Array.isArray(a.coeffs)&&a.coeffs.length===20)t.coeffs.set(a.coeffs);else if(a.type==="controls"){if(typeof a.viewMode=="number"){const x=a.viewMode|0;x!==t.viewMode&&U(t,x)}typeof a.surfaceMode=="number"&&(t.surfaceMode=a.surfaceMode|0),typeof a.showAxes=="boolean"&&(t.showAxes=!!a.showAxes),typeof a.showBox=="boolean"&&(t.showBox=!!a.showBox)}});try{(l=window.parent)==null||l.postMessage({type:"ready"},"*")}catch{}return t}function U(r,n){const o=r.gl.canvas,e=o.width/o.height;r.controls.dispose(),n===2?r.camera=R(e):r.camera=z(e),r.controls=b(r.camera,o),r.viewMode=n}function D(r){const{gl:n}=r;n.viewport(0,0,n.canvas.width,n.canvas.height),n.clear(n.COLOR_BUFFER_BIT|n.DEPTH_BUFFER_BIT),n.useProgram(r.prog),n.bindVertexArray(r.vao),r.uShowBox&&n.uniform1i(r.uShowBox,r.showBox?1:0),n.uniform1f(r.uHalf,v),n.uniform1f(r.uEdgeThickness,k),n.uniform1i(r.uSurface,r.surfaceMode),n.uniform1fv(r.uCoeffs,r.coeffs),n.uniform1i(r.uOrthographic,r.viewMode===2?1:0);const o=1.6,e=(c,f)=>{f?n.colorMask(...f):n.colorMask(!0,!0,!0,!0),r.controls.update(),r.camera.updateMatrixWorld(!0),c!==0&&(r.camera.position.x-=c,r.camera.updateMatrixWorld(!0));const i=new Float32Array(r.camera.projectionMatrix.elements);n.uniformMatrix4fv(r.uProjection,!1,i);const d=new Float32Array(r.camera.matrixWorldInverse.elements),t=u();S(t,t,[o,o,o]);const l=B(d),s=u();g(s,l,t),n.uniformMatrix4fv(r.uModelView,!1,s);const a=C(u(),s);n.uniformMatrix4fv(r.uModelInverse,!1,a),n.uniform1i(r.uShowAxes,r.showAxes?1:0),n.drawElements(n.TRIANGLES,r.iboSize,n.UNSIGNED_SHORT,0),c!==0&&(r.camera.position.x+=c,r.camera.updateMatrixWorld(!0))};r.viewMode===3?(e(-.12,[!0,!1,!1,!0]),n.clear(n.DEPTH_BUFFER_BIT),e(.12,[!1,!0,!0,!0]),n.colorMask(!0,!0,!0,!0)):e(0),n.bindVertexArray(null)}function A(r){D(r),requestAnimationFrame(()=>A(r))}window.addEventListener("load",()=>{const r=X();A(r)});
