// ===============================
// ELEMENTOS DA TELA
// ===============================

const menu = document.getElementById("menu");
const game = document.getElementById("game");
const bigBoardElement = document.getElementById("bigBoard");
const statusText = document.getElementById("status");

const pvpBtn = document.getElementById("pvpBtn");
const aiBtn = document.getElementById("aiBtn");
const backBtn = document.getElementById("backBtn");

pvpBtn.addEventListener("click", () => startGame("pvp"));
aiBtn.addEventListener("click", () => startGame("ai"));
backBtn.addEventListener("click", goToMenu);

// ===============================
// ESTADO DO JOGO
// ===============================

let currentPlayer;
let nextBoard;
let gameOver;
let mode;

let bigBoardState;
let smallBoards;

const winPatterns = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
];

// ===============================
// MENU
// ===============================

function startGame(selectedMode) {
    mode = selectedMode;
    menu.classList.add("hidden");
    game.classList.remove("hidden");
    initGame();
}

function goToMenu() {
    game.classList.add("hidden");
    menu.classList.remove("hidden");
}

// ===============================
// INICIALIZAÇÃO
// ===============================

function initGame() {
    bigBoardElement.innerHTML = "";

    currentPlayer = "X";
    nextBoard = null;
    gameOver = false;

    bigBoardState = Array(9).fill(null);
    smallBoards = [];

    for (let i = 0; i < 9; i++) {
        const smallBoard = document.createElement("div");
        smallBoard.classList.add("small-board");
        smallBoard.dataset.index = i;

        let smallState = Array(9).fill(null);
        smallBoards.push(smallState);

        for (let j = 0; j < 9; j++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.small = i;
            cell.dataset.cell = j;
            cell.addEventListener("click", handleMove);
            smallBoard.appendChild(cell);
        }

        bigBoardElement.appendChild(smallBoard);
    }

    statusText.textContent = "Vez do jogador: X";
    updateActiveBoard();
}

// ===============================
// JOGADA HUMANA
// ===============================

function handleMove(e) {
    if (gameOver) return;

    const smallIndex = parseInt(e.target.dataset.small);
    const cellIndex = parseInt(e.target.dataset.cell);

    if (!isMoveAllowed(smallIndex, cellIndex)) return;

    makeMove(smallIndex, cellIndex, e.target);

    if (mode === "ai" && currentPlayer === "O" && !gameOver) {
        setTimeout(aiMove, 400);
    }
}

function isMoveAllowed(smallIndex, cellIndex) {
    if (nextBoard !== null && smallIndex !== nextBoard) return false;
    if (smallBoards[smallIndex][cellIndex] !== null) return false;
    if (bigBoardState[smallIndex] !== null) return false;
    return true;
}

// ===============================
// EXECUTAR JOGADA
// ===============================

function makeMove(smallIndex, cellIndex, cellElement = null) {

    smallBoards[smallIndex][cellIndex] = currentPlayer;

    if (cellElement) {
        cellElement.textContent = currentPlayer;
    } else {
        const selector = `.cell[data-small='${smallIndex}'][data-cell='${cellIndex}']`;
        const cell = document.querySelector(selector);
        if (cell) cell.textContent = currentPlayer;
    }

    // Vitória no small board
    if (checkWinner(smallBoards[smallIndex], currentPlayer)) {
        bigBoardState[smallIndex] = currentPlayer;
        const boardDiv = document.querySelector(`.small-board[data-index='${smallIndex}']`);
        boardDiv.classList.add(currentPlayer === "X" ? "won-x" : "won-o");
    }

    // Vitória no board grande
    if (checkWinner(bigBoardState, currentPlayer)) {
        statusText.textContent = `🎉 Jogador ${currentPlayer} venceu!`;
        gameOver = true;
        return;
    }

    // Define próximo tabuleiro obrigatório
    nextBoard = cellIndex;

    if (bigBoardState[nextBoard] !== null || isFull(smallBoards[nextBoard])) {
        nextBoard = null;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusText.textContent = `Vez do jogador: ${currentPlayer}`;

    updateActiveBoard();
}

// ===============================
// IA
// ===============================

function aiMove() {

    let moves = getAvailableMoves();
    if (moves.length === 0) return;

    // 1️⃣ tenta ganhar
    let move = findWinningMove("O");

    // 2️⃣ tenta bloquear jogador
    if (!move) move = findWinningMove("X");

    // 3️⃣ aleatório
    if (!move) move = moves[Math.floor(Math.random() * moves.length)];

    makeMove(move.small, move.cell);
}

function getAvailableMoves() {
    let moves = [];

    for (let s = 0; s < 9; s++) {

        if (nextBoard !== null && s !== nextBoard) continue;
        if (bigBoardState[s] !== null) continue;

        for (let c = 0; c < 9; c++) {
            if (smallBoards[s][c] === null) {
                moves.push({ small: s, cell: c });
            }
        }
    }

    if (moves.length === 0 && nextBoard !== null) {
        nextBoard = null;
        return getAvailableMoves();
    }

    return moves;
}

function findWinningMove(player) {

    let moves = getAvailableMoves();

    for (let move of moves) {
        let boardCopy = [...smallBoards[move.small]];
        boardCopy[move.cell] = player;

        if (checkWinner(boardCopy, player)) {
            return move;
        }
    }

    return null;
}

// ===============================
// UTILIDADES
// ===============================

function checkWinner(board, player) {
    return winPatterns.some(pattern =>
        pattern.every(index => board[index] === player)
    );
}

function isFull(board) {
    return board.every(cell => cell !== null);
}

function updateActiveBoard() {

    document.querySelectorAll(".small-board").forEach(board => {
        board.classList.remove("active");
    });

    if (nextBoard !== null) {
        const boardDiv = document.querySelector(`.small-board[data-index='${nextBoard}']`);
        if (boardDiv) boardDiv.classList.add("active");
    }
}
