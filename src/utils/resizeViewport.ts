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
  aspectRatio = 16 / 9,
  centered = true
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

  if (centered) {
    // Kamera symmetrisch um Ursprung
    camera.left = -sceneWidth / 2;
    camera.right = sceneWidth / 2;
    camera.top = sceneHeight / 2;
    camera.bottom = -sceneHeight / 2;
  } else {
    // Kamera von (0, 0) aus nach rechts/oben
    camera.left = 0;
    camera.right = sceneWidth;
    camera.top = sceneHeight / 2;
    camera.bottom = -sceneHeight / 2;
  }

  camera.updateProjectionMatrix();

  renderer.setSize(width, height, false);

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.style.position = 'absolute';
  canvas.style.top = '50%';
  canvas.style.left = '50%';
  canvas.style.transform = 'translate(-50%, -50%)';
}

export function resizeCenteredOrthographic(
  renderer: WebGLRenderer,
  camera: OrthographicCamera,
  canvas: HTMLCanvasElement,
  visibleRadius: number,
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

  const actualAspect = width / height;

  let halfWidth: number, halfHeight: number;

  if (actualAspect >= 1) {
    halfHeight = visibleRadius;
    halfWidth = visibleRadius * actualAspect;
  } else {
    halfWidth = visibleRadius;
    halfHeight = visibleRadius / actualAspect;
  }

  camera.left = -halfWidth;
  camera.right = halfWidth;
  camera.top = halfHeight;
  camera.bottom = -halfHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(width, height, false);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.style.position = 'absolute';
  canvas.style.top = '50%';
  canvas.style.left = '50%';
  canvas.style.transform = 'translate(-50%, -50%)';
}