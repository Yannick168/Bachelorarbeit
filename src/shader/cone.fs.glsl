#version 300 es
precision highp float;
out vec4 outColor;

uniform vec2 u_resolution;
uniform vec3 cameraPosition;
uniform vec3 cameraForward;

float sdf_cone(vec3 p, float height, float radius) {
  float q = length(p.xz);
  float angle = atan(radius / height);
  float d = max(dot(vec2(q, -p.y), normalize(vec2(sin(angle), cos(angle)))), -p.y);
  return d;
}

float map(vec3 p) {
  p.y += 0.5; // Kegelbasis bei y=0
  return sdf_cone(p, 1.0, 0.5);
}

vec3 getNormal(vec3 p) {
  float e = 0.001;
  return normalize(vec3(
    map(p + vec3(e, 0, 0)) - map(p - vec3(e, 0, 0)),
    map(p + vec3(0, e, 0)) - map(p - vec3(0, e, 0)),
    map(p + vec3(0, 0, e)) - map(p - vec3(0, 0, e))
  ));
}

float raymarch(vec3 ro, vec3 rd, out vec3 p) {
  float t = 0.0;
  for (int i = 0; i < 128; i++) {
    p = ro + t * rd;
    float d = map(p);
    if (d < 0.001) return t;
    if (t > 50.0) break;
    t += d;
  }
  return -1.0;
}

void main() {
  vec2 uv = (gl_FragCoord.xy / u_resolution) * 2.0 - 1.0;
  uv.x *= u_resolution.x / u_resolution.y;

  vec3 ro = cameraPosition;
  vec3 forward = normalize(cameraForward);
  vec3 right = normalize(cross(vec3(0, 1, 0), forward));
  vec3 up = cross(forward, right);
  vec3 rd = normalize(uv.x * right + uv.y * up + forward);

  vec3 p;
  float t = raymarch(ro, rd, p);

  if (t > 0.0) {
    vec3 n = getNormal(p);
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    vec3 viewDir = normalize(ro - p);
    vec3 halfDir = normalize(lightDir + viewDir);

    float diff = max(dot(n, lightDir), 0.0);
    float spec = pow(max(dot(n, halfDir), 0.0), 64.0);
    vec3 baseColor = vec3(1.0, 0.0, 0.0); // rot

    vec3 color = 0.1 + diff * baseColor + spec * vec3(1.0);
    outColor = vec4(color, 1.0);
  } else {
    outColor = vec4(1.0); // Hintergrund weiß
  }
}
