#version 300 es
precision highp float;

in vec3 vUV;                // Eintrittspunkt auf der Frontface des Würfels im Objektraum
out vec4 fColor;

uniform mat4 uModelInverse; // Inverse Model-Matrix (Welt -> Objekt)
uniform int  uOrthographic; // 1 = Ortho, 0 = Perspective
uniform float uCoeffs[20];  // c300,c030,c003,c210,c201,c021,c012,c120,c102,c111,c200,c020,c002,c101,c110,c011,c100,c010,c001,c000

// -----------------------------------------------------------------------------
// Hilfsfunktionen
// -----------------------------------------------------------------------------
const float PI = 3.1415926535897932384626433832795;
const float INF = 1.0e30;
const float BOX_HALF = 3.0;      // Würfel [-3,3]^3

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
    if (abs(B) < eps) return 0;
    r.x = -C / B;
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

// Robuster kubischer Löser: gibt Anzahl reeller Wurzeln zurück; res enthält aufsteigend sortierte Wurzeln,
// nicht benutzte Slots sind INF.
int cubic(float A, float B, float C, float D, out vec3 res) {
  float scale = max(max(abs(A), abs(B)), max(abs(C), abs(D)));
  float eps = 1e-6 * (scale + 1.0);
  res = vec3(INF);

  // Fast-Quadratik (A ~ 0)
  if (abs(A) < eps) {
    vec2 q; int nq = quadratic(B, C, D, q);
    if (nq == 2) res = vec3(q.x, q.y, INF);
    else if (nq == 1) res = vec3(q.x, INF, INF);
    return nq;
  }

  // t ~ 0 Wurzel (D ~ 0) explizit
  if (abs(D) < eps) {
    vec2 q; int nq = quadratic(A, B, C, q);
    if (nq == 2) res = vec3(0.0, q.x, q.y);
    else if (nq == 1) res = vec3(0.0, q.x, INF);
    else res = vec3(0.0, INF, INF);
    sort3(res);
    return 1 + nq;
  }

  // Monische Form: t^3 + a t^2 + b t + c
  float a = B / A;
  float b = C / A;
  float c = D / A;

  // Depressierte Kubik: y^3 + p y + q = 0 mit t = y - a/3
  float a3 = a / 3.0;
  float p  = b - a*a/3.0;
  float q  = 2.0*a*a*a/27.0 - a*b/3.0 + c;

  float half_q = 0.5 * q;
  float third_p = p / 3.0;
  float disc = half_q*half_q + third_p*third_p*third_p;

  if (disc > eps) {
    // 1 reelle, 2 komplexe
    float s = sqrt(disc);
    float u = cbrt_safe(-half_q + s);
    float v = cbrt_safe(-half_q - s);
    float t = (u + v) - a3;
    res = vec3(t, INF, INF);
    return 1;
  }

  if (abs(disc) <= eps) {
    // zwei reelle (eine doppelte) oder dreifache
    if (abs(p) <= eps && abs(q) <= eps) {
      float t = -a3;               // dreifach
      res = vec3(t, INF, INF);
      return 1;
    } else {
      float u = cbrt_safe(-half_q);
      float t1 =  2.0*u - a3;
      float t2 = -u     - a3;
      if (t1 <= t2) res = vec3(t1, t2, INF); else res = vec3(t2, t1, INF);
      return 2;
    }
  }

  // drei reelle (trigonometrisch)
  float r = 2.0 * sqrt(-third_p);
  float arg = clamp(-half_q / sqrt(-third_p*third_p*third_p), -1.0, 1.0);
  float phi = acos(arg);

  float t1 =  r * cos(        phi / 3.0) - a3;
  float t2 =  r * cos((phi + 2.0*PI) / 3.0) - a3;
  float t3 =  r * cos((phi + 4.0*PI) / 3.0) - a3;

  res = vec3(t1, t2, t3);
  sort3(res);
  return 3;
}

// -----------------------------------------------------------------------------
// Polynom, Gradient, Hessian-Einträge (für allgemeine Kubik)
// -----------------------------------------------------------------------------
void unpackCoeffs(in float c[20],
                  out float c300, out float c030, out float c003,
                  out float c210, out float c201, out float c021, out float c012,
                  out float c120, out float c102, out float c111,
                  out float c200, out float c020, out float c002,
                  out float c101, out float c110, out float c011,
                  out float c100, out float c010, out float c001,
                  out float c000) {
  c300=c[0];  c030=c[1];  c003=c[2];
  c210=c[3];  c201=c[4];  c021=c[5];  c012=c[6];
  c120=c[7];  c102=c[8];  c111=c[9];
  c200=c[10]; c020=c[11]; c002=c[12];
  c101=c[13]; c110=c[14]; c011=c[15];
  c100=c[16]; c010=c[17]; c001=c[18];
  c000=c[19];
}

