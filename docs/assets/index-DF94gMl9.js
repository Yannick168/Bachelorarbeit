(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))t(n);new MutationObserver(n=>{for(const o of n)if(o.type==="childList")for(const d of o.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&t(d)}).observe(document,{childList:!0,subtree:!0});function i(n){const o={};return n.integrity&&(o.integrity=n.integrity),n.referrerPolicy&&(o.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?o.credentials="include":n.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function t(n){if(n.ep)return;n.ep=!0;const o=i(n);fetch(n.href,o)}})();const V=`#version 300 es
layout(location=0) in vec3 aPosition;
layout(location=1) in vec4 aColor;

uniform mat4 uMVP;

out vec4 vColor;

void main() {
  gl_Position = uMVP * vec4(aPosition, 1.0);
  vColor = aColor;
}
`,u=`#version 300 es
precision mediump float;


in vec4 vColor;
out vec4 fColor;

void main() {
  fColor = vColor; 
}
`;var M=1e-6,C=typeof Float32Array<"u"?Float32Array:Array;Math.hypot||(Math.hypot=function(){for(var e=0,a=arguments.length;a--;)e+=arguments[a]*arguments[a];return Math.sqrt(e)});function F(){var e=new C(16);return C!=Float32Array&&(e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0),e[0]=1,e[5]=1,e[10]=1,e[15]=1,e}function D(e){return e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=1,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=1,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e}function I(e,a,i){var t=a[0],n=a[1],o=a[2],d=a[3],A=a[4],p=a[5],E=a[6],m=a[7],h=a[8],y=a[9],c=a[10],P=a[11],g=a[12],R=a[13],S=a[14],T=a[15],s=i[0],f=i[1],l=i[2],v=i[3];return e[0]=s*t+f*A+l*h+v*g,e[1]=s*n+f*p+l*y+v*R,e[2]=s*o+f*E+l*c+v*S,e[3]=s*d+f*m+l*P+v*T,s=i[4],f=i[5],l=i[6],v=i[7],e[4]=s*t+f*A+l*h+v*g,e[5]=s*n+f*p+l*y+v*R,e[6]=s*o+f*E+l*c+v*S,e[7]=s*d+f*m+l*P+v*T,s=i[8],f=i[9],l=i[10],v=i[11],e[8]=s*t+f*A+l*h+v*g,e[9]=s*n+f*p+l*y+v*R,e[10]=s*o+f*E+l*c+v*S,e[11]=s*d+f*m+l*P+v*T,s=i[12],f=i[13],l=i[14],v=i[15],e[12]=s*t+f*A+l*h+v*g,e[13]=s*n+f*p+l*y+v*R,e[14]=s*o+f*E+l*c+v*S,e[15]=s*d+f*m+l*P+v*T,e}function z(e,a,i,t,n){var o=1/Math.tan(a/2),d;return e[0]=o/i,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=o,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[11]=-1,e[12]=0,e[13]=0,e[15]=0,n!=null&&n!==1/0?(d=1/(t-n),e[10]=(n+t)*d,e[14]=2*n*t*d):(e[10]=-1,e[14]=-2*t),e}var Y=z;function H(e,a,i,t){var n,o,d,A,p,E,m,h,y,c,P=a[0],g=a[1],R=a[2],S=t[0],T=t[1],s=t[2],f=i[0],l=i[1],v=i[2];return Math.abs(P-f)<M&&Math.abs(g-l)<M&&Math.abs(R-v)<M?D(e):(m=P-f,h=g-l,y=R-v,c=1/Math.hypot(m,h,y),m*=c,h*=c,y*=c,n=T*y-s*h,o=s*m-S*y,d=S*h-T*m,c=Math.hypot(n,o,d),c?(c=1/c,n*=c,o*=c,d*=c):(n=0,o=0,d=0),A=h*d-y*o,p=y*n-m*d,E=m*o-h*n,c=Math.hypot(A,p,E),c?(c=1/c,A*=c,p*=c,E*=c):(A=0,p=0,E=0),e[0]=n,e[1]=A,e[2]=m,e[3]=0,e[4]=o,e[5]=p,e[6]=h,e[7]=0,e[8]=d,e[9]=E,e[10]=y,e[11]=0,e[12]=-(n*P+o*g+d*R),e[13]=-(A*P+p*g+E*R),e[14]=-(m*P+h*g+y*R),e[15]=1,e)}function O(e,a,i){const t=e.createShader(a);if(e.shaderSource(t,i),e.compileShader(t),!e.getShaderParameter(t,e.COMPILE_STATUS))throw console.error(e.getShaderInfoLog(t)),new Error("Shader compile error");return t}function q(e,a,i){const t=e.createProgram();if(e.attachShader(t,a),e.attachShader(t,i),e.linkProgram(t),!e.getProgramParameter(t,e.LINK_STATUS))throw console.error(e.getProgramInfoLog(t)),new Error("Program link error");return t}const _=document.getElementById("glCanvas"),r=_.getContext("webgl2"),G=O(r,r.VERTEX_SHADER,V),K=O(r,r.FRAGMENT_SHADER,u),L=q(r,G,K);r.useProgram(L);r.enable(r.DEPTH_TEST);const W=new Float32Array([-1,-1,0,1,0,0,1,1,-1,0,0,1,0,1,0,1,0,0,0,1,1]),w=new Uint16Array([0,1,2]),B=r.createVertexArray();r.bindVertexArray(B);const j=r.createBuffer();r.bindBuffer(r.ARRAY_BUFFER,j);r.bufferData(r.ARRAY_BUFFER,W,r.STATIC_DRAW);const X=r.createBuffer();r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,X);r.bufferData(r.ELEMENT_ARRAY_BUFFER,w,r.STATIC_DRAW);r.enableVertexAttribArray(0);r.vertexAttribPointer(0,3,r.FLOAT,!1,7*4,0);r.enableVertexAttribArray(1);r.vertexAttribPointer(1,4,r.FLOAT,!1,7*4,3*4);r.bindVertexArray(null);const J=r.getUniformLocation(L,"uMVP"),Q=F(),b=F(),N=F(),x=F();H(b,[2,2,3],[0,0,0],[0,1,0]);Y(N,Math.PI/4,_.width/_.height,.1,100);I(x,N,I(x,b,Q));r.uniformMatrix4fv(J,!1,x);function U(){r.clearColor(1,1,1,1),r.clear(r.COLOR_BUFFER_BIT|r.DEPTH_BUFFER_BIT),r.useProgram(L),r.bindVertexArray(B),r.drawElements(r.TRIANGLES,w.length,r.UNSIGNED_SHORT,0),requestAnimationFrame(U)}U();
