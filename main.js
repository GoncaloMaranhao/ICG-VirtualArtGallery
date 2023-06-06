// Author: Gonçalo Rodrigues Maranhão

import * as THREE from './threejs/three.module.js';
import { FBXLoader } from './threejs/FBXLoader.js';
import { GLTFLoader } from './threejs/GLTFLoader.js';
import { DRACOLoader } from './threejs//DRACOLoader.js';
import './helpers/eventListeners.js';
import { generateStars, generatePlanets, generateSun, animatePlanets } from './helpers/darkRoom.js';
import { initializeEventListener } from './helpers/eventListeners.js';
import { initializePlayerMovement, updatePosition } from './helpers/playerMovement.js';
import { createWallWithDoorHole, createCeiling, 
         createDoor, createFloor, createRotatedWallWithDoorHole} from './helpers/entranceRoom.js';
import { createCircularWindow, createGarden, createSunnyRoom, createWallWithTwoWindows, createWindow  } from './helpers/sunnyRoom.js';
import { hasRequiredRotations, closeDoor, startStatueRotation, animateStatueRotation, openDoor } from './helpers/animations.js';
import { createSimpleWall, createPainting  } from './helpers/general.js';

export const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

export const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 1.7;

alert('PLEASE READ THIS. Here are the instructions. In order to gain control of the camera you must click with your right mouse in the middle of the screen. Then you can move the camera with the mouse and move the player with the w,a,s,d keys. You can open or close doors by pressing the key e and MOST IMPORTANTLY you can see a painting information by pressing the key x . There is a point in this game/exploration where you must read at least one paiting (it has something particular, you would be able to tell just by seeing it) information in order to advance. You can press space to remove these textboxes, you dont have to click the ok button with the mouse. ');

initializePlayerMovement(camera, renderer);

initializeEventListener(camera, startStatueRotation);

const textureLoader = new THREE.TextureLoader();

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('./threejs/draco/draco/');

const fbxLoader = new FBXLoader();
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

//For collisions
export let collidableObjects = [];

//--------------------------_Entrance Room_----------------------

const darkWoodTexture = textureLoader.load('./assets/textures/Wood_027_roughness.jpg');
const darkWoodMaterial = new THREE.MeshPhongMaterial({ map: darkWoodTexture });

const floorTexture = textureLoader.load('./assets/textures/Wood_027_basecolor.jpg');
const floorMaterial = new THREE.MeshPhongMaterial({ map: floorTexture });
floorMaterial.castShadow = true;
floorMaterial.receiveShadow = true;

const floorWidth = 25;
const floorHeight = 0.1;
const floorDepth = floorWidth;
const floorPosition = { x: 0, y: 0.05, z: 0 };
const floor = createFloor(floorWidth, floorHeight, floorDepth, floorMaterial, floorPosition);
scene.add(floor);

const doorWidth = 1.75;
const doorHeight = 2.5;
const doorDepth = 0.2;

const leftDoor = createDoor(scene, -floorWidth / 2, 0.13, 0, Math.PI / 2, 
          darkWoodMaterial, doorWidth, doorHeight, doorDepth); 
          leftDoor.boundingBox = new THREE.Box3().setFromObject(leftDoor);
          collidableObjects.push(leftDoor);

export let sunnyRoomDoor;
sunnyRoomDoor = createDoor(scene, floorWidth / 2,    0.13, 0, -Math.PI / 2, 
          darkWoodMaterial, doorWidth, doorHeight, doorDepth);
          sunnyRoomDoor.boundingBox = new THREE.Box3().setFromObject(sunnyRoomDoor);
          collidableObjects.push(sunnyRoomDoor);


export let frontDoor = createDoor(scene, 0, 0.13, -floorWidth / 2, 0, 
          darkWoodMaterial, doorWidth, doorHeight, doorDepth);
          frontDoor.boundingBox = new THREE.Box3().setFromObject(frontDoor);
          collidableObjects.push(frontDoor);

const ceilingPositionY = 7;
const ceilingWidth = floorWidth / 2;
const ceilingHeight = 0.1;
const ceilingDepth = floorDepth;
const ceilingMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
createCeiling(scene, - floorWidth / 4, ceilingPositionY, 0, ceilingMaterial,
              ceilingWidth, ceilingHeight, ceilingDepth );


const frontWallBounds = createWallWithDoorHole(scene, -floorWidth / 2, 0, -floorWidth / 2, 0, 0x8b0000, 
                       floorWidth, ceilingPositionY, 0.1, doorWidth * 2, doorHeight+0.1);
frontWallBounds.forEach(bounds => collidableObjects.push(bounds));

const leftWallBounds = createRotatedWallWithDoorHole(scene, -floorWidth / 2, 0, floorWidth / 2, Math.PI / 2, 0x8b0000,
                       floorWidth, ceilingPositionY, 0.1, doorWidth * 2, doorHeight + 0.1);
leftWallBounds.forEach(bounds => collidableObjects.push(bounds));

