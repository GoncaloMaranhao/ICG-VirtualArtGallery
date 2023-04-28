import * as THREE from './threejs/three.module.js';
import './helpers/eventListeners.js';
import { initializePlayerMovement } from './helpers/playerMovement.js';
import { updatePosition } from "./helpers/playerMovement.js";
import { createWallWithDoorHole, createCeiling, 
         createDoor, createPainting, createFloor} from './helpers/entranceRoom.js';
import { createSunnyRoom } from './helpers/sunnyRoom.js';

export const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional: use soft shadows
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

export const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 1.7;

initializePlayerMovement(camera, renderer);

const textureLoader = new THREE.TextureLoader();

//--------------------------_Entrance Room_----------------------

const darkWoodTexture = textureLoader.load('./assets/textures/castle_brick_07_diff_1k.jpg');
const darkWoodMaterial = new THREE.MeshPhongMaterial({ map: darkWoodTexture });

const floorTexture = textureLoader.load('./assets/textures/castle_brick_07_diff_1k.jpg');
const floorMaterial = new THREE.MeshPhongMaterial({ map: floorTexture });
const floorWidth = 20;
const floorHeight = 0.1;
const floorDepth = floorWidth;
const floorPosition = { x: 0, y: 0.05, z: 0 };
const floor = createFloor(floorWidth, floorHeight, floorDepth, floorMaterial, floorPosition);
scene.add(floor);

const doorWidth = 1.75;
const doorHeight = 2.5;
const doorDepth = 0.2;
// left door
createDoor(scene, -floorWidth / 2, 0.13, 0, Math.PI / 2, 
          darkWoodMaterial, doorWidth, doorHeight, doorDepth); 
// right door
createDoor(scene, floorWidth / 2,    0.13, 0, -Math.PI / 2, 
          darkWoodMaterial, doorWidth, doorHeight, doorDepth); 
// front door
createDoor(scene, 0, 0.13, -floorWidth / 2, 0, 
          darkWoodMaterial, doorWidth, doorHeight, doorDepth); 
          
const ceilingPositionY = 7;
const ceilingWidth = floorWidth / 2;
const ceilingHeight = 0.1;
const ceilingDepth = floorDepth;
const ceilingMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
createCeiling(scene, - floorWidth / 4, ceilingPositionY, 0, ceilingMaterial,
              ceilingWidth, ceilingHeight, ceilingDepth );

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


createPainting(scene, -5, 2, -floorWidth / 2 + 0.1, 2, 3, 0.1, './assets/textures/151090.jpg');


const pointLight = new THREE.PointLight(0xffffff, 1.0, 100);
pointLight.position.set(0, 2, 0);
scene.add(pointLight);

const sunnyPointLight = new THREE.PointLight(0xffffff, 1.0, 100);
sunnyPointLight.position.set(floorWidth, 2, 0);
scene.add(sunnyPointLight);

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

//--------------------------_Sunny Room_----------------------

const sunnyfloorPosition = { x: floorWidth, y: 0.05, z: 0 };
const sunnyFloor = createFloor(floorWidth, floorHeight, floorDepth, floorMaterial, sunnyfloorPosition);
scene.add(sunnyFloor);

// front wall 
//createWallWithDoorHole(scene, floorWidth + (floorWidth / 2), 0, floorWidth / 2, Math.PI / 2, 0x00ffff,
//                       floorWidth, ceilingPositionY, 0.1, 0, 0);

const sunnyRoomWidth = 19.5;
const sunnyRoomHeight = floorWidth;
const sunnyRoomDepth = floorDepth;
const segments = 16;
const sunnyRoom = createSunnyRoom(sunnyRoomWidth, sunnyRoomHeight, sunnyRoomDepth, segments, doorWidth, doorHeight);
sunnyRoom.position.set(floorWidth / 2,0 ,floorWidth / 2 ); // Position the sunny room next to the entrance room
scene.add(sunnyRoom);



//---------------------Animate------------------

function animate() {
  requestAnimationFrame(animate);
  updatePosition(camera);
  renderer.render(scene, camera);
}

animate();

