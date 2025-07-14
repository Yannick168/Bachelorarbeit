#version 300 es
precision highp float;

in vec3 vUV;

uniform mat4 uModelInverse;
uniform int uOrthographic;
uniform int uSurface;

out vec4 fColor;

#define M_PI 3.1415926535897932384626433832795
#define EPS 1e-8

// Boosting Efficiency in Solving Quartic Equations with No Compromise in Accuracy
// by ALBERTO GIACOMO ORELLANA and CRISTIANO DE MICHELE
// https://dl.acm.org/doi/abs/10.1145/3386241

const float cubic_rescal_fact = 4.3147815e12f; //= pow(FLT_MAX,1.0/3.0)/1.618034;
const float quart_rescal_fact = 2.6544356e9f; // = pow(FLT_MAX,1.0/4.0)/1.618034;
const float macheps = 1.192093e-07f; // FLT_EPSILON

vec2 cx_mul(vec2 a, vec2 b) {
  return (vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x));
}

vec2 cx_div(vec2 a, vec2 b) {
  return (vec2(((a.x * b.x + a.y * b.y) / (b.x * b.x + b.y * b.y)), ((a.y * b.x - a.x * b.y) / (b.x * b.x + b.y * b.y))));
}

float cx_abs(vec2 a) {
  return (sqrt(a.x * a.x + a.y * a.y));
}

vec2 cx_conj(vec2 a) {
  return (vec2(a.x, -a.y));
}

vec2 cx_sqrt(vec2 a) {
  float r = cx_abs(a);
  float rpart = sqrt(0.5f * (r + a.x));
  float ipart = sqrt(0.5f * (r - a.x));
  if(a.y < 0.0f)
    ipart = -ipart;
  return (vec2(rpart, ipart));
}

float fixedpow(float a, float x) {
  return pow(abs(a), x) * sign(a);
}

float cbrt(float a) {
  return fixedpow(a, 1.0f / 3.0f);
}

float oqs_max2(float a, float b) {
  if(a >= b)
    return a;
  else
    return b;
}

float oqs_max3(float a, float b, float c) {
  float t;
  t = oqs_max2(a, b);
  return oqs_max2(t, c);
}

void oqs_solve_cubic_analytic_depressed_handle_inf(float b, float c, out float sol) {
  // find analytically the dominant root of a depressed cubic x^3+b*x+c 
  // where coefficients b and c are large (see sec. 2.2 in the manuscript) 
  float Q, R, theta, A, B, QR, QRSQ, KK, sqrtQ, RQ;

  const float PI2 = M_PI / 2.0f, TWOPI = 2.0f * M_PI;
  Q = -b / 3.0f;
  R = 0.5f * c;
  if(R == 0.0f) {
    if(b <= 0.0f) {
      sol = sqrt(-b);
    } else {
      sol = 0.0f;
    }
    return;
  }

  if(abs(Q) < abs(R)) {
    QR = Q / R;
    QRSQ = QR * QR;
    KK = 1.0f - Q * QRSQ;
  } else {
    RQ = R / Q;
    KK = sign(Q) * (RQ * RQ / Q - 1.0f);
  }

  if(KK < 0.0f) {
    sqrtQ = sqrt(Q);
    theta = acos((R / abs(Q)) / sqrtQ);
    if(theta < PI2)
      sol = -2.0f * sqrtQ * cos(theta / 3.0f);
    else
      sol = -2.0f * sqrtQ * cos((theta + TWOPI) / 3.0f);
  } else {
    if(abs(Q) < abs(R))
      A = -sign(R) * cbrt(abs(R) * (1.0f + sqrt(KK)));
    else {
      A = -sign(R) * cbrt(abs(R) + sqrt(abs(Q)) * abs(Q) * sqrt(KK));
    }
    if(A == 0.0f)
      B = 0.0f;
    else
      B = Q / A;
    sol = A + B;
  }
}

void oqs_solve_cubic_analytic_depressed(float b, float c, out float sol) {
  // find analytically the dominant root of a depressed cubic x^3+b*x+c 
  // (see sec. 2.2 in the manuscript)
  float Q, R, theta, Q3, R2, A, B, sqrtQ;
  Q = -b / 3.0f;
  R = 0.5f * c;
  if(abs(Q) > 1e9f || abs(R) > 1e12f) {
    oqs_solve_cubic_analytic_depressed_handle_inf(b, c, sol);
    return;
  }
  Q3 = Q * Q * Q;
  R2 = R * R;
  if(R2 < Q3) {
    theta = acos(R / sqrt(Q3));
    sqrtQ = -2.0f * sqrt(Q);
    if(theta < M_PI / 2.0f)
      sol = sqrtQ * cos(theta / 3.0f);
    else
      sol = sqrtQ * cos((theta + 2.0f * M_PI) / 3.0f);
  } else {
    A = -sign(R) * pow(abs(R) + sqrt(R2 - Q3), 1.0f / 3.0f);
    if(A == 0.0f)
      B = 0.0f;
    else
      B = Q / A;
    sol = A + B; // this is always largest root even if A=B
  }
}

void oqs_calc_phi0(float a, float b, float c, float d, out float phi0, bool scaled) {
  // find phi0 as the dominant root of the depressed and shifted cubic 
  // in eq. (79) (see also the discussion in sec. 2.2 of the manuscript)
  float rmax, g, h, gg, hh, aq, bq, cq, dq, s, diskr;
  float maxtt, xxx, gx, x, xold, f, fold, df, xsq;
  float ggss, hhss, dqss, aqs, bqs, cqs, rfact, rfactsq;
  int iter;
  diskr = 9.0f * a * a - 24.0f * b;                    
  // eq. (87)
  if(diskr > 0.0f) {
    diskr = sqrt(diskr);
    if(a > 0.0f)
      s = -2.0f * b / (3.0f * a + diskr);
    else
      s = -2.0f * b / (3.0f * a - diskr);
  } else {
    s = -a / 4.0f;
  }
  // eqs. (83)
  aq = a + 4.0f * s;
  bq = b + 3.0f * s * (a + 2.0f * s);
  cq = c + s * (2.0f * b + s * (3.0f * a + 4.0f * s));
  dq = d + s * (c + s * (b + s * (a + s)));
  gg = bq * bq / 9.0f;
  hh = aq * cq;

  g = hh - 4.0f * dq - 3.0f * gg;                       // eq. (85)  
  h = (8.0f * dq + hh - 2.0f * gg) * bq / 3.0f - cq * cq - dq * aq * aq; // eq. (86)          
  oqs_solve_cubic_analytic_depressed(g, h, rmax);
  if(isnan(rmax) || isinf(rmax)) {
    oqs_solve_cubic_analytic_depressed_handle_inf(g, h, rmax);
    if((isnan(rmax) || isinf(rmax)) && scaled) {
          // try harder: rescale also the depressed cubic if quartic has been already rescaled
      rfact = cubic_rescal_fact;
      rfactsq = rfact * rfact;
      ggss = gg / rfactsq;
      hhss = hh / rfactsq;
      dqss = dq / rfactsq;
      aqs = aq / rfact;
      bqs = bq / rfact;
      cqs = cq / rfact;
      ggss = bqs * bqs / 9.0f;
      hhss = aqs * cqs;
      g = hhss - 4.0f * dqss - 3.0f * ggss;
      h = (8.0f * dqss + hhss - 2.0f * ggss) * bqs / 3.0f - cqs * (cqs / rfact) - (dq / rfact) * aqs * aqs;
      oqs_solve_cubic_analytic_depressed(g, h, rmax);
      if(isnan(rmax) || isinf(rmax)) {
        oqs_solve_cubic_analytic_depressed_handle_inf(g, h, rmax);
      }
      rmax *= rfact;
    }
  }
  // Newton-Raphson used to refine phi0 (see end of sec. 2.2 in the manuscript)
  x = rmax;
  xsq = x * x;
  xxx = x * xsq;
  gx = g * x;
  f = x * (xsq + g) + h;
  if(abs(xxx) > abs(gx))
    maxtt = abs(xxx);
  else
    maxtt = abs(gx);
  if(abs(h) > maxtt)
    maxtt = abs(h);

  if(abs(f) > macheps * maxtt) {
    for(iter = 0; iter < 8; iter++) {
      df = 3.0f * xsq + g;
      if(df == 0.0f)
        break;
      xold = x;
      x += -f / df;
      fold = f;
      xsq = x * x;
      f = x * (xsq + g) + h;
      if(f == 0.0f)
        break;

      if(abs(f) >= abs(fold)) {
        x = xold;
        break;
      }
    }
  }
  phi0 = x;
}

