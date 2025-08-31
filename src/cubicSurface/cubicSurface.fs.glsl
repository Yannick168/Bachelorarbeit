#version 300 es
precision highp float;

in vec3 vUV;

uniform mat4  uModelInverse;
uniform int   uOrthographic;
uniform int   uSurface;
uniform float uCoeffs[20];

uniform bool  uShowAxes;
uniform bool  uShowBox;
uniform float uHalf;
uniform float uEdgeThickness;

layout(location=0) out vec4 fColor;

const float INF = 1.0e30;
const float EPS = 1e-4;

// ---------------------------------------------------------
// robust quadratic & cubic
// ---------------------------------------------------------
float cbrt_safe(float x) { return (x >= 0.0) ? pow(x, 1.0/3.0) : -pow(-x, 1.0/3.0); }

void sort3(inout vec3 v) {
  if (v.x > v.y) { float t=v.x; v.x=v.y; v.y=t; }
  if (v.y > v.z) { float t=v.y; v.y=v.z; v.z=t; }
  if (v.x > v.y) { float t=v.x; v.x=v.y; v.y=t; }
}

int quadratic(float A, float B, float C, out vec2 r) {
  float scale = max(max(abs(A), abs(B)), abs(C));
  float eps = 1e-6 * (scale + 1.0);
  r = vec2(INF);

  if (abs(A) < eps) {
    if (abs(B) < eps) return 0;   // degeneriert
    r.x = -C / B;                  // linear
    return 1;
  }

  float disc = B*B - 4.0*A*C;
  if (disc < -eps) return 0;

  if (abs(disc) <= eps) {
    r.x = -0.5*B / A;
    return 1;
  }

  float s = sqrt(max(disc, 0.0));
  float q = -0.5 * (B + sign(B) * s);
  float r1 = q / A;
  float r2 = C / q;
  if (r1 <= r2) r = vec2(r1, r2); else r = vec2(r2, r1);
  return 2;
}

int cubic(float A, float B, float C, float D, out vec3 res) {
  float scale = max(max(abs(A), abs(B)), max(abs(C), abs(D)));
  float eps = 1e-6 * (scale + 1.0);
  res = vec3(INF);

  // Fast-Quadratik (t^3 ~ 0)
  if (abs(A) < eps) {
    vec2 q; int nq = quadratic(B, C, D, q);
    if (nq == 2) res = vec3(q.x, q.y, INF);
    else if (nq == 1) res = vec3(q.x, INF, INF);
    return nq;
  }

  // t ~ 0
  if (abs(D) < eps) {
    vec2 q; int nq = quadratic(A, B, C, q);
    if (nq == 2) res = vec3(0.0, q.x, q.y);
    else if (nq == 1) res = vec3(0.0, q.x, INF);
    else res = vec3(0.0, INF, INF);
    sort3(res);
    return 1 + nq;
  }

  // monisch: t^3 + a t^2 + b t + c = 0
  float a = B / A, b = C / A, c = D / A;

  // depressiert: y^3 + p y + q = 0, t = y - a/3
  float a3 = a / 3.0;
  float p  = b - a*a/3.0;
  float q  = 2.0*a*a*a/27.0 - a*b/3.0 + c;

  float half_q  = 0.5 * q;
  float third_p = p / 3.0;
  float disc = half_q*half_q + third_p*third_p*third_p;

  if (disc > eps) {
    float s = sqrt(disc);
    float u = cbrt_safe(-half_q + s);
    float v = cbrt_safe(-half_q - s);
    res = vec3((u + v) - a3, INF, INF);
    return 1;
  }

  if (abs(disc) <= eps) {
    if (abs(p) <= eps && abs(q) <= eps) {
      res = vec3(-a3, INF, INF);
      return 1;
    } else {
      float u = cbrt_safe(-half_q);
      float t1 =  2.0*u - a3;
      float t2 = -u     - a3;
      if (t1 <= t2) res = vec3(t1, t2, INF); else res = vec3(t2, t1, INF);
      return 2;
    }
  }

  // drei reelle
  float r = 2.0 * sqrt(-third_p);
  float arg = clamp(-half_q / sqrt(-third_p*third_p*third_p), -1.0, 1.0);
  float phi = acos(arg);

  float t1 =  r * cos(        phi / 3.0) - a3;
  float t2 =  r * cos((phi + 2.0*3.14159265) / 3.0) - a3;
  float t3 =  r * cos((phi + 4.0*3.14159265) / 3.0) - a3;

  res = vec3(t1, t2, t3);
  sort3(res);
  return 3;
}

