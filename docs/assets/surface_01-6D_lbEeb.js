import"./modulepreload-polyfill-B5Qt9EMX.js";import{c as m,l as G,p as Y,f as z,m as T,a as W}from"./mat4-DousPgjw.js";import{c as q,a as K,l as X,d as $,n as J,f as Q}from"./vec3-Er0YIGI6.js";function U(r,o,a){const n=r.createShader(o);if(r.shaderSource(n,a),r.compileShader(n),!r.getShaderParameter(n,r.COMPILE_STATUS)){const e=r.getShaderInfoLog(n);throw r.deleteShader(n),new Error("Shader compile error: "+e)}return n}function Z(r,o,a){const n=r.createProgram();if(r.attachShader(n,o),r.attachShader(n,a),r.linkProgram(n),!r.getProgramParameter(n,r.LINK_STATUS)){const e=r.getProgramInfoLog(n);throw r.deleteProgram(n),new Error("Program link error: "+e)}return n}const tt=`#version 300 es\r
layout(location=0) in vec3 aPosition;\r
layout(location=1) in vec4 aColor;\r
\r
uniform mat4 uMVP;\r
\r
out vec4 vColor;\r
\r
void main() {\r
  gl_Position = uMVP * vec4(aPosition, 1.0);\r
  vColor = aColor;\r
}\r
`,rt=`#version 300 es\r
precision mediump float;\r
\r
\r
in vec4 vColor;\r
out vec4 fColor;\r
\r
void main() {\r
  fColor = vColor; \r
}\r
`,h=document.getElementById("glCanvas"),t=h.getContext("webgl2");if(!t)throw new Error("WebGL2 not supported");t.enable(t.DEPTH_TEST);const ot=U(t,t.VERTEX_SHADER,tt),nt=U(t,t.FRAGMENT_SHADER,rt),M=Z(t,ot,nt);t.useProgram(M);function et(r,o,a,n,e,c,s){const f=[],u=[];for(let l=0;l<=o;l++){const i=e+(c-e)*(l/o);for(let d=0;d<=r;d++){const p=a+(n-a)*(d/r),[R,P,b]=s(p,i),E=(i-e)/(c-e),H=.2,j=1-E;f.push(R,P,b,E,H,j,1)}}for(let l=0;l<o;l++)for(let i=0;i<r;i++){const d=l*(r+1),p=(l+1)*(r+1),R=d+i,P=d+i+1,b=p+i,E=p+i+1;u.push(R,P,E,R,E,b)}return{positions:new Float32Array(f),indices:new Uint16Array(u)}}function at(r=1.5,o=24){const a=[],n=[];for(let e=0;e<=o;e++){const c=e*Math.PI/o;for(let s=0;s<=o;s++){const f=s*2*Math.PI/o,u=r*Math.sin(c)*Math.cos(f),l=r*Math.sin(c)*Math.sin(f),i=r*Math.cos(c);a.push(u,l,i,1,0,0,.3)}}for(let e=0;e<o;e++)for(let c=0;c<o;c++){const s=e*(o+1)+c,f=s+1,u=s+(o+1);n.push(s,f,s,u)}return{positions:new Float32Array(a),indices:new Uint16Array(n)}}const _=et(100,100,0,2*Math.PI,-2,2,(r,o)=>[1*Math.cos(r)*Math.cosh(o),1*Math.sin(r)*Math.cosh(o),o]),ct=new Float32Array([0,0,0,1,0,0,1,2,0,0,1,0,0,1,0,0,0,0,1,0,1,0,2,0,0,1,0,1,0,0,0,0,0,1,1,0,0,2,0,0,1,1]),st=new Uint16Array([0,1,2,3,4,5]);function w(r,o){const a=t.createVertexArray(),n=t.createBuffer(),e=t.createBuffer();return t.bindVertexArray(a),t.bindBuffer(t.ARRAY_BUFFER,n),t.bufferData(t.ARRAY_BUFFER,r,t.STATIC_DRAW),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,e),t.bufferData(t.ELEMENT_ARRAY_BUFFER,o,t.STATIC_DRAW),t.enableVertexAttribArray(0),t.vertexAttribPointer(0,3,t.FLOAT,!1,7*4,0),t.enableVertexAttribArray(1),t.vertexAttribPointer(1,4,t.FLOAT,!1,7*4,3*4),t.bindVertexArray(null),{vao:a,count:o.length}}const I=w(_.positions,_.indices),V=w(ct,st),F=at(2.5),L=w(F.positions,F.indices),it=t.getUniformLocation(M,"uMVP"),C=m(),B=m(),D=m(),S=m(),v=m();G(B,[8,2,8],[0,0,0],[0,1,0]);Y(D,Math.PI/4,h.width/h.height,.1,100);const N=1;function g(r,o,a){const n=Q(r,o,0),e=r*r+o*o;if(e<=a*a)n[2]=Math.sqrt(a*a-e);else{const c=Math.sqrt(e);n[0]*=a/c,n[1]*=a/c}return n}function O(r){const o=h.getBoundingClientRect(),a=(r.clientX-o.left)/o.width*2-1,n=(o.bottom-r.clientY)/o.height*2-1;return[a,n]}let x=!1,y=!1,A=null;h.addEventListener("mousedown",r=>{x=!0,y=!0;const[o,a]=O(r);A=g(o,a,N)});h.addEventListener("mouseup",()=>{x=!1,y=!1,A=null});h.addEventListener("mousemove",r=>{if(!x||!A)return;const[o,a]=O(r),n=g(o,a,N),e=q();if(K(e,A,n),X(e)<1e-5)return;const c=$(A,n),s=Math.min(1,Math.max(-1,c)),f=Math.acos(s),u=m();J(e,e),z(u,f,e),T(v,u,v),A=n});function k(){W(C,v),T(S,B,C),T(S,D,S),t.clearColor(1,1,1,1),t.clear(t.COLOR_BUFFER_BIT|t.DEPTH_BUFFER_BIT),t.useProgram(M),t.uniformMatrix4fv(it,!1,S),y&&(t.bindVertexArray(L.vao),t.drawElements(t.LINES,L.count,t.UNSIGNED_SHORT,0)),t.bindVertexArray(V.vao),t.drawElements(t.LINES,V.count,t.UNSIGNED_SHORT,0),t.bindVertexArray(I.vao),t.drawElements(t==null?void 0:t.TRIANGLES,I.count,t.UNSIGNED_SHORT,0),requestAnimationFrame(k)}k();
