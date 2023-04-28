import * as THREE from 'three';

function createVaultedWall(width, height, depth, segments) {
  const curve = new THREE.QuadraticBezierCurve(
    new THREE.Vector2(0, 0),
    new THREE.Vector2(width / 2, height),
    new THREE.Vector2(width, 0)
  );

  const points = curve.getPoints(segments);
  const shape = new THREE.Shape(points);

  const extrudeSettings = {
    steps: 1,
    depth: depth,
    bevelEnabled: false
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geometry, material);

  return mesh;
}

export function createSunnyRoom(width, height, depth, segments) {
    const group = new THREE.Group();
    
    const doorWidth = 1.5; 
    const doorHeight = 2; 

    
    const wallWidth = width * 2; // Increase the width to cover both sides
    const wall = createVaultedWall(height, depth, wallWidth, segments,);
    wall.rotation.y = Math.PI / 2;
    wall.position.x = 0;
    group.add(wall);
  
    return group;
  }

  