#version 300 es
precision highp float;
precision highp int;

in vec3 aPosition;

uniform mat4 uModelView;
uniform mat4 uProjection;

out vec3 vObjCoord;   // Objektkoordinate fürs Ray-Setup im FS

void main() {
  vObjCoord = aPosition;        // unverändert im Objektraum weiterreichen
  gl_Position = uProjection * uModelView * vec4(aPosition, 1.0);
}
