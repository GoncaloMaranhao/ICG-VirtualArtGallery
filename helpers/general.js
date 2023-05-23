import * as THREE from '../threejs/three.module.js';

const textureLoader = new THREE.TextureLoader();

export function createSimpleWall(position, width, height, depth, color, rotationY, material) {
  const geometry = new THREE.BoxGeometry(width, height, depth);

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

export function createPainting(scene, position, rotation, width, height, frameThickness, imagePath, paintingInfo) {
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
  paintingGroup.position.set(position.x, position.y, position.z);
  paintingGroup.rotation.set(rotation.x, rotation.y, rotation.z);
  paintingGroup.userData = paintingInfo;
  scene.add(paintingGroup);
}
