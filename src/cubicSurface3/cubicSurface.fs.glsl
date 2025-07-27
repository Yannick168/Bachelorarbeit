#version 300 es
precision highp float;

in vec3 vUV;

uniform mat4 uModelInverse;
uniform int uOrthographic;
uniform int uSurface;
uniform float uCoeffs[20];


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
  
//Sphere
/*
float c300 = 0.0f;
float c030 = 0.0f;
float c003 = 0.0f;
float c210 = 0.0f;
float c201 = 0.0f;
float c021 = 0.0f;
float c012 = 0.0f;
float c120 = 0.0f;
float c102 = 0.0f;  
float c111 = 0.0f;
float c200 = 1.0f; 
float c020 = 1.0f; 
float c002 = 1.0f; 
float c101 = 0.0f; 
float c110 = 0.0f;
float c011 = 0.0f; 
float c100 = 0.0f; 
float c010 = 0.0f; 
float c001 = 0.0f;
float c000 = -1.0f; 
*/

//Clebsch
/*
float c300 = 81.0f;
float c030 = 81.0f;
float c003 = 81.0f;
float c210 = -189.0f;
float c201 = -189.0f;
float c021 = -189.0f;
float c012 = -189.0f;
float c120 = -189.0f;
float c102 = -189.0f;  
float c111 = 54.0f;
float c200 = -9.0f; 
float c020 = -9.0f; 
float c002 = -9.0f; 
float c101 = 126.0f; 
float c110 = 126.0f;
float c011 = 126.0f; 
float c100 = -9.0f; 
float c010 = -9.0f; 
float c001 = -9.0f;
float c000 = 1.0f; 
*/


// Cayley-Kubik
/*
float c300 = 0.0f;
float c030 = 0.0f;
float c003 = 0.0f;
float c210 = 0.0f;
float c201 = 0.0f;
float c021 = 0.0f;
float c012 = 0.0f;
float c120 = 0.0f;
float c102 = 0.0f;  
float c111 = 1.0f;
float c200 = 0.0f; 
float c020 = 0.0f; 
float c002 = 0.0f; 
float c101 = 0.0f; 
float c110 = 0.0f;
float c011 = 0.0f; 
float c100 = 0.0f; 
float c010 = 1.0f; 
float c001 = 1.0f;
float c000 = 1.0f; 
*/

//Monkey Saddle
/*
float c300 = 1.0f;
float c030 = 0.0f;
float c003 = 0.0f;
float c210 = 0.0f;
float c201 = 0.0f;
float c021 = 0.0f;
float c012 = 0.0f;
float c120 = -3.0f;
float c102 = 0.0f;  
float c111 = 0.0f;
float c200 = 0.0f; 
float c020 = 0.0f; 
float c002 = 0.0f; 
float c101 = 0.0f; 
float c110 = 0.0f;
float c011 = 0.0f; 
float c100 = 0.0f; 
float c010 = 0.0f; 
float c001 = -1.0f;
float c000 = 0.0f; 
*/

//Cubic Cylinder
/*
float c300 = 1.0f;
float c030 = 1.0f;
float c003 = 0.0f;
float c210 = 0.0f;
float c201 = 0.0f;
float c021 = 0.0f;
float c012 = 0.0f;
float c120 = 0.0f;
float c102 = 0.0f;  
float c111 = 0.0f;
float c200 = 0.0f; 
float c020 = 0.0f; 
float c002 = 0.0f; 
float c101 = 0.0f; 
float c110 = 0.0f;
float c011 = 0.0f; 
float c100 = 0.0f; 
float c010 = 0.0f; 
float c001 = -1.0f;
float c000 = 0.0f; 
*/

//General Saddle Surface
/*
float c300 = 0.0f;
float c030 = 0.0f;
float c003 = 1.0f;
float c210 = 0.0f;
float c201 = 0.0f;
float c021 = 0.0f;
float c012 = 0.0f;
float c120 = 0.0f;
float c102 = 0.0f;  
float c111 = 0.0f;
float c200 = 1.0f; 
float c020 = -1.0f; 
float c002 = 0.0f; 
float c101 = 0.0f; 
float c110 = 0.0f;
float c011 = 0.0f; 
float c100 = 0.0f; 
float c010 = 0.0f; 
float c001 = 0.0f;
float c000 = 0.0f; 
*/