const rightWallBounds = createRotatedWallWithDoorHole(scene, floorWidth / 2, 0, floorWidth / 2, Math.PI / 2, 0x123456,
                       floorWidth, ceilingPositionY + 19.1, 0.1, doorWidth * 2, doorHeight + 0.1);
rightWallBounds.forEach(bounds => collidableObjects.push(bounds));

// back wall, no hole
let backWallEntranceRoomPosition = new THREE.Vector3(0, ceilingPositionY / 2, floorWidth / 2);
const backWallEntranceRoom = createSimpleWall(backWallEntranceRoomPosition, floorWidth, ceilingPositionY, 0.1, 0x0000ff, Math.PI, undefined, false);
scene.add(backWallEntranceRoom);
backWallEntranceRoom.updateMatrixWorld(true);
backWallEntranceRoom.boundingBox = new THREE.Box3().setFromObject(backWallEntranceRoom);
collidableObjects.push(backWallEntranceRoom);

const spotLight = new THREE.SpotLight(0xffffff, 1);
spotLight.position.set(0, ceilingHeight + 10, 0);
spotLight.angle = Math.PI / 2.5; 
spotLight.penumbra = 0.1;
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.bias = -0.005;
scene.add(spotLight);

//--------------------------_Sunny Room_----------------------

const sunnyFloorTexture = textureLoader.load('./assets/textures/14124.jpg');
const sunnyFloorMaterial = new THREE.MeshPhongMaterial({ map: sunnyFloorTexture });
sunnyFloorMaterial.castShadow = true;
sunnyFloorMaterial.receiveShadow = true;

const sunnyFloorWidth = 40;
const sunnyFloorHeight = 0.1;
const sunnyFloorDepth = sunnyFloorWidth - 15;

const sunnyfloorPosition = { x: floorWidth + 7.5, y: 0.05, z: 0 };
const sunnyFloor = createFloor(sunnyFloorWidth, sunnyFloorHeight, sunnyFloorDepth, sunnyFloorMaterial, sunnyfloorPosition);
scene.add(sunnyFloor);

const sunnyRoomWidth = 19.5;
const sunnyRoomHeight = floorWidth;
const sunnyRoomDepth = floorDepth * 2;
const segments = 16;
const sunnyRoom = createSunnyRoom(sunnyRoomWidth, sunnyRoomHeight, sunnyRoomDepth, segments, doorWidth, doorHeight);
sunnyRoom.position.set(floorWidth / 2,0 ,floorWidth / 2 );

scene.add(sunnyRoom);

const wallPosition = { x: 49.5, y: 0.05 , z: 0 };
const wallWidth = sunnyFloorWidth / 1.5;
const wallHeight = ceilingPositionY + 19.1;
const wallDepth = 0.4;

const rectWindowWidth = 10;
const rectWindowHeight = 5;
const rectWindowPosition = { x: 0, y: ceilingPositionY + 2 };

const circularWindowRadius = 2;
const circularWindowPosition = { x: 0, y: 18 };

const wallColor = 0x654321;
const wallRotationY = Math.PI / 2; 


const sunnyRoomFrontWall = createWallWithTwoWindows(wallPosition, wallWidth, wallHeight, wallDepth, 
                           rectWindowWidth, rectWindowHeight, rectWindowPosition, 
                           circularWindowRadius, circularWindowPosition, 
                           wallColor, wallRotationY, null);
scene.add(sunnyRoomFrontWall);
sunnyRoomFrontWall.updateMatrixWorld(true);
sunnyRoomFrontWall.boundingBox = new THREE.Box3().setFromObject(sunnyRoomFrontWall);
collidableObjects.push(sunnyRoomFrontWall);


const paneMaterial = new THREE.MeshPhongMaterial({
 color: 0xffffff, 
 transparent: true, 
 opacity: 0
});

const windowPosition = { x: 49.5, y: ceilingPositionY + 2, z: 0 };
const windowWidth = rectWindowWidth - 0.1;
const windowHeight = rectWindowHeight - 0.1;
const windowDepth = wallDepth - 0.1;
const windowFrameColor = 0x652233
const windowRotationY = Math.PI / 2; 

let textureLoader3 = new THREE.TextureLoader();
let wallTexture = textureLoader3.load('./assets/textures/wYrREaw-768x1024.jpg');

let wallMaterial = new THREE.MeshPhongMaterial({
  map: wallTexture, 
  side: THREE.DoubleSide
}); 


scene.add(createWindow(windowPosition, windowWidth, windowHeight, windowDepth, windowFrameColor, windowRotationY, wallMaterial, paneMaterial));

let radius = 2;
let position = new THREE.Vector3(49.5, 18, 0);
let rotation = new THREE.Vector3(0, 0, Math.PI / 2); 
let color = 0xff0000;

let roseWindowtexture = new THREE.TextureLoader().load('./assets/textures/roseWindow2.jpg');
const roseWindowmaterial = new THREE.MeshPhongMaterial({
  map: roseWindowtexture,
  transparent: true,
  side: THREE.DoubleSide
});

let window1 = createCircularWindow(radius, position, rotation, color, roseWindowmaterial);
scene.add(window1);

