export function openDoor(doorGroup) {

  const leftDoorPivot = doorGroup.children[0];
  const rightDoorPivot = doorGroup.children[1];

  const animationDuration = 1000;
  const startTime = performance.now(); 
  const isOpen = leftDoorPivot.rotation.y <= -1;

  const initialLeftRotation = isOpen ? -Math.PI / 2 : 0;
  const initialRightRotation = isOpen ? Math.PI / 2 : 0;

  function animateDoor() {
    const elapsed = performance.now() - startTime;
    const progress = elapsed / animationDuration;
  
    if (progress < 1) {
      doorGroup.isClosed = false;
      if (isOpen) {
        leftDoorPivot.rotation.y = initialLeftRotation + progress * Math.PI / 2;
        rightDoorPivot.rotation.y = initialRightRotation - progress * Math.PI / 2;
      } else {
        leftDoorPivot.rotation.y = initialLeftRotation - progress * Math.PI / 2;
        rightDoorPivot.rotation.y = initialRightRotation + progress * Math.PI / 2;
      }
      // Update the bounding box
      doorGroup.boundingBox.setFromObject(doorGroup);
      requestAnimationFrame(animateDoor);
    } else {
      if (isOpen) {
        leftDoorPivot.rotation.y = 0;
        rightDoorPivot.rotation.y = 0;
      } else {
        leftDoorPivot.rotation.y = -Math.PI / 2;
        rightDoorPivot.rotation.y = Math.PI / 2;
      }
      doorGroup.isClosed = !isOpen;
      doorGroup.boundingBox.setFromObject(doorGroup);
    }
  }

  animateDoor();
  requestAnimationFrame(animateDoor);
}

// I need to make another similar function to the one before so that the door automatically 
// closes when the player entere the sunny room
// I have no idea why the previous function doesn't work for this
export function closeDoor(doorGroup) {
  if (doorGroup.isAnimating) return;
  const leftDoorPivot = doorGroup.children[0];
  const rightDoorPivot = doorGroup.children[1];

  const animationDuration = 1000;
  const startTime = performance.now(); 
  const isClosed = leftDoorPivot.rotation.y >= 0;

  const initialLeftRotation = isClosed ? 0 : -Math.PI / 2;
  const initialRightRotation = isClosed ? 0 : Math.PI / 2;

  function animateDoor() {
    const elapsed = performance.now() - startTime;
    const progress = elapsed / animationDuration;

    if (progress < 1) {
      doorGroup.isClosed = true;
      if (!isClosed) {
        leftDoorPivot.rotation.y = initialLeftRotation + progress * Math.PI / 2;
        rightDoorPivot.rotation.y = initialRightRotation - progress * Math.PI / 2;
      }
      
      doorGroup.boundingBox.setFromObject(doorGroup);
      requestAnimationFrame(animateDoor);
    } else {
      if (!isClosed) {
        leftDoorPivot.rotation.y = 0;
        rightDoorPivot.rotation.y = 0;
      }
      doorGroup.isClosed = !isClosed;
      doorGroup.boundingBox.setFromObject(doorGroup);
    }
  }

  animateDoor();
  requestAnimationFrame(animateDoor);
}


let statue = null;
let isRotating = false;
let targetRotation = 0;
let isRPressed = false;
let canPressR = true;
let rotationsCount = 0;
const requiredRotations = 3;

export function incrementRotations() {
  rotationsCount++;
  console.log(rotationsCount);
}

export function hasRequiredRotations() {
  return rotationsCount >= requiredRotations;
}

export function setStatue(object) {
  statue = object;
  if (isRPressed) { 
      startStatueRotation();
  }
}

export function startStatueRotation(object) {
  if (canPressR) {
    if (object !== null) {
      targetRotation = object.rotation.y + Math.PI / 2;
      statue = object;
      isRotating = true;
    } else {
      isRPressed = true;
    }

    canPressR = false;
    setTimeout(() => {
      canPressR = true;
    }, 1000);  // 1s delay
  }
}


export function animateStatueRotation() {
  if (isRotating && statue) {
    if (Math.abs(statue.rotation.y - targetRotation) < 0.01) {
      statue.rotation.y = targetRotation;
      isRotating = false;
      incrementRotations();
          if (Math.abs(statue.rotation.y - 1.57) < 0.01) {
              const event = new CustomEvent('statueFacingCorrectDirection', { detail: statue });
              window.dispatchEvent(event);
          }
      } else {
          statue.rotation.y += (targetRotation - statue.rotation.y) * 0.1;
      }
  }
}


