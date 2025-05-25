import"./modulepreload-polyfill-B5Qt9EMX.js";const A=`#version 300 es\r
in vec4 a_position;\r
void main() {\r
  gl_Position = a_position;\r
}`,F=`#version 300 es\r
precision highp float;\r
out vec4 outColor;\r
\r
uniform vec2 u_resolution;\r
uniform float u_time;\r
uniform vec3 cameraPosition;\r
uniform vec3 cameraForward;\r
\r
// Kamera → Rayrichtung\r
vec3 getRayDirection(vec2 uv, vec3 camPos, vec3 camTarget, float zoom) {\r
  vec3 forward = normalize(camTarget - camPos);\r
  vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), forward));\r
  vec3 up = cross(forward, right);\r
  return normalize(uv.x * right + uv.y * up + zoom * forward);\r
}\r
\r
// SDF für stehenden Kegel (Basis unten, Spitze oben)\r
float sdf_cone(vec3 p, float height, float radius) {\r
  float q = length(p.xz);\r
  float angle = atan(radius / height);\r
  float d = max(dot(vec2(q, -p.y), normalize(vec2(sin(angle), cos(angle)))), -p.y);\r
  return d;\r
}\r
\r
// Raymarching\r
float raymarch(vec3 ro, vec3 rd) {\r
  float t = 0.0;\r
  for (int i = 0; i < 100; i++) {\r
    vec3 p = ro + t * rd;\r
    p.y += 0.5; // Kegel steht aufrecht mit Basis bei y = 0\r
    float d = sdf_cone(p, 1.0, 0.5);\r
    if (d < 0.001) return t;\r
    if (t > 50.0) break;\r
    t += d;\r
  }\r
  return -1.0;\r
}\r
\r
// Normale per Finite Differences\r
vec3 getNormal(vec3 p) {\r
  float eps = 0.001;\r
  vec2 e = vec2(1.0, -1.0) * eps;\r
  return normalize(vec3(\r
    sdf_cone(p + e.xyy, 1.0, 0.5) - sdf_cone(p + e.yyy, 1.0, 0.5),\r
    sdf_cone(p + e.yxy, 1.0, 0.5) - sdf_cone(p + e.yyy, 1.0, 0.5),\r
    sdf_cone(p + e.yyx, 1.0, 0.5) - sdf_cone(p + e.yyy, 1.0, 0.5)\r
  ));\r
}\r
\r
void main() {\r
  vec2 uv = (gl_FragCoord.xy / u_resolution) * 2.0 - 1.0;\r
  uv.x *= u_resolution.x / u_resolution.y;\r
\r
  vec3 camPos = cameraPosition;\r
  vec3 camTarget = camPos + cameraForward;\r
  vec3 rd = getRayDirection(uv, camPos, camTarget, 1.0);\r
\r
  float t = raymarch(camPos, rd);\r
  if (t > 0.0) {\r
    vec3 p = camPos + rd * t;\r
    vec3 shiftedP = p + vec3(0.0, 0.5, 0.0); // gleiche Verschiebung wie in raymarch\r
    vec3 normal = getNormal(shiftedP);\r
\r
    // Blinn-Phong Licht\r
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));\r
    vec3 viewDir = normalize(camPos - p);\r
    vec3 halfDir = normalize(lightDir + viewDir);\r
\r
    float diff = max(dot(normal, lightDir), 0.0);\r
    float spec = pow(max(dot(normal, halfDir), 0.0), 64.0);\r
\r
    vec3 ambient = vec3(0.1);\r
    vec3 baseColor = vec3(0.8, 0.4, 0.1); // orangebraun\r
    vec3 color = ambient + diff * baseColor + spec * vec3(1.0);\r
\r
    outColor = vec4(color, 1.0);\r
  } else {\r
    outColor = vec4(0.0); // Hintergrund schwarz\r
  }\r
}\r
`,a=document.getElementById("glcanvas"),n=a.getContext("webgl2");a.width=window.innerWidth;a.height=window.innerHeight;function h(r,i,t){const o=r.createShader(i);return r.shaderSource(o,t),r.compileShader(o),r.getShaderParameter(o,r.COMPILE_STATUS)?o:(console.error(r.getShaderInfoLog(o)),r.deleteShader(o),null)}function R(r,i,t){const o=h(r,r.VERTEX_SHADER,i),f=h(r,r.FRAGMENT_SHADER,t),e=r.createProgram();return r.attachShader(e,o),r.attachShader(e,f),r.linkProgram(e),r.getProgramParameter(e,r.LINK_STATUS)?e:(console.error(r.getProgramInfoLog(e)),null)}const d=R(n,A,F),P=n.createBuffer();n.bindBuffer(n.ARRAY_BUFFER,P);n.bufferData(n.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),n.STATIC_DRAW);const p=n.getAttribLocation(d,"a_position"),L=n.getUniformLocation(d,"u_resolution"),S=n.getUniformLocation(d,"u_time"),M=n.getUniformLocation(d,"cameraPosition"),b=n.getUniformLocation(d,"cameraForward");let s=[0,1.5,4],l=-Math.PI/2,m=0,u=[0,0,-1],c={};window.addEventListener("keydown",r=>c[r.key.toLowerCase()]=!0);window.addEventListener("keyup",r=>c[r.key.toLowerCase()]=!1);let g=0,y=0,v=!1;a.addEventListener("mousedown",()=>v=!0);a.addEventListener("mouseup",()=>v=!1);a.addEventListener("mousemove",r=>{if(!v)return;const i=r.movementX||r.clientX-g,t=r.movementY||r.clientY-y;g=r.clientX,y=r.clientY;const o=.002;l+=i*o,m-=t*o,m=Math.max(-Math.PI/2+.01,Math.min(Math.PI/2-.01,m)),u=[Math.cos(m)*Math.cos(l),Math.sin(m),Math.cos(m)*Math.sin(l)]});function x(r){const t=[Math.sin(l-Math.PI/2),0,Math.cos(l-Math.PI/2)],o=[0,1,0],f=u;if(c.w)for(let e=0;e<3;e++)s[e]+=f[e]*2.5*r;if(c.s)for(let e=0;e<3;e++)s[e]-=f[e]*2.5*r;if(c.a)for(let e=0;e<3;e++)s[e]-=t[e]*2.5*r;if(c.d)for(let e=0;e<3;e++)s[e]+=t[e]*2.5*r;if(c.q)for(let e=0;e<3;e++)s[e]-=o[e]*2.5*r;if(c.e)for(let e=0;e<3;e++)s[e]+=o[e]*2.5*r}let w=0;function _(r){r*=.001;const i=r-w;w=r,x(i);const t=new Float32Array(s),o=Math.hypot(...u),f=new Float32Array(u.map(e=>e/o));n.viewport(0,0,a.width,a.height),n.clear(n.COLOR_BUFFER_BIT),n.useProgram(d),n.bindBuffer(n.ARRAY_BUFFER,P),n.enableVertexAttribArray(p),n.vertexAttribPointer(p,2,n.FLOAT,!1,0,0),n.uniform2f(L,a.width,a.height),n.uniform1f(S,r),n.uniform3fv(M,t),n.uniform3fv(b,f),n.drawArrays(n.TRIANGLES,0,6),requestAnimationFrame(_)}requestAnimationFrame(_);
