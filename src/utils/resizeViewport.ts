import type { WebGLRenderer, PerspectiveCamera, OrthographicCamera } from 'three';

export function resizeToMaxViewportPerspective(
  renderer: WebGLRenderer,
  camera: PerspectiveCamera,
  canvas: HTMLCanvasElement,
  aspectRatio = 16 / 9
) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let width = vw;
  let height = vw / aspectRatio;

  if (height > vh) {
    height = vh;
    width = vh * aspectRatio;
  }

  renderer.setSize(width, height, false);

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.style.position = 'absolute';
  canvas.style.top = '50%';
  canvas.style.left = '50%';
  canvas.style.transform = 'translate(-50%, -50%)';
}

export function resizeToMaxViewportOrthographic(
  renderer: WebGLRenderer,
  camera: OrthographicCamera,
  canvas: HTMLCanvasElement,
  sceneWidth: number,
  aspectRatio = 16 / 9
) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let width = vw;
  let height = vw / aspectRatio;

  if (height > vh) {
    height = vh;
    width = vh * aspectRatio;
  }

  const sceneHeight = sceneWidth / aspectRatio;

  // Kamera mittig um Ursprung platzieren
// Nachher
  camera.left = 0;
  camera.right = sceneWidth;
  camera.top = sceneHeight / 2;
  camera.bottom = -sceneHeight / 2;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height, false);

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.style.position = 'absolute';
  canvas.style.top = '50%';
  canvas.style.left = '50%';
  canvas.style.transform = 'translate(-50%, -50%)';
}
