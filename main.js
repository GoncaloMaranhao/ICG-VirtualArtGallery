import * as THREE from './js/three.module.js';
import { PointerLockControls } from './js/PointerLockControls.js';
import { openDoor } from './animations.js';
import { updatePosition } from "./playerMovement.js";

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 1.7;

const controls = new PointerLockControls(camera, renderer.domElement);

document.addEventListener('click', () => {

  controls.lock();
});

controls.addEventListener('unlock', () => {

  // talvez queira fazer alguma coisa aqui quando o rato estiver unlocked??
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
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1.0, 100);
pointLight.position.set(0, 2, 0);
scene.add(pointLight);

const textureLoader = new THREE.TextureLoader();

const darkWoodTexture = textureLoader.load('./assets/textures/castle_brick_07_diff_1k.jpg');
const darkWoodMaterial = new THREE.MeshPhongMaterial({ map: darkWoodTexture });

const floorTexture = textureLoader.load('./assets/textures/plank_flooring_02_diff_1k.jpg');
const floorMaterial = new THREE.MeshPhongMaterial({ map: floorTexture });


const doorWidth = 1.75;
const doorHeight = 2.5;
const doorDepth = 0.2;

const floorWidth = 20;
const floorHeight = 0.1;
const floorDepth = floorWidth;

const ceilingWidth = floorWidth;
const ceilingHeight = 0.1;
const ceilingDepth = floorDepth;

const ceilingPositionY = 7;

const handleOffset = 0.4;

let isHoldingObject = false;
const objectOffset = new THREE.Vector3(0, 0.5, -1);


const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0xffff00 });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.set(0, 0.5, -3);
scene.add(cube);


function createWallWithDoorHole(x, y, z, rotationY, color, width, height, depth, doorWidth, doorHeight) {

  const wallMaterial = new THREE.MeshLambertMaterial({ color: color });

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
      bevelEnabled: false,
  });

  const wall = new THREE.Mesh(geometry, wallMaterial);
  wall.position.set(x, y, z);
  wall.rotation.y = rotationY;
  scene.add(wall);
}


// front wall
createWallWithDoorHole(-floorWidth / 2, 0, -floorWidth / 2, 0, 0xff0000, 
                       floorWidth, ceilingPositionY, 0.1, doorWidth * 2, doorHeight+0.1);

// front wall, for presentation
createWallWithDoorHole(-floorWidth / 2, 0, -floorWidth, 0, 0xff0000, 
                       floorWidth, ceilingPositionY, 0.1, doorWidth * 2, doorHeight+0.1);

// left wall 
createWallWithDoorHole(-floorWidth / 2, 0, floorWidth / 2, Math.PI / 2, 0x00ff00,
                       floorWidth, ceilingPositionY, 0.1, doorWidth * 2, doorHeight + 0.1);

// right wall 
createWallWithDoorHole(floorWidth / 2, 0, floorWidth / 2, Math.PI / 2, 0x0000ff,
                       floorWidth, ceilingPositionY, 0.1, doorWidth * 2, doorHeight + 0.1);

// back wall, no hole
createWallWithDoorHole(floorWidth / 2, 0, floorWidth / 2, Math.PI, 0x123456,
                       floorWidth, ceilingPositionY, 0.1, 0, 0);

// back wall, no hole, for presentation
createWallWithDoorHole(floorWidth / 2, 0, floorWidth , Math.PI, 0x123456,
                       floorWidth, ceilingPositionY, 0.1, 0, 0);

const ceilingMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });

function createCeiling(x, y, z, material, width, height, depth) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const ceiling = new THREE.Mesh(geometry, material);
  ceiling.position.set(x, y, z);
  scene.add(ceiling);
}

createCeiling(
  0,
  ceilingPositionY,
  0,
  ceilingMaterial,
  ceilingWidth,
  ceilingHeight,
  ceilingDepth
);

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

function createPainting(x, y, z, width, height, frameThickness, imagePath) {
  const frameGeometry = new THREE.BoxGeometry(width + 2 * frameThickness, height + 2 * frameThickness, frameThickness);
  const frameMaterial = new THREE.MeshPhongMaterial({ color: 0x654321 }); // Change the color according to your preference
  const frame = new THREE.Mesh(frameGeometry, frameMaterial);

  const canvasGeometry = new THREE.PlaneGeometry(width, height);
  const canvasTexture = textureLoader.load(imagePath);
  const canvasMaterial = new THREE.MeshPhongMaterial({ map: canvasTexture });
  const canvas = new THREE.Mesh(canvasGeometry, canvasMaterial);

  canvas.position.z = frameThickness / 2 + 0.01;

  const paintingGroup = new THREE.Group();
  paintingGroup.add(frame);
  paintingGroup.add(canvas);

  paintingGroup.position.set(x, y, z);

  scene.add(paintingGroup);
}

createPainting(-5, 2, -floorWidth / 2 + 0.1, 2, 3, 0.1, './assets/textures/151090.jpg');


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

