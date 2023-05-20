import * as THREE from 'three';

export function createSimpleWall(position, width, height, depth, color, rotationY, material) {
  const geometry = new THREE.BoxGeometry(width, height, depth);

  if (!material) {
    material = new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide });
  }

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(position.x, position.y, position.z);
  mesh.rotation.y = rotationY;
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;
}