// ---------------------------------------------------------
// ray / aabb
// ---------------------------------------------------------
bool rayAABB(vec3 ro, vec3 rd, float h, out float tEnter, out float tExit) {
  vec3 invD = 1.0 / rd;
  vec3 t0 = (vec3(-h) - ro) * invD;
  vec3 t1 = (vec3( h) - ro) * invD;
  vec3 tmin = min(t0, t1);
  vec3 tmax = max(t0, t1);
  tEnter = max(max(tmin.x, tmin.y), tmin.z);
  tExit  = min(min(tmax.x, tmax.y), tmax.z);
  return tExit > max(tEnter, 0.0);
}

// ---------------------------------------------------------
// gradient / normals
// ---------------------------------------------------------
vec3 cubicSurfaceNormal(vec3 p, float coeffs[20]) {
  float c300 = coeffs[0];
  float c030 = coeffs[1];
  float c003 = coeffs[2];
  float c210 = coeffs[3];
  float c201 = coeffs[4];
  float c021 = coeffs[5];
  float c012 = coeffs[6];
  float c120 = coeffs[7];
  float c102 = coeffs[8];
  float c111 = coeffs[9];
  float c200 = coeffs[10];
  float c020 = coeffs[11];
  float c002 = coeffs[12];
  float c101 = coeffs[13];
  float c110 = coeffs[14];
  float c011 = coeffs[15];
  float c100 = coeffs[16];
  float c010 = coeffs[17];
  float c001 = coeffs[18];
  float c000 = coeffs[19];

  vec3 n;
  n.x = c100 + c101*p.z + c102*pow(p.z, 2.0) + c110*p.y + c111*p.y*p.z + c120*pow(p.y, 2.0)
      + 2.0*c200*p.x + 2.0*c201*p.x*p.z + 2.0*c210*p.x*p.y + 3.0*c300*pow(p.x, 2.0);
  n.y = c010 + c011*p.z + c012*pow(p.z, 2.0) + 2.0*c020*p.y + 2.0*c021*p.y*p.z + 3.0*c030*pow(p.y, 2.0)
      + c110*p.x + c111*p.x*p.z + 2.0*c120*p.x*p.y + c210*pow(p.x, 2.0);
  n.z = c001 + 2.0*c002*p.z + 3.0*c003*pow(p.z, 2.0) + c011*p.y + 2.0*c012*p.y*p.z + c021*pow(p.y, 2.0)
      + c101*p.x + 2.0*c102*p.x*p.z + c111*p.x*p.y + c201*pow(p.x, 2.0);

  return normalize(n);
}

