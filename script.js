const puzzles = ["secret1.jpg", "secret2.jpg", "secret3.jpg"];
let currentPuzzle = 0;
let pieceSize = 60;
let boardSize = 5;
let totalPieces = boardSize * boardSize;
let correctCount = 0;
let puzzlePieces = [];

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
  document.getElementById("description").classList.add("hidden");
  createBoard();
  const piecesContainer = document.getElementById("pieces");
  piecesContainer.innerHTML = "";

  const img = new Image();
  img.src = puzzles[currentPuzzle];
  img.onload = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = pieceSize * boardSize;
    canvas.height = pieceSize * boardSize;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const pieceWidth = canvas.width / boardSize;
    const pieceHeight = canvas.height / boardSize;
    puzzlePieces = [];

    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        const pieceCanvas = document.createElement("canvas");
        pieceCanvas.width = pieceSize;
        pieceCanvas.height = pieceSize;
        const pieceCtx = pieceCanvas.getContext("2d");

        pieceCtx.drawImage(
          canvas,
          j * pieceWidth,
          i * pieceHeight,
          pieceWidth,
          pieceHeight,
          0,
          0,
          pieceSize,
          pieceSize
        );

        const pieceData = pieceCanvas.toDataURL();
        puzzlePieces.push({ data: pieceData, index: i * boardSize + j });
      }
    }

    shuffle(puzzlePieces);

    for (let piece of puzzlePieces) {
      const imgElem = document.createElement("img");
      imgElem.src = piece.data;
      imgElem.classList.add("piece");
      imgElem.draggable = true;
      imgElem.dataset.index = piece.index;
      imgElem.addEventListener("dragstart", dragStart);
      piecesContainer.appendChild(imgElem);
    }

    document.querySelectorAll(".cell").forEach((cell) => {
      cell.innerHTML = "";
      cell.addEventListener("dragover", dragOver);
      cell.addEventListener("drop", drop);
    });
  };
}

function dragStart(event) {
  event.dataTransfer.setData("index", event.target.dataset.index);
  event.dataTransfer.setData("src", event.target.src);
}

function dragOver(event) {
  event.preventDefault();
}

function drop(event) {
  event.preventDefault();
  const droppedIndex = parseInt(event.currentTarget.dataset.index);
  const pieceIndex = parseInt(event.dataTransfer.getData("index"));
  const src = event.dataTransfer.getData("src");

  if (event.currentTarget.children.length > 0) return;

  const piece = document.createElement("img");
  piece.src = src;
  piece.classList.add("piece");
  piece.draggable = false;

  event.currentTarget.appendChild(piece);

  if (droppedIndex === pieceIndex) {
    correctCount++;
  }

  if (correctCount === totalPieces) {
    document.getElementById("code-block").classList.remove("hidden");

    const descriptions = [
      "Жмурки — одно из самых атмосферных мест с захватывающим видом на Волгу.",
      "Пазл 2 — это историческая улица с купеческими домами и уютными дворами.",
      "Пазл 3 — знаменитая смотровая площадка с панорамой на Нижний Новгород."
    ];
    document.getElementById("description").classList.remove("hidden");
    document.getElementById("place-description").innerText = descriptions[currentPuzzle];

    showFireworks();
  }
}

function copyCode() {
  const code = document.getElementById("puzzle-code").innerText;
  navigator.clipboard.writeText(code).then(() => {
    alert("Код скопирован!");
  });
}

function showFireworks() {
  const container = document.createElement("div");
  container.classList.add("fireworks");
  document.body.appendChild(container);

  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/fireworks-js@2.1.0/dist/fireworks.js";
  script.onload = () => {
    const fireworks = new Fireworks(container, {
      autoresize: true,
      opacity: 0.8,
      acceleration: 1.05,
      friction: 0.97,
      gravity: 1.5,
      particles: 90,
      traceLength: 3,
      traceSpeed: 10,
      explosion: 5,
      intensity: 30,
      flickering: 50,
      lineStyle: 'round',
      hue: { min: 0, max: 360 },
      delay: { min: 15, max: 30 },
      rocketsPoint: { min: 0, max: 100 },
      lineWidth: { explosion: { min: 1, max: 3 }, trace: { min: 1, max: 2 } },
    });
    fireworks.start();
    setTimeout(() => {
      fireworks.stop();
      container.remove();
    }, 4000);
  };
  document.body.appendChild(script);
}

window.onload = () => {
  loadPuzzle(0);
};