float oqs_calc_err_ldlt(float b, float c, float d, float d2, float l1, float l2, float l3) {
  // Eqs. (29) and (30) in the manuscript
  float sum;
  sum = (b == 0.0f) ? abs(d2 + l1 * l1 + 2.0f * l3) : abs(((d2 + l1 * l1 + 2.0f * l3) - b) / b);
  sum += (c == 0.0f) ? abs(2.0f * d2 * l2 + 2.0f * l1 * l3) : abs(((2.0f * d2 * l2 + 2.0f * l1 * l3) - c) / c);
  sum += (d == 0.0f) ? abs(d2 * l2 * l2 + l3 * l3) : abs(((d2 * l2 * l2 + l3 * l3) - d) / d);
  return sum;
}

float oqs_calc_err_abcd_cmplx(
  float a,
  float b,
  float c,
  float d,
  vec2 aq,
  vec2 bq,
  vec2 cq,
  vec2 dq
) {
  // Eqs. (68) and (69) in the manuscript for complex alpha1 (aq), beta1 (bq), alpha2 (cq) and beta2 (dq)
  float sum;
  sum = (d == 0.0f) ? cx_abs(cx_mul(bq, dq)) : cx_abs((cx_mul(bq, dq) - vec2(d, 0.0f)) / d);
  sum += (c == 0.0f) ? cx_abs(cx_mul(bq, cq) + cx_mul(aq, dq)) : cx_abs((cx_mul(bq, cq) + cx_mul(aq, dq) - vec2(c, 0.0f)) / c);
  sum += (b == 0.0f) ? cx_abs(bq + cx_mul(aq, cq) + dq) : cx_abs((bq + cx_mul(aq, cq) + dq - vec2(b, 0.0f)) / b);
  sum += (a == 0.0f) ? cx_abs(aq + cq) : cx_abs((aq + cq - vec2(a, 0.0f)) / a);
  return sum;
}

float oqs_calc_err_abcd(float a, float b, float c, float d, float aq, float bq, float cq, float dq) {
  // Eqs. (68) and (69) in the manuscript for real alpha1 (aq), beta1 (bq), alpha2 (cq) and beta2 (dq)
  float sum;
  sum = (d == 0.0f) ? abs(bq * dq) : abs((bq * dq - d) / d);
  sum += (c == 0.0f) ? abs(bq * cq + aq * dq) : abs(((bq * cq + aq * dq) - c) / c);
  sum += (b == 0.0f) ? abs(bq + aq * cq + dq) : abs(((bq + aq * cq + dq) - b) / b);
  sum += (a == 0.0f) ? abs(aq + cq) : abs(((aq + cq) - a) / a);
  return sum;
}

float oqs_calc_err_abc(float a, float b, float c, float aq, float bq, float cq, float dq) {
  // Eqs. (48)-(51) in the manuscript
  float sum;
  sum = (c == 0.0f) ? abs(bq * cq + aq * dq) : abs(((bq * cq + aq * dq) - c) / c);
  sum += (b == 0.0f) ? abs(bq + aq * cq + dq) : abs(((bq + aq * cq + dq) - b) / b);
  sum += (a == 0.0f) ? abs(aq + cq) : abs(((aq + cq) - a) / a);
  return sum;
}

void oqs_NRabcd(float a, float b, float c, float d, inout float AQ, inout float BQ, inout float CQ, inout float DQ) {
  // Newton-Raphson described in sec. 2.3 of the manuscript for complex coefficients a,b,c,d
  int iter, k1, k2;
  float x02, errf, errfold, xold[4], x[4], dx[4], det, Jinv[16], fvec[4], vr[4];
  x[0] = AQ;
  x[1] = BQ;
  x[2] = CQ;
  x[3] = DQ;
  vr[0] = d;
  vr[1] = c;
  vr[2] = b;
  vr[3] = a;
  fvec[0] = x[1] * x[3] - d;
  fvec[1] = x[1] * x[2] + x[0] * x[3] - c;
  fvec[2] = x[1] + x[0] * x[2] + x[3] - b;
  fvec[3] = x[0] + x[2] - a;
  errf = 0.0f;
  for(k1 = 0; k1 < 4; k1++) {
    errf += (vr[k1] == 0.0f) ? abs(fvec[k1]) : abs(fvec[k1] / vr[k1]);
  }
  for(iter = 0; iter < 8; iter++) {
    x02 = x[0] - x[2];
    det = x[1] * x[1] + x[1] * (-x[2] * x02 - 2.0f * x[3]) + x[3] * (x[0] * x02 + x[3]);
    if(det == 0.0f)
      break;
    Jinv[4 * 0 + 0] = x02;
    Jinv[4 * 0 + 1] = x[3] - x[1];
    Jinv[4 * 0 + 2] = x[1] * x[2] - x[0] * x[3];
    Jinv[4 * 0 + 3] = -x[1] * Jinv[4 * 0 + 1] - x[0] * Jinv[4 * 0 + 2];
    Jinv[4 * 1 + 0] = x[0] * Jinv[4 * 0 + 0] + Jinv[4 * 0 + 1];
    Jinv[4 * 1 + 1] = -x[1] * Jinv[4 * 0 + 0];
    Jinv[4 * 1 + 2] = -x[1] * Jinv[4 * 0 + 1];
    Jinv[4 * 1 + 3] = -x[1] * Jinv[4 * 0 + 2];
    Jinv[4 * 2 + 0] = -Jinv[4 * 0 + 0];
    Jinv[4 * 2 + 1] = -Jinv[4 * 0 + 1];
    Jinv[4 * 2 + 2] = -Jinv[4 * 0 + 2];
    Jinv[4 * 2 + 3] = Jinv[4 * 0 + 2] * x[2] + Jinv[4 * 0 + 1] * x[3];
    Jinv[4 * 3 + 0] = -x[2] * Jinv[4 * 0 + 0] - Jinv[4 * 0 + 1];
    Jinv[4 * 3 + 1] = Jinv[4 * 0 + 0] * x[3];
    Jinv[4 * 3 + 2] = x[3] * Jinv[4 * 0 + 1];
    Jinv[4 * 3 + 3] = x[3] * Jinv[4 * 0 + 2];
    for(k1 = 0; k1 < 4; k1++) {
      dx[k1] = 0.0f;
      for(k2 = 0; k2 < 4; k2++) dx[k1] += Jinv[4 * k1 + k2] * fvec[k2];
    }
    for(k1 = 0; k1 < 4; k1++) xold[k1] = x[k1];

    for(k1 = 0; k1 < 4; k1++) {
      x[k1] += -dx[k1] / det;
    }
    fvec[0] = x[1] * x[3] - d;
    fvec[1] = x[1] * x[2] + x[0] * x[3] - c;
    fvec[2] = x[1] + x[0] * x[2] + x[3] - b;
    fvec[3] = x[0] + x[2] - a;
    errfold = errf;
    errf = 0.0f;
    for(k1 = 0; k1 < 4; k1++) {
      errf += (vr[k1] == 0.0f) ? abs(fvec[k1]) : abs(fvec[k1] / vr[k1]);
    }
    if(errf == 0.0f)
      break;
    if(errf >= errfold) {
      for(k1 = 0; k1 < 4; k1++) x[k1] = xold[k1];
      break;
    }
  }
  AQ = x[0];
  BQ = x[1];
  CQ = x[2];
  DQ = x[3];
}

