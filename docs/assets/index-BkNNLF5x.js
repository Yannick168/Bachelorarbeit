(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const o of n)if(o.type==="childList")for(const v of o.addedNodes)v.tagName==="LINK"&&v.rel==="modulepreload"&&a(v)}).observe(document,{childList:!0,subtree:!0});function i(n){const o={};return n.integrity&&(o.integrity=n.integrity),n.referrerPolicy&&(o.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?o.credentials="include":n.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function a(n){if(n.ep)return;n.ep=!0;const o=i(n);fetch(n.href,o)}})();const U=`#version 300 es
layout(location=0) in vec3 aPosition;
layout(location=1) in vec4 aColor;

uniform mat4 uMVP;

out vec4 vColor;

void main() {
  gl_Position = uMVP * vec4(aPosition, 1.0);
  vColor = aColor;
}
`,V=`#version 300 es
precision mediump float;


in vec4 vColor;
out vec4 fColor;

void main() {
  fColor = vColor; 
}
`;var M=1e-6,w=typeof Float32Array<"u"?Float32Array:Array;Math.hypot||(Math.hypot=function(){for(var e=0,t=arguments.length;t--;)e+=arguments[t]*arguments[t];return Math.sqrt(e)});function F(){var e=new w(16);return w!=Float32Array&&(e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0),e[0]=1,e[5]=1,e[10]=1,e[15]=1,e}function D(e){return e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=1,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=1,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e}function C(e,t,i){var a=t[0],n=t[1],o=t[2],v=t[3],A=t[4],p=t[5],E=t[6],m=t[7],h=t[8],y=t[9],c=t[10],P=t[11],g=t[12],R=t[13],S=t[14],T=t[15],s=i[0],f=i[1],l=i[2],d=i[3];return e[0]=s*a+f*A+l*h+d*g,e[1]=s*n+f*p+l*y+d*R,e[2]=s*o+f*E+l*c+d*S,e[3]=s*v+f*m+l*P+d*T,s=i[4],f=i[5],l=i[6],d=i[7],e[4]=s*a+f*A+l*h+d*g,e[5]=s*n+f*p+l*y+d*R,e[6]=s*o+f*E+l*c+d*S,e[7]=s*v+f*m+l*P+d*T,s=i[8],f=i[9],l=i[10],d=i[11],e[8]=s*a+f*A+l*h+d*g,e[9]=s*n+f*p+l*y+d*R,e[10]=s*o+f*E+l*c+d*S,e[11]=s*v+f*m+l*P+d*T,s=i[12],f=i[13],l=i[14],d=i[15],e[12]=s*a+f*A+l*h+d*g,e[13]=s*n+f*p+l*y+d*R,e[14]=s*o+f*E+l*c+d*S,e[15]=s*v+f*m+l*P+d*T,e}function z(e,t,i,a,n){var o=1/Math.tan(t/2),v;return e[0]=o/i,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=o,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[11]=-1,e[12]=0,e[13]=0,e[15]=0,n!=null&&n!==1/0?(v=1/(a-n),e[10]=(n+a)*v,e[14]=2*n*a*v):(e[10]=-1,e[14]=-2*a),e}var Y=z;function H(e,t,i,a){var n,o,v,A,p,E,m,h,y,c,P=t[0],g=t[1],R=t[2],S=a[0],T=a[1],s=a[2],f=i[0],l=i[1],d=i[2];return Math.abs(P-f)<M&&Math.abs(g-l)<M&&Math.abs(R-d)<M?D(e):(m=P-f,h=g-l,y=R-d,c=1/Math.hypot(m,h,y),m*=c,h*=c,y*=c,n=T*y-s*h,o=s*m-S*y,v=S*h-T*m,c=Math.hypot(n,o,v),c?(c=1/c,n*=c,o*=c,v*=c):(n=0,o=0,v=0),A=h*v-y*o,p=y*n-m*v,E=m*o-h*n,c=Math.hypot(A,p,E),c?(c=1/c,A*=c,p*=c,E*=c):(A=0,p=0,E=0),e[0]=n,e[1]=A,e[2]=m,e[3]=0,e[4]=o,e[5]=p,e[6]=h,e[7]=0,e[8]=v,e[9]=E,e[10]=y,e[11]=0,e[12]=-(n*P+o*g+v*R),e[13]=-(A*P+p*g+E*R),e[14]=-(m*P+h*g+y*R),e[15]=1,e)}function I(e,t,i){const a=e.createShader(t);if(e.shaderSource(a,i),e.compileShader(a),!e.getShaderParameter(a,e.COMPILE_STATUS))throw console.error(e.getShaderInfoLog(a)),new Error("Shader compile error");return a}function G(e,t,i){const a=e.createProgram();if(e.attachShader(a,t),e.attachShader(a,i),e.linkProgram(a),!e.getProgramParameter(a,e.LINK_STATUS))throw console.error(e.getProgramInfoLog(a)),new Error("Program link error");return a}const _=document.getElementById("glCanvas"),r=_.getContext("webgl2");if(!r)throw new Error("WebGL2 wird nicht unterstützt");const q=I(r,r.VERTEX_SHADER,U),W=I(r,r.FRAGMENT_SHADER,V),x=G(r,q,W);r.useProgram(x);r.enable(r.DEPTH_TEST);const K=new Float32Array([-1,-1,0,1,0,0,1,1,-1,0,0,1,0,1,0,1,0,0,0,1,1]),O=new Uint16Array([0,1,2]),b=r.createVertexArray();r.bindVertexArray(b);const j=r.createBuffer();r.bindBuffer(r.ARRAY_BUFFER,j);r.bufferData(r.ARRAY_BUFFER,K,r.STATIC_DRAW);const X=r.createBuffer();r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,X);r.bufferData(r.ELEMENT_ARRAY_BUFFER,O,r.STATIC_DRAW);r.enableVertexAttribArray(0);r.vertexAttribPointer(0,3,r.FLOAT,!1,7*4,0);r.enableVertexAttribArray(1);r.vertexAttribPointer(1,4,r.FLOAT,!1,7*4,3*4);r.bindVertexArray(null);const J=r.getUniformLocation(x,"uMVP"),Q=F(),B=F(),N=F(),L=F();H(B,[2,2,2],[0,0,0],[0,1,0]);Y(N,Math.PI/4,_.width/_.height,.1,100);C(L,N,C(L,B,Q));r.uniformMatrix4fv(J,!1,L);function u(){r.clearColor(1,1,1,1),r.clear(r.COLOR_BUFFER_BIT|r.DEPTH_BUFFER_BIT),r.useProgram(x),r.bindVertexArray(b),r.drawElements(r.TRIANGLES,O.length,r.UNSIGNED_SHORT,0),requestAnimationFrame(u)}u();
