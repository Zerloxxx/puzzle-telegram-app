const puzzles = ["secret1.jpg", "secret2.jpg", "secret3.jpg"];
let currentPuzzle = 0;
let pieceSize = 60;
let boardSize = 5;
let totalPieces = boardSize * boardSize;
let correctCount = 0;

function createBoard() {
  const board = document.getElementById("board");
  board.innerHTML = "";
  for (let i = 0; i < totalPieces; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    board.appendChild(cell);
  }
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function loadPuzzle(index) {
  currentPuzzle = index;
  resetPuzzle();
}

function resetPuzzle() {
  correctCount = 0;
  document.getElementById("code-block").classList.add("hidden");
  createBoard();

  const pieces = document.getElementById("pieces");
  pieces.innerHTML = "";

  const coords = [];
  for (let i = 0; i < totalPieces; i++) {
    const x = (i % boardSize) * pieceSize;
    const y = Math.floor(i / boardSize) * pieceSize;
    coords.push({ index: i, x, y });
  }

  shuffle(coords);

  for (let i = 0; i < totalPieces; i++) {
    const { index, x, y } = coords[i];

    const piece = document.createElement("img");
    piece.src = puzzles[currentPuzzle];
    piece.classList.add("piece");
    piece.draggable = true;
    piece.dataset.index = index;

    piece.style.objectPosition = `-${x}px -${y}px`;
    piece.style.objectFit = "none";
    piece.style.width = `${pieceSize}px`;
    piece.style.height = `${pieceSize}px`;

    piece.addEventListener("dragstart", dragStart);
    pieces.appendChild(piece);
  }

  document.querySelectorAll(".cell").forEach((cell) => {
    cell.innerHTML = "";
    cell.addEventListener("dragover", dragOver);
    cell.addEventListener("drop", drop);
  });
}

function dragStart(event) {
  event.dataTransfer.setData("index", event.target.dataset.index);
  event.dataTransfer.setData("src", event.target.src);
  event.dataTransfer.setData("pos", event.target.style.objectPosition);
}

function dragOver(event) {
  event.preventDefault();
}

function drop(event) {
  event.preventDefault();
  const droppedIndex = parseInt(event.currentTarget.dataset.index);
  const pieceIndex = parseInt(event.dataTransfer.getData("index"));
  const src = event.dataTransfer.getData("src");
  const pos = event.dataTransfer.getData("pos");

  if (event.currentTarget.children.length > 0) return;

  const piece = document.createElement("img");
  piece.src = src;
  piece.classList.add("piece");
  piece.style.objectPosition = pos;
  piece.style.objectFit = "none";
  piece.style.width = `${pieceSize}px`;
  piece.style.height = `${pieceSize}px`;

  event.currentTarget.appendChild(piece);

  if (droppedIndex === pieceIndex) {
    correctCount++;
  }

  if (correctCount === totalPieces) {
    document.getElementById("code-block").classList.remove("hidden");
  }
}

function copyCode() {
  const code = document.getElementById("puzzle-code").innerText;
  navigator.clipboard.writeText(code).then(() => {
    alert("Код скопирован!");
  });
}

window.onload = () => {
  loadPuzzle(0);
};

};
