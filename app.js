const container = document.getElementById("tetris-container");
const nextShape = document.getElementById("nextShape");
const scoreDisplay = document.getElementById("score");
const startBtn = document.getElementById("startBtn");
const myGameOver = document.getElementById("myGameOver");
const playAgain = document.getElementById("playAgain");
let lines = document.getElementById("lines");
let level = document.getElementById("level");

myGameOver.style.display = "none";

for (let i = 0; i < 200; i++) {
  const div = document.createElement("div");
  div.classList.add("tetris-box");
  container.appendChild(div);
}
for (let i = 0; i < 10; i++) {
  const div = document.createElement("div");
  div.classList.add("tetris-box", "bottom");
  container.appendChild(div);
}

for (let i = 0; i < 16; i++) {
  const div = document.createElement("div");
  div.classList.add("next-shape");
  nextShape.appendChild(div);
}

let squares = Array.from(document.querySelectorAll(".tetris-box"));
let displaySquares = Array.from(document.querySelectorAll(".next-shape"));
let lineScore = 0;
let levelScore = 1;
let score = 0;
const displayWidth = 4;
let displayIndex = 0;
const width = 10;
let nextRandom = 0;
let speedUp = false;
let timerId;
let currentPosition = 4;
let currentRotation = 0;

const colors = [
  "url(images/blue_block.png)",
  "url(images/pink_block.png)",
  "url(images/purple_block.png)",
  "url(images/peach_block.png)",
  "url(images/yellow_block.png)"
];

const lTetromino = [
  [1, width + 1, width * 2 + 1, 2],
  [width, width + 1, width + 2, width * 2 + 2],
  [1, width + 1, width * 2 + 1, width * 2],
  [width, width * 2, width * 2 + 1, width * 2 + 2]
];

const zTetromino = [
  [0, width, width + 1, width * 2 + 1],
  [width + 1, width + 2, width * 2, width * 2 + 1],
  [0, width, width + 1, width * 2 + 1],
  [width + 1, width + 2, width * 2, width * 2 + 1]
];

const tTetromino = [
  [1, width, width + 1, width + 2],
  [1, width + 1, width + 2, width * 2 + 1],
  [width, width + 1, width + 2, width * 2 + 1],
  [1, width, width + 1, width * 2 + 1]
];

const oTetromino = [
  [0, 1, width, width + 1],
  [0, 1, width, width + 1],
  [0, 1, width, width + 1],
  [0, 1, width, width + 1]
];

const iTetromino = [
  [1, width + 1, width * 2 + 1, width * 3 + 1],
  [width, width + 1, width + 2, width + 3],
  [1, width + 1, width * 2 + 1, width * 3 + 1],
  [width, width + 1, width + 2, width + 3]
];

const nextUpTetrominos = [
  [1, displayWidth + 1, displayWidth * 2 + 1, 2], // lTetromino
  [displayWidth + 1, displayWidth * 2 + 1, displayWidth * 2 + 2, displayWidth * 3 + 2], // zTetromino
  [displayWidth + 1, displayWidth * 2, displayWidth * 2 + 1, displayWidth * 2 + 2], // tTetromino
  [displayWidth * 2 + 1, displayWidth * 2 + 2, displayWidth + 1, displayWidth + 2], // oTetromino
  [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1] // iTetromino
];

const tetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino];

let random = Math.floor(Math.random() * tetrominoes.length);
let current = tetrominoes[random][currentRotation];


// Draw the current tetromino to the game area.
const draw = () => {
  current.forEach(index => {
    squares[currentPosition + index].classList.add("tetromino");
    squares[currentPosition + index].style.backgroundImage = colors[random];
  });
};

// Remove the current tetromino from the game area.
const undraw = () => {
  current.forEach(index => {
    squares[currentPosition + index].classList.remove("tetromino");
    squares[currentPosition + index].style.backgroundImage = "";
  });
};

// Check if the Tetromino has landed to the bottom, then set it in place and create a new Tetromino to the top.
const freeze = () => {
  if (current.some(index => squares[currentPosition + index + width].classList.contains("bottom"))) {
    current.forEach(index => squares[currentPosition + index].classList.add("bottom"));
    random = nextRandom;
    nextRandom = Math.floor(Math.random() * tetrominoes.length);
    current = tetrominoes[random][currentRotation];
    currentPosition = 4;
    draw();
    displayShape();
    addScore();
    gameOver();
  }
};

const controls = (e) => {
  if (e.keyCode === 37) {
    moveLeft();
  } else if (e.keyCode === 38) {
    rotate();
  } else if (e.keyCode === 39) {
    moveRight();
  } else if (e.keyCode === 40) {
    speedUp = true;
    moveDown();
  }
};

document.addEventListener("keydown", controls);