void oqs_solve_quadratic(float a, float b, out vec2 roots_re, out vec2 roots_im) {
  float div, sqrtd, diskr, zmax, zmin;
  diskr = a * a - 4.0f * b;
  if(diskr >= 0.0f) {
    if(a >= 0.0f)
      div = -a - sqrt(diskr);
    else
      div = -a + sqrt(diskr);

    zmax = div / 2.0f;

    if(zmax == 0.0f)
      zmin = 0.0f;
    else
      zmin = b / zmax;

    roots_re[0] = zmax;
    roots_im[0] = 0.0f;
    roots_re[1] = zmin;
    roots_im[1] = 0.0f;
  } else {
    sqrtd = sqrt(-diskr);
    roots_re[0] = -a / 2.0f;
    roots_im[0] = sqrtd / 2.0f;
    roots_re[1] = -a / 2.0f;
    roots_im[1] = -sqrtd / 2.0f;
  }
}

void oqs_quartic_solver(float coeff[5], out vec4 roots_re, out vec4 roots_im) {
  // USAGE:
  // This routine calculates the roots of the quartic equation
  // coeff[4]*x^4 + coeff[3]*x^3 + coeff[2]*x^2 + coeff[1]*x + coeff[0] = 0 
  // if coeff[4] != 0 
  // the four roots will be stored in the complex array roots[] 
  vec2 acx1, bcx1, ccx1, dcx1, acx, bcx, ccx, dcx, cdiskr, zx1, zx2, zxmax, zxmin, qroots_re, qroots_im;
  float l2m[12], d2m[12], res[12], resmin, bl311, dml3l3, err0 = 0.0f, err1 = 0.0f, aq1, bq1, cq1, dq1;
  float a, b, c, d, phi0, aq, bq, cq, dq, d2, d3, l1, l2, l3, errmin, errv[3], aqv[3], cqv[3], gamma, del2;
  int realcase[2], whichcase, k1, k, kmin, nsol;
  float rfactsq, rfact = 1.0f;

  a = coeff[3] / coeff[4];
  b = coeff[2] / coeff[4];
  c = coeff[1] / coeff[4];
  d = coeff[0] / coeff[4];
  oqs_calc_phi0(a, b, c, d, phi0, false);

  // simple polynomial rescaling
  if(isnan(phi0) || isinf(phi0)) {
    rfact = quart_rescal_fact;
    a /= rfact;
    rfactsq = rfact * rfact;
    b /= rfactsq;
    c /= rfactsq * rfact;
    d /= rfactsq * rfactsq;
    oqs_calc_phi0(a, b, c, d, phi0, true);
  }
  l1 = a / 2.0f;          // eq. (16)                                       
  l3 = b / 6.0f + phi0 / 2.0f;   // eq. (18)                                
  del2 = c - a * l3;     // defined just after eq. (27)                             
  nsol = 0;
  bl311 = 2.0f * b / 3.0f - phi0 - l1 * l1;   // This is d2 as defined in eq. (20) 
  dml3l3 = d - l3 * l3;            // dml3l3 is d3 as defined in eq. (15) with d2=0  

  // Three possible solutions for d2 and l2 (see eqs. (28) and discussion which follows)
  if(bl311 != 0.0f) {
    d2m[nsol] = bl311;
    l2m[nsol] = del2 / (2.0f * d2m[nsol]);
    res[nsol] = oqs_calc_err_ldlt(b, c, d, d2m[nsol], l1, l2m[nsol], l3);
    nsol++;
  }
  if(del2 != 0.0f) {
    l2m[nsol] = 2.0f * dml3l3 / del2;
    if(l2m[nsol] != 0.0f) {
      d2m[nsol] = del2 / (2.0f * l2m[nsol]);
      res[nsol] = oqs_calc_err_ldlt(b, c, d, d2m[nsol], l1, l2m[nsol], l3);
      nsol++;
    }

    d2m[nsol] = bl311;
    l2m[nsol] = 2.0f * dml3l3 / del2;
    res[nsol] = oqs_calc_err_ldlt(b, c, d, d2m[nsol], l1, l2m[nsol], l3);
    nsol++;
  }

  if(nsol == 0) {
    l2 = d2 = 0.0f;
  } else {
      // we select the (d2,l2) pair which minimizes errors
    for(k1 = 0; k1 < nsol; k1++) {
      if(k1 == 0 || res[k1] < resmin) {
        resmin = res[k1];
        kmin = k1;
      }
    }
    d2 = d2m[kmin];
    l2 = l2m[kmin];
  }
  whichcase = 0;
  if(d2 < 0.0f) {
      // Case I eqs. (37)-(40)
    gamma = sqrt(-d2);
    aq = l1 + gamma;
    bq = l3 + gamma * l2;

    cq = l1 - gamma;
    dq = l3 - gamma * l2;
    if(abs(dq) < abs(bq))
      dq = d / bq;
    else if(abs(dq) > abs(bq))
      bq = d / dq;
    if(abs(aq) < abs(cq)) {
      nsol = 0;
      if(dq != 0.0f) {
        aqv[nsol] = (c - bq * cq) / dq;    // see eqs. (47)
        errv[nsol] = oqs_calc_err_abc(a, b, c, aqv[nsol], bq, cq, dq);
        nsol++;
      }
      if(cq != 0.0f) {
        aqv[nsol] = (b - dq - bq) / cq;  // see eqs. (47)
        errv[nsol] = oqs_calc_err_abc(a, b, c, aqv[nsol], bq, cq, dq);
        nsol++;
      }
      aqv[nsol] = a - cq;                // see eqs. (47)
      errv[nsol] = oqs_calc_err_abc(a, b, c, aqv[nsol], bq, cq, dq);
      nsol++;
          // we select the value of aq (i.e. alpha1 in the manuscript) which minimizes errors
      for(k = 0; k < nsol; k++) {
        if(k == 0 || errv[k] < errmin) {
          kmin = k;
          errmin = errv[k];
        }
      }
      aq = aqv[kmin];
    } else {
      nsol = 0;
      if(bq != 0.0f) {
        cqv[nsol] = (c - aq * dq) / bq;              // see eqs. (53)
        errv[nsol] = oqs_calc_err_abc(a, b, c, aq, bq, cqv[nsol], dq);
        nsol++;
      }
      if(aq != 0.0f) {
        cqv[nsol] = (b - bq - dq) / aq;            // see eqs. (53)
        errv[nsol] = oqs_calc_err_abc(a, b, c, aq, bq, cqv[nsol], dq);
        nsol++;
      }
      cqv[nsol] = a - aq;                          // see eqs. (53)
      errv[nsol] = oqs_calc_err_abc(a, b, c, aq, bq, cqv[nsol], dq);
      nsol++;   
          // we select the value of cq (i.e. alpha2 in the manuscript) which minimizes errors
      for(k = 0; k < nsol; k++) {
        if(k == 0 || errv[k] < errmin) {
          kmin = k;
          errmin = errv[k];
        }
      }
      cq = cqv[kmin];
    }
    realcase[0] = 1;
  } else if(d2 > 0.0f) {
      // Case II eqs. (53)-(56)
    gamma = sqrt(d2);
    acx = vec2(l1, gamma);
    bcx = vec2(l3, gamma * l2);
    ccx = cx_conj(acx);
    dcx = cx_conj(bcx);
    realcase[0] = 0;
  } else
    realcase[0] = -1; // d2=0
  // Case III: d2 is 0 or approximately 0 (in this case check which solution is better)
  if(realcase[0] == -1 || (abs(d2) <= macheps * oqs_max3(abs(2.0f * b / 3.0f), abs(phi0), l1 * l1))) {
    d3 = d - l3 * l3;
    if(realcase[0] == 1)
      err0 = oqs_calc_err_abcd(a, b, c, d, aq, bq, cq, dq);
    else if(realcase[0] == 0)
      err0 = oqs_calc_err_abcd_cmplx(a, b, c, d, acx, bcx, ccx, dcx);
    if(d3 <= 0.0f) {
      realcase[1] = 1;
      aq1 = l1;
      bq1 = l3 + sqrt(-d3);
      cq1 = l1;
      dq1 = l3 - sqrt(-d3);
      if(abs(dq1) < abs(bq1))
        dq1 = d / bq1;
      else if(abs(dq1) > abs(bq1))
        bq1 = d / dq1;
      err1 = oqs_calc_err_abcd(a, b, c, d, aq1, bq1, cq1, dq1); // eq. (68)
    } else { // complex
      realcase[1] = 0;
      acx1 = vec2(l1, 0.0f);
      bcx1 = vec2(l3, sqrt(d3));
      ccx1 = vec2(l1, 0.0f);
      dcx1 = cx_conj(bcx1);
      err1 = oqs_calc_err_abcd_cmplx(a, b, c, d, acx1, bcx1, ccx1, dcx1);
    }
    if(realcase[0] == -1 || err1 < err0) {
      whichcase = 1; // d2 = 0
      if(realcase[1] == 1) {
        aq = aq1;
        bq = bq1;
        cq = cq1;
        dq = dq1;
      } else {
        acx = acx1;
        bcx = bcx1;
        ccx = ccx1;
        dcx = dcx1;
      }
    }
  }
  if(realcase[whichcase] == 1) {
    // if alpha1, beta1, alpha2 and beta2 are real first refine the coefficient through a Newton-Raphson
    oqs_NRabcd(a, b, c, d, aq, bq, cq, dq);      
    // finally calculate the roots as roots of p1(x) and p2(x) (see end of sec. 2.1)
    oqs_solve_quadratic(aq, bq, qroots_re, qroots_im);
    roots_re[0] = qroots_re[0];
    roots_im[0] = qroots_im[0];
    roots_re[1] = qroots_re[1];
    roots_im[1] = qroots_im[1];
    oqs_solve_quadratic(cq, dq, qroots_re, qroots_im);
    roots_re[2] = qroots_re[0];
    roots_im[2] = qroots_im[0];
    roots_re[3] = qroots_re[1];
    roots_im[3] = qroots_im[1];
  } else {
    // complex coefficients of p1 and p2
    if(whichcase == 0) { // d2!=0
      cdiskr = cx_mul(acx, acx) / 4.0f - bcx;               
      // calculate the roots as roots of p1(x) and p2(x) (see end of sec. 2.1)
      zx1 = -acx / 2.0f + cx_sqrt(cdiskr);
      zx2 = -acx / 2.0f - cx_sqrt(cdiskr);
      if(cx_abs(zx1) > cx_abs(zx2))
        zxmax = zx1;
      else
        zxmax = zx2;
      zxmin = cx_div(bcx, zxmax);
      roots_re[0] = zxmin.x;
      roots_im[0] = zxmin.y;
      roots_re[1] = zxmin.x;
      roots_im[1] = -zxmin.y;
      roots_re[2] = zxmax.x;
      roots_im[2] = zxmax.y;
      roots_re[3] = zxmax.x;
      roots_im[3] = -zxmax.y;
    } else { // d2 ~ 0
      // never gets here!
      cdiskr = cx_sqrt(cx_mul(acx, acx) - 4.0f * bcx);
      zx1 = -0.5f * (acx + cdiskr);
      zx2 = -0.5f * (acx - cdiskr);
      if(cx_abs(zx1) > cx_abs(zx2))
        zxmax = zx1;
      else
        zxmax = zx2;
      zxmin = cx_div(bcx, zxmax);
      roots_re[0] = zxmax.x;
      roots_im[0] = zxmax.y;
      roots_re[1] = zxmin.x;
      roots_im[1] = zxmin.y;
      cdiskr = cx_sqrt(cx_mul(ccx, ccx) - 4.0f * dcx);
      zx1 = -0.5f * (ccx + cdiskr);
      zx2 = -0.5f * (ccx - cdiskr);
      if(cx_abs(zx1) > cx_abs(zx2))
        zxmax = zx1;
      else
        zxmax = zx2;
      zxmin = cx_div(dcx, zxmax);
      roots_re[2] = zxmax.x;
      roots_im[2] = zxmax.y;
      roots_re[3] = zxmin.x;
      roots_im[3] = zxmin.y;
    }
  }

  if(rfact != 1.0f) {
    for(k = 0; k < 4; k++) roots_re[k] = roots_re[k] * rfact;
    roots_im[k] = roots_im[k] * rfact;
  }
}

