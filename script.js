const rows = 9;
const cols = 9;
const mineCount = 10;
let board = [];
let timer = 0;
let interval;
let gameOver = false;

function startGame() {
  gameOver = false;
  board = [];
  clearInterval(interval);
  timer = 0;
  document.getElementById('timer').textContent = 0;
  document.getElementById('mine-count').textContent = mineCount;
  document.getElementById('game-board').innerHTML = '';
  generateBoard();
  interval = setInterval(() => {
    timer++;
    document.getElementById('timer').textContent = timer;
  }, 1000);
}

function generateBoard() {
  const boardElement = document.getElementById('game-board');
  boardElement.style.gridTemplateColumns = `repeat(${cols}, 30px)`;

  // Create empty board
  for (let r = 0; r < rows; r++) {
    board[r] = [];
    for (let c = 0; c < cols; c++) {
      const cell = {
        row: r,
        col: c,
        mine: false,
        revealed: false,
        flagged: false,
        element: document.createElement('div'),
        adjacentMines: 0,
      };
      cell.element.classList.add('cell');
      cell.element.addEventListener('click', () => revealCell(r, c));
      cell.element.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        toggleFlag(r, c);
      });
      boardElement.appendChild(cell.element);
      board[r][c] = cell;
    }
  }

  placeMines();
  calculateAdjacents();
}

function placeMines() {
  let placed = 0;
  while (placed < mineCount) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (!board[r][c].mine) {
      board[r][c].mine = true;
      placed++;
    }
  }
}

function calculateAdjacents() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let count = 0;
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          const nr = r + i;
          const nc = c + j;
          if (
            nr >= 0 && nr < rows &&
            nc >= 0 && nc < cols &&
            board[nr][nc].mine
          ) {
            count++;
          }
        }
      }
      board[r][c].adjacentMines = count;
    }
  }
}

function revealCell(r, c) {
  const cell = board[r][c];
  if (cell.revealed || cell.flagged || gameOver) return;

  cell.revealed = true;
  cell.element.classList.add('revealed');

  if (cell.mine) {
    cell.element.textContent = '💣';
    endGame(false);
    return;
  }

  if (cell.adjacentMines > 0) {
    cell.element.textContent = cell.adjacentMines;
  } else {
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const nr = r + i;
        const nc = c + j;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          revealCell(nr, nc);
        }
      }
    }
  }

  checkWin();
}

function toggleFlag(r, c) {
  const cell = board[r][c];
  if (cell.revealed || gameOver) return;

  cell.flagged = !cell.flagged;
  cell.element.classList.toggle('flagged');
  cell.element.textContent = cell.flagged ? '🚩' : '';
}

function endGame(win) {
  clearInterval(interval);
  gameOver = true;
  if (!win) {
    alert('💥 Boom! You hit a mine!');
  } else {
    alert('🎉 You win!');
  }

  // Reveal all mines
  board.flat().forEach(cell => {
    if (cell.mine && !cell.revealed) {
      cell.element.classList.add('revealed');
      cell.element.textContent = '💣';
    }
  });
}

function checkWin() {
  const unrevealed = board.flat().filter(cell => !cell.revealed);
  if (unrevealed.length === mineCount) {
    endGame(true);
  }
}

// Start game on load
window.onload = startGame;
