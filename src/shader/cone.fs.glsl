#version 300 es
precision highp float;
out vec4 outColor;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 cameraPosition;
uniform vec3 cameraForward;

// Kamera → Rayrichtung
vec3 getRayDirection(vec2 uv, vec3 camPos, vec3 camTarget, float zoom) {
  vec3 forward = normalize(camTarget - camPos);
  vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), forward));
  vec3 up = cross(forward, right);
  return normalize(uv.x * right + uv.y * up + zoom * forward);
}

// SDF für stehenden Kegel (Basis unten, Spitze oben)
float sdf_cone(vec3 p, float height, float radius) {
  float q = length(p.xz);
  float angle = atan(radius / height);
  float d = max(dot(vec2(q, -p.y), normalize(vec2(sin(angle), cos(angle)))), -p.y);
  return d;
}

// Raymarching
float raymarch(vec3 ro, vec3 rd) {
  float t = 0.0;
  for (int i = 0; i < 100; i++) {
    vec3 p = ro + t * rd;
    p.y += 0.5; // Kegel steht aufrecht mit Basis bei y = 0
    float d = sdf_cone(p, 1.0, 0.5);
    if (d < 0.001) return t;
    if (t > 50.0) break;
    t += d;
  }
  return -1.0;
}

// Normale per Finite Differences
vec3 getNormal(vec3 p) {
  float eps = 0.001;
  vec2 e = vec2(1.0, -1.0) * eps;
  return normalize(vec3(
    sdf_cone(p + e.xyy, 1.0, 0.5) - sdf_cone(p + e.yyy, 1.0, 0.5),
    sdf_cone(p + e.yxy, 1.0, 0.5) - sdf_cone(p + e.yyy, 1.0, 0.5),
    sdf_cone(p + e.yyx, 1.0, 0.5) - sdf_cone(p + e.yyy, 1.0, 0.5)
  ));
}

void main() {
  vec2 uv = (gl_FragCoord.xy / u_resolution) * 2.0 - 1.0;
  uv.x *= u_resolution.x / u_resolution.y;

  vec3 camPos = cameraPosition;
  vec3 camTarget = camPos + cameraForward;
  vec3 rd = getRayDirection(uv, camPos, camTarget, 1.0);

  float t = raymarch(camPos, rd);
  if (t > 0.0) {
    vec3 p = camPos + rd * t;
    vec3 shiftedP = p + vec3(0.0, 0.5, 0.0); // gleiche Verschiebung wie in raymarch
    vec3 normal = getNormal(shiftedP);

    // Blinn-Phong Licht
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    vec3 viewDir = normalize(camPos - p);
    vec3 halfDir = normalize(lightDir + viewDir);

    float diff = max(dot(normal, lightDir), 0.0);
    float spec = pow(max(dot(normal, halfDir), 0.0), 64.0);

    vec3 ambient = vec3(0.1);
    vec3 baseColor = vec3(0.8, 0.4, 0.1); // orangebraun
    vec3 color = ambient + diff * baseColor + spec * vec3(1.0);

    outColor = vec4(color, 1.0);
  } else {
    outColor = vec4(0.0); // Hintergrund schwarz
  }
}