position = new THREE.Vector3(30, 0.1, 0);
rotation = new THREE.Vector3(0, Math.PI / 2, 0); 
let window2 = createCircularWindow(radius, position, rotation, color, roseWindowmaterial);
scene.add(window2);

//---------------------------_SunnyRoomPaintings_----------------------------
const positionPaintingX = 12.7;
const positionPaintingY = 2;
const positionPaintingZ = 3.5;

const normalPaitingwidth = 2;
const normalPaitingHeight = 3;
const normalPaitingFrameThickness = 0.1;

const positionPainting = new THREE.Vector3(positionPaintingX, positionPaintingY, positionPaintingZ);
const rotationPaintingVertical = new THREE.Vector3(0, Math.PI / 2, 0);
const rotationPaintingVerticalInverse = new THREE.Vector3(0, - Math.PI / 2, 0);
const rotationPaintingHorizontalTilt = new THREE.Vector3(Math.PI / 16, 0, Math.PI / 2);
const rotationPaintingHorizontalTilt2 = new THREE.Vector3(Math.PI / 8, 0, Math.PI / 2);
const rotationPaintingHorizontalTiltInverse = new THREE.Vector3(-Math.PI / 14, Math.PI, Math.PI / 2);
const rotationPaintingHorizontalTiltInverse2 = new THREE.Vector3(-Math.PI / 8, Math.PI, Math.PI / 2);

// Back wall
createPainting(
  scene, positionPainting, rotationPaintingVertical, 
  2, 3, 0.1, './assets/textures/1024px-A_Sunday_on_La_Grande_Jatte_by_Georges_Seurat_-_Joy_of_Museums_-_Art_Institute_of_Chicago.jpg',
  {
    name: "A Sunday Afternoon on the Island of La Grande Jatte",
    artist: "Georges Seurat",
    year: "1886",
    description: "Georges Seurat’s masterpiece, evoking the Paris of La Belle Epoque, is actually depicting a working-class suburban scene well outside the city’s center. Seurat often made this milieu his subject, which differed from the bourgeois portrayals of his Impressionist contemporaries. Seurat abjured the capture-the-moment approach of Manet, Monet and Degas, going instead for the sense of timeless permanence found in Greek sculpture. And that is exactly what you get in this frieze-like processional of figures whose stillness is in keeping with Seurat’s aim of creating a classical landscape in modern form."
  }
);

positionPainting.z = positionPaintingZ + 3.5;
createPainting(scene, positionPainting, rotationPaintingVertical, 
  2, 3, 0.1, './assets/textures/123.jpg', {
    name: "Girl with a Pearl Earring",
    artist: "Johannes Vermeer",
    year: "1665",
    description: "Johannes Vermeer’s 1665 study of a young woman is startlingly real and startlingly modern, almost as if it were a photograph. This gets into the debate over whether or not Vermeer employed a pre-photographic device called a camera obscura to create the image. Leaving that aside, the sitter is unknown, though it’s been speculated that she might have been Vermeer's maid. He portrays her looking over her shoulder, locking her eyes with the viewer as if attempting to establish an intimate connection across the centuries. Technically speaking, Girl isn’t a portrait, but rather an example of the Dutch genre called a tronie—a headshot meant more as still life of facial features than as an attempt to capture a likeness."
  }
);


positionPainting.z = positionPaintingZ - 7.5;
createPainting(scene, positionPainting, rotationPaintingVertical, normalPaitingwidth, 
  normalPaitingHeight, normalPaitingFrameThickness, './assets/textures/Starry-Night.webp', {
  name: "The Starry Night",
  artist: "Vincent van Gogh", 
  year: "1889",
  description: "Vincent Van Gogh’s most popular painting, The Starry Night was created by Van Gogh at the asylum in Saint-Rémy, where he’d committed himself in 1889. Indeed, The Starry Night seems to reflect his turbulent state of mind at the time, as the night sky comes alive with swirls and orbs of frenetically applied brush marks springing from the yin and yang of his personal demons and awe of nature."
  }
);
positionPainting.z = positionPaintingZ - 11;
createPainting(scene, positionPainting, rotationPaintingVertical, 2, normalPaitingHeight, 
  normalPaitingFrameThickness, './assets/textures/the-kiss-.jpg', {
    name: "The Kiss", 
    artist: "Gustav Klimt",
    year: "1907",
    description: "Opulently gilded and extravagantly patterned, The Kiss, Gustav Klimt’s fin-de-siècle portrayal of intimacy, is a mix of Symbolism and Vienna Jugendstil, the Austrian variant of Art Nouveau. Klimt depicts his subjects as mythical figures made modern by luxuriant surfaces of up-to-the moment graphic motifs. The work is a highpoint of the artist’s Golden Phase between 1899 and 1910 when he often used gold leaf—a technique inspired by a 1903 trip to the Basilica di San Vitale in Ravenna, Italy, where he saw the church’s famed Byzantine mosaics."
  }
);
positionPainting.y = positionPaintingY + 8;
positionPainting.z = positionPaintingZ - 4;
createPainting(scene, positionPainting, rotationPaintingVertical, 10, 9, normalPaitingFrameThickness, './assets/textures/151090.jpg');

