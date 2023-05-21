import * as THREE from 'three';

function createVaultedWall(width, height, depth, segments, doorWidth, doorHeight) {

  const widthScale = 0;
  const heightScale = 1.5;

  width += widthScale;
  height += heightScale;

  const curve = new THREE.QuadraticBezierCurve(
    new THREE.Vector2(0, 0),
    new THREE.Vector2(width / 2, height),
    new THREE.Vector2(width, 0)
  );

  const points = curve.getPoints(segments);

  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  const indices = [];

  points.forEach((point) => {
    if (point.x > 0 && point.x < doorWidth && point.y < doorHeight) {
      return;
    }
    vertices.push(point.x, point.y, 0);
    vertices.push(point.x, point.y, depth);
  });
  for (let i = 0; i < vertices.length / 3 - 2; i += 2) {
    indices.push(i, i + 1, i + 2);
    indices.push(i + 1, i + 3, i + 2);
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const material = new THREE.MeshPhongMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;
}
  
export function createSunnyRoom(width, height, depth, segments, doorWidth, doorHeight) {
  const group = new THREE.Group();

  const wallWidth = width * 2;
  const wall = createVaultedWall(height, depth, wallWidth, segments, doorWidth, doorHeight);
  wall.rotation.y = Math.PI / 2;
  wall.position.x = 0;
  group.add(wall);

  return group;
}

export function createFresco(scene, position, width, height, texturePath) {
  const textureLoader = new THREE.TextureLoader();
  const frescoTexture = textureLoader.load(texturePath);
  const frescoMaterial = new THREE.MeshPhongMaterial({ map: frescoTexture });
  const frescoGeometry = new THREE.PlaneGeometry(width, height);
  const fresco = new THREE.Mesh(frescoGeometry, frescoMaterial);

  fresco.castShadow = true;
  fresco.receiveShadow = true;
  
  fresco.position.set(position.x, position.y, position.z);
  scene.add(fresco);
}

export function createWindow(position, width, height, depth, frameColor, rotationY, frameMaterial, paneMaterial) {
  const windowFrameGeometry = new THREE.BoxGeometry(width, height, depth);

  if (!frameMaterial) {
    frameMaterial = new THREE.MeshPhongMaterial({ color: frameColor, side: THREE.DoubleSide });
  }

  const windowFrame = new THREE.Mesh(windowFrameGeometry, frameMaterial);
  windowFrame.castShadow = true;
  windowFrame.receiveShadow = true;

  const windowPaneGeometry = new THREE.BoxGeometry(width * 0.9, height * 0.9, depth * 0.1);

  if (paneMaterial) {
    const windowPane = new THREE.Mesh(windowPaneGeometry, paneMaterial);
    windowPane.castShadow = true;
    windowPane.receiveShadow = true;
    windowFrame.add(windowPane);
  }
  
  windowFrame.position.set(position.x, position.y, position.z);
  windowFrame.rotation.y = rotationY;

  return windowFrame;
}

export function createWallWithTwoWindows(position, wallWidth, wallHeight, wallDepth, 
  rectWindowWidth, rectWindowHeight, rectWindowPosition, 
  circularWindowRadius, circularWindowPosition, 
  color, rotationY, material) {

const shape = new THREE.Shape();
shape.moveTo(-wallWidth / 2, 0);
shape.lineTo(wallWidth / 2, 0);
shape.lineTo(wallWidth / 2, wallHeight);
shape.lineTo(-wallWidth / 2, wallHeight);

const rectHolePath = new THREE.Path();
rectHolePath.moveTo(rectWindowPosition.x - rectWindowWidth / 2, rectWindowPosition.y - rectWindowHeight / 2);
rectHolePath.lineTo(rectWindowPosition.x + rectWindowWidth / 2, rectWindowPosition.y - rectWindowHeight / 2);
rectHolePath.lineTo(rectWindowPosition.x + rectWindowWidth / 2, rectWindowPosition.y + rectWindowHeight / 2);
rectHolePath.lineTo(rectWindowPosition.x - rectWindowWidth / 2, rectWindowPosition.y + rectWindowHeight / 2);
shape.holes.push(rectHolePath);

const circularHolePath = new THREE.Path();
circularHolePath.absarc(circularWindowPosition.x, circularWindowPosition.y, circularWindowRadius, 0, Math.PI * 2, false);
shape.holes.push(circularHolePath);

const geometry = new THREE.ExtrudeGeometry(shape, { depth: wallDepth, bevelEnabled: false });

if (!material) {
material = new THREE.MeshPhongMaterial({ color, side: THREE.DoubleSide });
}

const mesh = new THREE.Mesh(geometry, material);
mesh.position.set(position.x, position.y, position.z);
mesh.rotation.y = rotationY;
mesh.castShadow = true;
mesh.receiveShadow = true;


return mesh;
}

