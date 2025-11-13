const board = document.querySelector(".board");
const infoScore = document.querySelector(".info.score h3");
const infoHighScore = document.querySelector(".info.high-score h3");
const infoTime = document.querySelector(".info.time h3");
const btnStartPause = document.querySelector(".btn-startPause");
const btnRestart = document.querySelector(".btn-restart");
const btnToggleTheme = document.querySelector(".info.toggleTheme");

localStorage.getItem("theme") === "dark" &&
  document.documentElement.classList.add("dark");

const BLOCK_SIZE = parseInt(
  getComputedStyle(document.documentElement).getPropertyValue("--block-size")
);

const BOARD_COLS = Math.floor(board.clientWidth / BLOCK_SIZE);
const BOARD_ROWS = Math.floor(board.clientHeight / BLOCK_SIZE);
let DIRECTION = "DOWN";
let GAME_STATUS = "PAUSED";
let SPEED = 150; // in milliseconds
let gameInterval;
let timerInterval;
let highScore = localStorage.getItem("snakeHighScore")
  ? parseInt(localStorage.getItem("snakeHighScore"))
  : 0;
infoHighScore.innerText = `High Score: ${highScore}`;

const blocks = [];

// Snake Initial Position
let snake = [
  {
    row: Math.floor(Math.random() * (BOARD_ROWS - 5)),
    col: Math.floor(Math.random() * (BOARD_COLS - 5)),
  },
];
let food = {
  row: Math.floor(Math.random() * BOARD_ROWS),
  col: Math.floor(Math.random() * BOARD_COLS),
};

for (let row = 0; row < BOARD_ROWS; row++) {
  for (let col = 0; col < BOARD_COLS; col++) {
    const block = document.createElement("div");
    block.classList.add("block");
    blocks[`block-${row}-${col}`] = block;
    board.appendChild(block);
  }
}

function renderSnakeAndFood() {
  snake.forEach((segment, index) => {
    const block = blocks[`block-${segment.row}-${segment.col}`];
    block.classList.add("snake");

    if (index === 0) block.classList.add("head");
    else block.classList.remove("head");
  });

  const foodBlock = blocks[`block-${food.row}-${food.col}`];
  foodBlock.classList.add("food");
}

function moveSnake() {
  snake.forEach((segment) => {
    const block = blocks[`block-${segment.row}-${segment.col}`];
    block.classList.remove("snake");
  });

  const head = { ...snake[0] };

  switch (DIRECTION) {
    case "RIGHT":
      head.col += 1;
      break;
    case "LEFT":
      head.col -= 1;
      break;
    case "UP":
      head.row -= 1;
      break;
    case "DOWN":
      head.row += 1;
      break;
  }

  if (head.row < 0) head.row = BOARD_ROWS - 1;
  if (head.row >= BOARD_ROWS) head.row = 0;
  if (head.col < 0) head.col = BOARD_COLS - 1;
  if (head.col >= BOARD_COLS) head.col = 0;

  if (
    snake.some(
      (segment) => segment.row === head.row && segment.col === head.col
    )
  ) {
    localStorage.setItem(
      "snakeHighScore",
      Math.max(highScore, snake.length - 1)
    );
    infoHighScore.innerText = `New High Score: ${Math.max(
      highScore,
      snake.length - 1
    )}`;

    btnStartPause.innerText = "Start";
    GAME_STATUS = "OVER";

    clearInterval(gameInterval);
    clearInterval(timerInterval);
    alert("Game Over! You collided with yourself.");
    return;
  }

  snake.unshift(head);
  snake.pop();

  if (head.row === food.row && head.col === food.col) {
    snake.push(snake[snake.length - 1]);
    infoScore.innerText = `Score: ${snake.length - 1}`;

    const foodBlock = blocks[`block-${food.row}-${food.col}`];
    foodBlock.classList.remove("food");

    food = {
      row: Math.floor(Math.random() * (BOARD_ROWS - 5)),
      col: Math.floor(Math.random() * (BOARD_COLS - 5)),
    };
  }

  renderSnakeAndFood();

  // console.log("Current Head:", head);
}

function changeDirection(event) {
  switch (event.key) {
    case "ArrowUp":
      if (DIRECTION === "DOWN") return;
      DIRECTION = "UP";
      break;
    case "ArrowDown":
      if (DIRECTION === "UP") return;
      DIRECTION = "DOWN";
      break;
    case "ArrowLeft":
      if (DIRECTION === "RIGHT") return;
      DIRECTION = "LEFT";
      break;
    case "ArrowRight":
      if (DIRECTION === "LEFT") return;
      DIRECTION = "RIGHT";
      break;
  }
}

function startTimer() {
  let seconds = 0;
  timerInterval = setInterval(() => {
    seconds++;
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    infoTime.innerText = `Time: ${hrs}:${mins}:${secs}`;
  }, 1000);
  infoTime.style.color = "red";
}

function startGame(event) {
  event.target.innerText = "Pause";
  GAME_STATUS = "RUNNING";
  gameInterval = setInterval(moveSnake, SPEED);
  startTimer();
}

function restartGame() {
  clearInterval(gameInterval);
  clearInterval(timerInterval);
  location.reload();
}

function pauseGame(event) {
  event.target.innerText = "Start";
  GAME_STATUS = "PAUSED";
  clearInterval(gameInterval);
  clearInterval(timerInterval);
}

function toggleTheme() {
  document.documentElement.classList.toggle("dark");
  btnToggleTheme.innerText = document.documentElement.classList.contains("dark")
    ? "Light"
    : "Dark";
  localStorage.setItem(
    "theme",
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );
}

document.addEventListener("keydown", changeDirection);
btnStartPause.addEventListener("click", (event) =>
  GAME_STATUS === "RUNNING" ? pauseGame(event) : startGame(event)
);

btnRestart.addEventListener("click", restartGame);
btnToggleTheme.addEventListener("click", toggleTheme);

const speedBtns = document.querySelectorAll(".btn-speed");

speedBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (GAME_STATUS === "PAUSED" || GAME_STATUS === "OVER") return;

    const speedChange = btn.getAttribute("data-speed");
    if (speedChange === "up" && SPEED > 50) {
      SPEED -= 20;
    } else if (speedChange === "down" && SPEED <= 500) {
      SPEED += 20;
    }
    if (GAME_STATUS === "RUNNING") {
      clearInterval(gameInterval);
      gameInterval = setInterval(moveSnake, SPEED);
    }
  });
});