document.addEventListener("keyup", (e) => {
  if (e.keyCode === 40) {
    speedUp = false;
    clearInterval(timerId);
    timerId = setInterval(moveDown, 1000);
  }
});

// Initialize a new game, resetting all relevant variables and elements.
const newGame = () => {
  squares.forEach(square => {
    square.classList.remove("tetromino", "bottom");
    square.style.backgroundImage = "";
  });

  // Recreate the bottom row
  for (let i = 0; i < 10; i++) {
    squares[190 + i].classList.add("bottom");
  }

  displaySquares.forEach(square => {
    square.classList.remove("tetromino");
    square.style.backgroundImage = "";
  });

  score = 0;
  scoreDisplay.innerHTML = score;
  lineScore = 0;
  lines.textContent = lineScore;
  levelScore = 1;
  level.textContent = levelScore;
  currentPosition = 4;
  currentRotation = 0;
  random = Math.floor(Math.random() * tetrominoes.length);
  current = tetrominoes[random][currentRotation];
  nextRandom = Math.floor(Math.random() * tetrominoes.length);
  speedUp = false;

  myGameOver.style.display = "none";
};

// Start the game, drawing the first Tetromino and setting the game loop.
const startGame = () => {
  draw();
  timerId = setInterval(moveDown, 1000);
  displayShape();
};

const moveDown = () => {
  undraw();
  currentPosition += width;
  draw();
  freeze();

  if (speedUp) {
    clearInterval(timerId);
    timerId = setInterval(moveDown, 100);
  }
};

const moveLeft = () => {
  undraw();
  const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);
  if (!isAtLeftEdge) currentPosition -= 1;
  if (current.some(index => squares[currentPosition + index].classList.contains("bottom"))) {
    currentPosition += 1;
  }
  draw();
};

const moveRight = () => {
  undraw();
  const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1);
  if (!isAtRightEdge) currentPosition += 1;
  if (current.some(index => squares[currentPosition + index].classList.contains("bottom"))) {
    currentPosition -= 1;
  }
  draw();
};

const isAtRight = () => {
  return current.some(index => (currentPosition + index + 1) % width === 0);
};

const isAtLeft = () => {
  return current.some(index => (currentPosition + index) % width === 0);
};

const isAtBottom = () => {
  return current.some(index => (currentPosition + index + width) >= squares.length);
};

// If the tetromino is fully on the left, right or bottom and try to rotate. Then it wont go through wall. 
const checkRotatePosition = (P) => {
  P = P || currentPosition;
  if ((P + 1) % width < 4) {
    if (isAtRight()) {
      currentPosition += 1;
      checkRotatePosition(P);
    }
  } else if (P % width > 5) {
    if (isAtLeft()) {
      currentPosition += 1;
      checkRotatePosition(P);
    }
  } else if (isAtBottom()) {
    currentPosition -= width;
    checkRotatePosition(P);
  }
};

const rotate = () => {
  undraw();
  currentRotation++;
  if (currentRotation === current.length) {
    currentRotation = 0;
  }
  current = tetrominoes[random][currentRotation];
  checkRotatePosition();
  draw();
};

// Display the next shape on the side.
const displayShape = () => {
  displaySquares.forEach(square => {
    square.classList.remove("tetromino");
    square.style.backgroundImage = "";
  });
  nextUpTetrominos[nextRandom].forEach(index => {
    displaySquares[displayIndex + index].classList.add("tetromino");
    displaySquares[displayIndex + index].style.backgroundImage = colors[nextRandom];
  });
};

startBtn.addEventListener("click", () => {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  } else {
    startGame();
  }
});

playAgain.addEventListener("click", () => {
  newGame();
  // Ensure the game does not start automatically
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
});

const addScore = () => {
  for (let i = 0; i < 199; i += width) {
    const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9];
    if (row.every(index => squares[index].classList.contains("bottom"))) {
      score += 10;
      lineScore += 1;
      lines.textContent = lineScore;
      scoreDisplay.innerHTML = score;
      if (lineScore % 10 === 0) {
        levelScore += 1;
        level.textContent = levelScore;
      }
      row.forEach(index => {
        squares[index].classList.remove("bottom");
        squares[index].classList.remove("tetromino");
        squares[index].style.backgroundImage = "";
      });
      const squaresRemoved = squares.splice(i, width);
      const emptySquares = squaresRemoved.map(() => {
        const div = document.createElement("div");
        div.classList.add("tetris-box");
        return div;
      });
      squares = squaresRemoved.concat(squares);
      squares.forEach(cell => container.appendChild(cell));
    }
  }
};

const gameOver = () => {
  if (current.some(index => squares[currentPosition + index].classList.contains("bottom"))) {
    myGameOver.style.display = "flex";
    clearInterval(timerId);
  }
};