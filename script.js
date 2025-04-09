window.Telegram.WebApp?.ready();

const board = document.getElementById('puzzle-board');
const piecesContainer = document.getElementById('pieces-container');
const resetButton = document.getElementById('reset-button');
const puzzleButtons = document.querySelectorAll('.puzzle-btn');
const descriptionBlock = document.getElementById('description-block');
const confettiCanvas = document.getElementById('confetti-canvas');

const size = 5;
const pieceSize = 100;

let pieces = [];
let currentPuzzle = 1;
let codeShown = false;

const puzzles = {
  1: {
    image: 'secret1.jpg',
    code: 'JMURKI25',
    description: 'Граффити неспроста появилось именно в Нижнем Новгороде, ведь именно там снималась большая часть «Жмурок». Конкретно во дворе, где появились уличные картины, Сережа и Саймон приехали на встречу к Доктору. На другом рисунке можно увидеть Рошфора в образе криминального авторитета Сергея Михайловича и Вжика в роли его сынульки Вадика.',
  },
  2: {
    image: 'secret2.jpg',
    code: 'DOMJMURKI52',
    description: 'Дореволюционный дом в центре Нижнего Новгорода, на улице Провиантской, когда-то был гостиницей для состоятельных гостей. Наибольшую известность место получило после выхода фильма «Жмурки», где развернулся кровавый финал бандитской истории, снятой Алексеем Балабановым.',
  },
  3: {
    image: 'secret3.jpg',
    code: 'TOUR-LEVEL-3',
    description: 'Памятник известному персонажу книг фантаста Кира Булычёва установлен в жилом косплексе «Гагаринские высоты», что находится в Приокском районе Нижнего Новгорода.',
  }
};

puzzleButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    currentPuzzle = parseInt(btn.dataset.id);
    init();
  });
});

