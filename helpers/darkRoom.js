import * as THREE from '../threejs/three.module.js';

let textureLoader = new THREE.TextureLoader();

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

function generatePositionForStars(restrictedZones) {
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

        const position = generatePositionForStars(restrictedZones);

        star.position.copy(position);
        stars.add(star);
    }
    
    return stars;
}


export function generatePlanets(numPlanets, restrictedZones) {
    const planets = new THREE.Group();

    for(let i = 0; i < numPlanets; i++) {
        const radius = THREE.MathUtils.randFloat(10, 100);
        const color = new THREE.Color(Math.random() * 0xffffff);  // Ensures brighter colors

        const geometry = new THREE.SphereGeometry(radius, 64, 64);

        const texturePath = '../assets/textures/castle_brick_07_diff_1k.jpg'; 
        const bumpMapPath = 'path_to_your_bump_map.png'; 
        const glowTexturePath = 'plank_flooring_02_diff_1k.jpg';  

        const texture = texturePath ? textureLoader.load(texturePath) : null;
        const bumpMap = bumpMapPath ? textureLoader.load(bumpMapPath) : null;
        
        const materialOptions = {
            color: color,
        };

        if (texture) {
            materialOptions.map = texture;
        }

        const material = new THREE.MeshBasicMaterial(materialOptions);

        const planet = new THREE.Mesh(geometry, material);

        const spriteMaterial = new THREE.SpriteMaterial({
            map: new THREE.TextureLoader().load(glowTexturePath),
            color: color,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(radius * 2, radius * 2, 1.0);
        planet.add(sprite); 

        
        const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(1000));
        const position = generatePosition(restrictedZones);
        position.y = 605/2 + THREE.MathUtils.randFloatSpread(50); 
        const scaleFactor = 1.5; //Closer or farther away from the sun 
        planet.orbitRadius = scaleFactor * position.distanceTo(new THREE.Vector3(0, 0, 0)); 
        planet.angle = Math.random() * Math.PI * 2; 

        planet.position.copy(position);
        
        planet.rotationSpeed = Math.random() * 0.002;
        
        planet.rotationAxis = new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize();
        
        const atmosphereGeometry = new THREE.SphereGeometry(radius * 1.01, 64, 64);
        const atmosphereMaterial = new THREE.MeshPhongMaterial({
            color: color,
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.3,
        });
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        planet.add(atmosphere);
        
        if (Math.random() > 0.6) { // 40% chance to have a ring
            const ringSize = THREE.MathUtils.randFloat(1.2, 1.5);
            const ringThickness = THREE.MathUtils.randFloat(0.1, 0.3);
            const ringGeometry = new THREE.RingGeometry(radius * ringSize, radius * ringSize + radius * ringThickness, 64);            const ringMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x888888, 
                side: THREE.DoubleSide 
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2; 
            planet.add(ring);
        }

        // elliptical rotation
        planet.orbitRadiusX = planet.orbitRadius * THREE.MathUtils.randFloat(0.5, 1.5); 
        planet.orbitRadiusZ = planet.orbitRadius; 

        
        planets.add(planet);
    }
    
    return planets;
}

export function generateSun() {
    const radius = 400; 
    const texturePath = '../assets/textures/castle_brick_07_diff_1k.jpg';  
    const glowTexturePath = 'plank_flooring_02_diff_1k.jpg'; 

    const geometry = new THREE.SphereGeometry(radius, 64, 64);
    const texture = texturePath ? textureLoader.load(texturePath) : null;
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        color: 0xffffff,
    });
    const sun = new THREE.Mesh(geometry, material);


    const position = new THREE.Vector3(-1000, 605, 0); 
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
        planet.position.x = center.x + planet.orbitRadiusX * Math.cos(planet.angle);
        planet.position.z = center.z + planet.orbitRadiusZ * Math.sin(planet.angle);
    });
}