//Left wall
positionPainting.x = positionPaintingX + 6;
positionPainting.y = positionPaintingY + 1;
positionPainting.z = positionPaintingZ - 15.1;
createPainting(scene, positionPainting, rotationPaintingHorizontalTilt, 
  normalPaitingwidth * 2, normalPaitingHeight * 2, normalPaitingFrameThickness, './assets/textures/zqh.jpeg', {
    name: "The Harvesters",
    artist: "Pieter Bruegel", 
    year: "1565",
    description: "Bruegel’s fanfare for the common man is considered one of the defining works of Western art. This composition was one of six created on the theme of the seasons. The time is probably early September. A group of peasants on the left cut and bundle ripened wheat, while the on the right, another group takes their midday meal. One figure is sacked out under a tree with his pants unbuttoned. This attention to detail continues throughout the painting as a procession of ever-granular observations receding into space. It was extraordinary for a time when landscapes served mostly as backdrops for religious paintings."
    }
  );
positionPainting.x = positionPaintingX + 13;
createPainting(scene, positionPainting, rotationPaintingHorizontalTilt, 
  normalPaitingwidth * 2, normalPaitingHeight * 2, normalPaitingFrameThickness, './assets/textures/Édouard_Mane.jpg', {
    name: "Le Déjeuner sur l’herbe",
    artist: "Édouard Manet", 
    year: "1863",
    description: "Manet’s scene of picnicking Parisians caused a scandal when it debuted at the Salon des Refusés, the alternative exhibition made up of works rejected by the jurors of the annual Salon—the official art exhibition of the Académie des Beaux-Arts that set artistic standards in France. The most vociferous objections to Manet’s work centered on the depiction of a nude woman in the company of men dressed in contemporary clothes. Based on motifs borrowed from such Renaissance greats as Raphael and Giorgione, Le Déjeuner was a cheeky send up of classical figuration—an insolent mash-up of modern life and painting tradition."
    }
  );
positionPainting.x = positionPaintingX + 21;
createPainting(scene, positionPainting, rotationPaintingHorizontalTilt, 
  normalPaitingwidth * 2, normalPaitingHeight * 2, normalPaitingFrameThickness, './assets/textures/guernica.jpg', {
    name: "Guernica",
    artist: "Pablo Picasso", 
    year: "1937",
    description: "Perhaps Picasso’s best-known painting, Guernica is an antiwar cris de coeur occasioned by the 1937 bombing of the eponymous Basque city during the Spanish Civil War by German and Italian aircraft allied with Fascist leader Francisco Franco. The leftist government that opposed him commissioned Picasso to created the painting for the Spanish Pavillion at 1937 World’s Fair in Paris. When it closed, Guernica went on an international tour, before winding up at the Museum of Modern Art in New York. Picasso loaned the painting to MoMA with the stipulation that it be returned to his native Spain once democracy was restored—which it was in 1981, six years after Franco's death in 1975 (Picasso himself died two years before that.) Today, the painting is housed at the Museo Nacional Centro de Arte Reina Sofía in Madrid."
    }
  );
positionPainting.x = positionPaintingX + 30;
createPainting(scene, positionPainting, rotationPaintingHorizontalTilt, 
  normalPaitingwidth * 2, normalPaitingHeight * 2, normalPaitingFrameThickness, './assets/textures/Liberty-jpg', {
    name: "Liberty Leading the People",
    artist: "Eugène Delacroix", 
    year: "1830",
    description: "Commemorating the July Revolution of 1830, which toppled King Charles X of France, Liberty Leading the People has become synonymous with the revolutionary spirit all over the world. Combining allegory with contemporary elements, the painting is a thrilling example of the Romantic style, going for the gut with its titular character brandishing the French Tricolor as members of different classes unite behind her to storm a barricade strewn with the bodies of fallen comrades. The image has inspired other works of art and literature, including the Statue of Liberty and Victor Hugo’s novel Les Misérables."
    }
  );
positionPainting.x = positionPaintingX + 10;
positionPainting.y = positionPaintingY + 9;
positionPainting.z = positionPaintingZ - 11.5;
createPainting(scene, positionPainting, rotationPaintingHorizontalTilt2, 10, 9, normalPaitingFrameThickness, './assets/textures/impression-sunrise.jpg');
positionPainting.x = positionPaintingX + 23;
createPainting(scene, positionPainting, rotationPaintingHorizontalTilt2, 10, 9, normalPaitingFrameThickness, './assets/textures/JEAN_.jpg');