float sphereIntersect(vec3 ro, vec3 rd, vec3 ce, float ra) {
  vec3 oc = ro - ce;
  float b = dot(oc, rd);
  float c = dot(oc, oc) - ra * ra;
  float h = b * b - c;
  if(h < 0.0f)
    return -1.0f; // no intersection
  h = sqrt(h);
  return -b - h;
}

float elipsoidIntersect(vec3 ro, vec3 rd, vec3 ra) {
  vec3 ocn = ro / ra;
  vec3 rdn = rd / ra;
  float a = dot(rdn, rdn);
  float b = dot(ocn, rdn);
  float c = dot(ocn, ocn);
  float h = b * b - a * (c - 1.0f);
  if(h < 0.0f)
    return -1.0f;
  h = sqrt(h);
  return (-b - h) / a;
}

vec3 elipsoidNormal(vec3 pos, vec3 ra) {
  return normalize(pos / ra);
}

float torusIntersect_old(vec3 ro, vec3 rd, vec2 tor) {
  float po = 1.0f;
  float Ra2 = tor.x * tor.x;
  float ra2 = tor.y * tor.y;
  float m = dot(ro, ro);
  float n = dot(ro, rd);
  float k = (m + Ra2 - ra2) / 2.0f;
  float k3 = n;
  float k2 = n * n - Ra2 * dot(rd.xy, rd.xy) + k;
  float k1 = n * k - Ra2 * dot(rd.xy, ro.xy);
  float k0 = k * k - Ra2 * dot(ro.xy, ro.xy);

  if(abs(k3 * (k3 * k3 - k2) + k1) < 0.01f) {
    po = -1.0f;
    float tmp = k1;
    k1 = k3;
    k3 = tmp;
    k0 = 1.0f / k0;
    k1 = k1 * k0;
    k2 = k2 * k0;
    k3 = k3 * k0;
  }

  float c2 = k2 * 2.0f - 3.0f * k3 * k3;
  float c1 = k3 * (k3 * k3 - k2) + k1;
  float c0 = k3 * (k3 * (c2 + 2.0f * k2) - 8.0f * k1) + 4.0f * k0;
  c2 /= 3.0f;
  c1 *= 2.0f;
  c0 /= 3.0f;
  float Q = c2 * c2 + c0;
  float R = c2 * c2 * c2 - 3.0f * c2 * c0 + c1 * c1;
  float h = R * R - Q * Q * Q;

  if(h >= 0.0f) {
    h = sqrt(h);
    float v = sign(R + h) * pow(abs(R + h), 1.0f / 3.0f); // cube root
    float u = sign(R - h) * pow(abs(R - h), 1.0f / 3.0f); // cube root
    vec2 s = vec2((v + u) + 4.0f * c2, (v - u) * sqrt(3.0f));
    float y = sqrt(0.5f * (length(s) + s.x));
    float x = 0.5f * s.y / y;
    float r = 2.0f * c1 / (x * x + y * y);
    float t1 = x - r - k3;
    t1 = (po < 0.0f) ? 2.0f / t1 : t1;
    float t2 = -x - r - k3;
    t2 = (po < 0.0f) ? 2.0f / t2 : t2;
    float t = 1e20f;
    if(t1 > 0.0f)
      t = t1;
    if(t2 > 0.0f)
      t = min(t, t2);
    if(t == 1e20f)
      t = -1.0f;
    return t;
  }

  float sQ = sqrt(Q);
  float w = sQ * cos(acos(-R / (sQ * Q)) / 3.0f);
  float d2 = -(w + c2);
  if(d2 < 0.0f)
    return -1.0f;
  float d1 = sqrt(d2);
  float h1 = sqrt(w - 2.0f * c2 + c1 / d1);
  float h2 = sqrt(w - 2.0f * c2 - c1 / d1);
  float t1 = -d1 - h1 - k3;
  t1 = (po < 0.0f) ? 2.0f / t1 : t1;
  float t2 = -d1 + h1 - k3;
  t2 = (po < 0.0f) ? 2.0f / t2 : t2;
  float t3 = d1 - h2 - k3;
  t3 = (po < 0.0f) ? 2.0f / t3 : t3;
  float t4 = d1 + h2 - k3;
  t4 = (po < 0.0f) ? 2.0f / t4 : t4;
  float t = 1e20f;
  if(t1 > 0.0f)
    t = t1;
  if(t2 > 0.0f)
    t = min(t, t2);
  if(t3 > 0.0f)
    t = min(t, t3);
  if(t4 > 0.0f)
    t = min(t, t4);
  if(t == 1e20f)
    t = -1.0f;
  return t;
}

