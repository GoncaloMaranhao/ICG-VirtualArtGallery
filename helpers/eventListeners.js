import * as THREE from '../threejs/three.module.js';
import { camera, scene } from '../main.js';
import { openDoor } from './animations.js';

document.addEventListener('keydown', (event) => {
  if (event.code === 'KeyE') {
    const doorRaycaster = new THREE.Raycaster();
    doorRaycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

    const intersects = doorRaycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      const firstIntersectedObject = intersects[0].object;

      if (firstIntersectedObject.parent.parent.isDoor) {
        openDoor(firstIntersectedObject.parent.parent);
      }
    }
  }
});


/* Cube rotation
    document.addEventListener('keydown', (event) => {

    if (event.code === 'KeyT') {
      if (!isHoldingObject) {
        const pickUpDistance = 2;
  
        const cubeDistance = cube.position.distanceTo(camera.position);
        if (cubeDistance < pickUpDistance) {
          isHoldingObject = true;
        }
      }
    }
  
    if (event.code === 'KeyU') {
      if (isHoldingObject) {
        isHoldingObject = false;
        cube.position.y = cube.geometry.parameters.height / 2 + floorHeight;
      }
    }
  });
    
  const rotationAngle = Math.PI / 4;
  
  document.addEventListener('keydown', (event) => {
    if (event.key === 'z') {
      cube.rotation.y += rotationAngle;
    }
  }); */