//Right Wall
positionPainting.x = positionPaintingX + 6;
positionPainting.y = positionPaintingY + 1;
positionPainting.z = positionPaintingZ + 8.15;
createPainting(scene, positionPainting, rotationPaintingHorizontalTiltInverse, 
  normalPaitingwidth * 2, normalPaitingHeight * 2, normalPaitingFrameThickness, './assets/textures/edward-hopper-nighthawks-1942-i116339.jpg', {
    name: "Nighthawks",
    artist: "Edward Hopper", 
    year: "1942",
    description: "An iconic depiction of urban isolation, Nighthawks depicts a quarter of characters at night inside a greasy spoon with an expansive wraparound window that almost takes up the entire facade of the diner. Its brightly lit interior—the only source of illumination for the scene—floods the sidewalk and the surrounding buildings, which are otherwise dark. The restaurant's glass exterior creates a display-case effect that heightens the sense that the subjects (three customers and a counterman) are alone together. It's a study of alienation as the figures studiously ignore each other while losing themselves in a state of reverie or exhaustion. The diner was based on a long-demolished one in Hopper's Greenwich Village neighborhood, and some art historians have suggested that the painting as a whole may have been inspired by Vincent van Gogh’s Café Terrace at Night, which was on exhibit at a gallery Hopper frequented at same time he painted Nighthawks Also of note: The redheaded woman on the far right is the artist's wife Jo, who frequently modeled for him."
    }
  );
positionPainting.x = positionPaintingX + 13;
createPainting(scene, positionPainting, rotationPaintingHorizontalTiltInverse, 
  normalPaitingwidth * 2, normalPaitingHeight * 2, normalPaitingFrameThickness, './assets/textures/Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg', {
    name: "Wanderer above the Sea of Fog",
    artist: "Caspar David Friedrich", 
    year: "1819",
    description: "The worship of nature, or more precisely, the feeling of awe it inspired, was a signature of the Romantic style in art, and there is no better example on that score than this image of a hiker in the mountains, pausing on a rocky outcrop to take in his surroundings. His back is turned towards the viewer as if he were too enthralled with the landscape to turn around, but his pose offers a kind of over-the-shoulder view that draws us into vista as if we were seeing it through his eyes."
    }
  );
positionPainting.x = positionPaintingX + 21;
createPainting(scene, positionPainting, rotationPaintingHorizontalTiltInverse, 
  normalPaitingwidth * 2, normalPaitingHeight * 2, normalPaitingFrameThickness, './assets/textures/Diego-Velazquez-Las-Meninas-detail-1656.jpg', {
    name: "Las Meninas",
    artist: "Diego Rodríguez de Silva", 
    year: "1830",
    description: "A painting of a painting within a painting, Velázquez masterpiece consists of different themes rolled into one: A portrait of Spain’s royal family and retinue in Velázquez’s studio; a self-portrait; an almost art-for-art’s-sake display of bravura brush work; and an interior scene, offering glimpses into Velázquez’s working life. Las Meninas is also a treatise on the nature of seeing, as well as a riddle confounding viewers about what exactly they’re looking at. It’s the visual art equivalent of breaking the fourth wall—or in this case, the studio’s far wall on which there hangs a mirror reflecting the faces of the Spanish King and Queen. Immediately this suggests that the royal couple is on our side of the picture plane, raising the question of where we are in relationship to them. Meanwhile, Velázquez’s full length rendering of himself at his easel begs the question of whether he’s looking in a mirror to paint the picture. In other words, are the subjects of Las Meninas (all of whom are fixing their gaze outside of the frame), looking at us, or looking at themselves?"
    }
  );
positionPainting.x = positionPaintingX + 30;
createPainting(scene, positionPainting, rotationPaintingHorizontalTiltInverse, 
  normalPaitingwidth * 2, normalPaitingHeight * 2, normalPaitingFrameThickness, './assets/textures/Screenshot from 2023-06-06 02-05-30.png', {
    name: "ICG-VirtualArtGallery",
    artist: "Gonçalo Maranhão",
    year: "2023",
    description: "Hello, it's nice that you found this. You can turn the statues by getting close to them and pressing 'z'. In order to get out of this room you have to rotate each statue ONCE."
    }
  );
positionPainting.x = positionPaintingX + 10;
positionPainting.y = positionPaintingY + 9;
positionPainting.z = positionPaintingZ + 5.2;
createPainting(scene, positionPainting, rotationPaintingHorizontalTiltInverse2, 10, 9, normalPaitingFrameThickness, './assets/textures/michelan.webp');
positionPainting.x = positionPaintingX + 23;
createPainting(scene, positionPainting, rotationPaintingHorizontalTiltInverse2, 10, 9, normalPaitingFrameThickness, './assets/textures/the-persistence-of-mem.jpg');


//Front wall
positionPainting.x = positionPaintingX + 36.6;
positionPainting.y = positionPaintingY + 1;
positionPainting.z = positionPaintingZ + 5;
createPainting(scene, positionPainting, rotationPaintingVerticalInverse, normalPaitingwidth + 1, 
  normalPaitingHeight + 1, normalPaitingFrameThickness, './assets/textures/Sandro_Botticell.jpg', {
    name: "ICG-VirtualArtGallery",
    artist: "Gonçalo Maranhão",
    year: "2023",
    description: "Botticelli’s The Birth of Venus was the first full-length, non-religious nude since antiquity, and was made for Lorenzo de Medici. It’s claimed that the figure of the Goddess of Love is modeled after one Simonetta Cattaneo Vespucci, whose favors were allegedly shared by Lorenzo and his younger brother, Giuliano. Venus is seen being blown ashore on a giant clamshell by the wind gods Zephyrus and Aura as the personification of spring awaits on land with a cloak. Unsurprisingly, Venus attracted the ire of Savonarola, the Dominican monk who led a fundamentalist crackdown on the secular tastes of the Florentines. His campaign included the infamous “Bonfire of the Vanities” of 1497, in which “profane” objects—cosmetics, artworks, books—were burned on a pyre. The Birth of Venus was itself scheduled for incineration, but somehow escaped destruction. Botticelli, though, was so freaked out by the incident that he gave up painting for a while."
    }
  );
