import * as THREE from './js/three.module.js';
import { PointerLockControls } from './js/PointerLockControls.js';
import { openDoor } from './animations.js';
import { updatePosition } from "./playerMovement.js";


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


// animate function
function animate() {

  requestAnimationFrame(animate);

  updatePosition(camera);

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


// load textures
const textureLoader = new THREE.TextureLoader();

// entrance room front Door
const darkWoodTexture = textureLoader.load('./assets/textures/castle_brick_07_diff_1k.jpg');
const darkWoodMaterial = new THREE.MeshPhongMaterial({ map: darkWoodTexture });

// entrance room floor
const floorTexture = textureLoader.load('./assets/textures/plank_flooring_02_diff_1k.jpg');
const floorMaterial = new THREE.MeshPhongMaterial({ map: floorTexture });


// window texture
const windowTexture = textureLoader.load('./assets/textures/red_sandstone_pavement_diff_1k.jpg');


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

const windowWidth = 2;
const windowHeight = 2;
const windowSpacing = 1.5;

const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });

const ceilingMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });

function createWallWithDoorHole(x, y, z, rotationY, material, width, height, depth, doorWidth, doorHeight) {

  const wallShape = new THREE.Shape();
  wallShape.moveTo(0, 0);
  wallShape.lineTo(0, height);
  wallShape.lineTo(width, height);
  wallShape.lineTo(width, 0);
  wallShape.lineTo(0, 0);

  const doorHoleShape = new THREE.Path();
  const doorHoleX = (width - doorWidth) / 2;
  const doorHoleY = 0;
  doorHoleShape.moveTo(doorHoleX, doorHoleY);
  doorHoleShape.lineTo(doorHoleX, doorHoleY + doorHeight);
  doorHoleShape.lineTo(doorHoleX + doorWidth, doorHoleY + doorHeight);
  doorHoleShape.lineTo(doorHoleX + doorWidth, doorHoleY);
  doorHoleShape.lineTo(doorHoleX, doorHoleY);

  wallShape.holes.push(doorHoleShape);

  const geometry = new THREE.ExtrudeGeometry(wallShape, {
      depth: depth,
      bevelEnabled: false, // to make sure it fits the door
  });

  const wall = new THREE.Mesh(geometry, material);
  wall.position.set(x, y, z);
  wall.rotation.y = rotationY;
  scene.add(wall);
}


 // front wall
 createWallWithDoorHole(-floorWidth / 2, 0, -floorWidth / 2, 0, wallMaterial, 
                       floorWidth, ceilingPositionY, 0.1, doorWidth * 2, doorHeight+0.1);

// left wall 
createWallWithDoorHole(-floorWidth / 2, 0, floorWidth / 2, Math.PI / 2, wallMaterial,
                       floorWidth, ceilingPositionY, 0.1, doorWidth * 2, doorHeight + 0.1);

// right wall 
createWallWithDoorHole(floorWidth / 2, 0, floorWidth / 2, Math.PI / 2, wallMaterial,
                       floorWidth, ceilingPositionY, 0.1, doorWidth * 2, doorHeight + 0.1);

// back wall, no hole
createWallWithDoorHole(floorWidth / 2, 0, floorWidth / 2, Math.PI, wallMaterial,
                       floorWidth, ceilingPositionY, 0.1, 0, 0);



function createWindow(x, y, z, width, height, texture) {
  const windowGeometry = new THREE.PlaneGeometry(width, height);
  const windowMaterial = new THREE.MeshPhongMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
  const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
  windowMesh.position.set(x, y, z);
  windowMesh.rotation.x = Math.PI / 2;
  return windowMesh;
}

