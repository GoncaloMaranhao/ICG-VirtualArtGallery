function openDoor(doorGroup) {

  const leftDoorPivot = doorGroup.children[0];
  const rightDoorPivot = doorGroup.children[1];

  const animationDuration = 1000;
  const startTime = performance.now(); // returns a timestamp in ms

  // check door status
  const isOpen = leftDoorPivot.rotation.y <= -1;

  const initialLeftRotation = isOpen ? -Math.PI / 2 : 0;
  const initialRightRotation = isOpen ? Math.PI / 2 : 0;

    function animateDoor() {

      const elapsed = performance.now() - startTime;
      const progress = elapsed / animationDuration;

      if (progress < 1) {
        if (isOpen) {
          // close 
          leftDoorPivot.rotation.y = initialLeftRotation + progress * Math.PI / 2;
          rightDoorPivot.rotation.y = initialRightRotation - progress * Math.PI / 2;
        } else {
          // open
          leftDoorPivot.rotation.y = initialLeftRotation - progress * Math.PI / 2;
          rightDoorPivot.rotation.y = initialRightRotation + progress * Math.PI / 2;
        }
        requestAnimationFrame(animateDoor);

      } else {
        if (isOpen) {
          // close 
          leftDoorPivot.rotation.y = 0;
          rightDoorPivot.rotation.y = 0;
        } else {
          // open 
          leftDoorPivot.rotation.y = -Math.PI / 2;
          rightDoorPivot.rotation.y = Math.PI / 2;
        }
      }
    }

  animateDoor();
  requestAnimationFrame(animateDoor);
}

export { openDoor };
