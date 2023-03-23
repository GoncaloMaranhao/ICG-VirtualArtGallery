import * as THREE from './js/three.module.js';
import { OrbitControls } from './js/OrbitControls.js';
import { PointerLockControls } from './js/PointerLockControls.js';

// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 1.6; // Set initial camera height

// Create a WebGLRenderer and add to the DOM
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Keys for movement
const keys = {
    KeyW: false,
    KeyA: false,
    KeyS: false,
    KeyD: false,
  };

// Listeners for keys
document.addEventListener('keydown', (event) => {
    if (keys.hasOwnProperty(event.code)) {
      keys[event.code] = true;
    }
  });
  
  document.addEventListener('keyup', (event) => {
    if (keys.hasOwnProperty(event.code)) {
      keys[event.code] = false;
    }
  });

// Create controls
const controls = new PointerLockControls(camera, renderer.domElement);

// Listeners for mouse
document.addEventListener('click', () => {
    controls.lock();
  });
  
  controls.addEventListener('unlock', () => {
    // Provavelmente quero meter aqui qql coisa para quando se faz unlock do rato
  });

// function to handle the movement
function updatePosition() {
    const speed = 0.1;
    const direction = new THREE.Vector3();
  
    camera.getWorldDirection(direction);
    direction.y = 0; // Remove the vertical component to stay on the ground
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
  

// Create Door with two separate parts because of the opening animation
function createDoor(x, y, z) {
    const leftDoor = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 2, 0.2),
      new THREE.MeshStandardMaterial({ color: 0xff0000 })
    );
    leftDoor.position.set(-0.25, 0, 0);
  
    const rightDoor = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 2, 0.2),
      new THREE.MeshStandardMaterial({ color: 0xff0000 })
    );
    rightDoor.position.set(0.25, 0, 0);
  
    const doorGroup = new THREE.Group();
    doorGroup.add(leftDoor);
    doorGroup.add(rightDoor);
    doorGroup.position.set(x, y, z);
    doorGroup.name = 'door'; // Add a name property to the door group
    doorGroup.isDoor = true; // Add isDoor property to the door group
    scene.add(doorGroup);
  }
  
  

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Create the corridor
const corridorLength = 10;
const corridor = new THREE.Mesh(
  new THREE.BoxGeometry(1, 2, corridorLength),
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
corridor.position.set(0, 1, -corridorLength / 2);
scene.add(corridor);

// Add the corridor doors
createDoor(0, 1, -corridorLength);
createDoor(-1.5, 1, -corridorLength / 2);
createDoor(1.5, 1, -corridorLength / 2);

// Create the floor
const floor = new THREE.Mesh(
  new THREE.BoxGeometry(10, 0.1, corridorLength),
  new THREE.MeshStandardMaterial({ color: 0xaaaaaa })
);
floor.position.set(0, 0.05, -corridorLength / 2);
scene.add(floor);

// Create Plants for corridor
function createPlant(x, y, z) {
    const plant = new THREE.Mesh(
      new THREE.ConeGeometry(0.5, 1, 8),
      new THREE.MeshStandardMaterial({ color: 0x00ff00 })
    );
    plant.position.set(x, y, z);
    scene.add(plant);
  }

// Add plants
createPlant(-0.5, 0.5, 0);
createPlant(0.5, 0.5, 0);

// Create floor lamp
function createFloorLamp(x, y, z) {
    const lampGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 8);
    const lampMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
    const lamp = new THREE.Mesh(lampGeometry, lampMaterial);
    lamp.position.set(x, y, z);
    scene.add(lamp);
  
    const light = new THREE.PointLight(0xffffff, 1, 10);
    light.position.set(x, y + 1, z);
    scene.add(light);
}

createFloorLamp(-0.75, 1, -1);
createFloorLamp(0.75, 1, -1);

// Create a door placeholder
const doorPlaceholder = new THREE.Mesh(
  new THREE.BoxGeometry(1, 2, 0.2),
  new THREE.MeshStandardMaterial({ color: 0xff0000 })
);
doorPlaceholder.position.set(0, 1, -corridorLength);
scene.add(doorPlaceholder);




// Animate function
function animate() {
  requestAnimationFrame(animate);

  updatePosition();


  renderer.render(scene, camera);
}


function openDoor(doorGroup) {
    const leftDoor = doorGroup.children[0];
    const rightDoor = doorGroup.children[1];
  
    const targetRotation = Math.PI / 2;
    const animationDuration = 1000;
    const startTime = performance.now();
  
    // Check if the door is open or closed
    const isOpen = leftDoor.rotation.y <= -0.1; // Check if the door is open
  
    const initialLeftRotation = isOpen ? -targetRotation : 0;
    const initialRightRotation = isOpen ? targetRotation : 0;
    
    function animateDoor() {
      const elapsed = performance.now() - startTime;
      const progress = elapsed / animationDuration;
  
      if (progress < 1) {
        if (isOpen) {
          // Close the door
          leftDoor.rotation.y = initialLeftRotation + progress * targetRotation;
          rightDoor.rotation.y = initialRightRotation - progress * targetRotation;
        } else {
          // Open the door
          leftDoor.rotation.y = initialLeftRotation - progress * targetRotation;
          rightDoor.rotation.y = initialRightRotation + progress * targetRotation;
        }
        requestAnimationFrame(animateDoor);
      } else {
        if (isOpen) {
          // Close the door
          leftDoor.rotation.y = 0;
          rightDoor.rotation.y = 0;
        } else {
          // Open the door
          leftDoor.rotation.y = -targetRotation;
          rightDoor.rotation.y = targetRotation;
        }
      }
    }
  
    animateDoor();
  }
  
  
  
  

// Raycaster for door interaction
const raycaster = new THREE.Raycaster();
const interactionDistance = 1.5;

document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyR') {
      raycaster.setFromCamera(new THREE.Vector2(), camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
  
      if (intersects.length > 0 && intersects[0].distance < interactionDistance) {
        let doorGroup = null;
        let currentObject = intersects[0].object;
  
        // Traverse the object hierarchy to find the door group with the 'isDoor' property
        while (currentObject) {
          if (currentObject.isDoor) {
            doorGroup = currentObject;
            break;
          }
          currentObject = currentObject.parent;
        }
  
        if (doorGroup) {
          openDoor(doorGroup);
        }
      }
    }
  });

animate();