//Calyey 2 (Problem mit dem cubic solver)
/*
float c300 = -1.6f;
float c030 = 0.0f;
float c003 = 1.0f;
float c210 = 0.0f;
float c201 = 0.0f;
float c021 = 0.0f;
float c012 = 0.0f;
float c120 = 4.8f;
float c102 = 0.0f;  
float c111 = 0.0f;
float c200 = 0.0f; 
float c020 = 0.8f; 
float c002 = 0.0f; 
float c101 = 0.0f; 
float c110 = 0.0f;
float c011 = 0.0f; 
float c100 = 0.0f; 
float c010 = 0.0f; 
float c001 = 0.0f;
float c000 = 0.0f; 
*/


//crosspropeller
/*
float c300 = 0.0f;
float c030 = 0.0f;
float c003 = 0.0f;
float c210 = 0.0f;
float c201 = 0.0f;
float c021 = 0.0f;
float c012 = 0.0f;
float c120 = 0.0f;
float c102 = 0.0f;  
float c111 = 1.0f;
float c200 = 1.0f; 
float c020 = 0.1f; 
float c002 = 0.0f; 
float c101 = 0.0f; 
float c110 = 0.0f;
float c011 = 0.0f; 
float c100 = 0.0f; 
float c010 = 0.0f; 
float c001 = 0.0f;
float c000 = 0.0f; 

*/





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
  vec3 res;
  float t = 1e20f;

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

  
  int n = cubic(coeff[3],coeff[2],coeff[1],coeff[0],res);
  for(int i = 0; i < n; i++) {
    if (res[i] < 0.0f)
      continue;
    if (res[i] < t) {
      vec3 p = ro + res[i] * rd;
      if (dot(p,p) > 2.0f)
        continue;
      t = res[i];
    }
  }

  if(t == 1e20f)
    return (-1.0f);
  return (t);
}


vec3 cubicSurfaceNormal(vec3 p, float coeffs[20]) {
  float c300 = uCoeffs[0];
  float c030 = uCoeffs[1];
  float c003 = uCoeffs[2];
  float c210 = uCoeffs[3];
  float c201 = uCoeffs[4];
  float c021 = uCoeffs[5];
  float c012 = uCoeffs[6];
  float c120 = uCoeffs[7];
  float c102 = uCoeffs[8];
  float c111 = uCoeffs[9];
  float c200 = uCoeffs[10];
  float c020 = uCoeffs[11];
  float c002 = uCoeffs[12];
  float c101 = uCoeffs[13];
  float c110 = uCoeffs[14];
  float c011 = uCoeffs[15];
  float c100 = uCoeffs[16];
  float c010 = uCoeffs[17];
  float c001 = uCoeffs[18];
  float c000 = uCoeffs[19];
  vec3 n;

  n.x = c100 + c101*p.z + c102*pow(p.z, 2.0) + c110*p.y + c111*p.y*p.z + c120*pow(p.y, 2.0) + 2.0*c200*p.x + 2.0*c201*p.x*p.z + 2.0*c210*p.x*p.y + 3.0*c300*pow(p.x, 2.0);
  n.y = c010 + c011*p.z + c012*pow(p.z, 2.0) + 2.0*c020*p.y + 2.0*c021*p.y*p.z + 3.0*c030*pow(p.y, 2.0) + c110*p.x + c111*p.x*p.z + 2.0*c120*p.x*p.y + c210*pow(p.x, 2.0);
  n.z = c001 + 2.0*c002*p.z + 3.0*c003*pow(p.z, 2.0) + c011*p.y + 2.0*c012*p.y*p.z + c021*pow(p.y, 2.0) + c101*p.x + 2.0*c102*p.x*p.z + c111*p.x*p.y + c201*pow(p.x, 2.0);

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
      lambda = cubicSurfaceIntersect(ro, rd, uCoeffs);
      if(lambda < 0.0f)
        discard;
      p = ro + lambda * rd;
      n = cubicSurfaceNormal(p, uCoeffs);
      break;

    case 2:
      lambda = clebschIntersect(ro, rd);
      if(lambda < 0.0f)
        discard;
      p = ro + lambda * rd;
      n = clebschNormal(p);
      float lambdro = clebschLineIntersect(ro,rd);
      if (lambdro > 0.0f && lambdro < lambda) {
        p = ro + lambdro * rd;
        n = clebschLineNormal(p);
        col = vec4(1.0f,0.0f,0.0f,1.0f);
      }
      break;
  }
  fColor = abs(dot(rd, n)) * col;
}

