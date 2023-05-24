import * as THREE from '../threejs/three.module.js';

function generatePosition(restrictedZones) {
    while (true) {
        const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(1000));
        const position = new THREE.Vector3(x, y, z);

        let isInRestrictedZone = false;
        for (const zone of restrictedZones) {
            if (zone.containsPoint(position)) {
                isInRestrictedZone = true;
                break;
            }
        }
        if (!isInRestrictedZone) {
            return position;
        }
    }
}


export function generateStars(numStars, restrictedZones) {
    const stars = new THREE.Group();

    for(let i = 0; i < numStars; i++) {
        const geometry = new THREE.SphereGeometry(0.5, 32, 32);
        const material = new THREE.MeshBasicMaterial({color: 0xffffff});
        const star = new THREE.Mesh(geometry, material);

        const position = generatePosition(restrictedZones);

        star.position.copy(position);
        stars.add(star);
    }
    
    return stars;
}

let textureLoader = new THREE.TextureLoader();


export function generatePlanets(numPlanets, restrictedZones) {
    const planets = new THREE.Group();

    for(let i = 0; i < numPlanets; i++) {
        const radius = THREE.MathUtils.randFloat(10, 50);
        const color = new THREE.Color(Math.random() * 0x11111);

        const geometry = new THREE.SphereGeometry(radius, 64, 64);

        const texturePath = '../assets/textures/castle_brick_07_diff_1k.jpg'; 
        const bumpMapPath = 'path_to_your_bump_map.png'; 
        const texture = texturePath ? textureLoader.load(texturePath) : null;
        const bumpMap = bumpMapPath ? textureLoader.load(bumpMapPath) : null;
        
        const materialOptions = {
            color: color,
            bumpScale: 0.05, 
        };

        if (texture) {
            materialOptions.map = texture;
        }

        if (bumpMap) {
            materialOptions.bumpMap = bumpMap;
        }

        const material = new THREE.MeshStandardMaterial(materialOptions);

        const planet = new THREE.Mesh(geometry, material);
        const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(1000));
        const position = generatePosition(restrictedZones);
        planet.orbitRadius = position.distanceTo(new THREE.Vector3(0, 0, 0)); 
        planet.angle = Math.random() * Math.PI * 2; 


        planet.position.copy(position);
        planet.position.set(x, y, z);
        
        planet.rotationSpeed = Math.random() * 0.02;
        
        planet.rotationAxis = new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize();
        
        const atmosphereGeometry = new THREE.SphereGeometry(radius * 1.01, 64, 64);
        const atmosphereMaterial = new THREE.MeshBasicMaterial({
            color: color,
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.3,
        });
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        planet.add(atmosphere);
        
        // TODO: Add rings
        
        planets.add(planet);
    }
    
    return planets;
}

export function generateSun(restrictedZones) {
    const radius = 200; 
    const texturePath = '../assets/textures/castle_brick_07_diff_1k.jpg';  
    const glowTexturePath = 'plank_flooring_02_diff_1k.jpg'; 

    const geometry = new THREE.SphereGeometry(radius, 64, 64);
    const texture = texturePath ? textureLoader.load(texturePath) : null;
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        color: 0xffffff,
    });
    const sun = new THREE.Mesh(geometry, material);

    const position = generatePosition(restrictedZones);
    sun.position.copy(position);


    const spriteMaterial = new THREE.SpriteMaterial({
        map: new THREE.TextureLoader().load(glowTexturePath),
        color: 0xffffee,
        transparent: false,
        blending: THREE.AdditiveBlending
    });

    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(radius*2, radius*2, 1.0);
    sun.add(sprite); 

    return sun;
}

export function animatePlanets(planets, sun) {
    const center = sun.position;
    planets.children.forEach((planet) => {
        const axis = new THREE.Vector3().subVectors(center, planet.position).normalize();
        
        planet.rotateOnAxis(axis, planet.rotationSpeed);
        
        planet.angle += planet.rotationSpeed;
        planet.position.x = center.x + planet.orbitRadius * Math.cos(planet.angle);
        planet.position.z = center.z + planet.orbitRadius * Math.sin(planet.angle);
    });
}