float cubicEval(in vec3 p, in float coeffs[20]) {
  float c300,c030,c003,c210,c201,c021,c012,c120,c102,c111,c200,c020,c002,c101,c110,c011,c100,c010,c001,c000;
  unpackCoeffs(coeffs, c300,c030,c003,c210,c201,c021,c012,c120,c102,c111,c200,c020,c002,c101,c110,c011,c100,c010,c001,c000);
  float x=p.x, y=p.y, z=p.z;
  return
    c300*x*x*x + c030*y*y*y + c003*z*z*z +
    c210*x*x*y + c201*x*x*z + c021*y*y*z + c012*y*z*z +
    c120*x*y*y + c102*x*z*z + c111*x*y*z +
    c200*x*x + c020*y*y + c002*z*z +
    c101*x*z + c110*x*y + c011*y*z +
    c100*x + c010*y + c001*z + c000;
}

vec3 cubicGrad(in vec3 p, in float coeffs[20]) {
  float c300,c030,c003,c210,c201,c021,c012,c120,c102,c111,c200,c020,c002,c101,c110,c011,c100,c010,c001,c000;
  unpackCoeffs(coeffs, c300,c030,c003,c210,c201,c021,c012,c120,c102,c111,c200,c020,c002,c101,c110,c011,c100,c010,c001,c000);
  float x=p.x, y=p.y, z=p.z;

  float fx =
    3.0*c300*x*x + 2.0*c210*x*y + 2.0*c201*x*z + c120*y*y + c102*z*z + c111*y*z +
    2.0*c200*x + c101*z + c110*y + c100;

  float fy =
    3.0*c030*y*y + c210*x*x + 2.0*c021*y*z + c012*z*z + 2.0*c120*x*y + c111*x*z +
    2.0*c020*y + c110*x + c011*z + c010;

  float fz =
    3.0*c003*z*z + c201*x*x + 2.0*c102*x*z + 2.0*c012*y*z + c021*y*y + c111*x*y +
    2.0*c002*z + c101*x + c011*y + c001;

  return vec3(fx, fy, fz);
}

// Einzelne Hessian-Einträge am Punkt p (nur was wir brauchen)
void cubicHessianAt(in vec3 p, in float coeffs[20],
                    out float f_xx, out float f_yy, out float f_zz,
                    out float f_xy, out float f_xz, out float f_yz) {
  float c300,c030,c003,c210,c201,c021,c012,c120,c102,c111,c200,c020,c002,c101,c110,c011,c100,c010,c001,c000;
  unpackCoeffs(coeffs, c300,c030,c003,c210,c201,c021,c012,c120,c102,c111,c200,c020,c002,c101,c110,c011,c100,c010,c001,c000);
  float x=p.x, y=p.y, z=p.z;

  f_xx = 6.0*c300*x + 2.0*c210*y + 2.0*c201*z + 2.0*c200;
  f_yy = 6.0*c030*y + 2.0*c021*z + 2.0*c120*x + 2.0*c020;
  f_zz = 6.0*c003*z + 2.0*c102*x + 2.0*c012*y + 2.0*c002;

  f_xy = 2.0*c210*x + 2.0*c120*y + c111*z + c110;
  f_xz = 2.0*c201*x + 2.0*c102*z + c111*y + c101;
  f_yz = 2.0*c021*y + 2.0*c012*z + c111*x + c011;
}

// Leitkoeffizient A über 3. Ableitungs-Tensor (positionsunabhängig)
float cubicLeadingA(in vec3 rd, in float coeffs[20]) {
  float c300,c030,c003,c210,c201,c021,c012,c120,c102,c111,c200,c020,c002,c101,c110,c011,c100,c010,c001,c000;
  unpackCoeffs(coeffs, c300,c030,c003,c210,c201,c021,c012,c120,c102,c111,c200,c020,c002,c101,c110,c011,c100,c010,c001,c000);
  float dx=rd.x, dy=rd.y, dz=rd.z;

  return
    c300*dx*dx*dx + c030*dy*dy*dy + c003*dz*dz*dz +
    c210*dx*dx*dy + c201*dx*dx*dz + c120*dx*dy*dy +
    c021*dy*dy*dz + c012*dy*dz*dz + c102*dx*dz*dz +
    c111*dx*dy*dz;
}