int solveCubicEquation(float a, float b, float c, out vec3 solutions) {
  float a2 = a * a;
  float q = (a2 - 3.0f * b) / 9.0f;
  float r = (a * (2.0f * a2 - 9.0f * b) + 27.0f * c) / 54.0f;
  float r2 = r * r;
  float q3 = q * q * q;

  if(r2 < q3) {
    float t = r / sqrt(q3);
    if(t < -1.0f)
      t = -1.0f;
    if(t > 1.0f)
      t = 1.0f;
    t = acos(t);
    a /= 3.0f;
    q = -2.0f * sqrt(q);
    float x0 = q * cos(t / 3.0f) - a;
    float x1 = q * cos((t + 2.0f * M_PI) / 3.0f) - a;
    float x2 = q * cos((t - 2.0f * M_PI) / 3.0f) - a;
    solutions[0] = x0;
    solutions[1] = x1;
    solutions[2] = x2;
    return (3);
  } else {
    float A = -pow(abs(r) + sqrt(r2 - q3), 1.0f / 3.0f);
    if(r < 0.0f)
      A = -A;
    float B = (A == 0.0f) ? 0.0f : q / A;
    a /= 3.0f;
    float x0 = (A + B) - a;
    float x1 = -0.5f * (A + B) - a;
    float x2 = 0.5f * sqrt(3.0f) * (A - B);
    if(abs(x2) < EPS) {
      solutions[0] = x0;
      solutions[1] = x1;
      return (2);
    }
    solutions[0] = x0;
    return (1);
  }
}

bool isZero(float a, float b, float c, float d, float x) {
  return (abs(x * x * x * x + a * x * x * x + b * x * x + c * x + d) < 1e-2f);
//  return(true);
}

int solveQuarticEquation(float a, float b, float c, float d, out vec4 solutions) {
  float a3 = -b;
  float b3 = a * c - 4.0f * d;
  float c3 = -a * a * d - c * c + 4.0f * b * d;

  vec3 x3;
  int ns = solveCubicEquation(a3, b3, c3, x3);
  int k = 0;

  float q1, q2, p1, p2, D, sqD, y;

  y = x3[0];
  for(int i = 1; i < ns; i++) if(abs(x3[i]) > abs(y))
      y = x3[i];

  D = y * y - 4.0f * d;
  if(D < 0.0f) {
    D = 0.0f;
    y = 2.0f * sqrt(d);
  }
  if(abs(D) < EPS) {
    q1 = q2 = y * 0.5f;
    D = a * a - 4.0f * (b - y);
    if(abs(D) < EPS)
      p1 = p2 = a * 0.5f;
    else {
      sqD = sqrt(D);
      p1 = (a + sqD) * 0.5f;
      p2 = (a - sqD) * 0.5f;
    }
  } else {
    sqD = sqrt(D);
    q1 = (y + sqD) * 0.5f;
    q2 = (y - sqD) * 0.5f;
    p1 = (a * q1 - c) / (q1 - q2);
    p2 = (c - a * q2) / (q1 - q2);
  }

  D = p1 * p1 - 4.0f * q1;
  if(D >= 0.0f) {
    sqD = sqrt(D);
    float x0 = (-p1 + sqD) * 0.5f;
    float x1 = (-p1 - sqD) * 0.5f;
    if(isZero(a, b, c, d, x0))
      solutions[k++] = x0;
    if(isZero(a, b, c, d, x1))
      solutions[k++] = x1;
  }

  D = p2 * p2 - 4.0f * q2;
  if(D >= 0.0f) {
    sqD = sqrt(D);
    float x2 = (-p2 + sqD) * 0.5f;
    float x3 = (-p2 - sqD) * 0.5f;
    if(isZero(a, b, c, d, x2))
      solutions[k++] = x2;
    if(isZero(a, b, c, d, x3))
      solutions[k++] = x3;
  }
  return (k);
}

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

int quadratic(vec3 coeffs, out vec2 res) {
  return quadratic(coeffs[0], coeffs[1], coeffs[2], res);
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
  if(A == 0.0f) {
    X = 1e8f;
    A = B;
    b1 = C;
    c2 = D;
  } else if(D == 0.0f) {
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
    if(t > 0.0f)
      r = 1.324718f * max(r, sqrt(t));
    x0 = X - s * r;
    if(x0 != X) {
      for(int i = 0; i < 6; i++) {
        X = x0;
        eval(X, A, B, C, D, q, dq, b1, c2);
        if(dq == 0.0f)
          break;
        x0 -= (q / dq);
      }
      if(abs(A) * X * X > abs(D / X)) {
        c2 = -D / X;
        b1 = (c2 - C) / X;
      }
    }
  }
  res.x = X;
  return 1 + quadratic(A, b1, c2, res.yz);
}

// Special wrapper for cubic function for solving quartic.
// Find largest real root of x**3 + a*x**2 + b*x + c
// Assume c < 0
float qcubic(float a, float b, float c) {
  // c is always <= 0, but may be very
  // small, in which case we return an
  // approximation. Never return < 0.
  //assert(c <= 0.0);
  if(c == 0.0f)
    return 0.0f;

  vec3 res;
  int nroots = cubic(1.0f, a, b, c, res);
  if(nroots == 1)
    return res.x;
  else
    return max(res.x, max(res.y, res.z));
}

