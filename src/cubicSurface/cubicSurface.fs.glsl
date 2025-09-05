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

// -------- helpers (keine pow() für x^2/x^3) ---------------------------------
float sqr(float x)  { return x * x; }
float cube(float x) { return x * x * x; }

// -------- Cubic Solver --------------------------
float sgn(float x) {
  return x < 0.0f ? -1.0f : 1.0f; // Return 1 for x == 0
}

int quadratic(float A, float B, float C, out vec2 res) {
  float x1, x2;
  float b = -0.5f * B;
  float q = b * b - A * C;
  if(q < 0.0f)
    return 0;
  float r = b + sgn(b) * sqrt(q);
  if(r == 0.0f) {
    x1 = C / A;
    x2 = -x1;
  } else {
    x1 = C / r;
    x2 = r / A;
  }
  res = vec2(x1, x2);
  return 2;
}

void eval(
  float X,
  float A,
  float B,
  float C,
  float D,
  out float Q,
  out float Q1,
  out float B1,
  out float C2
) {
  float q0 = A * X;
  B1 = q0 + B;
  C2 = B1 * X + C;
  Q1 = (q0 + B1) * X + C2;
  Q = C2 * X + D;
}

// Solve: Ax^3 + Bx^2 + Cx + D == 0
// Find one real root, then reduce to quadratic.
int cubic(float A, float B, float C, float D, out vec3 res) {
  float X, b1, c2;
  if (A == 0.0f) {
    X = 1e8f;
    A = B;
    b1 = C;
    c2 = D;
  } else if (D == 0.0f) {
    X = 0.0f;
    b1 = B;
    c2 = C;
  } else {
    X = -(B / A) / 3.0f;
    float t, r, s, q, dq, x0;
    eval(X, A, B, C, D, q, dq, b1, c2);
    t = q / A;
    r = pow(abs(t), 1.0f / 3.0f);
    s = sgn(t);
    t = -dq / A;
    if (t > 0.0f)
      r = 1.324718f * max(r, sqrt(t));
    x0 = X - s * r;
    if (x0 != X) {
      for(int i = 0; i < 6; i++) {
        X = x0;
        eval(X, A, B, C, D, q, dq, b1, c2);
        if (dq == 0.0f)
          break;
        x0 -= (q / dq);
      }
      if (abs(A) * X * X > abs(D / X)) {
        c2 = -D / X;
        b1 = (c2 - C) / X;
      }
    }
  }
  res.x = X;
  return 1 + quadratic(A, b1, c2, res.yz);
}
// -------- ray / aabb ---------------------------------------------------------
bool rayAABB(vec3 ro, vec3 rd, float h, out float tEnter, out float tExit) {
  // Inverse Richtungen (für Division durch rd)
  vec3 invD = 1.0 / rd;

  // Schnittpunkte mit den beiden Ebenen jeder Achse (-h, +h)
  vec3 t0 = (vec3(-h) - ro) * invD;
  vec3 t1 = (vec3( h) - ro) * invD;

  // Für jede Achse das kleinere (tmin) und größere (tmax) nehmen
  vec3 tmin = min(t0, t1);
  vec3 tmax = max(t0, t1);

  // Eintritts- und Austrittsparameter
  tEnter = max(max(tmin.x, tmin.y), tmin.z);
  tExit  = min(min(tmax.x, tmax.y), tmax.z);

  // Ray trifft AABB, wenn Austritt hinter Eintritt liegt und vorwärts (t>0)
  return tExit > max(tEnter, 0.0);
}
// -------- gradient / normals (ohne pow) --------------------------------------
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

  float x=p.x, y=p.y, z=p.z;

  vec3 n;
  n.x = c100 + c101*z + c102*sqr(z) + c110*y + c111*y*z + c120*sqr(y)
      + 2.0*c200*x + 2.0*c201*x*z + 2.0*c210*x*y + 3.0*c300*cube(x);
  n.y = c010 + c011*z + c012*sqr(z) + 2.0*c020*y + 2.0*c021*y*z + 3.0*c030*cube(y)
      + c110*x + c111*x*z + 2.0*c120*x*y + c210*sqr(x);
  n.z = c001 + 2.0*c002*z + 3.0*c003*cube(z) + c011*y + 2.0*c012*y*z + c021*sqr(y)
      + c101*x + 2.0*c102*x*z + c111*x*y + c201*sqr(x);

  return normalize(n);
}