// Liefert die t-Koeffizienten (A,B,C,D) von f(ro + t*rd) = 0
void cubicRayCoeffs(in vec3 ro, in vec3 rd, in float coeffs[20],
                    out float A, out float B, out float C, out float D) {
  // D = f(ro)
  D = cubicEval(ro, coeffs);

  // C = grad f(ro) ⋅ rd
  vec3 g = cubicGrad(ro, coeffs);
  C = dot(g, rd);

  // B = 0.5 * rd^T H(ro) rd
  float f_xx,f_yy,f_zz,f_xy,f_xz,f_yz;
  cubicHessianAt(ro, coeffs, f_xx,f_yy,f_zz,f_xy,f_xz,f_yz);
  B = 0.5 * ( f_xx*rd.x*rd.x + f_yy*rd.y*rd.y + f_zz*rd.z*rd.z
             + 2.0*f_xy*rd.x*rd.y + 2.0*f_xz*rd.x*rd.z + 2.0*f_yz*rd.y*rd.z );

  // A = (1/6) * D^3_richtung (Kontraktion mit 3.-Ableitungs-Tensor)  -> kompakt via closed form:
  A = cubicLeadingA(rd, coeffs);
}

// Ray/AABB-Schnitt (Slab-Methode). Rückgabe: true wenn Hit; gibt tNear/tFar aus.
bool rayBox(vec3 ro, vec3 rd, vec3 bmin, vec3 bmax, out float tNear, out float tFar) {
  vec3 inv = 1.0 / rd;
  vec3 t1 = (bmin - ro) * inv;
  vec3 t2 = (bmax - ro) * inv;
  vec3 tmin = min(t1, t2);
  vec3 tmax = max(t1, t2);
  tNear = max(max(tmin.x, tmin.y), tmin.z);
  tFar  = min(min(tmax.x, tmax.y), tmax.z);
  return tFar >= max(tNear, 0.0);
}

// Normale = ∇f / ||∇f||
vec3 cubicSurfaceNormal(vec3 p, float coeffs[20]) {
  vec3 n = cubicGrad(p, coeffs);
  return normalize(n);
}

// -----------------------------------------------------------------------------
// Hauptprogramm
// -----------------------------------------------------------------------------
void main() {
  // Ray aufbauen (Objektraum)
  vec3 ro = vUV;
  vec3 camPos = (uModelInverse * vec4(0.0, 0.0, 0.0, 1.0)).xyz;

  vec3 rd = (uOrthographic == 1)
    ? normalize(mat3(uModelInverse) * vec3(0.0, 0.0, -1.0))
    : normalize(ro - camPos);

  // AABB-Check (feste Box)
  float tN, tF;
  if (!rayBox(ro, rd, vec3(-BOX_HALF), vec3(BOX_HALF), tN, tF)) {
    discard;
  }

  // Polynom-Koeffizienten von f(ro + t*rd)
  float A, B, C, D;
  cubicRayCoeffs(ro, rd, uCoeffs, A, B, C, D);

  // Wurzeln bestimmen
  vec3 roots;
  int nRoots = cubic(A, B, C, D, roots);

  // gültigste (kleinste) Wurzel im Box-Intervall wählen
  float tHit = INF;
  float tMin = max(tN, 1.0e-4); // leicht vorziehen, um Selbsttreffer zu vermeiden
  float tMax = tF;

  if (nRoots >= 1 && roots.x >= tMin && roots.x <= tMax) tHit = min(tHit, roots.x);
  if (nRoots >= 2 && roots.y >= tMin && roots.y <= tMax) tHit = min(tHit, roots.y);
  if (nRoots >= 3 && roots.z >= tMin && roots.z <= tMax) tHit = min(tHit, roots.z);

  if (tHit == INF) {
    discard;
  }

  vec3 p = ro + tHit * rd;

  // Sicherheits-Clip an den Würfel (verhindert Richtungs-Artefakte)
  if (abs(p.x) > BOX_HALF + 0.001 || abs(p.y) > BOX_HALF + 0.001 || abs(p.z) > BOX_HALF + 0.001) {
    discard;
  }

  // Normale & Shading
  vec3 n = normalize(cubicSurfaceNormal(p, uCoeffs));

  // Blickrichtungs-Term (hell = frontal, dunkel = seitlich)
  float k = clamp(abs(dot(normalize(rd), n)), 0.0, 1.0);

  // gleiche Farbgebung wie zuvor, nur mit k statt Lichtquelle
  vec3 base = 0.5 + 0.5 * n;          // Normal-Visualisierung
  vec3 col  = mix(0.15*base, base, k); // Kontrast über view-Term

  fColor = vec4(col, 1.0);
}
