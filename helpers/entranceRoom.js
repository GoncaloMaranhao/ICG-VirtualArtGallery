import * as THREE from '../threejs/three.module.js';

export function createFloor(floorWidth, floorHeight, floorDepth, floorMaterial, position) {
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(floorWidth, floorHeight, floorDepth),
    floorMaterial
  );

  floor.position.set(position.x, position.y, position.z);
  //floor.receiveShadow = true;

  return floor;
}

export function createWallWithDoorHole(scene, x, y, z, rotationY, color, width, height, depth, doorWidth, doorHeight) {
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
  wall.castShadow = true;
  wall.receiveShadow = true;
  scene.add(wall);
}

export function createCeiling(scene, x, y, z, material, width, height, depth) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const ceiling = new THREE.Mesh(geometry, material);
  ceiling.position.set(x, y, z);
  ceiling.receiveShadow = true;
  ceiling.castShadow = true;
  scene.add(ceiling);
}
const handleOffset = 0.4;

export function createDoor(scene, x, y, z, rotationY, material, width, height, depth) {
  const leftDoor = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      material
  );
  leftDoor.castShadow = true;
  leftDoor.receiveShadow = true;

  const rightDoor = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      material
  );
  rightDoor.castShadow = true;
  rightDoor.receiveShadow = true;
  
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
  leftDoor.add(leftDoorHandleBack);
  rightDoor.add(rightDoorHandle);
  rightDoor.add(rightDoorHandleBack);

  const doorGroup = new THREE.Group();
  doorGroup.add(leftDoorPivot);
  doorGroup.add(rightDoorPivot);
  doorGroup.position.set(x, y, z);
  doorGroup.rotation.y = rotationY;
  doorGroup.isDoor = true;

  scene.add(doorGroup);
}

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

const textureLoader = new THREE.TextureLoader();

export function createPainting(scene, x, y, z, width, height, frameThickness, imagePath) {
  const frameGeometry = new THREE.BoxGeometry(width + 2 * frameThickness, height + 2 * frameThickness, frameThickness);
  const frameMaterial = new THREE.MeshPhongMaterial({ color: 0x654321 }); 
  const frame = new THREE.Mesh(frameGeometry, frameMaterial);
  frame.receiveShadow = true;
  frame.castShadow = true;

  const canvasGeometry = new THREE.PlaneGeometry(width, height);
  const canvasTexture = textureLoader.load(imagePath);
  const canvasMaterial = new THREE.MeshPhongMaterial({ map: canvasTexture });
  const canvas = new THREE.Mesh(canvasGeometry, canvasMaterial);
  canvas.receiveShadow = true;
  canvas.castShadow = true;
  canvas.position.z = frameThickness / 2 + 0.01;

  const paintingGroup = new THREE.Group();
  paintingGroup.add(frame);
  paintingGroup.add(canvas);
  paintingGroup.position.set(x, y, z);
  scene.add(paintingGroup);
}

