import * as THREE from './js/three.module.js';
import { PointerLockControls } from './js/PointerLockControls.js';

// create a scene
const scene = new THREE.Scene();

// create a WebGLRenderer and add to the DOM
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 1.7;

// create controls
const controls = new PointerLockControls(camera, renderer.domElement);


// listeners for mouse
document.addEventListener('click', () => {
  controls.lock();
});

controls.addEventListener('unlock', () => {
  // talvez queira fazer alguma coisa aqui quando o rato estiver unlocked??
});

// keys for movement
const keys = {
  KeyW: false,
  KeyA: false,
  KeyS: false,
  KeyD: false,
};

// listeners for keys
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

// window resize event listener
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  });


// this function is based and the logic of moving in first person is based
//
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

// animate function
function animate() {
  requestAnimationFrame(animate);

  updatePosition();

  renderer.render(scene, camera);
}

// ------------------------------------------------------------ LIGHTING -----------------------------------------------------
// add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
scene.add(ambientLight);

// add a point light
const pointLight = new THREE.PointLight(0xffffff, 1.0, 100);
pointLight.position.set(0, 2, 0);
scene.add(pointLight);

// ------------------------------------------------------------ TEXTURES -----------------------------------------------------

// load textures
const textureLoader = new THREE.TextureLoader();

// entrance room front Door
const darkWoodTexture = textureLoader.load('./assets/textures/dark_wood_diff_4k.jpg');
const darkWoodMaterial = new THREE.MeshPhongMaterial({ map: darkWoodTexture });

// entrance room floor
const floorTexture = textureLoader.load('./assets/textures/plank_flooring_02_diff_1k.jpg');
const floorMaterial = new THREE.MeshPhongMaterial({ map: floorTexture });

// ------------------------------------------------------------ VARIABLES -----------------------------------------------------


// ------------------------------------------------------------ entrance room vars -----------------------------------------------------

const doorWidth = 1.75;
const doorHeight = 2.5;
const doorDepth = 0.2;


const floorWidth = 20;
const floorHeight = 0.1;
const floorDepth = floorWidth;

const ceilingWidth = floorWidth;
const ceilingHeight = 0.1;
const ceilingDepth = floorDepth;

const ceilingPositionX = 0;
const ceilingPositionY = 7;
const ceilingPositionZ = 0;

// var to make the handles of the door closer together
const handleOffset = 0.4;

// this is to make the wall behind the door transparent
// so that when I open the door I can't see the wall
// const transparentMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, opacity: 0, transparent: true });





// ------------------------------------------------------------ ENTRANCE ROOM ----------------------------------------

// create walls 
// adding material to make the wall behind the door transparent
function createWall(x, y, z,rotationY, width, height, depth, material ) {
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    material
  );
  wall.position.set(x, y, z);
  wall.rotation.y = rotationY;
  scene.add(wall);
}
// front wall
createWall(0, ceilingPositionY / 2, -floorWidth / 2, 0, floorWidth, ceilingPositionY, 0.1,);
// back wall 
createWall(0, ceilingPositionY / 2, floorWidth / 2, 0, floorWidth, ceilingPositionY, 0.1);
// left wall 
createWall(-floorWidth / 2, ceilingPositionY / 2, 0, 0, 0.1, ceilingPositionY, floorWidth);
// right wall 
createWall(floorWidth / 2, ceilingPositionY / 2, 0, 0, 0.1, ceilingPositionY, floorWidth); 


// create ceiling
const ceiling = new THREE.Mesh(
  new THREE.BoxGeometry(ceilingWidth, ceilingHeight, ceilingDepth),
  new THREE.MeshPhongMaterial({ color: 0xffffff })
);

ceiling.position.set(ceilingPositionX, ceilingPositionY, ceilingPositionZ);
scene.add(ceiling);

// create floor
const floor = new THREE.Mesh(
  new THREE.BoxGeometry(floorWidth, floorHeight, floorDepth),
  //new THREE.MeshPhongMaterial({ color: 0xaaaaaa })
  floorMaterial
  );

floor.position.set(0, 0.05, 0);
scene.add(floor);


