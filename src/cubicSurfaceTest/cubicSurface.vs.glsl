#version 300 es
precision highp float;

in vec3 aPosition;      // Würfel-Position (Modelraum)
out vec3 vUV;           // an FS weiterreichen

uniform mat4 uProjection;
uniform mat4 uModelView;

void main() {
  vUV = aPosition;                              // im Modelraum bleiben
  gl_Position = uProjection * uModelView * vec4(aPosition, 1.0);
}
