let selectedPuzzle = 1;
let fieldSize = 5;
let puzzleSize = 100;
let pieces = [];
let placedPieces = [];
let correctCount = 0;
let code = "NN2025-TOUR";

const puzzleImages = {
    1: "secret1.jpg",
    2: "secret2.jpg",
    3: "secret3.jpg",
};

function initGame() {
    const puzzleImage = puzzleImages[selectedPuzzle];
    const puzzleArea = document.getElementById("puzzle-area");
    const pieceContainer = document.getElementById("piece-container");
    const codeBlock = document.getElementById("code-block");
    const copyBtn = document.getElementById("copy-btn");
    const descBlock = document.getElementById("description-block");

    puzzleArea.innerHTML = "";
    pieceContainer.innerHTML = "";
    codeBlock.classList.add("hidden");
    copyBtn.classList.add("hidden");
    descBlock.innerHTML = "";
    correctCount = 0;
    pieces = [];
    placedPieces = [];

    for (let y = 0; y < fieldSize; y++) {
        for (let x = 0; x < fieldSize; x++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.dataset.x = x;
            cell.dataset.y = y;
            puzzleArea.appendChild(cell);
        }
    }

    for (let y = 0; y < fieldSize; y++) {
        for (let x = 0; x < fieldSize; x++) {
            const piece = document.createElement("div");
            piece.className = "piece";
            piece.style.width = `${puzzleSize}px`;
            piece.style.height = `${puzzleSize}px`;
            piece.style.backgroundImage = `url(${puzzleImage})`;
            piece.style.backgroundSize = `${puzzleSize * fieldSize}px ${puzzleSize * fieldSize}px`;
            piece.style.backgroundPosition = `-${x * puzzleSize}px -${y * puzzleSize}px`;
            piece.dataset.correctX = x;
            piece.dataset.correctY = y;

            piece.draggable = true;
            piece.addEventListener("dragstart", dragStart);
            piece.addEventListener("dragend", dragEnd);

            pieces.push(piece);
        }
    }

    shuffleArray(pieces);
    pieces.forEach(piece => pieceContainer.appendChild(piece));

    document.querySelectorAll(".cell").forEach(cell => {
        cell.addEventListener("dragover", dragOver);
        cell.addEventListener("drop", dropPiece);
    });

    try {
        Telegram.WebApp.expand();
    } catch (e) {
        console.log("Telegram.WebApp недоступен:", e);
    }
}

function dragStart(e) {
    e.dataTransfer.setData("text/plain", JSON.stringify({
        correctX: this.dataset.correctX,
        correctY: this.dataset.correctY
    }));
    this.classList.add("dragging");
}

function dragEnd(e) {
    this.classList.remove("dragging");
}

function dragOver(e) {
    e.preventDefault();
}

function dropPiece(e) {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData("text/plain"));
    const existing = this.querySelector(".piece");
    if (existing) {
        existing.remove();
        correctCount--;
    }

    const piece = [...document.querySelectorAll(".piece")].find(p =>
        p.dataset.correctX === data.correctX &&
        p.dataset.correctY === data.correctY &&
        !p.parentElement.classList.contains("cell")
    );

    if (piece) {
        this.appendChild(piece);
        const correct = this.dataset.x == data.correctX && this.dataset.y == data.correctY;
        if (correct) {
            correctCount++;
        }
    }

    if (correctCount === fieldSize * fieldSize) {
        showCode();
    }
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

function showCode() {
    const codeBlock = document.getElementById("code-block");
    const copyBtn = document.getElementById("copy-btn");
    const descBlock = document.getElementById("description-block");

    codeBlock.classList.remove("hidden");
    copyBtn.classList.remove("hidden");

    if (selectedPuzzle === 1) {
        descBlock.innerText = "Жмурки — знаменитое граффити в центре города.";
    } else if (selectedPuzzle === 2) {
        descBlock.innerText = "Дом Жмурки — культовое здание советского модернизма.";
    } else if (selectedPuzzle === 3) {
        descBlock.innerText = "Громозека — уличное искусство с отсылкой к фантастике.";
    }

    launchConfetti();
}

function resetGame() {
    initGame();
}

function selectPuzzle(num) {
    selectedPuzzle = num;
    initGame();
}

function launchConfetti() {
    const canvas = document.getElementById("confetti-canvas");
    const jsConfetti = new JSConfetti({ canvas });
    canvas.classList.remove("hidden");
    jsConfetti.addConfetti({
        emojis: ["🎉", "🎊", "✨", "🎈"],
        emojiSize: 40,
        confettiNumber: 60
    });
}

document.getElementById("copy-btn").addEventListener("click", () => {
    navigator.clipboard.writeText(code).then(() => {
        alert("Код скопирован!");
        try {
            Telegram.WebApp.sendData(code);
        } catch (e) {
            console.log("Не в Telegram WebApp:", e);
        }
    });
});

initGame();
