#version 300 es
precision highp float;

layout(location=0) in vec3 aPosition;

uniform mat4 uProjection;
uniform mat4 uModelView;

out vec3 vPosOS;   // Objekt-Raum-Position (Punkt auf der Würfelfläche)

void main() {
  vPosOS = aPosition;
  gl_Position = uProjection * uModelView * vec4(aPosition, 1.0);
}
