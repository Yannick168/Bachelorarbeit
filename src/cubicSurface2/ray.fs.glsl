#version 300 es
precision highp float;

in vec3 vUV;

uniform mat4 uModelInverse;
uniform int uOrthographic;
uniform int uSurface;

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

// Clebsch's Surface
float clebschIntersect(vec3 ro, vec3 rd) {

  float coeff[4];
  vec3 res;
  float t = 1e20f;

  coeff[3] = 81.0f*rd.x*rd.x*rd.x - 189.0f*rd.x*rd.x*rd.y - 189.0f*rd.x*rd.x*rd.z - 189.0f*rd.x*rd.y*rd.y + 54.0f*rd.x*rd.y*rd.z 
            - 189.0f*rd.x*rd.z*rd.z + 81.0f*rd.y*rd.y*rd.y - 189.0f*rd.y*rd.y*rd.z - 189.0f*rd.y*rd.z*rd.z + 81.0f*rd.z*rd.z*rd.z;
  coeff[2] = 243.0f*ro.x*rd.x*rd.x - 378.0f*ro.x*rd.x*rd.y - 378.0f*ro.x*rd.x*rd.z - 189.0f*ro.x*rd.y*rd.y + 54.0f*ro.x*rd.y*rd.z 
            - 189.0f*ro.x*rd.z*rd.z - 189.0f*ro.y*rd.x*rd.x - 378.0f*ro.y*rd.x*rd.y + 54.0f*ro.y*rd.x*rd.z + 243.0f*ro.y*rd.y*rd.y 
            - 378.0f*ro.y*rd.y*rd.z - 189.0f*ro.y*rd.z*rd.z - 189.0f*ro.z*rd.x*rd.x + 54.0f*ro.z*rd.x*rd.y - 378.0f*ro.z*rd.x*rd.z 
            - 189.0f*ro.z*rd.y*rd.y - 378.0f*ro.z*rd.y*rd.z + 243.0f*ro.z*rd.z*rd.z - 9.0f*rd.x*rd.x + 126.0f*rd.x*rd.y + 126.0f*rd.x*rd.z 
            - 9.0f*rd.y*rd.y + 126.0f*rd.y*rd.z - 9.0f*rd.z*rd.z;
  coeff[1] = 243.0f*ro.x*ro.x*rd.x - 189.0f*ro.x*ro.x*rd.y - 189.0f*ro.x*ro.x*rd.z - 378.0f*ro.x*ro.y*rd.x - 378.0f*ro.x*ro.y*rd.y 
             + 54.0f*ro.x*ro.y*rd.z - 378.0f*ro.x*ro.z*rd.x + 54.0f*ro.x*ro.z*rd.y - 378.0f*ro.x*ro.z*rd.z - 18.0f*ro.x*rd.x + 126.0f*ro.x*rd.y 
             + 126.0f*ro.x*rd.z - 189.0f*ro.y*ro.y*rd.x + 243.0f*ro.y*ro.y*rd.y - 189.0f*ro.y*ro.y*rd.z + 54.0f*ro.y*ro.z*rd.x 
             - 378.0f*ro.y*ro.z*rd.y - 378.0f*ro.y*ro.z*rd.z + 126.0f*ro.y*rd.x - 18.0f*ro.y*rd.y + 126.0f*ro.y*rd.z - 189.0f*ro.z*ro.z*rd.x 
             - 189.0f*ro.z*ro.z*rd.y + 243.0f*ro.z*ro.z*rd.z + 126.0f*ro.z*rd.x + 126.0f*ro.z*rd.y - 18.0f*ro.z*rd.z - 9.0f*rd.x - 9.0f*rd.y 
             - 9.0f*rd.z;
  coeff[0] = 81.0f*ro.x*ro.x*ro.x - 189.0f*ro.x*ro.x*ro.y - 189.0f*ro.x*ro.x*ro.z - 9.0f*ro.x*ro.x - 189.0f*ro.x*ro.y*ro.y + 54.0f*ro.x*ro.y*ro.z
             + 126.0f*ro.x*ro.y - 189.0f*ro.x*ro.z*ro.z + 126.0f*ro.x*ro.z - 9.0f*ro.x + 81.0f*ro.y*ro.y*ro.y - 189.0f*ro.y*ro.y*ro.z 
             - 9.0f*ro.y*ro.y - 189.0f*ro.y*ro.z*ro.z + 126.0f*ro.y*ro.z - 9.0f*ro.y + 81.0f*ro.z*ro.z*ro.z - 9.0f*ro.z*ro.z - 9.0f*ro.z + 1.0f;
  
  int n = cubic(coeff[3],coeff[2],coeff[1],coeff[0],res);
  for(int i = 0; i < n; i++) {
    if (res[i] < 0.0f)
      continue;
    if (res[i] < t) {
      vec3 p = ro + res[i] * rd;
      if (dot(p,p) > 1.0f)
        continue;
      t = res[i];
    }
  }

  if(t == 1e20f)
    return (-1.0f);
  return (t);
}