int quartic(vec4 coeffs, out vec4 res) {
  float c1 = coeffs[0];
  float c2 = coeffs[1];
  float c3 = coeffs[2];
  float c4 = coeffs[3];
  float alpha = 0.5f * c1;
  float A = c2 - alpha * alpha;
  float B = c3 - alpha * A;
  float a, b, beta, psi;
  psi = qcubic(2.0f * A - alpha * alpha, A * A + 2.0f * B * alpha - 4.0f * c4, -B * B);
  //assert(!isnan(psi));
  //assert(!isinf(psi));
  //assert(psi >= 0.0);
  a = sqrt(psi);
  beta = 0.5f * (A + psi);
  if(psi <= 0.0f) {
    b = sqrt(max(beta * beta - c4, 0.0f));
  } else {
    b = 0.5f * a * (alpha - B / psi);
  }
  int resn = quadratic(1.0f, alpha + a, beta + b, res.xy);
  vec2 tmp;
  if(quadratic(1.0f, alpha - a, beta - b, tmp) != 0) {
    res.zw = res.xy;
    res.xy = tmp;
    resn += 2;
  }
  return resn;
}

int quartic(float A, float B, float C, float D, float E, out vec4 roots) {
  int nroots;
  vec4 coeffs = vec4(B, C, D, E) / A;
  nroots = quartic(coeffs, roots);
  return nroots;
}

float torusIntersect(vec3 ro, vec3 rd, vec2 tor) {
  float Ra2 = tor.x * tor.x;
  float ra2 = tor.y * tor.y;
  float m = dot(ro, ro);
  float n = dot(ro, rd);
  float k = (m + Ra2 - ra2) / 2.0f;
  float k3 = n;
  float k2 = n * n - Ra2 * dot(rd.xy, rd.xy) + k;
  float k1 = n * k - Ra2 * dot(rd.xy, ro.xy);
  float k0 = k * k - Ra2 * dot(ro.xy, ro.xy);
  float b = 4.0f * k3;
  float c = 4.0f * k2;
  float d = 8.0f * k1;
  float e = 4.0f * k0;

  float t = 1e20f;

/*
    vec4 roots;

    int nroots = quartic(1.0f,b,c,d,e,roots);
    int nroots = solveQuarticEquation(b,c,d,e,roots);
    
    for(int i=0;i<nroots;i++) {
        if (roots[i] < t) t = roots[i];
    }
*/
  float coeff[5];
  vec4 roots_re, roots_im;

  coeff[4] = 1.0f;
  coeff[3] = b;
  coeff[2] = c;
  coeff[1] = d;
  coeff[0] = e;
  oqs_quartic_solver(coeff, roots_re, roots_im);

  for(int i = 0; i < 4; i++) {
    if(roots_im[i] != 0.0f)
      continue;
    if(roots_re[i] < t)
      t = roots_re[i];
  }

  if(t == 1e20f)
    return (-1.0f);
  return (t);
}

vec3 torusNormal(vec3 pos, vec2 tor) {
  return normalize(pos * (dot(pos, pos) - tor.y * tor.y - tor.x * tor.x * vec3(1.0f, 1.0f, -1.0f)));
}

float roundedboxIntersect(vec3 ro, vec3 rd, vec3 size, float rad) {
    // bounding box
  vec3 m = 1.0f / rd;
  vec3 n = m * ro;
  vec3 k = abs(m) * (size + rad);
  vec3 t1 = -n - k;
  vec3 t2 = -n + k;
  float tN = max(max(t1.x, t1.y), t1.z);
  float tF = min(min(t2.x, t2.y), t2.z);
  if(tN > tF || tF < 0.0f)
    return -1.0f;
  float t = tN;

    // convert to first octant
  vec3 pos = ro + t * rd;
  vec3 s = sign(pos);
  ro *= s;
  rd *= s;
  pos *= s;

    // faces
  pos -= size;
  pos = max(pos.xyz, pos.yzx);
  if(min(min(pos.x, pos.y), pos.z) < 0.0f)
    return t;

    // some precomputation
  vec3 oc = ro - size;
  vec3 dd = rd * rd;
  vec3 oo = oc * oc;
  vec3 od = oc * rd;
  float ra2 = rad * rad;

  t = 1e20f;

    // corner
  float b = od.x + od.y + od.z;
  float c = oo.x + oo.y + oo.z - ra2;
  float h = b * b - c;
  if(h > 0.0f)
    t = -b - sqrt(h);

    // edge X
  {
    float a = dd.y + dd.z;
    float b = od.y + od.z;
    float c = oo.y + oo.z - ra2;
    float h = b * b - a * c;
    if(h > 0.0f) {
      h = (-b - sqrt(h)) / a;
      if(h > 0.0f && h < t && abs(ro.x + rd.x * h) < size.x)
        t = h;
    }
  }
    // edge Y
  {
    float a = dd.z + dd.x;
    float b = od.z + od.x;
    float c = oo.z + oo.x - ra2;
    float h = b * b - a * c;
    if(h > 0.0f) {
      h = (-b - sqrt(h)) / a;
      if(h > 0.0f && h < t && abs(ro.y + rd.y * h) < size.y)
        t = h;
    }
  }
    // edge Z
  {
    float a = dd.x + dd.y;
    float b = od.x + od.y;
    float c = oo.x + oo.y - ra2;
    float h = b * b - a * c;
    if(h > 0.0f) {
      h = (-b - sqrt(h)) / a;
      if(h > 0.0f && h < t && abs(ro.z + rd.z * h) < size.z)
        t = h;
    }
  }
  if(t > 1e19f)
    t = -1.0f;

  return t;
}

// normal of a rounded box
vec3 roundedboxNormal(vec3 pos, vec3 siz, float rad) {
  return sign(pos) * normalize(max(abs(pos) - siz, 0.0f));
}

// Goursat's Surface
float goursatIntersect(vec3 ro, vec3 rd, float ka, float kb) {
  float po = 1.0f;
  vec3 rd2 = rd * rd;
  vec3 rd3 = rd2 * rd;
  vec3 ro2 = ro * ro;
  vec3 ro3 = ro2 * ro;
  float k4 = dot(rd2, rd2);
  float k3 = dot(ro, rd3);
  float k2 = dot(ro2, rd2) - kb / 6.0f;
  float k1 = dot(ro3, rd) - kb * dot(rd, ro) / 2.0f;
  float k0 = dot(ro2, ro2) + ka - kb * dot(ro, ro);
  k3 /= k4;
  k2 /= k4;
  k1 /= k4;
  k0 /= k4;
  float c2 = k2 - k3 * (k3);
  float c1 = k1 + k3 * (2.0f * k3 * k3 - 3.0f * k2);
  float c0 = k0 + k3 * (k3 * (c2 + k2) * 3.0f - 4.0f * k1);

  if(abs(c1) < 0.1f * abs(c2)) {
    po = -1.0f;
    float tmp = k1;
    k1 = k3;
    k3 = tmp;
    k0 = 1.0f / k0;
    k1 = k1 * k0;
    k2 = k2 * k0;
    k3 = k3 * k0;
    c2 = k2 - k3 * (k3);
    c1 = k1 + k3 * (2.0f * k3 * k3 - 3.0f * k2);
    c0 = k0 + k3 * (k3 * (c2 + k2) * 3.0f - 4.0f * k1);
  }

  c0 /= 3.0f;
  float Q = c2 * c2 + c0;
  float R = c2 * c2 * c2 - 3.0f * c0 * c2 + c1 * c1;
  float h = R * R - Q * Q * Q;

  if(h > 0.0f) { // 2 intersections
    h = sqrt(h);
    float s = sign(R + h) * pow(abs(R + h), 1.0f / 3.0f); // cube root
    float u = sign(R - h) * pow(abs(R - h), 1.0f / 3.0f); // cube root
    float x = s + u + 4.0f * c2;
    float y = s - u;
    float ks = x * x + y * y * 3.0f;
    float k = sqrt(ks);
    float t = -0.5f * po * abs(y) * sqrt(6.0f / (k + x)) - 2.0f * c1 * (k + x) / (ks + x * k) - k3;
    return (po < 0.0f) ? 1.0f / t : t;
  }

    // 4 intersections
  float sQ = sqrt(Q);
  float w = sQ * cos(acos(-R / (sQ * Q)) / 3.0f);
  float d2 = -w - c2;
  if(d2 < 0.0f)
    return -1.0f; //no intersection
  float d1 = sqrt(d2);
  float h1 = sqrt(w - 2.0f * c2 + c1 / d1);
  float h2 = sqrt(w - 2.0f * c2 - c1 / d1);
  float t1 = -d1 - h1 - k3;
  t1 = (po < 0.0f) ? 1.0f / t1 : t1;
  float t2 = -d1 + h1 - k3;
  t2 = (po < 0.0f) ? 1.0f / t2 : t2;
  float t3 = d1 - h2 - k3;
  t3 = (po < 0.0f) ? 1.0f / t3 : t3;
  float t4 = d1 + h2 - k3;
  t4 = (po < 0.0f) ? 1.0f / t4 : t4;
  float t = 1e20f;
  if(t1 > 0.0f)
    t = t1;
  if(t2 > 0.0f)
    t = min(t, t2);
  if(t3 > 0.0f)
    t = min(t, t3);
  if(t4 > 0.0f)
    t = min(t, t4);
  return t;
}

