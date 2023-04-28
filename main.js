import * as THREE from './js/three.module.js';
import { PointerLockControls } from './js/PointerLockControls.js';
import { openDoor } from './misc/animations.js';
import { updatePosition } from "./misc/playerMovement.js";
import { createWallWithDoorHole, createCeiling, 
         createDoor, createPainting} from './misc/various.js';

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional: use soft shadows
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 1.7;

const controls = new PointerLockControls(camera, renderer.domElement);

document.addEventListener('click', () => {

  controls.lock();
});

controls.addEventListener('unlock', () => {
});


function animate() {
  requestAnimationFrame(animate);

  if (isHoldingObject) {
    const newPosition = camera.position.clone();
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    newPosition.add(cameraDirection.multiply(objectOffset));
    newPosition.y += 0.5;
    cube.position.copy(newPosition);
  }

  updatePosition(camera);
  renderer.render(scene, camera);
}

const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
//scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1.0, 100);
pointLight.position.set(0, 2, 0);
scene.add(pointLight);

const textureLoader = new THREE.TextureLoader();

const darkWoodTexture = textureLoader.load('./assets/textures/castle_brick_07_diff_1k.jpg');
const darkWoodMaterial = new THREE.MeshPhongMaterial({ map: darkWoodTexture });

const floorTexture = textureLoader.load('./assets/textures/castle_brick_07_diff_1k.jpg');
const floorMaterial = new THREE.MeshPhongMaterial({ map: floorTexture });

const doorWidth = 1.75;
const doorHeight = 2.5;
const doorDepth = 0.2;

const floorWidth = 20;
const floorHeight = 0.1;
const floorDepth = floorWidth;

const ceilingWidth = floorWidth / 2;
const ceilingHeight = 0.1;
const ceilingDepth = floorDepth;

const ceilingPositionY = 7;


let isHoldingObject = false;
const objectOffset = new THREE.Vector3(0, 0.5, -1);

const spotLight = new THREE.SpotLight(0xffffff, 1);
spotLight.position.set(0, ceilingHeight + 10, 0);
spotLight.angle = Math.PI / 2.5; 
spotLight.penumbra = 0.1;
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.bias = -0.005; // fix shadow acne or peter-panning issue
scene.add(spotLight);

const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0xffff00 });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.set(0, 0.5, -3);
scene.add(cube);

// front wall
createWallWithDoorHole(scene, -floorWidth / 2, 0, -floorWidth / 2, 0, 0xff0000, 
                       floorWidth, ceilingPositionY, 0.1, doorWidth * 2, doorHeight+0.1);

// left wall 
createWallWithDoorHole(scene, -floorWidth / 2, 0, floorWidth / 2, Math.PI / 2, 0x00ff00,
                       floorWidth, ceilingPositionY, 0.1, doorWidth * 2, doorHeight + 0.1);

// right wall 
createWallWithDoorHole(scene, floorWidth / 2, 0, floorWidth / 2, Math.PI / 2, 0x0000ff,
                       floorWidth, ceilingPositionY, 0.1, doorWidth * 2, doorHeight + 0.1);

// back wall, no hole
createWallWithDoorHole(scene, floorWidth / 2, 0, floorWidth / 2, Math.PI, 0x123456,
                       floorWidth, ceilingPositionY, 0.1, 0, 0);

const ceilingMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });

createCeiling(scene, - floorWidth / 4, ceilingPositionY, 0, ceilingMaterial,
              ceilingWidth, ceilingHeight, ceilingDepth );

const floor = new THREE.Mesh(
  new THREE.BoxGeometry(floorWidth, floorHeight, floorDepth),
  floorMaterial
  );

floor.position.set(0, 0.05, 0);
floor.receiveShadow = true;
scene.add(floor);


// left door
createDoor(scene, -floorWidth / 2, 0.13, 0, Math.PI / 2, 
          darkWoodMaterial, doorWidth, doorHeight, doorDepth); 

// right door
createDoor(scene, floorWidth / 2,    0.13, 0, -Math.PI / 2, 
          darkWoodMaterial, doorWidth, doorHeight, doorDepth); 

// front door
createDoor(scene, 0, 0.13, -floorWidth / 2, 0, 
          darkWoodMaterial, doorWidth, doorHeight, doorDepth); 



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



createPainting(scene, -5, 2, -floorWidth / 2 + 0.1, 2, 3, 0.1, './assets/textures/151090.jpg');

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
});
  
animate();

