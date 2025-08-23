#version 300 es
precision highp float;

in vec3 vUV;

uniform mat4 uModelInverse;
uniform int uOrthographic;
uniform int uSurface;
uniform float uCoeffs[20];

uniform bool  uShowBox;          // per TS toggeln
uniform float uHalf;             // = r (z.B. 3.0)
uniform float uEdgeThickness;    // Linienstärke in Objektraum-Einheiten (z.B. 0.03)


out vec4 fColor;

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


const float EPS = 1e-4;


// Robuster Ray–AABB-Test (Slab-Methode) für [-h, h]^3
bool rayAABB(vec3 ro, vec3 rd, float h, out float tNear, out float tFar) {
    vec3 invD = 1.0 / rd;
    vec3 t0 = (vec3(-h) - ro) * invD;
    vec3 t1 = (vec3( h) - ro) * invD;
    vec3 tmin = min(t0, t1);
    vec3 tmax = max(t0, t1);
    float tNear = max(max(tmin.x, tmin.y), tmin.z);
    float tFar  = min(min(tmax.x, tmax.y), tmax.z);
    return tFar > max(tNear, 0.0);
}

  
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

  n.x = c100 + c101*p.z + c102*pow(p.z, 2.0) + c110*p.y + c111*p.y*p.z + c120*pow(p.y, 2.0) + 2.0*c200*p.x + 2.0*c201*p.x*p.z + 2.0*c210*p.x*p.y + 3.0*c300*pow(p.x, 2.0);
  n.y = c010 + c011*p.z + c012*pow(p.z, 2.0) + 2.0*c020*p.y + 2.0*c021*p.y*p.z + 3.0*c030*pow(p.y, 2.0) + c110*p.x + c111*p.x*p.z + 2.0*c120*p.x*p.y + c210*pow(p.x, 2.0);
  n.z = c001 + 2.0*c002*p.z + 3.0*c003*pow(p.z, 2.0) + c011*p.y + 2.0*c012*p.y*p.z + c021*pow(p.y, 2.0) + c101*p.x + 2.0*c102*p.x*p.z + c111*p.x*p.y + c201*pow(p.x, 2.0);

  return(normalize(n));
}



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

  float coeff[4];

  coeff[3] =
    c003*pow(rd.z,3.0) + c012*rd.y*pow(rd.z,2.0) + c021*pow(rd.y,2.0)*rd.z +
    c030*pow(rd.y,3.0) + c102*rd.x*pow(rd.z,2.0) + c111*rd.x*rd.y*rd.z +
    c120*rd.x*pow(rd.y,2.0) + c201*pow(rd.x,2.0)*rd.z + c210*pow(rd.x,2.0)*rd.y +
    c300*pow(rd.x,3.0);

  coeff[2] =
    ro.x*c102*pow(rd.z,2.0) + ro.x*c111*rd.y*rd.z + ro.x*c120*pow(rd.y,2.0) +
    2.0*ro.x*c201*rd.x*rd.z + 2.0*ro.x*c210*rd.x*rd.y + 3.0*ro.x*c300*pow(rd.x,2.0) +
    ro.y*c012*pow(rd.z,2.0) + 2.0*ro.y*c021*rd.y*rd.z + 3.0*ro.y*c030*pow(rd.y,2.0) +
    ro.y*c111*rd.x*rd.z + 2.0*ro.y*c120*rd.x*rd.y + ro.y*c210*pow(rd.x,2.0) +
    3.0*ro.z*c003*pow(rd.z,2.0) + 2.0*ro.z*c012*rd.y*rd.z + ro.z*c021*pow(rd.y,2.0) +
    2.0*ro.z*c102*rd.x*rd.z + ro.z*c111*rd.x*rd.y + ro.z*c201*pow(rd.x,2.0) +
    c002*pow(rd.z,2.0) + c011*rd.y*rd.z + c020*pow(rd.y,2.0) +
    c101*rd.x*rd.z + c110*rd.x*rd.y + c200*pow(rd.x,2.0);

  coeff[1] =
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

  coeff[0] =
    pow(ro.x,3.0)*c300 + pow(ro.x,2.0)*ro.y*c210 + pow(ro.x,2.0)*ro.z*c201 + pow(ro.x,2.0)*c200 +
    ro.x*pow(ro.y,2.0)*c120 + ro.x*ro.y*ro.z*c111 + ro.x*ro.y*c110 +
    ro.x*pow(ro.z,2.0)*c102 + ro.x*ro.z*c101 + ro.x*c100 +
    pow(ro.y,3.0)*c030 + pow(ro.y,2.0)*ro.z*c021 + pow(ro.y,2.0)*c020 +
    ro.y*pow(ro.z,2.0)*c012 + ro.y*ro.z*c011 + ro.y*c010 +
    pow(ro.z,3.0)*c003 + pow(ro.z,2.0)*c002 + ro.z*c001 + c000;

  
  float tNear, tFar;
  if (!rayAABB(ro, rd, uHalf, tNear, tFar)) return -1.0;
  tNear = max(tNear, EPS);

  vec3 res;
  float t = 1e20f;
  int n = cubic(coeff[3],coeff[2],coeff[1],coeff[0], res);
  
  // Kandidaten filtern auf Intervall
  for (int i = 0; i < n; ++i) {
    float ti = res[i];
    if (ti < 0.0)      continue;
    if (ti < tNear || ti > tFar) continue;
    t = min(t, ti);
  }

  if(t == 1e20f)
    return (-1.0f);
  return (t);
}




