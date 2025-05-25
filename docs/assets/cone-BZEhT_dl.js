import"./modulepreload-polyfill-B5Qt9EMX.js";const P=`#version 300 es
in vec4 a_position;
void main() {
  gl_Position = a_position;
}`,F=`#version 300 es
precision highp float;
out vec4 outColor;

uniform vec2 u_resolution;
uniform vec3 cameraPosition;
uniform vec3 cameraForward;

float sdf_cone(vec3 p, float height, float radius) {
  float q = length(p.xz);
  float angle = atan(radius / height);
  float d = max(dot(vec2(q, -p.y), normalize(vec2(sin(angle), cos(angle)))), -p.y);
  return d;
}

float map(vec3 p) {
  p.y += 0.5; // Kegelbasis bei y=0
  return sdf_cone(p, 1.0, 0.5);
}

vec3 getNormal(vec3 p) {
  float e = 0.001;
  return normalize(vec3(
    map(p + vec3(e, 0, 0)) - map(p - vec3(e, 0, 0)),
    map(p + vec3(0, e, 0)) - map(p - vec3(0, e, 0)),
    map(p + vec3(0, 0, e)) - map(p - vec3(0, 0, e))
  ));
}

float raymarch(vec3 ro, vec3 rd, out vec3 p) {
  float t = 0.0;
  for (int i = 0; i < 128; i++) {
    p = ro + t * rd;
    float d = map(p);
    if (d < 0.001) return t;
    if (t > 50.0) break;
    t += d;
  }
  return -1.0;
}

void main() {
  vec2 uv = (gl_FragCoord.xy / u_resolution) * 2.0 - 1.0;
  uv.x *= u_resolution.x / u_resolution.y;

  vec3 ro = cameraPosition;
  vec3 forward = normalize(cameraForward);
  vec3 right = normalize(cross(vec3(0, 1, 0), forward));
  vec3 up = cross(forward, right);
  vec3 rd = normalize(uv.x * right + uv.y * up + forward);

  vec3 p;
  float t = raymarch(ro, rd, p);

  if (t > 0.0) {
    vec3 n = getNormal(p);
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    vec3 viewDir = normalize(ro - p);
    vec3 halfDir = normalize(lightDir + viewDir);

    float diff = max(dot(n, lightDir), 0.0);
    float spec = pow(max(dot(n, halfDir), 0.0), 64.0);
    vec3 baseColor = vec3(1.0, 0.0, 0.0); // rot

    vec3 color = 0.1 + diff * baseColor + spec * vec3(1.0);
    outColor = vec4(color, 1.0);
  } else {
    outColor = vec4(1.0); // Hintergrund weiß
  }
}
`,a=document.getElementById("glcanvas"),o=a.getContext("webgl2");a.width=window.innerWidth;a.height=window.innerHeight;function p(e,i,t){const r=e.createShader(i);return e.shaderSource(r,t),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS)?r:(console.error(e.getShaderInfoLog(r)),e.deleteShader(r),null)}function L(e,i,t){const r=p(e,e.VERTEX_SHADER,i),f=p(e,e.FRAGMENT_SHADER,t),n=e.createProgram();return e.attachShader(n,r),e.attachShader(n,f),e.linkProgram(n),e.getProgramParameter(n,e.LINK_STATUS)?n:(console.error(e.getProgramInfoLog(n)),null)}const m=L(o,P,F),y=o.createBuffer();o.bindBuffer(o.ARRAY_BUFFER,y);o.bufferData(o.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),o.STATIC_DRAW);const h=o.getAttribLocation(m,"a_position"),M=o.getUniformLocation(m,"u_resolution"),S=o.getUniformLocation(m,"u_time"),R=o.getUniformLocation(m,"cameraPosition"),E=o.getUniformLocation(m,"cameraForward");let s=[0,1.5,4],d=-Math.PI/2,l=0,u=[0,0,-1],c={};window.addEventListener("keydown",e=>c[e.key.toLowerCase()]=!0);window.addEventListener("keyup",e=>c[e.key.toLowerCase()]=!1);let w=0,g=0,v=!1;a.addEventListener("mousedown",()=>v=!0);a.addEventListener("mouseup",()=>v=!1);a.addEventListener("mousemove",e=>{if(!v)return;const i=e.movementX||e.clientX-w,t=e.movementY||e.clientY-g;w=e.clientX,g=e.clientY;const r=.002;d+=i*r,l-=t*r,l=Math.max(-Math.PI/2+.01,Math.min(Math.PI/2-.01,l)),u=[Math.cos(l)*Math.cos(d),Math.sin(l),Math.cos(l)*Math.sin(d)]});function C(e){const t=[Math.sin(d-Math.PI/2),0,Math.cos(d-Math.PI/2)],r=[0,1,0],f=u;if(c.w)for(let n=0;n<3;n++)s[n]+=f[n]*2.5*e;if(c.s)for(let n=0;n<3;n++)s[n]-=f[n]*2.5*e;if(c.a)for(let n=0;n<3;n++)s[n]-=t[n]*2.5*e;if(c.d)for(let n=0;n<3;n++)s[n]+=t[n]*2.5*e;if(c.q)for(let n=0;n<3;n++)s[n]-=r[n]*2.5*e;if(c.e)for(let n=0;n<3;n++)s[n]+=r[n]*2.5*e}let A=0;function _(e){e*=.001;const i=e-A;A=e,C(i);const t=new Float32Array(s),r=Math.hypot(...u),f=new Float32Array(u.map(n=>n/r));o.viewport(0,0,a.width,a.height),o.clear(o.COLOR_BUFFER_BIT),o.useProgram(m),o.bindBuffer(o.ARRAY_BUFFER,y),o.enableVertexAttribArray(h),o.vertexAttribPointer(h,2,o.FLOAT,!1,0,0),o.uniform2f(M,a.width,a.height),o.uniform1f(S,e),o.uniform3fv(R,t),o.uniform3fv(E,f),o.drawArrays(o.TRIANGLES,0,6),requestAnimationFrame(_)}requestAnimationFrame(_);
