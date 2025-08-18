import numpy as np

# ---------------- Utils ----------------

def _unit(v: np.ndarray) -> np.ndarray:
    v = np.asarray(v, dtype=float)
    n = np.linalg.norm(v)
    if n == 0:
        raise ValueError("Nullvektor kann nicht normiert werden.")
    return v / n

def _rotation_a_to_b(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    """
    3x3-Rotationsmatrix R mit R @ a = b (a,b werden intern normiert).
    Behandelt den 180°-Sonderfall stabil.
    """
    a = _unit(a)
    b = _unit(b)
    v = np.cross(a, b)
    c = float(np.dot(a, b))
    s = np.linalg.norm(v)
    I = np.eye(3)

    if s < 1e-15:
        if c > 0.0:
            return I
        # 180°: wähle beliebige Achse ⟂ a
        if abs(a[0]) < abs(a[1]) and abs(a[0]) < abs(a[2]):
            tmp = np.array([1.0, 0.0, 0.0])
        elif abs(a[1]) < abs(a[2]):
            tmp = np.array([0.0, 1.0, 0.0])
        else:
            tmp = np.array([0.0, 0.0, 1.0])
        u = _unit(np.cross(a, tmp))
        return 2.0 * np.outer(u, u) - I

    vx = np.array([
        [0,     -v[2],  v[1]],
        [v[2],   0,    -v[0]],
        [-v[1],  v[0],  0   ]
    ])
    R = I + vx + vx @ vx * ((1.0 - c) / (s * s))
    return R

# ---------------- Torus: Normal im lokalen System (Achse = z) ----------------

def _torus_normal_local(p_local: np.ndarray, R: float, r: float, eps: float = 1e-14) -> np.ndarray:
    """
    Normalenvektor (lokale Koordinaten, Torus-Achse = z) am Punkt p_local.
    Rückgabe ist normiert und zeigt nach außen (Gradient von F=0).
    """
    x, y, z = map(float, p_local)
    # F = (x^2+y^2+z^2 + R^2 - r^2)^2 - 4 R^2 (x^2 + y^2)
    s = x*x + y*y + z*z + R*R - r*r
    # ∇F = [4x(s-2R^2), 4y(s-2R^2), 4z s] -> Faktor 4 ist egal (wird normiert)
    n = np.array([(s - 2*R*R) * x, (s - 2*R*R) * y, s * z], dtype=float)
    ln = np.linalg.norm(n)
    if ln < eps:
        # Fallback über Geometrie: Vektor vom Rohrkreiszentrum zum Punkt
        q = np.hypot(x, y)
        if q < eps:
            n = np.array([0.0, 0.0, np.sign(z) if abs(z) > eps else 1.0])
        else:
            center = np.array([R * x / q, R * y / q, 0.0])
            n = np.array([x, y, z]) - center
    return n / np.linalg.norm(n)

def _orient_normal(n_world: np.ndarray, p_world: np.ndarray,
                   face_towards_ray_dir: np.ndarray | None = None,
                   face_towards_point: np.ndarray | None = None,
                   face_towards_dir: np.ndarray | None = None) -> np.ndarray:
    """
    Optionale Umorientierung der Normale:
    - face_towards_ray_dir: flippt, falls n ⋅ D > 0 (zur Ray-Richtung hin schauen)
    - face_towards_point:   flippt, falls n ⋅ (P_target - p) > 0 (zur Kamera hin)
    - face_towards_dir:     flippt, falls n ⋅ dir > 0 (zur gegebenen Richtung hin)
    Es wird die erste angegebene Option angewandt.
    """
    n = np.asarray(n_world, float)
    p = np.asarray(p_world, float)
    if face_towards_ray_dir is not None:
        D = np.asarray(face_towards_ray_dir, float)
        if np.dot(n, D) > 0.0:
            n = -n
    elif face_towards_point is not None:
        tgt = np.asarray(face_towards_point, float)
        if np.dot(n, tgt - p) > 0.0:
            n = -n
    elif face_towards_dir is not None:
        d = np.asarray(face_towards_dir, float)
        if np.dot(n, d) > 0.0:
            n = -n
    return n

# ---------------- Hauptfunktion: Schnitt + Normalen ----------------

def line_torus_intersections(
    P0, D, C=(0, 0, 0), axis=(0, 0, 1), R=2.0, r=1.0,
    tol=1e-9, return_normals=False,
    face_towards_ray=False,        # neu: Normale zur Strahlrichtung ausrichten
    face_towards_point=None,       # neu: Normale zur Kamera (o.ä.) ausrichten
    face_towards_dir=None,         # neu: Normale zu einer beliebigen Richtung ausrichten
    debug_verify_normals=False     # neu: numerische Gradient-Prüfung
):
    """
    Schnittpunkte einer Geraden mit einem Torus (evtl. 0,2,4 Lösungen).

    Parameter (wichtigste)
    ----------------------
    P0 : (3,)  Stützpunkt der Geraden (Welt)
    D  : (3,)  Richtungsvektor der Geraden (muss nicht normiert sein)
    C  : (3,)  Zentrum des Torus (Welt)
    axis : (3,) Achse des Torus (Welt)
    R  : float Großer Radius
    r  : float Kleiner Radius
    return_normals : bool
      Falls True, zusätzlich Normalen in Weltkoordinaten (normiert) zurückgeben.
    face_towards_* : siehe _orient_normal (optional)
    debug_verify_normals : prüft die Normale via numerischer Ableitung von F (langsam).

    Rückgabe
    --------
    ts, points [, normals]
    """
    P0 = np.asarray(P0, dtype=float)
    D  = np.asarray(D,  dtype=float)
    C  = np.asarray(C,  dtype=float)
    axis = np.asarray(axis, dtype=float)

    if np.linalg.norm(D) == 0:
        raise ValueError("Richtungsvektor D darf nicht der Nullvektor sein.")
    if R <= 0 or r <= 0:
        raise ValueError("R und r müssen > 0 sein.")
    if r >= R:
        raise ValueError("Es muss r < R gelten (echter Torus).")

    # In lokales System (Achse -> z, Zentrum -> Ursprung)
    k = np.array([0.0, 0.0, 1.0])
    R_align = _rotation_a_to_b(axis, k)      # R_align @ axis = k
    P0_local = R_align @ (P0 - C)
    D_local  = R_align @ D

    px, py, pz = P0_local
    dx, dy, dz = D_local

    # Quartisches Polynom: (|p+td|^2 + R^2 - r^2)^2 - 4 R^2 ((px+tdx)^2 + (py+tdy)^2) = 0
    A  = dx*dx + dy*dy + dz*dz
    Bp = 2.0 * (px*dx + py*dy + pz*dz)
    Cp = (px*px + py*py + pz*pz) + (R*R - r*r)

    a = dx*dx + dy*dy
    b = 2.0 * (px*dx + py*dy)
    c = px*px + py*py

    E = 4.0 * R * R

    coeff4 = A*A
    coeff3 = 2.0*A*Bp
    coeff2 = Bp*Bp + 2.0*A*Cp - E*a
    coeff1 = 2.0*Bp*Cp - E*b
    coeff0 = Cp*Cp - E*c

    coeffs = np.array([coeff4, coeff3, coeff2, coeff1, coeff0], dtype=float)

    roots = np.roots(coeffs)

    # Reelle Lösungen (Filter auf kleinen Imaginärteil)
    real_roots = []
    for z in roots:
        if abs(z.imag) <= tol * max(1.0, abs(z.real)):
            real_roots.append(float(z.real))
    real_roots.sort()

    # Punkte (Welt)
    points = [P0 + t * D for t in real_roots]

    if not return_normals:
        return real_roots, points

    # Normalen berechnen: lokal -> Welt (R^T), dann optional orientieren
    normals_world = []
    for p_world in points:
        p_local = R_align @ (np.asarray(p_world) - C)
        n_local = _torus_normal_local(p_local, R, r)
        n_world = R_align.T @ n_local  # inverse Rotation
        n_world = n_world / np.linalg.norm(n_world)

        # Orientierung (optional)
        if face_towards_ray:
            n_world = _orient_normal(n_world, p_world, face_towards_ray_dir=D)
        elif face_towards_point is not None:
            n_world = _orient_normal(n_world, p_world, face_towards_point=face_towards_point)
        elif face_towards_dir is not None:
            n_world = _orient_normal(n_world, p_world, face_towards_dir=face_towards_dir)

        # Debug: numerische Verifikation der Gradientenrichtung (langsam)
        if debug_verify_normals:
            def F_world(x):
                # F in Weltkoordinaten: F(R_align @ (x - C))
                xl = R_align @ (x - C)
                X, Y, Z = xl
                return (X*X + Y*Y + Z*Z + R*R - r*r)**2 - 4*R*R*(X*X + Y*Y)
            h = 1e-6
            e = np.eye(3)
            grad = np.zeros(3)
            for i in range(3):
                grad[i] = (F_world(np.asarray(p_world)+h*e[i]) - F_world(np.asarray(p_world)-h*e[i]))/(2*h)
            grad /= np.linalg.norm(grad)
            # Falls Vorzeichen anders: Grad kann ±n sein; das ist okay.
            if abs(np.dot(grad, n_world)) < 1 - 1e-4:
                raise RuntimeError("Normalenprüfung fehlgeschlagen: numerischer Gradient weicht ab.")

        normals_world.append(n_world)

    return real_roots, points, normals_world

def first_hit_point_and_normal(
    P0, D, C=(0,0,0), axis=(0,0,1), R=2.0, r=1.0,
    tol=1e-9, t_min=0.0, t_max=np.inf,
    face_towards_ray=False, face_towards_point=None, face_towards_dir=None
):
    """
    Liefert (t, Punkt, Normale) für das kleinste t in [t_min, t_max].
    Normale ist optional zum Ray / Punkt / Richtung hin orientiert.
    """
    ts, pts, ns = line_torus_intersections(
        P0, D, C, axis, R, r, tol=tol, return_normals=True,
        face_towards_ray=face_towards_ray,
        face_towards_point=face_towards_point,
        face_towards_dir=face_towards_dir
    )
    candidates = [(t, p, n) for t, p, n in zip(ts, pts, ns) if (t_min - tol) <= t <= (t_max + tol)]
    if not candidates:
        return None, None, None
    t, p, n = min(candidates, key=lambda x: x[0])
    return float(t), np.asarray(p, float), np.asarray(n / np.linalg.norm(n), float)

# ---------------- Beispiel ----------------
if __name__ == "__main__":
    # Torus: Zentrum (0,0,0), Achse entlang y, R=2, r=0.6
    C = (0, 0, 0)
    axis = (0, 1, 0)
    R_big = 2.0
    r_small = 0.6

    # Gerade: P(t) = P0 + t*D
    P0 = (8, 4, -2.5)
    D  = (-8, -2.85, 2.5)

    # Alle Schnittpunkte + Normalen (standard: außen, nicht zum Ray hin orientiert)
    ts, pts, ns = line_torus_intersections(P0, D, C, axis, R_big, r_small, return_normals=True)
    print("Alle reellen t:", ts)
    for p, n in zip(pts, ns):
        print("P:", np.round(p, 6), "  n:", np.round(n, 6), "  n·D=", float(np.dot(n, D)))

    # Erster Treffer, Normale zum Strahl hin orientiert (häufig fürs Shading gewünscht)
    t, p, n = first_hit_point_and_normal(P0, D, C, axis, R_big, r_small,
                                         t_min=0.0, face_towards_ray=True)
    if t is not None:
        print("\nErster Treffer (Ray-facing):")
        print("t =", t)
        print("P =", np.round(p, 6))
        print("n =", np.round(n, 6), "  n·D=", float(np.dot(n, D)))
