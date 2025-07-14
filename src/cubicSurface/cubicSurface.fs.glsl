#version 300 es
precision highp float;

in vec2 vUV;
out vec4 fragColor;

uniform vec3 camPos;
uniform mat3 camRot;

__SURFACE_FUNCTION__

float map(vec3 p) {
  return surface(p);
}

vec3 getNormal(vec3 p) {
  float eps = 0.001;
  return normalize(vec3(
    map(p + vec3(eps, 0, 0)) - map(p - vec3(eps, 0, 0)),
    map(p + vec3(0, eps, 0)) - map(p - vec3(0, eps, 0)),
    map(p + vec3(0, 0, eps)) - map(p - vec3(0, 0, eps))
  ));
}

void main() {
  vec2 uv = vUV * 2.0 - 1.0;
  vec3 ro = camPos;
  vec3 rd = normalize(camRot * normalize(vec3(uv, -1.5)));

  float t = 0.0;
  float d;
  bool hit = false;
  for (int i = 0; i < 100; i++) {
    vec3 p = ro + t * rd;
    d = map(p);
    if (abs(d) < 0.001) {
      hit = true;
      break;
    }
    t += d * 0.5;
    if (t > 10.0) break;
  }

  if (hit) {
    vec3 p = ro + t * rd;
    vec3 n = getNormal(p);
    vec3 lightDir = normalize(vec3(0.5, 1.0, 0.8));
    float diffuse = max(dot(n, lightDir), 0.0);
    fragColor = vec4(vec3(0.2, 0.8, 1.0) * diffuse, 1.0);
  } else {
    fragColor = vec4(1.0);
  }
}
