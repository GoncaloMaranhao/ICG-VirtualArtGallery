import * as THREE from '../threejs/three.module.js';
import { camera, scene, models } from '../main.js';
import { openDoor, startStatueRotation } from './animations.js';


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

export function initializeEventListener() {
  const raycaster = new THREE.Raycaster();
  const direction = new THREE.Vector2(0, 0);

  window.addEventListener('keydown', function (event) {
    if (event.key === 'r') {
      raycaster.setFromCamera(direction, camera);

      const intersects = raycaster.intersectObjects(models, true);

      if (intersects.length > 0 && intersects[0].distance < 5) {
        startStatueRotation(intersects[0].object);
      }
    }
  });
}

window.addEventListener('keydown', function (event) {
  if (event.key === 'i') {
    const raycaster = new THREE.Raycaster();
    const direction = new THREE.Vector2(0, 0);
    raycaster.setFromCamera(direction, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);  // You may need to specify the array of paintings if not all objects in the scene should be selectable.

    if (intersects.length > 0 && intersects[0].distance < 5) {
      const painting = intersects[0].object.parent;  // Assuming the intersected object is the canvas, its parent would be the painting group
      const userData = painting.userData;
      // Display the painting information
      alert(`${userData.name}\n${userData.artist}\n${userData.year}\n${userData.description}`);
    }
  }
});