// -------- polynomial along ray (ohne pow) ------------------------------------
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

  float rx=ro.x, ry=ro.y, rz=ro.z;
  float dx=rd.x, dy=rd.y, dz=rd.z;

  float dx2 = sqr(dx), dy2 = sqr(dy), dz2 = sqr(dz);
  float rx2 = sqr(rx), ry2 = sqr(ry), rz2 = sqr(rz);

  float a3 =
    c003*cube(dz) + c012*dy*dz2 + c021*dy2*dz +
    c030*cube(dy) + c102*dx*dz2 + c111*dx*dy*dz +
    c120*dx*dy2 + c201*dx2*dz + c210*dx2*dy +
    c300*cube(dx);

  float a2 =
    rx*c102*dz2 + rx*c111*dy*dz + rx*c120*dy2 +
    2.0*rx*c201*dx*dz + 2.0*rx*c210*dx*dy + 3.0*rx*c300*dx2 +
    ry*c012*dz2 + 2.0*ry*c021*dy*dz + 3.0*ry*c030*dy2 +
    ry*c111*dx*dz + 2.0*ry*c120*dx*dy + ry*c210*dx2 +
    3.0*rz*c003*dz2 + 2.0*rz*c012*dy*dz + rz*c021*dy2 +
    2.0*rz*c102*dx*dz + rz*c111*dx*dy + rz*c201*dx2 +
    c002*dz2 + c011*dy*dz + c020*dy2 +
    c101*dx*dz + c110*dx*dy + c200*dx2;

  float a1 =
    rx2*c201*dz + rx2*c210*dy + 3.0*rx2*c300*dx +
    rx*ry*c111*dz + 2.0*rx*ry*c120*dy + 2.0*rx*ry*c210*dx +
    2.0*rx*rz*c102*dz + rx*rz*c111*dy + 2.0*rx*rz*c201*dx +
    rx*c101*dz + rx*c110*dy + 2.0*rx*c200*dx +
    ry2*c021*dz + 3.0*ry2*c030*dy + ry2*c120*dx +
    2.0*ry*rz*c012*dz + 2.0*ry*rz*c021*dy + ry*rz*c111*dx +
    ry*c011*dz + 2.0*ry*c020*dy + ry*c110*dx +
    3.0*rz2*c003*dz + rz2*c012*dy + rz2*c102*dx +
    2.0*rz*c002*dz + rz*c011*dy + rz*c101*dx +
    c001*dz + c010*dy + c100*dx;

  float a0 =
    cube(rx)*c300 + rx2*ry*c210 + rx2*rz*c201 + rx2*c200 +
    rx*ry2*c120 + rx*ry*rz*c111 + rx*ry*c110 +
    rx*rz2*c102 + rx*rz*c101 + rx*c100 +
    cube(ry)*c030 + ry2*rz*c021 + ry2*c020 +
    ry*rz2*c012 + ry*rz*c011 + ry*c010 +
    cube(rz)*c003 + rz2*c002 + rz*c001 + c000;

  float tEnter, tExit;
  if (!rayAABB(ro, rd, uHalf, tEnter, tExit)) return -1.0;
  tEnter = max(tEnter, EPS);

  vec3 roots;
  float t = INF;
  int n = cubic(a3, a2, a1, a0, roots);

  // kleinste gültige Wurzel im [tEnter, tExit]
  for (int i = 0; i < n; ++i) {
    float ti = roots[i];
    if (ti < 0.0)               continue;
    if (ti < tEnter || ti > tExit) continue;
    t = min(t, ti);
  }

  return (t == INF) ? -1.0 : t;
}

// -------- box edges & axes-as-quadrics ---------------------------------------
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

// -------- main ----------------------------------------------------------------
void main() {
  // Box-Kanten overlay
  if (uShowBox) {
    float d  = edgeDistance(vUV, uHalf);
    float aa = fwidth(d);
    float m  = 1.0 - smoothstep(uEdgeThickness - aa, uEdgeThickness + aa, d);
    if (m > 0.0) {
      fColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }
  }

  // stabiler Ray im Objektraum
  vec3 ro = vUV;

  // Kamera: Position (w=1) und -Z Richtung (w=0) in Objektraum
  vec3 camPos = (uModelInverse * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  vec3 rd = (uOrthographic == 1)
    ? normalize((uModelInverse * vec4(0.0, 0.0, -1.0, 0.0)).xyz)
    : normalize(ro - camPos);

  ro += EPS * rd;

  // 1) Hauptfläche
  float tCubic = cubicSurfaceIntersect(ro, rd, uCoeffs);

  // 2) Achsen (als Quadriken in demselben 20er-Layout)
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

  // Headlight-Shading
  float shade = abs(dot(rd, n));
  rgb *= max(shade, 0.0);

  fColor = vec4(rgb, 1.0);
}
