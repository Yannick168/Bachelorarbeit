from sympy import *
from sympy.codegen.rewriting import optimize, optims_c99

x,y,z,l = symbols("x y z l")
a1,a2,a3 = symbols("a1 a2 a3")
d1,d2,d3 = symbols("d1 d2 d3")
c300,c030,c003,c210,c201,c021,c012,c120,c102,c111 = symbols("c300 c030 c003 c210 c201 c021 c012 c120 c102 c111")
c200,c020,c002,c000,c001,c010,c011,c100,c101,c110 = symbols("c200 c020 c002 c000 c001 c010 c011 c100 c101 c110")

cubicsurface = c300*x**3+c030*y**3+c003*z**3+c210*x**2*y+c201*x**2*z+c021*y**2*z+c012*y*z**2+c120*x*y**2+c102*x*z**2+c111*x*y*z+c200*x**2+c020*y**2+c002*z**2+c000+c001*z+c010*y+c011*y*z+c100*x+c101*x*z+c110*x*y

expr = cubicsurface.subs([(x,a1+l*d1),(y,a2+l*d2),(z,a3+l*d3)])

expr = expand(expr)

c3 = expr.coeff(l,3)
c2 = expr.coeff(l,2)
c1 = expr.coeff(l,1)
c0 = expr.coeff(l,0)

print(c3)
print()
print(c2)
print()
print(c1)
print()
print(c0)
print()

print(diff(cubicsurface,x))
