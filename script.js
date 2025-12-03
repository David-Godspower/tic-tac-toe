// ---------------------
// VARIABLES
// ---------------------
let board = ["", "", "", "", "", "", "", "", ""];
let human = "X";
let ai = "O";
let gameOver = false;

let resetBtn = document.querySelector('#reset');
let newGameBtn = document.querySelector('#new-btn');
let msgContainer = document.querySelector('.msg-container');
let msg = document.querySelector('#msg');

const boxes = document.querySelectorAll(".box");

// ---------------------
// EVENT LISTENERS
// ---------------------
boxes.forEach((box, index) => {
    box.addEventListener("click", () => {
        if (!gameOver && box.innerText === "") {
            makeMove(index, human);

            if (!gameOver) {
                // Add AI delay
                setTimeout(() => {
                    let bestMoveIndex = bestMove();
                    makeMove(bestMoveIndex, ai);
                }, 500); // 500ms delay
            }
        }
    });
});

// Reset / New Game buttons
resetBtn.addEventListener('click', resetGame);
newGameBtn.addEventListener('click', resetGame);

// ---------------------
// FUNCTIONS
// ---------------------
function makeMove(index, player) {
    board[index] = player;
    boxes[index].innerText = player;
    boxes[index].style.pointerEvents = "none"; // disable clicked box

    if (checkWinner(player)) {
        showWinner(player);
    } else if (isDraw()) {
        showDraw();
    }
}

function showWinner(player) {
    msg.innerText = `Congratulations Player ${player} wins!`;
    msgContainer.classList.remove('hide');
    gameOver = true;
}

function showDraw() {
    msg.innerText = "Draw!";
    msgContainer.classList.remove('hide');
    gameOver = true;
}

function resetGame() {
    board = ["", "", "", "", "", "", "", "", ""];
    boxes.forEach(box => {
        box.innerText = "";
        box.style.pointerEvents = "auto"; // enable clicking
    });
    gameOver = false;
    msgContainer.classList.add('hide');
}

// ---------------------
// MINIMAX AI
// ---------------------
function bestMove() {
    let bestScore = -Infinity;
    let move;

    for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
            board[i] = ai;
            let score = minimax(board, 0, false);
            board[i] = "";
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(newBoard, depth, isMaximizing) {
    if (checkWinner(ai)) return 10 - depth;
    if (checkWinner(human)) return depth - 10;
    if (isDraw()) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (newBoard[i] === "") {
                newBoard[i] = ai;
                let score = minimax(newBoard, depth + 1, false);
                newBoard[i] = "";
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (newBoard[i] === "") {
                newBoard[i] = human;
                let score = minimax(newBoard, depth + 1, true);
                newBoard[i] = "";
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

// ---------------------
// GAME HELPERS
// ---------------------
function checkWinner(player) {
    const wins = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ];
    return wins.some(pattern =>
        pattern.every(index => board[index] === player)
    );
}

function isDraw() {
    return board.every(cell => cell !== "");
}

document.getElementById('year').textContent = new Date().getFullYear();