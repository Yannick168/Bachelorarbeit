#version 300 es
precision highp float;

in vec3 aPosition;     // kommt aus deinem Cube-VBO
out vec3 vUV;          // geht weiter an den Fragment-Shader

uniform mat4 uProjection;
uniform mat4 uModelView;

void main() {
  vUV = aPosition;                           // im Modelraum
  gl_Position = uProjection * uModelView * vec4(aPosition, 1.0);
}
