import"./modulepreload-polyfill-B5Qt9EMX.js";import{c as m,l as G,p as Y,f as z,m as T,a as W}from"./mat4-uSk0HlBj.js";import{c as q,a as K,l as X,d as $,n as J,f as Q}from"./vec3-DGbGUZ3g.js";function U(o,r,a){const n=o.createShader(r);if(o.shaderSource(n,a),o.compileShader(n),!o.getShaderParameter(n,o.COMPILE_STATUS)){const e=o.getShaderInfoLog(n);throw o.deleteShader(n),new Error("Shader compile error: "+e)}return n}function Z(o,r,a){const n=o.createProgram();if(o.attachShader(n,r),o.attachShader(n,a),o.linkProgram(n),!o.getProgramParameter(n,o.LINK_STATUS)){const e=o.getProgramInfoLog(n);throw o.deleteProgram(n),new Error("Program link error: "+e)}return n}const tt=`#version 300 es
layout(location=0) in vec3 aPosition;
layout(location=1) in vec4 aColor;

uniform mat4 uMVP;

out vec4 vColor;

void main() {
  gl_Position = uMVP * vec4(aPosition, 1.0);
  vColor = aColor;
}
`,ot=`#version 300 es
precision mediump float;


in vec4 vColor;
out vec4 fColor;

void main() {
  fColor = vColor; 
}
`,h=document.getElementById("glCanvas"),t=h.getContext("webgl2");if(!t)throw new Error("WebGL2 not supported");t.enable(t.DEPTH_TEST);const rt=U(t,t.VERTEX_SHADER,tt),nt=U(t,t.FRAGMENT_SHADER,ot),M=Z(t,rt,nt);t.useProgram(M);function et(o,r,a,n,e,c,s){const f=[],u=[];for(let l=0;l<=r;l++){const i=e+(c-e)*(l/r);for(let d=0;d<=o;d++){const p=a+(n-a)*(d/o),[R,P,b]=s(p,i),E=(i-e)/(c-e),H=.2,j=1-E;f.push(R,P,b,E,H,j,1)}}for(let l=0;l<r;l++)for(let i=0;i<o;i++){const d=l*(o+1),p=(l+1)*(o+1),R=d+i,P=d+i+1,b=p+i,E=p+i+1;u.push(R,P,E,R,E,b)}return{positions:new Float32Array(f),indices:new Uint16Array(u)}}function at(o=1.5,r=24){const a=[],n=[];for(let e=0;e<=r;e++){const c=e*Math.PI/r;for(let s=0;s<=r;s++){const f=s*2*Math.PI/r,u=o*Math.sin(c)*Math.cos(f),l=o*Math.sin(c)*Math.sin(f),i=o*Math.cos(c);a.push(u,l,i,1,0,0,.3)}}for(let e=0;e<r;e++)for(let c=0;c<r;c++){const s=e*(r+1)+c,f=s+1,u=s+(r+1);n.push(s,f,s,u)}return{positions:new Float32Array(a),indices:new Uint16Array(n)}}const _=et(100,100,0,2*Math.PI,-2,2,(o,r)=>[1*Math.cos(o)*Math.cosh(r),1*Math.sin(o)*Math.cosh(r),r]),ct=new Float32Array([0,0,0,1,0,0,1,2,0,0,1,0,0,1,0,0,0,0,1,0,1,0,2,0,0,1,0,1,0,0,0,0,0,1,1,0,0,2,0,0,1,1]),st=new Uint16Array([0,1,2,3,4,5]);function w(o,r){const a=t.createVertexArray(),n=t.createBuffer(),e=t.createBuffer();return t.bindVertexArray(a),t.bindBuffer(t.ARRAY_BUFFER,n),t.bufferData(t.ARRAY_BUFFER,o,t.STATIC_DRAW),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,e),t.bufferData(t.ELEMENT_ARRAY_BUFFER,r,t.STATIC_DRAW),t.enableVertexAttribArray(0),t.vertexAttribPointer(0,3,t.FLOAT,!1,7*4,0),t.enableVertexAttribArray(1),t.vertexAttribPointer(1,4,t.FLOAT,!1,7*4,3*4),t.bindVertexArray(null),{vao:a,count:r.length}}const I=w(_.positions,_.indices),V=w(ct,st),F=at(2.5),L=w(F.positions,F.indices),it=t.getUniformLocation(M,"uMVP"),C=m(),B=m(),D=m(),S=m(),v=m();G(B,[8,2,8],[0,0,0],[0,1,0]);Y(D,Math.PI/4,h.width/h.height,.1,100);const N=1;function g(o,r,a){const n=Q(o,r,0),e=o*o+r*r;if(e<=a*a)n[2]=Math.sqrt(a*a-e);else{const c=Math.sqrt(e);n[0]*=a/c,n[1]*=a/c}return n}function O(o){const r=h.getBoundingClientRect(),a=(o.clientX-r.left)/r.width*2-1,n=(r.bottom-o.clientY)/r.height*2-1;return[a,n]}let x=!1,y=!1,A=null;h.addEventListener("mousedown",o=>{x=!0,y=!0;const[r,a]=O(o);A=g(r,a,N)});h.addEventListener("mouseup",()=>{x=!1,y=!1,A=null});h.addEventListener("mousemove",o=>{if(!x||!A)return;const[r,a]=O(o),n=g(r,a,N),e=q();if(K(e,A,n),X(e)<1e-5)return;const c=$(A,n),s=Math.min(1,Math.max(-1,c)),f=Math.acos(s),u=m();J(e,e),z(u,f,e),T(v,u,v),A=n});function k(){W(C,v),T(S,B,C),T(S,D,S),t.clearColor(1,1,1,1),t.clear(t.COLOR_BUFFER_BIT|t.DEPTH_BUFFER_BIT),t.useProgram(M),t.uniformMatrix4fv(it,!1,S),y&&(t.bindVertexArray(L.vao),t.drawElements(t.LINES,L.count,t.UNSIGNED_SHORT,0)),t.bindVertexArray(V.vao),t.drawElements(t.LINES,V.count,t.UNSIGNED_SHORT,0),t.bindVertexArray(I.vao),t.drawElements(t==null?void 0:t.TRIANGLES,I.count,t.UNSIGNED_SHORT,0),requestAnimationFrame(k)}k();