positionPainting.z = positionPaintingZ;
createPainting(scene, positionPainting, rotationPaintingVerticalInverse, 
  normalPaitingwidth + 1, normalPaitingHeight + 1, normalPaitingFrameThickness, './assets/textures/The_Arnolfin.jpg', {
    name: "The Arnolfini Portrait",
    artist: "Jan van Eyck",
    year: "1434",
    description: "One of the most significant works produced during the Northern Renaissance, this composition is believed to be one of the first paintings executed in oils. A full-length double portrait, it reputedly portrays an Italian merchant and a woman who may or may not be his bride. In 1934, the celebrated art historian Erwin Panofsky proposed that the painting is actually a wedding contract. What can be reliably said is that the piece is one of the first depictions of an interior using orthogonal perspective to create a sense of space that seems contiguous with the viewer’s own; it feels like a painting you could step into."
    }
  );
positionPainting.z = positionPaintingZ -5;
createPainting(scene, positionPainting, rotationPaintingVerticalInverse, 
  normalPaitingwidth + 1, normalPaitingHeight + 1, normalPaitingFrameThickness, './assets/textures/asdzxcv.jpg', {
    name: "The Garden of Earthly Delights",
    artist: "Hieronymus Bosch,",
    year: "1515",
    description: "This fantastical triptych is generally considered a distant forerunner to Surrealism. In truth, it’s the expression of a late medieval artist who believed that God and the Devil, Heaven and Hell were real. Of the three scenes depicted, the left panel shows Christ presenting Eve to Adam, while the right one features the depredations of Hell; less clear is whether the center panel depicts Heaven. In Bosch’s perfervid vision of Hell, an enormous set of ears wielding a phallic knife attacks the damned, while a bird-beaked bug king with a chamber pot for a crown sits on its throne, devouring the doomed before promptly defecating them out again. This riot of symbolism has been largely impervious to interpretation, which may account for its widespread appeal."
    }
  );
positionPainting.z = positionPaintingZ -10;
createPainting(scene, positionPainting, rotationPaintingVerticalInverse, 
  normalPaitingwidth + 1, normalPaitingHeight + 1, normalPaitingFrameThickness, './assets/textures/579px-.jpg', {
    name: "Les Demoiselles ",
    artist: "Pablo Picasso",
    year: "1889",
    description: "The ur-canvas of 20th-century art, Les Demoiselles d’Avignon ushered in the modern era by decisively breaking with the representational tradition of Western painting, incorporating allusions to the African masks that Picasso had seen in Paris's ethnographic museum at the Palais du Trocadro. Its compositional DNA also includes El Greco’s The Vision of Saint John (1608–14), now hanging in the Metropolitan Museum of Art. The women being depicted are actually prostitutes in a brothel in the artist's native Barcelona."
    }
  );


//---------------------------_SunnyRoomLight_--------------------------------

const spotLightSunnyRoom = new THREE.SpotLight(0xFFFFFF, 1, 0, Math.PI); 
spotLightSunnyRoom.position.set(47, ceilingPositionY + 2, 0);
spotLightSunnyRoom.castShadow = true;
spotLightSunnyRoom.shadow.bias = -0.001;
scene.add(spotLightSunnyRoom);

const spotLightSunnyRoom2 = new THREE.SpotLight(0xFFFFFF, 1, 0, Math.PI); 
spotLightSunnyRoom2.position.set(13, ceilingPositionY + 2, 0); 
spotLightSunnyRoom2.castShadow = true;
spotLightSunnyRoom2.shadow.bias = -0.001;
scene.add(spotLightSunnyRoom2);

const spotLightSunnyRoom3 = new THREE.SpotLight(0xFF0000, 1, 0, Math.PI); 
spotLightSunnyRoom3.position.set(47, 18, 0);
spotLightSunnyRoom3.castShadow = true;
spotLightSunnyRoom3.shadow.bias = -0.001;
scene.add(spotLightSunnyRoom3);

export let sunnyRoomBoundary;
sunnyRoomBoundary = new THREE.Box3(
  new THREE.Vector3(sunnyFloorWidth/2, 0, sunnyFloorDepth / 2),
  new THREE.Vector3(sunnyFloorWidth * 1.5, sunnyRoomHeight / 2, sunnyFloorDepth* 1.5)
);

let translationVector = new THREE.Vector3(-7.4, 0.1, -25);
sunnyRoomBoundary.min.add(translationVector);
sunnyRoomBoundary.max.add(translationVector);

// const sunnyRoomBoundaryHelper = new THREE.Box3Helper(sunnyRoomBoundary, 0xff0000);
// scene.add(sunnyRoomBoundaryHelper);