// ---------------------------------------------------------
// build polynomial along ray & intersect
// ---------------------------------------------------------
float cubicSurfaceIntersect(vec3 ro, vec3 rd, float coeffs[20]) {
  float c300 = coeffs[0];
  float c030 = coeffs[1];
  float c003 = coeffs[2];
  float c210 = coeffs[3];
  float c201 = coeffs[4];
  float c021 = coeffs[5];
  float c012 = coeffs[6];
  float c120 = coeffs[7];
  float c102 = coeffs[8];
  float c111 = coeffs[9];
  float c200 = coeffs[10];
  float c020 = coeffs[11];
  float c002 = coeffs[12];
  float c101 = coeffs[13];
  float c110 = coeffs[14];
  float c011 = coeffs[15];
  float c100 = coeffs[16];
  float c010 = coeffs[17];
  float c001 = coeffs[18];
  float c000 = coeffs[19];

  float a[4];

  // t^3
  a[3] =
    c003*pow(rd.z,3.0) + c012*rd.y*pow(rd.z,2.0) + c021*pow(rd.y,2.0)*rd.z +
    c030*pow(rd.y,3.0) + c102*rd.x*pow(rd.z,2.0) + c111*rd.x*rd.y*rd.z +
    c120*rd.x*pow(rd.y,2.0) + c201*pow(rd.x,2.0)*rd.z + c210*pow(rd.x,2.0)*rd.y +
    c300*pow(rd.x,3.0);

  // t^2
  a[2] =
    ro.x*c102*pow(rd.z,2.0) + ro.x*c111*rd.y*rd.z + ro.x*c120*pow(rd.y,2.0) +
    2.0*ro.x*c201*rd.x*rd.z + 2.0*ro.x*c210*rd.x*rd.y + 3.0*ro.x*c300*pow(rd.x,2.0) +
    ro.y*c012*pow(rd.z,2.0) + 2.0*ro.y*c021*rd.y*rd.z + 3.0*ro.y*c030*pow(rd.y,2.0) +
    ro.y*c111*rd.x*rd.z + 2.0*ro.y*c120*rd.x*rd.y + ro.y*c210*pow(rd.x,2.0) +
    3.0*ro.z*c003*pow(rd.z,2.0) + 2.0*ro.z*c012*rd.y*rd.z + ro.z*c021*pow(rd.y,2.0) +
    2.0*ro.z*c102*rd.x*rd.z + ro.z*c111*rd.x*rd.y + ro.z*c201*pow(rd.x,2.0) +
    c002*pow(rd.z,2.0) + c011*rd.y*rd.z + c020*pow(rd.y,2.0) +
    c101*rd.x*rd.z + c110*rd.x*rd.y + c200*pow(rd.x,2.0);

  // t^1
  a[1] =
    pow(ro.x,2.0)*c201*rd.z + pow(ro.x,2.0)*c210*rd.y + 3.0*pow(ro.x,2.0)*c300*rd.x +
    ro.x*ro.y*c111*rd.z + 2.0*ro.x*ro.y*c120*rd.y + 2.0*ro.x*ro.y*c210*rd.x +
    2.0*ro.x*ro.z*c102*rd.z + ro.x*ro.z*c111*rd.y + 2.0*ro.x*ro.z*c201*rd.x +
    ro.x*c101*rd.z + ro.x*c110*rd.y + 2.0*ro.x*c200*rd.x +
    pow(ro.y,2.0)*c021*rd.z + 3.0*pow(ro.y,2.0)*c030*rd.y + pow(ro.y,2.0)*c120*rd.x +
    2.0*ro.y*ro.z*c012*rd.z + 2.0*ro.y*ro.z*c021*rd.y + ro.y*ro.z*c111*rd.x +
    ro.y*c011*rd.z + 2.0*ro.y*c020*rd.y + ro.y*c110*rd.x +
    3.0*pow(ro.z,2.0)*c003*rd.z + pow(ro.z,2.0)*c012*rd.y + pow(ro.z,2.0)*c102*rd.x +
    2.0*ro.z*c002*rd.z + ro.z*c011*rd.y + ro.z*c101*rd.x +
    c001*rd.z + c010*rd.y + c100*rd.x;

  // t^0
  a[0] =
    pow(ro.x,3.0)*c300 + pow(ro.x,2.0)*ro.y*c210 + pow(ro.x,2.0)*ro.z*c201 + pow(ro.x,2.0)*c200 +
    ro.x*pow(ro.y,2.0)*c120 + ro.x*ro.y*ro.z*c111 + ro.x*ro.y*c110 +
    ro.x*pow(ro.z,2.0)*c102 + ro.x*ro.z*c101 + ro.x*c100 +
    pow(ro.y,3.0)*c030 + pow(ro.y,2.0)*ro.z*c021 + pow(ro.y,2.0)*c020 +
    ro.y*pow(ro.z,2.0)*c012 + ro.y*ro.z*c011 + ro.y*c010 +
    pow(ro.z,3.0)*c003 + pow(ro.z,2.0)*c002 + ro.z*c001 + c000;

  float tEnter, tExit;
  if (!rayAABB(ro, rd, uHalf, tEnter, tExit)) return -1.0;
  tEnter = max(tEnter, EPS);

  vec3 res;
  float t = INF;
  int n = cubic(a[3], a[2], a[1], a[0], res);

  for (int i = 0; i < n; ++i) {
    float ti = res[i];
    if (ti < 0.0)               continue;
    if (ti < tEnter || ti > tExit) continue;
    t = min(t, ti);
  }

  if (t == INF) return -1.0;
  return t;
}

