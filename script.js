const images = ["secret1.jpg", "secret2.jpg", "secret3.jpg"];
const codes = ["NN2025-TOUR", "ZURA-SECRET-2", "NN-LEGEND-3"];
const descriptions = [
  "На этом изображении — загадочные жмурки, символ детства и тайных воспоминаний.",
  "Дом жмурки — место силы, которое хранит секреты старого района.",
  "Громозека — таинственное создание из другого измерения!"
];

let currentPuzzle = 0;
let pieces = [];
let board = [];
let boardElement = document.getElementById("game-board");
let piecesContainer = document.getElementById("pieces-container");
let codeContainer = document.getElementById("code-container");
let codeText = document.getElementById("code-text");
let descriptionBlock = document.getElementById("description-block");

function createBoard() {
  boardElement.innerHTML = "";
  board = [];
  for (let i = 0; i < 25; i++) {
    const cell = document.createElement("div");
    boardElement.appendChild(cell);
    board.push(null);
  }
}

function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function createPieces() {
  piecesContainer.innerHTML = "";
  pieces = [];

  for (let i = 0; i < 25; i++) {
    const row = Math.floor(i / 5);
    const col = i % 5;
    const piece = document.createElement("div");
    piece.classList.add("piece");
    piece.style.backgroundImage = `url(${images[currentPuzzle]})`;
    piece.style.backgroundPosition = `-${col * 60}px -${row * 60}px`;
    piece.draggable = true;
    piece.dataset.index = i;

    piece.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", piece.dataset.index);
    });

    pieces.push(piece);
  }

  shuffleArray(pieces).forEach((p) => piecesContainer.appendChild(p));
}

function setupDropEvents() {
  const cells = boardElement.querySelectorAll("div");
  cells.forEach((cell, idx) => {
    cell.addEventListener("dragover", (e) => e.preventDefault());
    cell.addEventListener("drop", (e) => {
      e.preventDefault();
      const pieceIndex = e.dataTransfer.getData("text/plain");
      const piece = pieces.find((p) => p.dataset.index == pieceIndex);
      if (cell.firstChild) return;
      cell.appendChild(piece);
      board[idx] = parseInt(pieceIndex);

      checkWin();
    });
  });
}

function checkWin() {
  if (board.every((val, idx) => val === idx)) {
    codeContainer.classList.remove("hidden");
    codeText.textContent = codes[currentPuzzle];
    descriptionBlock.classList.remove("hidden");
    descriptionBlock.textContent = descriptions[currentPuzzle];
    launchConfetti();
    if (window.Telegram?.WebApp?.sendData) {
      Telegram.WebApp.sendData(codes[currentPuzzle]);
    }
  }
}

function resetGame() {
  codeContainer.classList.add("hidden");
  descriptionBlock.classList.add("hidden");
  createBoard();
  createPieces();
  setupDropEvents();
}

function loadPuzzle(index) {
  currentPuzzle = index;
  resetGame();
}

document.getElementById("reset-button").addEventListener("click", resetGame);
document.getElementById("copy-button").addEventListener("click", () => {
  navigator.clipboard.writeText(codeText.textContent);
});

function launchConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  let confetti = Array.from({ length: 150 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    r: Math.random() * 6 + 2,
    d: Math.random() * 100,
    color: `hsl(${Math.random() * 360}, 100%, 60%)`,
    tilt: Math.random() * 10 - 10,
    tiltAngleIncremental: Math.random() * 0.1 + 0.05,
    tiltAngle: 0
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confetti.forEach((c) => {
      ctx.beginPath();
      ctx.lineWidth = c.r;
      ctx.strokeStyle = c.color;
      ctx.moveTo(c.x + c.tilt + c.r / 2, c.y);
      ctx.lineTo(c.x + c.tilt, c.y + c.tilt + c.r / 2);
      ctx.stroke();
    });
    update();
  }

  function update() {
    confetti.forEach((c, i) => {
      c.tiltAngle += c.tiltAngleIncremental;
      c.y += (Math.cos(c.d) + 3 + c.r / 2) / 2;
      c.tilt = Math.sin(c.tiltAngle) * 15;

      if (c.y > canvas.height) {
        confetti[i] = {
          x: Math.random() * canvas.width,
          y: -20,
          r: c.r,
          d: c.d,
          color: c.color,
          tilt: c.tilt,
          tiltAngleIncremental: c.tiltAngleIncremental,
          tiltAngle: c.tiltAngle
        };
      }
    });
  }

  (function animate() {
    draw();
    requestAnimationFrame(animate);
  })();
}

// Старт
resetGame();
