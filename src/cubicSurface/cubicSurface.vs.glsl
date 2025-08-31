#version 300 es
precision highp float;

layout(location=0) in vec3 aPosition;

uniform mat4 uModelView;
uniform mat4 uProjection;

out vec3 vUV;

void main() {
    vec4 pos = vec4(aPosition, 1.0);
    vUV = pos.xyz;
    gl_Position = uProjection * uModelView * pos;
}
