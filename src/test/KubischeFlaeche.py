from sympy import *
from sympy.codegen.rewriting import optimize, optims_c99

x,y,z,l = symbols("x y z l")
a1,a2,a3 = symbols("a1 a2 a3")
d1,d2,d3 = symbols("d1 d2 d3")

# 20 Koeffizienten in Shader-/Widget-Reihenfolge
c300,c030,c003, \
c210,c201,c021,c012,c120,c102,c111, \
c200,c020,c002, \
c101,c110,c011, \
c100,c010,c001, \
c000 = symbols("c300 c030 c003 c210 c201 c021 c012 c120 c102 c111 "
               "c200 c020 c002 c101 c110 c011 c100 c010 c001 c000")

cubicsurface = (
    c300*x**3 +        # x^3
    c030*y**3 +        # y^3
    c003*z**3 +        # z^3
    c210*x**2*y +      # x^2 y
    c201*x**2*z +      # x^2 z
    c021*y**2*z +      # y^2 z
    c012*y*z**2 +      # y z^2
    c120*x*y**2 +      # x y^2
    c102*x*z**2 +      # x z^2
    c111*x*y*z +       # x y z
    c200*x**2 +        # x^2
    c020*y**2 +        # y^2
    c002*z**2 +        # z^2
    c101*x*z +         # x z
    c110*x*y +         # x y
    c011*y*z +         # y z
    c100*x +           # x
    c010*y +           # y
    c001*z +           # z
    c000               # 1
)

expr = cubicsurface.subs([(x,a1+l*d1),(y,a2+l*d2),(z,a3+l*d3)])

expr = expand(expr)

c3 = expr.coeff(l,3)
c2 = expr.coeff(l,2)
c1 = expr.coeff(l,1)
c0 = expr.coeff(l,0)

print(ccode(c3))
print()
print(ccode(c2))
print()
print(ccode(c1))
print()
print(ccode(c0))
print()

print(diff(cubicsurface,x))

#c003*pow(d3, 3) + c012*d2*pow(d3, 2) + c021*pow(d2, 2)*d3 + c030*pow(d2, 3) + c102*d1*pow(d3, 2) + c111*d1*d2*d3 + c120*d1*pow(d2, 2) + c201*pow(d1, 2)*d3 + c210*pow(d1, 2)*d2 + c300*pow(d1, 3)

#a1*c102*pow(d3, 2) + a1*c111*d2*d3 + a1*c120*pow(d2, 2) + 2*a1*c201*d1*d3 + 2*a1*c210*d1*d2 + 3*a1*c300*pow(d1, 2) + a2*c012*pow(d3, 2) + 2*a2*c021*d2*d3 + 3*a2*c030*pow(d2, 2) + a2*c111*d1*d3 + 2*a2*c120*d1*d2 + a2*c210*pow(d1, 2) + 3*a3*c003*pow(d3, 2) + 2*a3*c012*d2*d3 + a3*c021*pow(d2, 2) + 2*a3*c102*d1*d3 + a3*c111*d1*d2 + a3*c201*pow(d1, 2) + c002*pow(d3, 2) + c011*d2*d3 + c020*pow(d2, 2) + c101*d1*d3 + c110*d1*d2 + c200*pow(d1, 2)

#pow(a1, 2)*c201*d3 + pow(a1, 2)*c210*d2 + 3*pow(a1, 2)*c300*d1 + a1*a2*c111*d3 + 2*a1*a2*c120*d2 + 2*a1*a2*c210*d1 + 2*a1*a3*c102*d3 + a1*a3*c111*d2 + 2*a1*a3*c201*d1 + a1*c101*d3 + a1*c110*d2 + 2*a1*c200*d1 + pow(a2, 2)*c021*d3 + 3*pow(a2, 2)*c030*d2 + pow(a2, 2)*c120*d1 + 2*a2*a3*c012*d3 + 2*a2*a3*c021*d2 + a2*a3*c111*d1 + a2*c011*d3 + 2*a2*c020*d2 + a2*c110*d1 + 3*pow(a3, 2)*c003*d3 + pow(a3, 2)*c012*d2 + pow(a3, 2)*c102*d1 + 2*a3*c002*d3 + a3*c011*d2 + a3*c101*d1 + c001*d3 + c010*d2 + c100*d1

#pow(a1, 3)*c300 + pow(a1, 2)*a2*c210 + pow(a1, 2)*a3*c201 + pow(a1, 2)*c200 + a1*pow(a2, 2)*c120 + a1*a2*a3*c111 + a1*a2*c110 + a1*pow(a3, 2)*c102 + a1*a3*c101 + a1*c100 + pow(a2, 3)*c030 + pow(a2, 2)*a3*c021 + pow(a2, 2)*c020 + a2*pow(a3, 2)*c012 + a2*a3*c011 + a2*c010 + pow(a3, 3)*c003 + pow(a3, 2)*c002 + a3*c001 + c000
