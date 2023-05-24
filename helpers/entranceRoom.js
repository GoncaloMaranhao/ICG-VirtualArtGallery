import * as THREE from '../threejs/three.module.js';


export function createFloor(floorWidth, floorHeight, floorDepth, floorMaterial, position) {
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(floorWidth, floorHeight, floorDepth),
    floorMaterial
  );
  floor.castShadow = true;
  floor.receiveShadow = true;
  
  floor.position.set(position.x, position.y, position.z);

  return floor;
}

function createBoundingBoxWireframe(scene, boundingBox) {
  const size = boundingBox.getSize(new THREE.Vector3());
  const center = boundingBox.getCenter(new THREE.Vector3());
  
  const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
  const wireframeGeometry = new THREE.WireframeGeometry(geometry);
  const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
  const wireframe = new THREE.LineSegments(wireframeGeometry, material);
  
  wireframe.position.copy(center);
  
  scene.add(wireframe);
  return wireframe;
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

  // This if for collision detection, basically I'm removing the door hole from being detected for collision
  // otherwise even when the door is open I can't go through because the wall itself has collision
  const wallBounds = [];

  const leftWallBounds = new THREE.Box3(new THREE.Vector3(0, y, z), new THREE.Vector3((width - doorWidth) / 2, y + height, z + depth));
  const rightWallBounds = new THREE.Box3(new THREE.Vector3((width + doorWidth) / 2, y, z), new THREE.Vector3(width, y + height, z + depth));

  const rotationMatrix = new THREE.Matrix4().makeRotationY(rotationY);

  leftWallBounds.min.applyMatrix4(rotationMatrix);
  leftWallBounds.max.applyMatrix4(rotationMatrix);
  rightWallBounds.min.applyMatrix4(rotationMatrix);
  rightWallBounds.max.applyMatrix4(rotationMatrix);

  leftWallBounds.translate(new THREE.Vector3(x, 0, 0));
  rightWallBounds.translate(new THREE.Vector3(x, 0, 0));

  createBoundingBoxWireframe(scene, leftWallBounds);
  createBoundingBoxWireframe(scene, rightWallBounds);

  wallBounds.push(leftWallBounds);
  wallBounds.push(rightWallBounds);

  return wallBounds;
}

export function createRotatedWallWithDoorHole(scene, x, y, z, rotationY, color, width, height, depth, doorWidth, doorHeight) {
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

  const wallBounds = [];

  const leftWallBounds = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3((width - doorWidth) / 2, height, depth));
  const rightWallBounds = new THREE.Box3(new THREE.Vector3((width + doorWidth) / 2, 0, 0), new THREE.Vector3(width, height, depth));

  // Rotate bounding boxes to match the wall's rotation
  leftWallBounds.applyMatrix4(new THREE.Matrix4().makeRotationY(rotationY));
  rightWallBounds.applyMatrix4(new THREE.Matrix4().makeRotationY(rotationY));

  // Translate bounding boxes to the wall's position
  leftWallBounds.translate(new THREE.Vector3(x, y, z));
  rightWallBounds.translate(new THREE.Vector3(x, y, z));

  createBoundingBoxWireframe(scene, leftWallBounds);
  createBoundingBoxWireframe(scene, rightWallBounds);

  wallBounds.push(leftWallBounds);
  wallBounds.push(rightWallBounds);

  return wallBounds;
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

  doorGroup.isClosed = false;

  scene.add(doorGroup);
  return doorGroup;
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



