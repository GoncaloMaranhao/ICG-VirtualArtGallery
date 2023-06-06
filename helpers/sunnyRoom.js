import * as THREE from 'three';
import { FBXLoader } from '../threejs/FBXLoader.js';
import { GLTFLoader } from '../threejs/GLTFLoader.js';
import { collidableObjects } from '../main.js';

function createVaultedWall(width, height, depth, segments, doorWidth, doorHeight) {

  const widthScale = 0;
  const heightScale = 1.5;

  width += widthScale;
  height += heightScale;

  // Create a curve to represent the vaulted shape of the wall
  const curve = new THREE.QuadraticBezierCurve(
    new THREE.Vector2(0, 0),
    new THREE.Vector2(width / 2, height),
    new THREE.Vector2(width, 0)
  );
  
  // Get points along the curve
  const points = curve.getPoints(segments);

  const geometry = new THREE.BufferGeometry();
  // holds the coordinates for each vertex
  const vertices = [];
  // holds the indices that define each triangular face
  const indices = [];

  points.forEach((point) => {
    if (point.x > 0 && point.x < doorWidth && point.y < doorHeight) {
      return;
    }
  // push each point's coordinates to the vertices array twice, once for the front and once for the back
    vertices.push(point.x, point.y, 0);
    vertices.push(point.x, point.y, depth);
  });
    // creating the faces of the wall
  for (let i = 0; i < vertices.length / 3 - 2; i += 2) {
    indices.push(i, i + 1, i + 2);
    indices.push(i + 1, i + 3, i + 2);
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  // this is to fix the lightning
  geometry.computeVertexNormals();

  const material = new THREE.MeshPhongMaterial({ color: 0x654321, side: THREE.DoubleSide });
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

  // Invisible walls for collision because I can't find another way to add collision to such a complex shape (vaultedWall) 
  const boxGeometry = new THREE.BoxGeometry(wallWidth, depth, 0.1);
  const boxMaterial = new THREE.MeshBasicMaterial({visible: false});
  const boundingBox = new THREE.Mesh(boxGeometry, boxMaterial);

  boundingBox.position.set(30, 0, 12);
  group.add(boundingBox);
  boundingBox.updateMatrixWorld(true);
  boundingBox.boundingBox = new THREE.Box3().setFromObject(boundingBox);
  collidableObjects.push(boundingBox);

  const boundingBox2 = new THREE.Mesh(boxGeometry, boxMaterial);
  boundingBox2.position.set(30,0,-12);
  group.add(boundingBox2);
  boundingBox2.updateMatrixWorld(true);
  boundingBox2.boundingBox = new THREE.Box3().setFromObject(boundingBox2);
  collidableObjects.push(boundingBox2);

  return group;
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
const loader2 = new THREE.TextureLoader();
const texturePath = './assets/textures/green-artificial-grass-textured-background.jpg';

export function createGarden(scene, position, outerRadius, innerRadius, flowerCount, thickness, rotationX = Math.PI / 2) {
  const texture = loader2.load(texturePath);

  const gardenShape = new THREE.Shape()
    .moveTo(0, 0)
    .absarc(0, 0, outerRadius, 0, Math.PI * 2, false);

  const holePath = new THREE.Path()
    .moveTo(0, 0)
    .absarc(0, 0, innerRadius, 0, Math.PI * 2, true);

  gardenShape.holes.push(holePath);
  
  const gardenGeometry = new THREE.ExtrudeGeometry(gardenShape, { depth: thickness, bevelEnabled: false });
  
  const gardenMaterial = new THREE.MeshPhongMaterial({ map: texture });
  
  const garden = new THREE.Mesh(gardenGeometry, gardenMaterial);

  garden.position.set(position.x, position.y, position.z);
  garden.rotation.x = rotationX;
  garden.receiveShadow = true;
  
  scene.add(garden);
  
  const loader = new GLTFLoader();
  loader.load(
    './assets/models/Flowers2.glb',
    (gltf) => {
      for (let i = 0; i < flowerCount; i++) {
        let flower = gltf.scene.clone();
  
        flower.traverse(function (node) {
          if (node instanceof THREE.Mesh) {
            node.castShadow = true;
            node.receiveShadow = true;
            if (node.material) {
              if (node.material instanceof THREE.MeshPhongMaterial) {
                node.material.shininess = 10;
              }
              if (node.material instanceof THREE.MeshStandardMaterial) {
                node.material.roughness = 0.8; 
              }
            }
          }
        });
        const scale = 1;
        flower.scale.set(scale, scale, scale);
  
        let angle = Math.random() * Math.PI * 2;
        let rad = outerRadius - 1.9;
        flower.position.set(
          rad * Math.cos(angle) + position.x - 1.5,
          position.y,
          rad * Math.sin(angle) + position.z + 0.5
        );
        scene.add(flower);
      }
    },
    undefined,
    (err) => {
      console.error(err);
    }
  );
  
}

export function createCircularWindow(radius, position, rotation, color, material) {
  const geometry = new THREE.CylinderGeometry(radius, radius, 0.1, 64);
  if (!material) {
    material = new THREE.MeshPhongMaterial({ color: color, side: THREE.DoubleSide });
  }

  const circle = new THREE.Mesh(geometry, material);
  circle.rotation.set(rotation.x, rotation.y, rotation.z);
  circle.position.set(position.x, position.y, position.z);
  circle.castShadow = true;
  circle.receiveShadow = true;

  return circle;
}
