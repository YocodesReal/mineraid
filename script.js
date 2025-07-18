<script>
const board = document.getElementById("board");
const difficulty = document.getElementById("difficulty");
const timer = document.getElementById("timer");
const minesLeft = document.getElementById("mines-left");
const gameOverScreen = document.getElementById("game-over");
const finalScore = document.getElementById("final-score");
const leaderboardList = document.getElementById("leaderboard");
let grid = [];
let rows = 10;
let cols = 10;
let mineCount = 10;
let revealedCount = 0;
let gameEnded = false;
let flagCount = 0;
let timerInterval;
let seconds = 0;

function setupGame() {
  board.innerHTML = "";
  gameEnded = false;
  revealedCount = 0;
  flagCount = 0;
  seconds = 0;
  gameOverScreen.classList.add("hidden");
  clearInterval(timerInterval);
  timer.textContent = "0";
  updateBoardSize();
  updateMineCount();
  generateGrid();
  startTimer();
}

function updateBoardSize() {
  const value = difficulty.value;
  if (value === "easy") {
    rows = cols = 8;
    mineCount = 10;
  } else if (value === "medium") {
    rows = cols = 12;
    mineCount = 25;
  } else {
    rows = cols = 16;
    mineCount = 50;
  }
  board.style.gridTemplateColumns = `repeat(${cols}, 34px)`;
}

function updateMineCount() {
  minesLeft.textContent = mineCount - flagCount;
}

function generateGrid() {
  grid = [];
  let minesPlaced = 0;
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      const cell = {
        element: document.createElement("div"),
        hasMine: false,
        revealed: false,
        flagged: false,
        r, c, count: 0,
      };
      cell.element.classList.add("cell");
      cell.element.addEventListener("click", () => revealCell(cell));
      cell.element.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        toggleFlag(cell);
      });
      board.appendChild(cell.element);
      row.push(cell);
    }
    grid.push(row);
  }

  while (minesPlaced < mineCount) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (!grid[r][c].hasMine) {
      grid[r][c].hasMine = true;
      minesPlaced++;
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      grid[r][c].count = countNeighborMines(r, c);
    }
  }
}

function countNeighborMines(r, c) {
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc].hasMine) {
        count++;
      }
    }
  }
  return count;
}

function revealCell(cell) {
  if (cell.revealed || cell.flagged || gameEnded) return;
  cell.revealed = true;
  cell.element.classList.add("revealed");
  revealedCount++;
  if (cell.hasMine) {
    cell.element.classList.add("mine");
    endGame(false);
  } else {
    if (cell.count > 0) {
      cell.element.textContent = cell.count;
    } else {
      revealAdjacent(cell);
    }
    checkWin();
  }
}

function revealAdjacent(cell) {
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = cell.r + dr, nc = cell.c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        revealCell(grid[nr][nc]);
      }
    }
  }
}

function toggleFlag(cell) {
  if (cell.revealed || gameEnded) return;
  cell.flagged = !cell.flagged;
  cell.element.classList.toggle("flagged", cell.flagged);
  cell.element.textContent = cell.flagged ? "⚑" : "";
  flagCount += cell.flagged ? 1 : -1;
  updateMineCount();
}

function checkWin() {
  if (revealedCount === rows * cols - mineCount) {
    endGame(true);
  }
}

function endGame(won) {
  gameEnded = true;
  clearInterval(timerInterval);
  if (won) {
    const score = seconds + mineCount * 5;
    finalScore.textContent = `Your score: ${score}`;
    gameOverScreen.classList.remove("hidden");
    saveScore(score);
    updateLeaderboard();
  } else {
    revealAllMines();
    finalScore.textContent = "Game Over!";
    gameOverScreen.classList.remove("hidden");
  }
}

function revealAllMines() {
  grid.flat().forEach(cell => {
    if (cell.hasMine) {
      cell.element.classList.add("mine");
      cell.element.textContent = "💣";
    }
  });
}

function startTimer() {
  timerInterval = setInterval(() => {
    seconds++;
    timer.textContent = seconds;
  }, 1000);
}

function saveScore(score) {
  let scores = JSON.parse(localStorage.getItem("mineraid_scores")) || [];
  scores.push({ score, time: new Date().toLocaleTimeString() });
  scores.sort((a, b) => a.score - b.score);
  scores = scores.slice(0, 10); // top 10
  localStorage.setItem("mineraid_scores", JSON.stringify(scores));
}

function updateLeaderboard() {
  const scores = JSON.parse(localStorage.getItem("mineraid_scores")) || [];
  leaderboardList.innerHTML = "";
  scores.forEach(entry => {
    const li = document.createElement("li");
    li.textContent = `⏱ ${entry.score} pts at ${entry.time}`;
    leaderboardList.appendChild(li);
  });
}

document.getElementById("start").addEventListener("click", setupGame);
difficulty.addEventListener("change", setupGame);

// Start with default game
setupGame();
updateLeaderboard();
</script>