export function isInsideSunnyRoom(camera, boundary) {
  const cameraPosition = camera.position;
  return boundary.containsPoint(cameraPosition);
}

//-----------------------------_SunnyRoomStatues_-------------------------

window.addEventListener('statueFacingCorrectDirection', function (event) {
  if (hasRequiredRotations()) { 
    spotLightSunnyRoom.intensity = 0;
    spotLightSunnyRoom2.intensity = 0;
    spotLightSunnyRoom3.intensity = 1;
    openDoor(sunnyRoomDoor);
  }
});

const gardenPosition = { x: 30, y: 0.5, z: 0 };
createGarden(scene, gardenPosition, 8, 4, 100, 0.1, Math.PI / 2);

export let models = [];

gltfLoader.load(
   './assets/models/Statue.glb',
   (gltf) => {
    const model = gltf.scene
    model.scale.set(2, 2, 2);
    model.position.set(30, 1.5, 3.1);
    models.push(model);
    model.traverse(function(node) {
       if (node.isMesh) {
         node.castShadow = true;
       }
     });
     scene.add(model);
   },
   undefined, 
   (error) => console.error(error)
 )
 gltfLoader.load(
   './assets/models/StatueA.glb',
   (gltf) => {
    const model = gltf.scene
    model.scale.set(2.25, 2.25, 2.25);
    model.position.set(30, 2, -3);
    models.push(model);
    model.traverse(function(node) {
       if (node.isMesh) {
         node.castShadow = true;
       }
     });
     scene.add(model);
   },
   undefined, 
   (error) => console.error(error)
 );

 gltfLoader.load(
   './assets/models/StatueB.glb',
   (gltf) => {
     const model = gltf.scene
     model.scale.set(0.8, 0.8, 0.8);
     model.position.set(33, 1.2, 0)
     models.push(model)
     model.traverse(function(node) {
       if (node.isMesh) {
         node.castShadow = true;
       }
     })
     scene.add(model);
   },
   undefined, 
   (error) => console.error(error)
 );

//---------------------_Dark Room_----------------------------

const planets1Bounds = new THREE.Box3(new THREE.Vector3(1000, 10, -10), new THREE.Vector3(-10, 10, 10));
const planets2Bounds = new THREE.Box3(new THREE.Vector3(-10, 10, -10), new THREE.Vector3(-10, 10, 10));

const stars1Bounds = new THREE.Box3(new THREE.Vector3(-70, -35, -50), new THREE.Vector3(70, 55, 50));
const stars2Bounds = new THREE.Box3(new THREE.Vector3(-70, -15, -90), new THREE.Vector3(70, 80, 90));

const restrictedZonesForStarts = [stars1Bounds, stars2Bounds];
const restrictedZones = [planets1Bounds, planets2Bounds];

const stars = generateStars(1000, restrictedZonesForStarts);
scene.add(stars);
const planets = generatePlanets(30, restrictedZones);
scene.add(planets);

const sun = generateSun(restrictedZones);
scene.add(sun);

//Light to see the door
const spotLightDarkRoomDoor = new THREE.SpotLight(0xff0000, 0); 
spotLightDarkRoomDoor.position.set(-10, 4, 0); 
spotLightDarkRoomDoor.target.position.set(-13, 0, 0); 
scene.add(spotLightDarkRoomDoor);
scene.add(spotLightDarkRoomDoor.target);

//Dark Room boundary box
export let darkRoomBoundary;
darkRoomBoundary = new THREE.Box3(
  new THREE.Vector3(sunnyFloorWidth/2, 0, sunnyFloorDepth / 2),
  new THREE.Vector3(sunnyFloorWidth * 1.5, sunnyRoomHeight / 2, sunnyFloorDepth* 1.5)
);

let translationVectorDarkRoom = new THREE.Vector3(-73, 0.1, -25);
darkRoomBoundary.min.add(translationVectorDarkRoom);
darkRoomBoundary.max.add(translationVectorDarkRoom);

// const darkRoomBoundaryHelper = new THREE.Box3Helper(darkRoomBoundary, 0xff0000);
// scene.add(darkRoomBoundaryHelper);

export function isInsideDarkRoom(camera, darkRoomBoundary) {
  const cameraPosition = camera.position;
  return darkRoomBoundary.containsPoint(cameraPosition);
}


//Black walls for collision in DarkRoom, the extra parameters are to take out the shininess because I don't want the walls to be seen
let darkRoomFrontWallPosition = new THREE.Vector3(-floorWidth * 1.5, 0, 0);
const darkRoomFrontWall = createSimpleWall(darkRoomFrontWallPosition, floorWidth, 2, 0.1, 0x000000, Math.PI / 2, undefined, false);
scene.add(darkRoomFrontWall);
darkRoomFrontWall.updateMatrixWorld(true);
darkRoomFrontWall.boundingBox = new THREE.Box3().setFromObject(darkRoomFrontWall);
collidableObjects.push(darkRoomFrontWall);

