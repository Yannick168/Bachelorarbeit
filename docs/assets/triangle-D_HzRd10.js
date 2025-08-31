import"./modulepreload-polyfill-B5Qt9EMX.js";import{c as t,l as d,p as P,m}from"./mat4-C8xVwdYF.js";const R=`#version 300 es
layout(location=0) in vec3 aPosition;
layout(location=1) in vec4 aColor;

uniform mat4 uMVP;

out vec4 vColor;

void main() {
  gl_Position = uMVP * vec4(aPosition, 1.0);
  vColor = aColor;
}
`,S=`#version 300 es
precision mediump float;


in vec4 vColor;
out vec4 fColor;

void main() {
  fColor = vColor; 
}
`;function A(e,n,a){const o=e.createShader(n);if(e.shaderSource(o,a),e.compileShader(o),!e.getShaderParameter(o,e.COMPILE_STATUS))throw console.error(e.getShaderInfoLog(o)),new Error("Shader compile error");return o}function T(e,n,a){const o=e.createProgram();if(e.attachShader(o,n),e.attachShader(o,a),e.linkProgram(o),!e.getProgramParameter(o,e.LINK_STATUS))throw console.error(e.getProgramInfoLog(o)),new Error("Program link error");return o}const i=document.getElementById("glCanvas"),r=i.getContext("webgl2"),h=A(r,r.VERTEX_SHADER,R),_=A(r,r.FRAGMENT_SHADER,S),s=T(r,h,_);r.useProgram(s);r.enable(r.DEPTH_TEST);const b=new Float32Array([-1,-1,0,1,0,0,1,1,-1,0,0,1,0,1,0,1,0,0,0,1,1]),f=new Uint16Array([0,1,2]),l=r.createVertexArray();r.bindVertexArray(l);const F=r.createBuffer();r.bindBuffer(r.ARRAY_BUFFER,F);r.bufferData(r.ARRAY_BUFFER,b,r.STATIC_DRAW);const g=r.createBuffer();r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,g);r.bufferData(r.ELEMENT_ARRAY_BUFFER,f,r.STATIC_DRAW);r.enableVertexAttribArray(0);r.vertexAttribPointer(0,3,r.FLOAT,!1,7*4,0);r.enableVertexAttribArray(1);r.vertexAttribPointer(1,4,r.FLOAT,!1,7*4,3*4);r.bindVertexArray(null);const C=r.getUniformLocation(s,"uMVP"),p=t(),u=t(),v=t(),c=t();d(u,[2,2,3],[0,0,0],[0,1,0]);P(v,Math.PI/4,i.width/i.height,.1,100);m(c,v,m(c,u,p));r.uniformMatrix4fv(C,!1,c);function E(){r.clearColor(1,1,1,1),r.clear(r.COLOR_BUFFER_BIT|r.DEPTH_BUFFER_BIT),r.useProgram(s),r.bindVertexArray(l),r.drawElements(r.TRIANGLES,f.length,r.UNSIGNED_SHORT,0),requestAnimationFrame(E)}E();