function init() {
  board.innerHTML = '';
  piecesContainer.innerHTML = '';
  pieces = [];
  codeShown = false;
  removeCopyButton();
  stopConfetti();
  descriptionBlock.classList.add('hidden');
  piecesContainer.classList.remove('hidden');

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.style.left = `${x * pieceSize}px`;
      cell.style.top = `${y * pieceSize}px`;
      cell.dataset.x = x;
      cell.dataset.y = y;
      board.appendChild(cell);
    }
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const piece = document.createElement('div');
      piece.classList.add('piece');
      piece.style.backgroundImage = `url('${puzzles[currentPuzzle].image}')`;
      piece.style.backgroundSize = `${pieceSize * size}px ${pieceSize * size}px`;
      piece.style.backgroundPosition = `-${x * pieceSize}px -${y * pieceSize}px`;
      piece.dataset.correctX = x;
      piece.dataset.correctY = y;
      pieces.push(piece);
    }
  }

  shuffleArray(pieces);
  pieces.forEach(piece => {
    piecesContainer.appendChild(piece);
    enableDrag(piece);
  });
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function enableDrag(piece) {
  let offsetX, offsetY;

  piece.addEventListener('mousedown', (e) => {
    offsetX = e.offsetX;
    offsetY = e.offsetY;

    piece.style.zIndex = 3;
    piece.style.position = 'absolute';
    document.body.appendChild(piece);

    moveAt(e.pageX, e.pageY);

    function moveAt(pageX, pageY) {
      piece.style.left = pageX - offsetX + 'px';
      piece.style.top = pageY - offsetY + 'px';
    }

    const onMouseMove = (e) => moveAt(e.pageX, e.pageY);
    const onMouseUp = (e) => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      const boardRect = board.getBoundingClientRect();
      const x = Math.floor((e.pageX - boardRect.left) / pieceSize);
      const y = Math.floor((e.pageY - boardRect.top) / pieceSize);

      const occupied = Array.from(board.children).some(el => {
        return (
          el.classList.contains('piece') &&
          parseInt(el.style.left) === x * pieceSize &&
          parseInt(el.style.top) === y * pieceSize
        );
      });

      if (x >= 0 && x < size && y >= 0 && y < size && !occupied) {
        piece.style.left = `${x * pieceSize}px`;
        piece.style.top = `${y * pieceSize}px`;
        board.appendChild(piece);
        piece.style.position = 'absolute';
        piece.dataset.currentX = x;
        piece.dataset.currentY = y;
        checkWin();
      } else {
        returnToPool(piece);
      }

      piece.style.zIndex = 2;
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
}

function returnToPool(piece) {
  piece.style.position = 'static';
  piece.style.left = 'unset';
  piece.style.top = 'unset';
  piecesContainer.appendChild(piece);
  delete piece.dataset.currentX;
  delete piece.dataset.currentY;
}

function checkWin() {
  const placed = board.querySelectorAll('.piece');
  if (placed.length !== size * size) return;

  let correct = true;
  placed.forEach(p => {
    if (p.dataset.currentX !== p.dataset.correctX || p.dataset.currentY !== p.dataset.correctY) {
      correct = false;
    }
  });

  if (correct && !codeShown) {
    showWinCode();
    codeShown = true;
  }
}

function showWinCode() {
  const codeBlock = document.createElement('div');
  codeBlock.id = 'win-code';
  codeBlock.textContent = `Код: ${puzzles[currentPuzzle].code}`;
  document.querySelector('.buttons').appendChild(codeBlock);

  const copyBtn = document.createElement('button');
  copyBtn.textContent = 'Скопировать код';
  copyBtn.style.marginLeft = '10px';
  copyBtn.style.padding = '8px 14px';
  copyBtn.style.borderRadius = '6px';
  copyBtn.style.background = '#1976d2';
  copyBtn.style.color = 'white';
  copyBtn.style.border = 'none';
  copyBtn.style.cursor = 'pointer';

  copyBtn.onclick = () => {
    navigator.clipboard.writeText(puzzles[currentPuzzle].code);
    copyBtn.textContent = 'Скопировано!';
  };

  document.querySelector('.buttons').appendChild(copyBtn);

  // 🟢 Отправка кода в Telegram
  if (window.Telegram.WebApp) {
    window.Telegram.WebApp.sendData(puzzles[currentPuzzle].code);
  }

  // 👀 Описание и салют
  descriptionBlock.textContent = puzzles[currentPuzzle].description;
  piecesContainer.classList.add('hidden');
  descriptionBlock.classList.remove('hidden');
  launchConfetti();
}

function removeCopyButton() {
  const code = document.getElementById('win-code');
  if (code) code.remove();
  const btns = document.querySelectorAll('button');
  btns.forEach(btn => {
    if (btn.textContent === 'Скопировать код' || btn.textContent === 'Скопировано!') {
      btn.remove();
    }
  });
}

resetButton.addEventListener('click', init);

function launchConfetti() {
  const ctx = confettiCanvas.getContext('2d');
  const w = confettiCanvas.width = window.innerWidth;
  const h = confettiCanvas.height = window.innerHeight;
  let particles = [];

  for (let i = 0; i < 150; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h - h,
      r: Math.random() * 6 + 4,
      d: Math.random() * 100,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`,
      tilt: Math.random() * 10 - 10
    });
  }

  let angle = 0;
  function draw() {
    ctx.clearRect(0, 0, w, h);
    angle += 0.01;
    for (let i = 0; i < particles.length; i++) {
      let p = particles[i];
      p.y += Math.cos(angle + p.d) + 2;
      p.x += Math.sin(angle) * 2;
      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.ellipse(p.x, p.y, p.r, p.r / 2, p.tilt, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const interval = setInterval(draw, 16);
  confettiCanvas.dataset.active = 'true';

  setTimeout(() => {
    clearInterval(interval);
    ctx.clearRect(0, 0, w, h);
    confettiCanvas.dataset.active = 'false';
  }, 3000);
}

function stopConfetti() {
  if (confettiCanvas.dataset.active === 'true') {
    const ctx = confettiCanvas.getContext('2d');
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiCanvas.dataset.active = 'false';
  }
}

init();