let darkRoomLeftWallPosition = new THREE.Vector3(-floorWidth, 0, floorWidth / 2);
const darkRoomLeftWall = createSimpleWall(darkRoomLeftWallPosition, floorWidth, 2, 0.1, 0x000000, Math.PI, undefined, false);
scene.add(darkRoomLeftWall);
darkRoomLeftWall.updateMatrixWorld(true);
darkRoomLeftWall.boundingBox = new THREE.Box3().setFromObject(darkRoomLeftWall);
collidableObjects.push(darkRoomLeftWall);

let darkRoomRightWallPosition = new THREE.Vector3(-floorWidth, 0, -floorWidth / 2);
const darkRoomRightWall = createSimpleWall(darkRoomRightWallPosition, floorWidth, 2, 0.1, 0x000000, Math.PI, undefined, false);
scene.add(darkRoomRightWall);
darkRoomRightWall.updateMatrixWorld(true);
darkRoomRightWall.boundingBox = new THREE.Box3().setFromObject(darkRoomRightWall);
collidableObjects.push(darkRoomRightWall);

//-------------------------___Final Room___------------------------------------------
let finalFrontWallPosition = new THREE.Vector3(1, 2, -21);
const finalFrontWall = createSimpleWall(finalFrontWallPosition, floorWidth / 2, 7, 0.1, 0xff0000, Math.PI, undefined, false);
scene.add(finalFrontWall);
finalFrontWall.updateMatrixWorld(true);
finalFrontWall.boundingBox = new THREE.Box3().setFromObject(finalFrontWall);
collidableObjects.push(finalFrontWall);

let finalLeftWallPosition = new THREE.Vector3(-5, 2, -17);
const finalLeftWall = createSimpleWall(finalLeftWallPosition, 9, 7, 0.1, 0xff0000, Math.PI / 2, undefined, false);
scene.add(finalLeftWall);
finalLeftWall.updateMatrixWorld(true);
finalLeftWall.boundingBox = new THREE.Box3().setFromObject(darkRoomLeftWall);
collidableObjects.push(finalLeftWall);

let finalRightWallPosition = new THREE.Vector3(6, 2, -17);
const finalRightWall = createSimpleWall(finalRightWallPosition, 9, 7, 0.1, 0xff0000, Math.PI / 2, undefined, false);
scene.add(finalRightWall);
finalRightWall.updateMatrixWorld(true);
finalRightWall.boundingBox = new THREE.Box3().setFromObject(darkRoomRightWall);
collidableObjects.push(finalRightWall);

const floorFinalPosition = new THREE.Vector3(0.5, 0, -15.5);

const floorFinal = createFloor(11, 0.1, 11, floorMaterial, floorFinalPosition);
scene.add(floorFinal);
floorFinal.updateMatrixWorld(true);
floorFinal.boundingBox = new THREE.Box3().setFromObject(floorFinal);
collidableObjects.push(floorFinal);

const pointLight = new THREE.PointLight(0xffffff, 1.0, 12);
pointLight.position.set(0.5, 1, -18.5);
scene.add(pointLight);

const rotationPainting = new THREE.Vector3(0, 0, Math.PI / 2);

positionPainting.x = 0;
positionPainting.y = 2;
positionPainting.z = -21;
createPainting(scene, positionPainting, rotationPainting, normalPaitingwidth + 1, 
  normalPaitingHeight + 1, normalPaitingFrameThickness, './assets/textures/final.jpg', {
    name: "ICG-VirtualArtGallery",
    artist: "Gonçalo Maranhão",
    year: "2023",
    description: "Thank you for playing, this is a project made by Gonçalo Maranhão in the context of the class of Introduction to Computer Graphics in University of Aveiro, you can check the code at https://github.com/GoncaloMaranhao/ICG-VirtualArtGallery. If you have come directly towards this room I advise you to go to the room that you can see at the beginning to start the exploration. Remember that you can press the 'e' button to open or close doors and most importantly the 'x' button to see a painting's information."
    }
  );

//---------------------Animate------------------

let enteredSunnyRoom = false;
let doorClosed = false; 
export let enteredDarkRoom = false;

function animate() {
  requestAnimationFrame(animate);
  animateStatueRotation();
  animatePlanets(planets, sun);

  if (isInsideSunnyRoom(camera, sunnyRoomBoundary)) {
    enteredSunnyRoom = true; 
    if(spotLightSunnyRoom3.intensity === 0) {
        spotLightSunnyRoom.intensity = 1;
        spotLightSunnyRoom2.intensity = 1;
        if (!doorClosed) {  
            closeDoor(sunnyRoomDoor);
            doorClosed = true;  
        }
    }
  } else {
    spotLightSunnyRoom.intensity = 0;
    spotLightSunnyRoom2.intensity = 0;
    spotLightSunnyRoom3.intensity = 0;
  }

  if(enteredSunnyRoom == true){
    spotLightDarkRoomDoor.intensity = 1; 
  }
  if (sun) {
    sun.rotation.y += 0.001;
  }
  if (isInsideDarkRoom(camera, darkRoomBoundary)) {
    enteredDarkRoom = true; 
  }

  updatePosition(camera);
  renderer.render(scene, camera);
}

animate();