function createCeilingWithWindows(x, y, z, material, width, height, depth, windowWidth, windowHeight, windowSpacing) {
  const ceilingShape = new THREE.Shape();

  ceilingShape.moveTo(0, 0);
  ceilingShape.lineTo(0, width);
  ceilingShape.lineTo(depth, width);
  ceilingShape.lineTo(depth, 0);
  ceilingShape.lineTo(0, 0);

  const windowHoleShape = new THREE.Path();

  const firstWindowPosition = 3; // position of the first window
  const windowsStartPosition = (width / 2) - firstWindowPosition - windowWidth;
  const windowOffsetX = depth / 4; // windows' position along the x-axis

  for (let i = 0; i < 3; i++) {
    const windowHoleX = windowOffsetX;
    const windowHoleY = windowsStartPosition + i * (windowWidth + windowSpacing);
    windowHoleShape.moveTo(windowHoleX + windowHeight, windowHoleY);
    windowHoleShape.lineTo(windowHoleX, windowHoleY);
    windowHoleShape.lineTo(windowHoleX, windowHoleY + windowWidth);
    windowHoleShape.lineTo(windowHoleX + windowHeight, windowHoleY + windowWidth);
    windowHoleShape.lineTo(windowHoleX + windowHeight, windowHoleY);
    const windowMesh = createWindow(-width / 2 + windowHoleX + windowHeight / 2, ceilingPositionY - height / 2, -depth / 2 + windowsStartPosition + i * (windowWidth + windowSpacing) + windowWidth / 2, windowHeight, windowWidth, windowTexture);
    scene.add(windowMesh);
  }

  ceilingShape.holes.push(windowHoleShape);

  const geometry = new THREE.ExtrudeGeometry(ceilingShape, {
    depth: height,
    bevelEnabled: false,
  });

  const ceiling = new THREE.Mesh(geometry, material);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(x, y, z);
  scene.add(ceiling);
}

// Create the ceiling with window holes
createCeilingWithWindows(
  -ceilingWidth / 2,
  ceilingPositionY,
  -ceilingDepth / 2,
  ceilingMaterial,
  ceilingWidth,
  ceilingHeight,
  ceilingDepth,
  windowWidth,
  windowHeight,
  windowSpacing
);

// create floor
const floor = new THREE.Mesh(
  new THREE.BoxGeometry(floorWidth, floorHeight, floorDepth),
  floorMaterial
  );

floor.position.set(0, 0.05, 0);
scene.add(floor);


function createDoor(x, y, z, rotationY, material, width, height, depth) {

  const leftDoor = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      material
  );

  const rightDoor = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      material
  );
  
  // I'm creating Pivot points because I want to open/close the doors around the hinge
  const leftDoorPivot = new THREE.Object3D();
  leftDoorPivot.position.set(-width , 0, 0);
  leftDoorPivot.add(leftDoor);
  leftDoor.position.set(width / 2, height/2, 0);

  const rightDoorPivot = new THREE.Object3D();
  rightDoorPivot.position.set(width, 0, 0);
  rightDoorPivot.add(rightDoor);
  rightDoor.position.set(-width / 2, height/2, 0);

  const handleMaterial = new THREE.MeshPhongMaterial({ color: 0x800080 });
  const leftDoorHandle = createDoorHandle(-width / 32 + handleOffset, height / 32, depth / 2 + 0.01, 0, handleMaterial);
  const rightDoorHandle = createDoorHandle(width / 32 - handleOffset, height / 32, depth / 2 + 0.01, 0, handleMaterial);

  const leftDoorHandleBack = createDoorHandle(-width / 32 + handleOffset, height / 32, -depth / 2 - 0.01, 0, handleMaterial);
  const rightDoorHandleBack = createDoorHandle(width / 32 - handleOffset, height / 32, -depth / 2 - 0.01, 0, handleMaterial);

  leftDoor.add(leftDoorHandle);
  rightDoor.add(rightDoorHandle);

  leftDoor.add(leftDoorHandleBack);
  rightDoor.add(rightDoorHandleBack);

  const doorGroup = new THREE.Group();
  doorGroup.add(leftDoorPivot);
  doorGroup.add(rightDoorPivot);
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



// detect door interaction
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


animate();

