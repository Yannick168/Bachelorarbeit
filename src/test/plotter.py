import matplotlib.pyplot as plt
import numpy as np

fig = plt.figure()
ax = fig.add_subplot(111, projection='3d')

# Kugel
u, v = np.mgrid[0:2*np.pi:50j, 0:np.pi:25j]
x = np.cos(u)*np.sin(v)
y = np.sin(u)*np.sin(v)
z = np.cos(v)
ax.plot_surface(x, y, z, color="red", alpha=0.9)

# Boden
X, Y = np.meshgrid(np.linspace(-2,2,10), np.linspace(-2,2,10))
Z = np.zeros_like(X)
ax.plot_surface(X, Y, Z, color="lightgray", alpha=0.5)

plt.show()

