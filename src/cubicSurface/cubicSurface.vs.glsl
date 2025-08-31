#version 300 es
precision highp float;

in vec3 aPosition;       // aus VBO
out vec3 vUV;            // Modelraum-Position

uniform mat4 uProjection;
uniform mat4 uModelView;

void main() {
  vUV = aPosition; // wir bleiben im Modelraum (wie früher)
  gl_Position = uProjection * uModelView * vec4(aPosition, 1.0);
}