float edgeDistance(vec3 p, float r) {
  // Distanz zu den drei Paaren |x|=r, |y|=r, |z|=r
  vec3 d = abs(abs(p) - r);      // d.x ~ Distanz zu x=±r, etc.

  // „Beide klein“ ~ Nähe zur Kante
  float dXY = max(d.x, d.y);
  float dXZ = max(d.x, d.z);
  float dYZ = max(d.y, d.z);

  // Nur werten, wenn die dritte Koordinate innerhalb ist (mit kleiner Toleranz)
  float t  = r + uEdgeThickness;
  float inX = step(abs(p.x), t);
  float inY = step(abs(p.y), t);
  float inZ = step(abs(p.z), t);

  float BIG = 1e3;
  float eXY = mix(BIG, dXY, inZ); // Kanten parallel Z
  float eXZ = mix(BIG, dXZ, inY); // Kanten parallel Y
  float eYZ = mix(BIG, dYZ, inX); // Kanten parallel X

  return min(min(eXY, eXZ), eYZ);
}


void main() {
  // ===== Box-Kanten zuerst prüfen (BEVOR irgendwas discardet wird) =====
  // vUV ist hier deine Objektraum-Position auf der Cube-Fläche.
  if (uShowBox) {
    float d  = edgeDistance(vUV, uHalf);           // Abstand zur nächsten Kante
    float aa = fwidth(d);                           // Anti-Aliasing
    float m  = 1.0 - smoothstep(uEdgeThickness - aa,
                                uEdgeThickness + aa, d);
    if (m > 0.0) {
      // reine Kante: direkt ausgeben und fertig
      fColor = vec4(0.0f, 0.0f, 0.0f, 1.0f);       // Kantenfarbe
      return;
    }
  }

  // ===== Dein bisheriger Ray-Setup =====
  vec3 ro = vUV;
  vec3 rd = (uOrthographic == 1) ? -uModelInverse[2].xyz
                                 : vUV - uModelInverse[3].xyz;
  rd = normalize(rd);
  ro += 1e-4 * rd; // kleiner Push-off gegen Self-Intersection
  
  vec4 col = vec4(0.0f, 1.0f, 0.0f, 1.0f);

  vec3 p, n;
  float lambda;

  lambda = cubicSurfaceIntersect(ro, rd, uCoeffs);
  if (lambda < 0.0f)
    discard;
  p = ro + lambda * rd;
  n = cubicSurfaceNormal(p, uCoeffs);
  break;


  // Headlight-/View-Shading
  float shade = abs(dot(normalize(rd), normalize(n)));
  fColor = vec4(col.rgb * shade, col.a);
}
