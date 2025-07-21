#version 300 es
precision highp float;

uniform vec3 u_cameraOrigin;
uniform mat4 u_cameraMatrix;
uniform vec2 u_resolution;

out vec4 fragColor;

vec3 getRayDirection(vec2 fragCoord, vec2 resolution, mat4 invCam) {
    vec2 ndc = (fragCoord / resolution) * 2.0 - 1.0;
    vec4 clip = vec4(ndc, -1.0, 1.0);
    vec4 world = invCam * clip;
    return normalize(world.xyz / world.w - u_cameraOrigin);
}

// Ray-Zylinder-Schnitt (analytisch, unendlich langer Zylinder)
bool intersectCylinder(vec3 o, vec3 v, vec3 a, vec3 b, float r, out float t) {
    vec3 oa = o - a;
    vec3 bxv = cross(b, v);
    vec3 bxoa = cross(b, oa);

    float A = dot(bxv, bxv);
    float B = 2.0 * dot(bxv, bxoa);
    float C = dot(bxoa, bxoa) - dot(b, b) * r * r;

    float disc = B * B - 4.0 * A * C;
    if (disc < 0.0) return false;

    float sqrtDisc = sqrt(disc);
    float t1 = (-B - sqrtDisc) / (2.0 * A);
    float t2 = (-B + sqrtDisc) / (2.0 * A);

    t = (t1 > 0.0) ? t1 : ((t2 > 0.0) ? t2 : -1.0);
    return (t > 0.0);
}

// Normale am Zylinder (Gradient der impliziten Funktion)
vec3 cylinderNormal(vec3 p, vec3 a, vec3 b) {
    vec3 pa = p - a;
    vec3 grad = 2.0 * cross(b, cross(b, pa));
    return normalize(grad);
}

void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec3 ro = u_cameraOrigin;
    vec3 rd = getRayDirection(fragCoord, u_resolution, u_cameraMatrix);

    // Zylinderparameter
    vec3 a = vec3(0.0, 0.0, 0.0);  // Aufpunkt
    vec3 b = vec3(0.0, 1.0, 0.0);  // Richtungsvektor
    float r = 0.5;

    float t;
    if (intersectCylinder(ro, rd, a, b, r, t)) {
        vec3 hitPos = ro + t * rd;
        vec3 normal = cylinderNormal(hitPos, a, b);

        // einfache Beleuchtung
        vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
        float diff = max(dot(normal, lightDir), 0.0);
        vec3 baseColor = vec3(1.0, 0.6, 0.3);
        fragColor = vec4(baseColor * diff, 1.0);
    } else {
        fragColor = vec4(0.0); // kein Treffer
    }
}
