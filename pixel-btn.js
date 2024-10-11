//v2

// You can add this into your css file, it's just the webflow copying button was bugging out with css embeds
const style = document.createElement('style');
style.innerHTML = `.block[class*="cc-active"] { background-color: white; }`;
document.head.appendChild(style);

// Configuration variables for pulse behavior
const numRows = 7; // Number of rows in the grid
const numCols = 25; // Number of columns in the grid


// Block size configuration (in pixels)
const blockSize = 8; // Width and height of each block in pixels

// Timing and speed control
const pulseDelayMin = 20; // Minimum delay between propagation steps (in milliseconds)
const pulseDelayMax = 70; // Maximum delay between propagation steps (in milliseconds)
const activationDelayMin = 50; // Minimum time a block remains active (in milliseconds)
const activationDelayMax = 150; // Maximum time a block remains active (in milliseconds)
const propagationProbability = 0.3; // Probability (0.0 to 1.0) of a neighbor being activated


let pulseId = 0; // Unique pulse identifier

// Function to dynamically generate blocks based on the number of rows and columns
function populateGrid() {
  const gridContainer = document.querySelector('.button-grid');
  gridContainer.innerHTML = ''; // Clear any existing blocks

  // Update the grid template styles dynamically based on numRows and numCols
  gridContainer.style.gridTemplateRows = `repeat(${numRows}, ${blockSize}px)`;
  gridContainer.style.gridTemplateColumns = `repeat(${numCols}, ${blockSize}px)`;

  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      const block = document.createElement('div');
      block.classList.add('block');
      block.style.width = `${blockSize}px`;
      block.style.height = `${blockSize}px`;
      gridContainer.appendChild(block);
    }
  }
}

// Function to dynamically assign data-index attributes to each block and create mapping of adjacent blocks
function assignDataIndexesAndNeighbors() {
  const blocks = document.querySelectorAll('.block');
  const neighborMap = {}; // This will store the map of each block to its neighbors

  blocks.forEach((block, index) => {
    block.setAttribute('data-index', index); // Assign the data-index to each block

    const row = Math.floor(index / numCols);
    const col = index % numCols;

    // Calculate the neighbors' indices (top, top-right, right, etc.)
    const neighbors = [];

    const neighborOffsets = [
      { rowOffset: -1, colOffset: -1 }, // Top-left
      { rowOffset: -1, colOffset: 0 }, // Top
      { rowOffset: -1, colOffset: 1 }, // Top-right
      { rowOffset: 0, colOffset: -1 }, // Left
      { rowOffset: 0, colOffset: 1 }, // Right
      { rowOffset: 1, colOffset: -1 }, // Bottom-left
      { rowOffset: 1, colOffset: 0 }, // Bottom
      { rowOffset: 1, colOffset: 1 }, // Bottom-right
    ];

    // Find all valid neighbors (inside the grid boundaries)
    neighborOffsets.forEach(({ rowOffset, colOffset }) => {
      const newRow = row + rowOffset;
      const newCol = col + colOffset;

      if (newRow >= 0 && newRow < numRows && newCol >= 0 && newCol < numCols) {
        const neighborIndex = newRow * numCols + newCol;
        neighbors.push(neighborIndex);
      }
    });

    neighborMap[index] = neighbors; // Store the neighbors for this block
  });

  return neighborMap;
}

// Function to introduce randomness (returns true or false randomly)
function randomChance(probability) {
  return Math.random() < probability;
}

// Function to activate the pulse effect with a unique pulseId
function activatePulse(index, neighborMap, pulseId) {
  const currentBlock = document.querySelector(`.block[data-index="${index}"]`);
  const neighbors = neighborMap[index];

  // Mark the current block as active and blinked for this specific pulse
  if (currentBlock) {
    currentBlock.classList.add(`cc-active-${pulseId}`, `cc-blinked-${pulseId}`);

    // Schedule the deactivation of the initial block after a random delay within the defined range
    setTimeout(() => {
      currentBlock.classList.remove(`cc-active-${pulseId}`);
    }, Math.random() * (activationDelayMax - activationDelayMin) + activationDelayMin);
  }

  // Randomly activate adjacent blocks unless they already have the 'cc-blinked' class for this pulse
  neighbors.forEach((neighborIndex) => {
    const neighborBlock = document.querySelector(`.block[data-index="${neighborIndex}"]`);
    if (neighborBlock && !neighborBlock.classList.contains(`cc-blinked-${pulseId}`) &&
      randomChance(propagationProbability)) {
      neighborBlock.classList.add(`cc-active-${pulseId}`);
    }
  });

  // Call the pulse propagation function recursively after a random delay within the defined range
  setTimeout(() => {
    propagatePulse(neighborMap, pulseId);
  }, Math.random() * (pulseDelayMax - pulseDelayMin) + pulseDelayMin);
}

// Function to propagate the pulse with a unique pulseId
function propagatePulse(neighborMap, pulseId) {
  const activeBlocks = document.querySelectorAll(
    `.block.cc-active-${pulseId}:not(.cc-blinked-${pulseId})`);

  // If no more active blocks for this pulse, stop the propagation and clean up this pulse
  if (activeBlocks.length === 0) {
    clearBlinkedBlocks(pulseId); // Clear all 'cc-blinked' for this pulse
    return;
  }

  activeBlocks.forEach((block) => {
    const index = parseInt(block.getAttribute('data-index'));
    const neighbors = neighborMap[index];

    // Mark the block as blinked for this pulse and randomly schedule removal of active class
    block.classList.add(
      `cc-blinked-${pulseId}`); // Prevents reactivation of this block in the same pulse

    // Instead of immediately removing the `cc-active`, delay it randomly within the defined range
    setTimeout(() => {
      block.classList.remove(`cc-active-${pulseId}`);
    }, Math.random() * (activationDelayMax - activationDelayMin) + activationDelayMin);

    // Randomly activate adjacent blocks unless they already have 'cc-blinked' for this pulse
    neighbors.forEach((neighborIndex) => {
      const neighborBlock = document.querySelector(`.block[data-index="${neighborIndex}"]`);
      if (neighborBlock && !neighborBlock.classList.contains(`cc-blinked-${pulseId}`) &&
        randomChance(propagationProbability)) {
        neighborBlock.classList.add(`cc-active-${pulseId}`);
      }
    });
  });

  // Continue the pulse propagation after a random delay within the defined range
  setTimeout(() => {
    propagatePulse(neighborMap, pulseId);
  }, Math.random() * (pulseDelayMax - pulseDelayMin) + pulseDelayMin);
}

// Function to clear all 'cc-blinked' blocks for a specific pulse once the pulse ends
function clearBlinkedBlocks(pulseId) {
  document.querySelectorAll(`.block.cc-blinked-${pulseId}`).forEach((block) => {
    block.classList.remove(`cc-blinked-${pulseId}`);
  });
}

// Function to handle mouse hover or click over .c-button
function handleButtonAction(block, neighborMap) {
  pulseId++; // Increment pulseId to make each pulse unique
  const blockIndex = parseInt(block.getAttribute('data-index'));

  // Start the pulse from the clicked or hovered block with a unique pulseId
  activatePulse(blockIndex, neighborMap, pulseId);
}

// Initialize everything (populate grid and set up neighbors)
populateGrid();
const neighborMap = assignDataIndexesAndNeighbors();

// Add hover and click listeners to each block inside .button-grid
document.querySelectorAll('.button-grid .block').forEach((block) => {
  block.addEventListener('mouseover', () => {
    handleButtonAction(block, neighborMap);
  });

  block.addEventListener('click', () => {
    handleButtonAction(block, neighborMap);
  });
});
