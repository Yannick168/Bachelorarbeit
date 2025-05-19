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
`,n=document.getElementById("glcanvas"),e=n.getContext("webgl2");n.width=window.innerWidth;n.height=window.innerHeight;function p(r,a,i){const o=r.createShader(a);return r.shaderSource(o,i),r.compileShader(o),r.getShaderParameter(o,r.COMPILE_STATUS)?o:(console.error(r.getShaderInfoLog(o)),r.deleteShader(o),null)}function R(r,a,i){const o=p(r,r.VERTEX_SHADER,a),l=p(r,r.FRAGMENT_SHADER,i),t=r.createProgram();return r.attachShader(t,o),r.attachShader(t,l),r.linkProgram(t),r.getProgramParameter(t,r.LINK_STATUS)?t:(console.error(r.getProgramInfoLog(t)),null)}const m=R(e,A,F),P=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,P);e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),e.STATIC_DRAW);const y=e.getAttribLocation(m,"a_position"),S=e.getUniformLocation(m,"u_resolution"),L=e.getUniformLocation(m,"u_time"),x=e.getUniformLocation(m,"cameraPosition"),b=e.getUniformLocation(m,"cameraForward");let v=Math.PI/4,c=Math.PI/4,s=4,f=!1,h=0,g=0;n.addEventListener("mousedown",r=>{f=!0,h=r.clientX,g=r.clientY});n.addEventListener("mouseup",()=>f=!1);n.addEventListener("mouseleave",()=>f=!1);n.addEventListener("mousemove",r=>{if(!f)return;const a=r.clientX-h,i=r.clientY-g;h=r.clientX,g=r.clientY,v-=a*.01,c-=i*.01,c=Math.max(.1,Math.min(Math.PI-.1,c))});n.addEventListener("wheel",r=>{s+=r.deltaY*.01,s=Math.max(2,Math.min(10,s))});function _(r){r*=.001;const a=s*Math.sin(c)*Math.sin(v),i=s*Math.cos(c),o=s*Math.sin(c)*Math.cos(v),l=new Float32Array([a,i,o]),t=[0,.5,0],d=new Float32Array([t[0]-a,t[1]-i,t[2]-o]),w=Math.hypot(...d);for(let u=0;u<3;u++)d[u]/=w;e.viewport(0,0,n.width,n.height),e.clear(e.COLOR_BUFFER_BIT),e.useProgram(m),e.bindBuffer(e.ARRAY_BUFFER,P),e.enableVertexAttribArray(y),e.vertexAttribPointer(y,2,e.FLOAT,!1,0,0),e.uniform2f(S,n.width,n.height),e.uniform1f(L,r),e.uniform3fv(x,l),e.uniform3fv(b,d),e.drawArrays(e.TRIANGLES,0,6),requestAnimationFrame(_)}requestAnimationFrame(_);
