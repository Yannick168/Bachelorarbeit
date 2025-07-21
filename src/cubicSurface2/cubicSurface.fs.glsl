#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform vec3 u_cameraOrigin;
uniform mat4 u_cameraMatrix;
uniform float u_polyCoeffs[4];      // t³, t², t¹, t⁰ (f(o + td) = 0)
uniform float u_surfaceCoeffs[20];   // c000..c300 (f(x,y,z) = 0)

out vec4 fragColor;

vec3 getRayDirection(vec2 fragCoord, vec2 resolution, mat4 invCam) {
  vec2 ndc = fragCoord / resolution * 2.0 - 1.0;
  vec4 clip = vec4(ndc, -1.0, 1.0);
  vec4 world = invCam * clip;
  return normalize(world.xyz / world.w - u_cameraOrigin);
}

vec3 evalGradient(vec3 p, float[20] c) {
  float x = p.x, y = p.y, z = p.z;

  float dx =
    3.0 * c[0] * x * x +          // c300
    2.0 * c[4] * x * y +          // c210
    2.0 * c[5] * x * z +          // c201
    c[10] * 2.0 * x +             // c200
    c[13] * y +                   // c110
    c[14] * z +                   // c101
    c[16];                        // c100

  float dy =
    3.0 * c[1] * y * y +          // c030
    2.0 * c[8] * x * y +          // c120
    2.0 * c[6] * y * z +          // c021
    c[11] * 2.0 * y +             // c020
    c[13] * x +                   // c110
    c[15] * z +                   // c011
    c[17];                        // c010

  float dz =
    3.0 * c[2] * z * z +          // c003
    2.0 * c[9] * x * z +          // c102
    2.0 * c[7] * y * z +          // c012
    c[12] * 2.0 * z +             // c002
    c[14] * x +                   // c101
    c[15] * y +                   // c011
    c[18];                        // c001

  return vec3(dx, dy, dz);
}


void main() {
  vec2 fragCoord = gl_FragCoord.xy;
  vec3 o = u_cameraOrigin;
  vec3 d = getRayDirection(fragCoord, u_resolution, u_cameraMatrix);

  float c0 = u_polyCoeffs[0];
  float c1 = u_polyCoeffs[1];
  float c2 = u_polyCoeffs[2];
  float c3 = u_polyCoeffs[3];

  float t = -1.0;
  bool hasHit = false;

  if (abs(c3) < 1e-6) {
    if (abs(c2) > 1e-6) {
      float disc = c1 * c1 - 4.0 * c2 * c0;
      if (disc >= 0.0) {
        float sqrtD = sqrt(disc);
        float t1 = (-c1 - sqrtD) / (2.0 * c2);
        float t2 = (-c1 + sqrtD) / (2.0 * c2);
        t = min(t1, t2);
        hasHit = t > 0.0;
      }
    }
  } else {
    float aa = c3, bb = c2, cc = c1, dd = c0;
    bb /= aa; cc /= aa; dd /= aa;
    float Q = (3.0 * cc - bb * bb) / 9.0;
    float R = (9.0 * bb * cc - 27.0 * dd - 2.0 * bb * bb * bb) / 54.0;
    float D = Q * Q * Q + R * R;

    if (D >= 0.0) {
      float sqrtD = sqrt(D);
      float S = sign(R + sqrtD) * pow(abs(R + sqrtD), 1.0 / 3.0);
      float T = sign(R - sqrtD) * pow(abs(R - sqrtD), 1.0 / 3.0);
      float x1 = -bb / 3.0 + (S + T);
      t = (x1 > 0.0) ? x1 : -1.0;
      hasHit = t > 0.0;
    } else {
      float theta = acos(R / sqrt(-Q * Q * Q));
      float r = 2.0 * sqrt(-Q);
      float x1 = r * cos(theta / 3.0) - bb / 3.0;
      float x2 = r * cos((theta + 2.0 * 3.1415926) / 3.0) - bb / 3.0;
      float x3 = r * cos((theta + 4.0 * 3.1415926) / 3.0) - bb / 3.0;
      t = 1e20;
      if (x1 > 0.0) t = min(t, x1);
      if (x2 > 0.0) t = min(t, x2);
      if (x3 > 0.0) t = min(t, x3);
      hasHit = t < 1e10;
    }
  }

  if (hasHit) {
    vec3 hit = o + t * d;
    vec3 normal = normalize(evalGradient(hit, u_surfaceCoeffs));
    vec3 lightDir = normalize(vec3(1.0, 1.0, 0.5));
    float diff = max(dot(normal, lightDir), 0.0);
    fragColor = vec4(vec3(1.0, 0.6, 0.3) * diff, 1.0);
  } else {
    fragColor = vec4(0.0);
  }
}