// create door with two separate parts because of how I want the opening animation
function createDoor(x, y, z, rotationY, material, width, height, depth) {
  const leftDoor = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      material
  );
  leftDoor.position.set(-width / 2, height / 2, 0);

  const rightDoor = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      material
  );
  rightDoor.position.set(width / 2, height / 2, 0);

  const handleMaterial = new THREE.MeshPhongMaterial({ color: 0x800080 });
  const leftDoorHandle = createDoorHandle(-width / 32 + handleOffset, height / 32, depth / 2 + 0.01, 0, handleMaterial);
  const rightDoorHandle = createDoorHandle(width / 32 - handleOffset, height / 32, depth / 2 + 0.01, 0, handleMaterial);

  leftDoor.add(leftDoorHandle);
  rightDoor.add(rightDoorHandle);

  const doorGroup = new THREE.Group();
  doorGroup.add(leftDoor);
  doorGroup.add(rightDoor);
  doorGroup.position.set(x, y, z);
  doorGroup.rotation.y = rotationY;
  doorGroup.isDoor = true;
  scene.add(doorGroup);
}

// left door
createDoor(-floorWidth / 2, 0.13, 0, Math.PI / 2, 
          darkWoodMaterial, doorWidth, doorHeight, doorDepth); 

// right door
createDoor(floorWidth / 2,    0.13, 0, -Math.PI / 2, 
          darkWoodMaterial, doorWidth, doorHeight, doorDepth); 

// front door
createDoor(0, 0.13, -floorWidth / 2, 0, 
          darkWoodMaterial, doorWidth, doorHeight, doorDepth); 

// create door handle
function createDoorHandle(x, y, z, rotationY, material) {
  const handleRadius = 0.05;
  const handleLength = 1;

  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(handleRadius, handleRadius, handleLength, 32),
    material
  );
  handle.rotation.y = rotationY;
  handle.position.set(x, y, z);
  return handle;
}


// open and close the door
function openDoor(doorGroup) {
  const leftDoor = doorGroup.children[0];
  const rightDoor = doorGroup.children[1];
  const targetRotation = Math.PI / 2;
  const animationDuration = 1000;
  const startTime = performance.now(); // returns a timestamp in ms

  // check door status
  const isOpen = leftDoor.rotation.y <= -0.1;

  const initialLeftRotation = isOpen ? -Math.PI / 2 : 0;
  const initialRightRotation = isOpen ? Math.PI / 2 : 0;

    function animateDoor() {
      const elapsed = performance.now() - startTime;
      const progress = elapsed / animationDuration;

      if (progress < 1) {
        if (isOpen) {
          // close 
          leftDoor.rotation.y = initialLeftRotation + progress * Math.PI / 2;
          rightDoor.rotation.y = initialRightRotation - progress * Math.PI / 2;
        } else {
          // open
          leftDoor.rotation.y = initialLeftRotation - progress * Math.PI / 2;
          rightDoor.rotation.y = initialRightRotation + progress * Math.PI / 2;
        }
        requestAnimationFrame(animateDoor);

      } else {
        if (isOpen) {
          // close 
          leftDoor.rotation.y = 0;
          rightDoor.rotation.y = 0;
        } else {
          // open 
          leftDoor.rotation.y = -Math.PI / 2;
          rightDoor.rotation.y = Math.PI / 2;
        }
      }
    }

  animateDoor();
  requestAnimationFrame(animateDoor);
}


// this raycaster logic is based on Adam Sullovey logic -> https://codepen.io/adamsullovey/pen/BoJrbb
// detect door interaction
document.addEventListener('keydown', (event) => {
  if (event.code === 'KeyE') {
    const doorRaycaster = new THREE.Raycaster();
    doorRaycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

    const intersects = doorRaycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      const firstIntersectedObject = intersects[0].object;

      if (firstIntersectedObject.parent.isDoor) {
          openDoor(firstIntersectedObject.parent);
      }
    }

  }
});


// ------------------------------------------------------------ -----------------------------------------------------


animate();

// axes helper - to remove in final delivery
const axesHelper = new THREE.AxesHelper(5);
axesHelper.material.linewidth = 5;
scene.add(axesHelper);

axesHelper.position.set(0,2,0);