import * as THREE from 'three';

function createVaultedWallWithDoorHole(width, height, depth, segments, doorWidth, doorHeight) {
    const curve = new THREE.QuadraticBezierCurve(
      new THREE.Vector2(0, 0),
      new THREE.Vector2(width / 2, height),
      new THREE.Vector2(width, 0)
    );
  
    const points = curve.getPoints(segments);
  
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];
  
    // Add vertices for the wall with a hole for the door
    points.forEach((point) => {
      if (point.x > 0 && point.x < doorWidth && point.y < doorHeight) {
        return;
      }
      vertices.push(point.x, point.y, 0);
      vertices.push(point.x, point.y, depth);
    });
  
    // Create faces for the wall
    for (let i = 0; i < vertices.length / 3 - 2; i += 2) {
      indices.push(i, i + 1, i + 2);
      indices.push(i + 1, i + 3, i + 2);
    }
  
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
  
    // Update face normals and vertex normals
    geometry.computeVertexNormals();
  
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);
  
    return mesh;
  }
  

export function createSunnyRoom(width, height, depth, segments, doorWidth, doorHeight) {
  const group = new THREE.Group();

  const wallWidth = width * 2; // Increase the width to cover both sides
  const wall = createVaultedWallWithDoorHole(height, depth, wallWidth, segments, doorWidth, doorHeight);
  wall.rotation.y = Math.PI / 2;
  wall.position.x = 0;
  group.add(wall);

  return group;
}
