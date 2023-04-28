import * as THREE from '../threejs/three.module.js';
import { PointerLockControls } from '../threejs/PointerLockControls.js';

export const keys = {
  KeyW: false,
  KeyA: false,
  KeyS: false,
  KeyD: false,
};

document.addEventListener("keydown", (event) => {
  if (keys.hasOwnProperty(event.code)) {
    keys[event.code] = true;
  }
});

document.addEventListener("keyup", (event) => {
  if (keys.hasOwnProperty(event.code)) {
    keys[event.code] = false;
  }
});

export function updatePosition(camera) {
  const speed = 0.1;
  const direction = new THREE.Vector3();

  camera.getWorldDirection(direction);
  direction.y = 0;
  direction.normalize();

  if (keys.KeyW) {
    camera.position.addScaledVector(direction, speed);
  }
  if (keys.KeyS) {
    camera.position.addScaledVector(direction, -speed);
  }
  if (keys.KeyD) {
    direction.cross(camera.up);
    camera.position.addScaledVector(direction, speed);
  }
  if (keys.KeyA) {
    direction.cross(camera.up);
    camera.position.addScaledVector(direction, -speed);
  }
}

export function initializePlayerMovement(camera, renderer) {
  const controls = new PointerLockControls(camera, renderer.domElement);

  document.addEventListener('click', () => {
    controls.lock();
  });

  controls.addEventListener('unlock', () => {
  });

  return controls;
}