// ---------------------------------------------------------
// box edges & axes-as-quadrics
// ---------------------------------------------------------
float edgeDistance(vec3 p, float r) {
  vec3 d = abs(abs(p) - r);
  float dXY = max(d.x, d.y);
  float dXZ = max(d.x, d.z);
  float dYZ = max(d.y, d.z);

  float t  = r + uEdgeThickness;
  float inX = step(abs(p.x), t);
  float inY = step(abs(p.y), t);
  float inZ = step(abs(p.z), t);

  float BIG = 1e3;
  float eXY = mix(BIG, dXY, inZ);
  float eXZ = mix(BIG, dXZ, inY);
  float eYZ = mix(BIG, dYZ, inX);

  return min(min(eXY, eXZ), eYZ);
}

void zeroCoeffs(out float c[20]) { for (int i=0;i<20;i++) c[i] = 0.0; }

void axisCoeffsX(float r, out float c[20]) {
  zeroCoeffs(c);
  c[11] = 1.0; // y^2
  c[12] = 1.0; // z^2
  c[19] = -r*r;
}
void axisCoeffsY(float r, out float c[20]) {
  zeroCoeffs(c);
  c[10] = 1.0; // x^2
  c[12] = 1.0; // z^2
  c[19] = -r*r;
}
void axisCoeffsZ(float r, out float c[20]) {
  zeroCoeffs(c);
  c[10] = 1.0; // x^2
  c[11] = 1.0; // y^2
  c[19] = -r*r;
}

// ---------------------------------------------------------
// main
// ---------------------------------------------------------
void main() {
  // box edges (overlay)
  if (uShowBox) {
    float d  = edgeDistance(vUV, uHalf);
    float aa = fwidth(d);
    float m  = 1.0 - smoothstep(uEdgeThickness - aa, uEdgeThickness + aa, d);
    if (m > 0.0) {
      fColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }
  }

  // stable ray setup in object space
  vec3 ro = vUV;

  // camera at origin in camera space -> transform to object space (w=1)
  vec3 camPos = (uModelInverse * vec4(0.0, 0.0, 0.0, 1.0)).xyz;

  // camera -Z direction in camera space -> object space (w=0)
  vec3 rd = (uOrthographic == 1)
    ? normalize((uModelInverse * vec4(0.0, 0.0, -1.0, 0.0)).xyz)
    : normalize(ro - camPos);

  ro += EPS * rd;

  float tCubic = cubicSurfaceIntersect(ro, rd, uCoeffs);

  float radius = max(uEdgeThickness, 0.02);
  float tX = -1.0, tY = -1.0, tZ = -1.0;
  float cx[20]; float cy[20]; float cz[20];

  if (uShowAxes) {
    axisCoeffsX(radius, cx);
    axisCoeffsY(radius, cy);
    axisCoeffsZ(radius, cz);
    tX = cubicSurfaceIntersect(ro, rd, cx);
    tY = cubicSurfaceIntersect(ro, rd, cy);
    tZ = cubicSurfaceIntersect(ro, rd, cz);
  }

  bool haveCubic = (tCubic >= 0.0);
  bool haveX = (tX >= 0.0);
  bool haveY = (tY >= 0.0);
  bool haveZ = (tZ >= 0.0);

  if (!haveCubic && !haveX && !haveY && !haveZ) {
    discard;
  }

  float tMin = INF;
  int   which = -1; // 0=X,1=Y,2=Z, 3=Cubic

  if (haveX && tX < tMin) { tMin = tX; which = 0; }
  if (haveY && tY < tMin) { tMin = tY; which = 1; }
  if (haveZ && tZ < tMin) { tMin = tZ; which = 2; }
  if (haveCubic && tCubic < tMin) { tMin = tCubic; which = 3; }

  vec3 p = ro + tMin * rd;
  vec3 n, rgb;

  if (which == 0) {
    n   = normalize(cubicSurfaceNormal(p, cx));
    rgb = vec3(1.0, 0.0, 0.0);
  } else if (which == 1) {
    n   = normalize(cubicSurfaceNormal(p, cy));
    rgb = vec3(0.0, 1.0, 0.0);
  } else if (which == 2) {
    n   = normalize(cubicSurfaceNormal(p, cz));
    rgb = vec3(0.0, 0.0, 1.0);
  } else {
    n   = normalize(cubicSurfaceNormal(p, uCoeffs));
    rgb = vec3(1.0, 0.1, 0.1);
  }

  // Headlight shading (view-abhängig, wie gewünscht)
  float shade = abs(dot(rd, n));
  rgb *= max(shade, 0.0);

  fColor = vec4(rgb, 1.0);
}
