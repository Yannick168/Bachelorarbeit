#version 300 es
precision highp float;

in vec3 aPosition;
out vec3 vPosition;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

void main() {
    vPosition = aPosition;
    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
}
