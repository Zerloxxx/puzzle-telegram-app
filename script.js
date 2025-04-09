const pieces = document.getElementById('pieces');
const board = document.getElementById('board');
const codeBlock = document.getElementById('code-block');
const code = document.getElementById('code');

let puzzleImage = 'secret1.jpg';
let selectedPuzzle = 1;
let total = 5;

function createBoard() {
  board.innerHTML = '';
  for (let i = 0; i < total * total; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    board.appendChild(cell);
  }
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function createPieces() {
  pieces.innerHTML = '';
  let indexes = shuffle([...Array(total * total).keys()]);

  indexes.forEach(index => {
    const x = index % total;
    const y = Math.floor(index / total);
    const piece = document.createElement('img');
    piece.className = 'piece';
    piece.draggable = true;
    piece.style.objectFit = 'cover';
    piece.style.objectPosition = `-${x * 60}px -${y * 60}px`;
    piece.src = puzzleImage;
    piece.dataset.index = index;
    piece.addEventListener('dragstart', dragStart);
    pieces.appendChild(piece);
  });
}

function resetPuzzle() {
  createBoard();
  createPieces();
  codeBlock.classList.add('hidden');
}

function dragStart(e) {
  e.dataTransfer.setData('index', e.target.dataset.index);
  e.dataTransfer.setData('src', e.target.src);
  e.dataTransfer.setData('pos', e.target.style.objectPosition);
}

function drop(e) {
  e.preventDefault();
  const index = e.dataTransfer.getData('index');
  const src = e.dataTransfer.getData('src');
  const pos = e.dataTransfer.getData('pos');

  if (e.target.className === 'cell' && !e.target.hasChildNodes()) {
    const img = document.createElement('img');
    img.className = 'piece';
    img.src = src;
    img.style.objectPosition = pos;
    img.draggable = true;
    img.dataset.index = index;
    img.addEventListener('dragstart', dragStart);
    e.target.appendChild(img);
  }

  checkPuzzle();
}

function allowDrop(e) {
  e.preventDefault();
}

function checkPuzzle() {
  const cells = board.querySelectorAll('.cell');
  let correct = true;

  for (let i = 0; i < cells.length; i++) {
    const img = cells[i].querySelector('img');
    if (!img || parseInt(img.dataset.index) !== i) {
      correct = false;
      break;
    }
  }

  if (correct) {
    codeBlock.classList.remove('hidden');

    if (window.Telegram?.WebApp?.sendData) {
      Telegram.WebApp.sendData('NN2025-TOUR');
    }
  }
}

function loadPuzzle(n) {
  selectedPuzzle = n;
  puzzleImage = `secret${n}.jpg`;
  resetPuzzle();
}

board.addEventListener('dragover', allowDrop);
board.addEventListener('drop', drop);

window.addEventListener('load', () => {
  loadPuzzle(1);
});

function copyCode() {
  navigator.clipboard.writeText(code.textContent);
}