vec3 goursatNormal(vec3 pos, float ka, float kb) {
  return normalize(4.0f * pos * pos * pos - 2.0f * pos * kb);
}

// Clebsch's Surface
float clebschIntersect(vec3 ro, vec3 rd) {

  float coeff[5];
  vec4 roots_re, roots_im;
  float t = 1e20f;

  coeff[4] = 81.0f*rd.x*rd.x*rd.x - 189.0f*rd.x*rd.x*rd.y - 189.0f*rd.x*rd.x*rd.z - 189.0f*rd.x*rd.y*rd.y + 54.0f*rd.x*rd.y*rd.z 
            - 189.0f*rd.x*rd.z*rd.z + 81.0f*rd.y*rd.y*rd.y - 189.0f*rd.y*rd.y*rd.z - 189.0f*rd.y*rd.z*rd.z + 81.0f*rd.z*rd.z*rd.z;
  coeff[3] = 243.0f*ro.x*rd.x*rd.x - 378.0f*ro.x*rd.x*rd.y - 378.0f*ro.x*rd.x*rd.z - 189.0f*ro.x*rd.y*rd.y + 54.0f*ro.x*rd.y*rd.z 
            - 189.0f*ro.x*rd.z*rd.z - 189.0f*ro.y*rd.x*rd.x - 378.0f*ro.y*rd.x*rd.y + 54.0f*ro.y*rd.x*rd.z + 243.0f*ro.y*rd.y*rd.y 
            - 378.0f*ro.y*rd.y*rd.z - 189.0f*ro.y*rd.z*rd.z - 189.0f*ro.z*rd.x*rd.x + 54.0f*ro.z*rd.x*rd.y - 378.0f*ro.z*rd.x*rd.z 
            - 189.0f*ro.z*rd.y*rd.y - 378.0f*ro.z*rd.y*rd.z + 243.0f*ro.z*rd.z*rd.z - 9.0f*rd.x*rd.x + 126.0f*rd.x*rd.y + 126.0f*rd.x*rd.z 
            - 9.0f*rd.y*rd.y + 126.0f*rd.y*rd.z - 9.0f*rd.z*rd.z;
  coeff[2] = 243.0f*ro.x*ro.x*rd.x - 189.0f*ro.x*ro.x*rd.y - 189.0f*ro.x*ro.x*rd.z - 378.0f*ro.x*ro.y*rd.x - 378.0f*ro.x*ro.y*rd.y 
             + 54.0f*ro.x*ro.y*rd.z - 378.0f*ro.x*ro.z*rd.x + 54.0f*ro.x*ro.z*rd.y - 378.0f*ro.x*ro.z*rd.z - 18.0f*ro.x*rd.x + 126.0f*ro.x*rd.y 
             + 126.0f*ro.x*rd.z - 189.0f*ro.y*ro.y*rd.x + 243.0f*ro.y*ro.y*rd.y - 189.0f*ro.y*ro.y*rd.z + 54.0f*ro.y*ro.z*rd.x 
             - 378.0f*ro.y*ro.z*rd.y - 378.0f*ro.y*ro.z*rd.z + 126.0f*ro.y*rd.x - 18.0f*ro.y*rd.y + 126.0f*ro.y*rd.z - 189.0f*ro.z*ro.z*rd.x 
             - 189.0f*ro.z*ro.z*rd.y + 243.0f*ro.z*ro.z*rd.z + 126.0f*ro.z*rd.x + 126.0f*ro.z*rd.y - 18.0f*ro.z*rd.z - 9.0f*rd.x - 9.0f*rd.y 
             - 9.0f*rd.z;
  coeff[1] = 81.0f*ro.x*ro.x*ro.x - 189.0f*ro.x*ro.x*ro.y - 189.0f*ro.x*ro.x*ro.z - 9.0f*ro.x*ro.x - 189.0f*ro.x*ro.y*ro.y + 54.0f*ro.x*ro.y*ro.z
             + 126.0f*ro.x*ro.y - 189.0f*ro.x*ro.z*ro.z + 126.0f*ro.x*ro.z - 9.0f*ro.x + 81.0f*ro.y*ro.y*ro.y - 189.0f*ro.y*ro.y*ro.z 
             - 9.0f*ro.y*ro.y - 189.0f*ro.y*ro.z*ro.z + 126.0f*ro.y*ro.z - 9.0f*ro.y + 81.0f*ro.z*ro.z*ro.z - 9.0f*ro.z*ro.z - 9.0f*ro.z + 1.0f;
  coeff[0] = 0.0f;
  oqs_quartic_solver(coeff, roots_re, roots_im);

  for(int i = 0; i < 4; i++) {
    if (roots_im[i] != 0.0f)
      continue;
    if (abs(roots_re[i]) < 1e-4f)
      continue;
    if (roots_re[i] < t) {
      vec3 p = ro + roots_re[i] * rd;
      if (dot(p,p) > 1.0f)
        continue;
      t = roots_re[i];
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
  return(min(res[0],res[1]));
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

// Kummer Surface
float kummerIntersect(vec3 ro, vec3 rd) {

  float coeff[5];
  vec4 roots_re, roots_im;
  float t = 1e20f;
  float mu2 = 1.69f;
  float lam = (3.0f*mu2-1.0f)/(3.0f-mu2);

  float a1 = ro.x;
  float a1_2 = a1*a1;
  float a1_3 = a1_2*a1;
  float a1_4 = a1_3*a1;
  float a2 = ro.y;
  float a2_2 = a2*a2;
  float a2_3 = a2_2*a2;
  float a2_4 = a2_3*a2;
  float a3 = ro.z;
  float a3_2 = a3*a3;
  float a3_3 = a3_2*a3;
  float a3_4 = a3_3*a3;

  float d1 = rd.x;
  float d1_2 = d1*d1;
  float d1_3 = d1_2*d1;
  float d1_4 = d1_3*d1;
  float d2 = rd.y;
  float d2_2 = d2*d2;
  float d2_3 = d2_2*d2;
  float d2_4 = d2_3*d2;
  float d3 = rd.z;
  float d3_2 = d3*d3;
  float d3_3 = d3_2*d3;
  float d3_4 = d3_3*d3;

  
  coeff[4] = -4.0f*d1_2*d2_2*lam + 2.0f*d1_2*d2_2 + 2.0f*d1_2*d3_2*lam + 2.0f*d1_2*d3_2 + d1_4 + 2.0f*d2_2*d3_2*lam + 2.0f*d2_2*d3_2 + d2_4 - d3_4*lam + d3_4;
  coeff[3] = -8.0f*a1*d1*d2_2*lam + 4.0f*a1*d1*d2_2 + 4.0f*a1*d1*d3_2*lam + 4.0f*a1*d1*d3_2 + 4.0f*a1*d1_3 - 8.0f*a2*d1_2*d2*lam + 4.0f*a2*d1_2*d2 + 4.0f*a2*d2*d3_2*lam 
             + 4.0f*a2*d2*d3_2 + 4.0f*a2*d2_3 + 4.0f*a3*d1_2*d3*lam + 4.0f*a3*d1_2*d3 + 4.0f*a3*d2_2*d3*lam + 4.0f*a3*d2_2*d3 - 4.0f*a3*d3_3*lam + 4.0f*a3*d3_3 
             + 4.0f*d1_2*d3*lam - 4.0f*d2_2*d3*lam;
  coeff[2] = -16.0f*a1*a2*d1*d2*lam + 8.0f*a1*a2*d1*d2 + 8.0f*a1*a3*d1*d3*lam + 8.0f*a1*a3*d1*d3 + 8.0f*a1*d1*d3*lam + 6.0f*a1_2*d1_2 - 4.0f*a1_2*d2_2*lam 
            + 2.0f*a1_2*d2_2 + 2.0f*a1_2*d3_2*lam + 2.0f*a1_2*d3_2 + 8.0f*a2*a3*d2*d3*lam + 8.0f*a2*a3*d2*d3 - 8.0f*a2*d2*d3*lam - 4.0f*a2_2*d1_2*lam 
            + 2.0f*a2_2*d1_2 + 6.0f*a2_2*d2_2 + 2.0f*a2_2*d3_2*lam + 2.0f*a2_2*d3_2 + 4.0f*a3*d1_2*lam - 4.0f*a3*d2_2*lam + 2.0f*a3_2*d1_2*lam + 2.0f*a3_2*d1_2 
            + 2.0f*a3_2*d2_2*lam + 2.0f*a3_2*d2_2 - 6.0f*a3_2*d3_2*lam + 6.0f*a3_2*d3_2 + 2.0f*d1_2*lam - 2.0f*d1_2*mu2 + 2.0f*d2_2*lam - 2.0f*d2_2*mu2 
            + 2.0f*d3_2*lam - 2.0f*d3_2*mu2;
  coeff[1] = -8.0f*a1*a2_2*d1*lam + 4.0f*a1*a2_2*d1 + 8.0f*a1*a3*d1*lam + 4.0f*a1*a3_2*d1*lam + 4.0f*a1*a3_2*d1 + 4.0f*a1*d1*lam - 4.0f*a1*d1*mu2 
             - 8.0f*a1_2*a2*d2*lam + 4.0f*a1_2*a2*d2 + 4.0f*a1_2*a3*d3*lam + 4.0f*a1_2*a3*d3 + 4.0f*a1_2*d3*lam + 4.0f*a1_3*d1 - 8.0f*a2*a3*d2*lam 
             + 4.0f*a2*a3_2*d2*lam + 4.0f*a2*a3_2*d2 + 4.0f*a2*d2*lam - 4.0f*a2*d2*mu2 + 4.0f*a2_2*a3*d3*lam + 4.0f*a2_2*a3*d3 - 4.0f*a2_2*d3*lam 
             + 4.0f*a2_3*d2 + 4.0f*a3*d3*lam - 4.0f*a3*d3*mu2 - 4.0f*a3_3*d3*lam + 4.0f*a3_3*d3;
  coeff[0] = -4.0f*a1_2*a2_2*lam + 2.0f*a1_2*a2_2 + 4.0f*a1_2*a3*lam + 2.0f*a1_2*a3_2*lam + 2.0f*a1_2*a3_2 + 2.0f*a1_2*lam - 2.0f*a1_2*mu2 + a1_4 
             - 4.0f*a2_2*a3*lam + 2.0f*a2_2*a3_2*lam + 2.0f*a2_2*a3_2 + 2.0f*a2_2*lam - 2.0f*a2_2*mu2 + a2_4 + 2.0f*a3_2*lam - 2.0f*a3_2*mu2 - a3_4*lam 
             + a3_4 - lam + mu2*mu2;

  oqs_quartic_solver(coeff, roots_re, roots_im);

  for(int i = 0; i < 4; i++) {
    if (roots_im[i] != 0.0f)
      continue;
    if (roots_re[i] < t) {
      vec3 p = ro + roots_re[i] * rd;
      if (dot(p,p) > 3.0f)
        continue;
      t = roots_re[i];
    }
  }

  if(t == 1e20f)
    return (-1.0f);
  return (t);
}

vec3 kummerNormal(vec3 p) {
  vec3 n;
  float mu2 = 1.69f;
  float lam = (3.0f*mu2-1.0f)/(3.0f-mu2);

  n.x = -8.0f*lam*p.x*p.y*p.y + 4.0f*lam*p.x*p.z*p.z + 8.0f*lam*p.x*p.z + 4.0f*lam*p.x - 4.0f*mu2*p.x + 4.0f*p.x*p.x*p.x + 4.0f*p.x*p.y*p.y + 4.0f*p.x*p.z*p.z;
  n.y = -8.0f*lam*p.x*p.x*p.y + 4.0f*lam*p.y*p.z*p.z - 8.0f*lam*p.y*p.z + 4.0f*lam*p.y - 4.0f*mu2*p.y + 4.0f*p.x*p.x*p.y + 4.0f*p.y*p.y*p.y + 4.0f*p.y*p.z*p.z;
  n.z = 4.0f*lam*p.x*p.x*p.z + 4.0f*lam*p.x*p.x + 4.0f*lam*p.y*p.y*p.z - 4.0f*lam*p.y*p.y - 4.0f*lam*p.z*p.z*p.z + 4.0f*lam*p.z - 4.0f*mu2*p.z + 4.0f*p.x*p.x*p.z 
        + 4.0f*p.y*p.y*p.z + 4.0f*p.z*p.z*p.z;
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
      float r = 1.0f;
      vec3 ce = vec3(0.0f, 0.0f, 0.0f);
      lambda = sphereIntersect(ro, rd, ce, r);
      if(lambda < 0.0f)
        discard;
      p = ro + lambda * rd;
      n = p;
      break;
    case 2:
      vec3 ra = vec3(1.0f, 0.5f, 0.5f);
      lambda = elipsoidIntersect(ro, rd, ra);
      if(lambda < 0.0f)
        discard;
      p = ro + lambda * rd;
      n = elipsoidNormal(p, ra);
      break;
    case 3:
      vec2 tor = vec2(0.75f, 0.2f);
      lambda = torusIntersect(ro, rd, tor);
//          lambda = torusIntersect_old(ro, rd, tor);
      if(lambda < 0.0f)
        discard;
      p = ro + lambda * rd;
      n = torusNormal(p, tor);
      break;
    case 6:
      vec3 size = vec3(0.7f, 0.5f, 0.3f);
      float rad = 0.2f;
      lambda = roundedboxIntersect(ro, rd, size, rad);
      if(lambda < 0.0f)
        discard;
      p = ro + lambda * rd;
      n = roundedboxNormal(p, size, rad);
      break;
    case 4:
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
    case 5:
      lambda = kummerIntersect(ro, rd);
      if(lambda < 0.0f)
        discard;
      p = ro + lambda * rd;
      n = kummerNormal(p);
      break;
    case 7:
      float ka = 0.1f;
      float kb = 0.5f;
      lambda = goursatIntersect(ro, rd, ka, kb);
      if(lambda < 0.0f)
        discard;
      p = ro + lambda * rd;
      n = goursatNormal(p, ka, kb);
      break;
  }
  fColor = abs(dot(rd, n)) * col;
}
