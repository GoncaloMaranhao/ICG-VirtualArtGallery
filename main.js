import * as THREE from './threejs/three.module.js';
import './helpers/eventListeners.js';
import { initializePlayerMovement } from './helpers/playerMovement.js';
import { updatePosition } from "./helpers/playerMovement.js";
import { createWallWithDoorHole, createCeiling, 
         createDoor, createPainting, createFloor} from './helpers/entranceRoom.js';
import { createSunnyRoom, createWallWithTwoWindows, createWindow  } from './helpers/sunnyRoom.js';

export const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
floorMaterial.castShadow = true;
floorMaterial.receiveShadow = true;

const floorWidth = 25;
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
                       floorWidth, ceilingPositionY + 19.1, 0.1, doorWidth * 2, doorHeight + 0.1);
// back wall, no hole
createWallWithDoorHole(scene, floorWidth / 2, 0, floorWidth / 2, Math.PI, 0x123456,
                       floorWidth, ceilingPositionY, 0.1, 0, 0);


createPainting(scene, -5, 2, -floorWidth / 2 + 0.1, 2, 3, 0.1, './assets/textures/151090.jpg');


// const pointLight = new THREE.PointLight(0xffffff, 1.0, 100);
// pointLight.position.set(0, 2, 0);
// scene.add(pointLight);


const spotLight = new THREE.SpotLight(0xffffff, 1);
spotLight.position.set(0, ceilingHeight + 10, 0);
spotLight.angle = Math.PI / 2.5; 
spotLight.penumbra = 0.1;
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.bias = -0.005;
scene.add(spotLight);

const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0xffff00 });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.set(0, 1, 3);
scene.add(cube);

//--------------------------_Sunny Room_----------------------

// const sunnyPointLight = new THREE.PointLight(0xffffff, 1.0, 100);
// sunnyPointLight.castShadow = true;
// sunnyPointLight.receiveShadow = true;
// sunnyPointLight.position.set(floorWidth, 2, 0);
// sunnyPointLight.shadow.bias = -0.005;
// scene.add(sunnyPointLight);

// const sunnyPointLight2 = new THREE.PointLight(0xffffff, 1.0, 100);
// sunnyPointLight2.position.set(floorWidth + 10, 2, 0);
// scene.add(sunnyPointLight2);

// const sunnyPointLight3 = new THREE.PointLight(0xffffff, 1.0, 100);
// sunnyPointLight3.position.set(floorWidth + 15, 2, 0);
// scene.add(sunnyPointLight3);

const sunnyFloorTexture = textureLoader.load('./assets/textures/red_sandstone_pavement_diff_1k.jpg');
const sunnyFloorMaterial = new THREE.MeshPhongMaterial({ map: sunnyFloorTexture });
sunnyFloorMaterial.castShadow = true;
sunnyFloorMaterial.receiveShadow = true;

const sunnyFloorWidth = 40;
const sunnyFloorHeight = 0.1;
const sunnyFloorDepth = sunnyFloorWidth - 15;

const sunnyfloorPosition = { x: floorWidth + 7.5, y: 0.05, z: 0 };
const sunnyFloor = createFloor(sunnyFloorWidth, sunnyFloorHeight, sunnyFloorDepth, sunnyFloorMaterial, sunnyfloorPosition);
scene.add(sunnyFloor);

const sunnyRoomWidth = 19.5;
const sunnyRoomHeight = floorWidth;
const sunnyRoomDepth = floorDepth * 2;
const segments = 16;
const sunnyRoom = createSunnyRoom(sunnyRoomWidth, sunnyRoomHeight, sunnyRoomDepth, segments, doorWidth, doorHeight);
sunnyRoom.position.set(floorWidth / 2,0 ,floorWidth / 2 );
scene.add(sunnyRoom);


const wallPosition = { x: 49.5, y: 0.05 , z: 0 };
const wallWidth = sunnyFloorWidth / 1.5;
const wallHeight = ceilingPositionY + 19.1;
const wallDepth = 0.4;

const rectWindowWidth = 10;
const rectWindowHeight = 5;
const rectWindowPosition = { x: 0, y: ceilingPositionY + 2 };

const circularWindowRadius = 2;
const circularWindowPosition = { x: 0, y: 18 };

const wallColor = 0x654321;
const wallRotationY = Math.PI / 2; 

scene.add(createWallWithTwoWindows(wallPosition, wallWidth, wallHeight, wallDepth, 
                                   rectWindowWidth, rectWindowHeight, rectWindowPosition, 
                                   circularWindowRadius, circularWindowPosition, 
                                   wallColor, wallRotationY, null));

const paneMaterial = new THREE.MeshPhongMaterial({
 color: 0xFFFFFF, 
 transparent: true, 
 opacity: 0
});

const windowPosition = { x: 49.5, y: ceilingPositionY + 2, z: 0 };
const windowWidth = rectWindowWidth - 0.1;
const windowHeight = rectWindowHeight - 0.1;
const windowDepth = wallDepth - 0.1;
const windowFrameColor = 0x652233
const windowRotationY = Math.PI / 2; 
scene.add(createWindow(windowPosition, windowWidth, windowHeight, windowDepth, windowFrameColor, windowRotationY, null, paneMaterial));

const spotLightSunnyRoom = new THREE.SpotLight(0xFFFFFF, 1, 0, Math.PI); 
spotLightSunnyRoom.position.set(47, ceilingPositionY + 2, 0);
spotLightSunnyRoom.target.position.set(49.4, 0, 0); 
spotLightSunnyRoom.castShadow = true;
spotLightSunnyRoom.shadow.bias = -0.001;
scene.add(spotLightSunnyRoom);
scene.add(spotLightSunnyRoom.target);


// Invisible box for sunny Room light
const sunnyRoomBoundary = new THREE.Box3(
  new THREE.Vector3(sunnyFloorWidth/2, 0, sunnyFloorDepth / 2),
  new THREE.Vector3(sunnyFloorWidth * 1.5, sunnyRoomHeight / 2, sunnyFloorDepth* 1.5)
);

let translationVector = new THREE.Vector3(-5, 0.1, -25);
sunnyRoomBoundary.min.add(translationVector);
sunnyRoomBoundary.max.add(translationVector);

const sunnyRoomBoundaryHelper = new THREE.Box3Helper(sunnyRoomBoundary, 0xff0000);
scene.add(sunnyRoomBoundaryHelper);

//---------------------Animate------------------

function isInsideSunnyRoom(camera, boundary) {
  const cameraPosition = camera.position;
  return boundary.containsPoint(cameraPosition);
}

function animate() {
  requestAnimationFrame(animate);
  
  if (isInsideSunnyRoom(camera, sunnyRoomBoundary)) {
    spotLightSunnyRoom.intensity = 1;
  } else {
    spotLightSunnyRoom.intensity = 0;
  }
  
  updatePosition(camera);
  renderer.render(scene, camera);
}


animate();

