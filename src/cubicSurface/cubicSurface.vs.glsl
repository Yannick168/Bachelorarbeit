// VS
in vec3 aPosition;
uniform mat4 uProjection, uModelView; // = View * Model
out vec3 vUV;                         // Modellraum-Position
void main() {
  vUV = aPosition;                    // Modellraum!
  gl_Position = uProjection * uModelView * vec4(aPosition, 1.0);
}
