#version 300 es
precision highp float;

in vec3 vPosition;
out vec4 outColor;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform float coeffs[20];

// ==========================
// 1. Ray Rekonstruktion
// ==========================

vec3 getRayOrigin() {
    return vec3(inverse(uModelViewMatrix) * vec4(0.0, 0.0, 0.0, 1.0));
}

vec3 getRayDirection(vec3 fragPos) {
    vec3 worldPos = vec3(inverse(uModelViewMatrix) * vec4(fragPos, 1.0));
    return normalize(worldPos - getRayOrigin());
}

// ==========================
// 2. Solver für t
// ==========================

float solve_cubic(float a, float b, float c, float d) {
    if (abs(a) < 1e-6) {
        // Degeneriert zu quadratischer Gleichung
        float delta = c * c - 4.0 * b * d;
        if (delta < 0.0) return -1.0;
        float t1 = (-c + sqrt(delta)) / (2.0 * b);
        float t2 = (-c - sqrt(delta)) / (2.0 * b);
        return min(t1, t2);
    }

    float A = b / a;
    float B = c / a;
    float C = d / a;

    float Q = (3.0*B - A*A) / 9.0;
    float R = (9.0*A*B - 27.0*C - 2.0*A*A*A) / 54.0;
    float D = Q*Q*Q + R*R;

    float t = -1.0;
    if (D >= 0.0) {
        float sqrtD = sqrt(D);
        float S = sign(R + sqrtD) * pow(abs(R + sqrtD), 1.0/3.0);
        float T = sign(R - sqrtD) * pow(abs(R - sqrtD), 1.0/3.0);
        float root = -A / 3.0 + (S + T);
        if (root > 0.0) t = root;
    } else {
        float theta = acos(R / sqrt(-Q*Q*Q));
        float sqrtQ = sqrt(-Q);
        for (int k = 0; k < 3; ++k) {
            float root = 2.0 * sqrtQ * cos((theta + float(k) * 2.0 * 3.14159265359) / 3.0) - A / 3.0;
            if (root > 0.0 && (t < 0.0 || root < t)) {
                t = root;
            }
        }
    }
    return t;
}

// ==========================
// 3. Ray-Koeffizienten berechnen
// ==========================

void computeRayCoeffs(vec3 a, vec3 d, out float c3, out float c2, out float c1, out float c0) {
    float dx = d.x, dy = d.y, dz = d.z;
    float ax = a.x, ay = a.y, az = a.z;
    float[20] c = coeffs;

    c3 =
        c[0]*pow(dx,3.0) + c[1]*pow(dy,3.0) + c[2]*pow(dz,3.0) +
        c[3]*dx*dx*dy + c[4]*dx*dx*dz + c[5]*dy*dy*dz +
        c[6]*dy*dz*dz + c[7]*dx*dy*dy + c[8]*dx*dz*dz +
        c[9]*dx*dy*dz;

    c2 =
        ax*c[8]*dz*dz + ax*c[9]*dy*dz + ax*c[7]*dy*dy + 2.0*ax*c[4]*dx*dz +
        2.0*ax*c[3]*dx*dy + 3.0*ax*c[0]*dx*dx + ay*c[6]*dz*dz +
        2.0*ay*c[5]*dy*dz + 3.0*ay*c[1]*dy*dy + ay*c[9]*dx*dz +
        2.0*ay*c[7]*dx*dy + ay*c[3]*dx*dx + 3.0*az*c[2]*dz*dz +
        2.0*az*c[6]*dy*dz + az*c[5]*dy*dy + 2.0*az*c[8]*dx*dz +
        az*c[9]*dx*dy + az*c[4]*dx*dx + c[12]*dz*dz +
        c[14]*dy*dy + c[17]*dx*dz + c[19]*dx*dy + c[10]*dx*dx;

    c1 =
        pow(ax,2.0)*c[4]*dz + pow(ax,2.0)*c[3]*dy + 3.0*pow(ax,2.0)*c[0]*dx +
        ax*ay*c[9]*dz + 2.0*ax*ay*c[7]*dy + 2.0*ax*ay*c[3]*dx +
        2.0*ax*az*c[8]*dz + ax*az*c[9]*dy + 2.0*ax*az*c[4]*dx +
        ax*c[16]*dz + ax*c[18]*dy + 2.0*ax*c[10]*dx +
        pow(ay,2.0)*c[5]*dz + 3.0*pow(ay,2.0)*c[1]*dy +
        ay*ay*c[7]*dx + 2.0*ay*az*c[6]*dz + 2.0*ay*az*c[5]*dy +
        ay*az*c[9]*dx + ay*c[13]*dz + 2.0*ay*c[14]*dy +
        ay*c[19]*dx + 3.0*pow(az,2.0)*c[2]*dz + pow(az,2.0)*c[6]*dy +
        pow(az,2.0)*c[8]*dx + 2.0*az*c[12]*dz + az*c[17]*dy +
        az*c[18]*dx + c[11]*dz + c[13]*dy + c[15]*dx;

    c0 =
        pow(ax,3.0)*c[0] + pow(ax,2.0)*ay*c[3] + pow(ax,2.0)*az*c[4] + pow(ax,2.0)*c[10] +
        ax*pow(ay,2.0)*c[7] + ax*ay*az*c[9] + ax*ay*c[19] + ax*pow(az,2.0)*c[8] +
        ax*az*c[17] + ax*c[15] + pow(ay,3.0)*c[1] + pow(ay,2.0)*az*c[5] +
        pow(ay,2.0)*c[14] + ay*pow(az,2.0)*c[6] + ay*az*c[13] +
        ay*c[13] + pow(az,3.0)*c[2] + pow(az,2.0)*c[12] + az*c[11] + c[16];
}

// ==========================
// 4. Fragment-Hauptfunktion
// ==========================

void main() {
    vec3 ro = getRayOrigin();
    vec3 rd = getRayDirection(vPosition);

    float c3, c2, c1, c0;
    computeRayCoeffs(ro, rd, c3, c2, c1, c0);

    float t = solve_cubic(c3, c2, c1, c0);

    if (t > 0.0) {
        vec3 p = ro + t * rd;
        outColor = vec4(p * 0.5 + 0.5, 1.0);
    } else {
        outColor = vec4(1.0);
    }
}
