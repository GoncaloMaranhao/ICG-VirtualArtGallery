import * as THREE from './js/three.module.js';

export const keys = {
    KeyW: false,
    KeyA: false,
    KeyS: false,
    KeyD: false,
  };
  
  // listeners for keys
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
  
  // this function is based and the logic of moving in first person is based
  //
  // function to handle the movement
  export function updatePosition(camera) {
    const speed = 0.1;
    const direction = new THREE.Vector3();
  
    camera.getWorldDirection(direction);
    direction.y = 0; // remove the vertical component to stay on the ground
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
  