float clebschLineIntersect(vec3 ro, vec3 rd) {
  vec3 a = vec3(0.0f,0.0f,-1.0/3.0f);
  vec3 b = vec3(1.0f,-1.0f,0.0f);
  float coeff[3];
  float rad = 0.01f;

  vec3 bxrd = cross(b,rd);
  vec3 bxroa = cross(b,ro-a);
  coeff[2] = dot(bxrd,bxrd);
  coeff[1] = 2.0f*dot(bxrd,bxroa);
  coeff[0] = dot(bxroa,bxroa)-dot(b,b)*rad*rad;

  vec2 res;
  int s = quadratic(coeff[2],coeff[1],coeff[0],res);
  if (s == 0) return(-1.0f);
  if (res[0] < 0.0f && res[1] < 0.0f) return(-1.0f);
  float t = min(res[0],res[1]);
  vec3 p = ro + t * rd;
  if (dot(p,p) > 1.0f) return(-1.0f);
  return(t);
}

vec3 clebschNormal(vec3 p) {
  vec3 n;

  n.x = 243.0f*p.x*p.x - 378.0f*p.x*(p.y + p.z) - 18.0f*p.x - 189.0f*p.y*p.y + 54.0f*p.y*p.z + 126.0f*p.y - 189.0f*p.z*p.z + 126.0f*p.z - 9.0f;
  n.y = -189.0f*p.x*p.x + 54.0f*p.x*p.z + 126.0f*p.x + 243.0f*p.y*p.y - 378.0f*p.y*(p.x + p.z) - 18.0f*p.y - 189.0f*p.z*p.z + 126.0f*p.z - 9.0f;
  n.z = -189.0f*p.x*p.x + 54.0f*p.x*p.y + 126.0f*p.x - 189.0f*p.y*p.y + 126.0f*p.y + 243.0f*p.z*p.z - 378.0f*p.z*(p.x + p.y) - 18.0f*p.z - 9.0f;
  return(normalize(n));
}

vec3 clebschLineNormal(vec3 p) {
  vec3 a = vec3(0.0f,0.0f,-1.0/3.0f);
  vec3 b = vec3(1.0f,-1.0f,0.0f);
  vec3 n = cross(b,cross(b,p-a));
  return(normalize(n));
}

void main() {
  vec3 ro = vUV;
  vec3 rd = (uOrthographic == 1) ? -uModelInverse[2].xyz : vUV - uModelInverse[3].xyz;
  rd = normalize(rd);
  vec4 col = vec4(1.0f, 1.0f, 1.0f, 1.0f);

  vec3 p, n;
  float lambda;

  switch(uSurface) {
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
      lambda = clebschIntersect(ro, rd);
      if(lambda < 0.0f)
        discard;
      p = ro + lambda * rd;
      n = clebschNormal(p);
      float lambda2 = clebschLineIntersect(ro,rd);
      if (lambda2 > 0.0f && lambda2 < lambda) {
        p = ro + lambda2 * rd;
        n = clebschLineNormal(p);
        col = vec4(1.0f,0.0f,0.0f,1.0f);
      }
      break;
  }
  fColor = abs(dot(rd, n)) * col;
}
