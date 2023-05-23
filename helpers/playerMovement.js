import * as THREE from '../threejs/three.module.js';
import { PointerLockControls } from '../threejs/PointerLockControls.js';
import { collidableObjects } from '../main.js';

let playerBox = new THREE.Box3();

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

  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();
  const backward = new THREE.Vector3();
  const left = new THREE.Vector3();

  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();

  right.copy(forward).cross(camera.up);
  backward.copy(forward).negate();
  left.copy(right).negate();

  const tempPosition = camera.position.clone();
  
  if (keys.KeyW && !checkCollision(tempPosition, forward)) {
      tempPosition.addScaledVector(forward, speed);
  }
  if (keys.KeyS && !checkCollision(tempPosition, backward)) {
      tempPosition.addScaledVector(backward, speed);
  }
  if (keys.KeyD && !checkCollision(tempPosition, right)) {
      tempPosition.addScaledVector(right, speed);
  }
  if (keys.KeyA && !checkCollision(tempPosition, left)) {
      tempPosition.addScaledVector(left, speed);
  }

  camera.position.copy(tempPosition);

  // Update playerBox to new position
  playerBox.setFromCenterAndSize(camera.position, new THREE.Vector3(0.5, 1.8, 0.5));
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

function boxIntersect(box1, box2) {
  return box1.min.x <= box2.max.x && box1.max.x >= box2.min.x &&
         box1.min.y <= box2.max.y && box1.max.y >= box2.min.y &&
         box1.min.z <= box2.max.z && box1.max.z >= box2.min.z;
}

export function checkCollision(position, direction) {
  const speed = 0.1;
  const tempBox = playerBox.clone();
  tempBox.translate(direction.clone().multiplyScalar(speed));

  for (let object of collidableObjects) {
      let objectBox = new THREE.Box3().setFromObject(object);
      if (boxIntersect(tempBox, objectBox)) {
          return true;
      }
  }
  return false;
}
