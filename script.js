// ---------------------
// 1. VARIABLES & STATE
// ---------------------
const human = "X";
const ai = "O";
let board = Array(9).fill("");
let gameOver = false;
let isAiTurn = false;
let scores = JSON.parse(localStorage.getItem('tttScores')) || { x: 0, o: 0, tie: 0 };

// DOM Elements
const boxes = document.querySelectorAll(".box");
const resetBtn = document.querySelector('#reset');
const newGameBtn = document.querySelector('#new-btn');
const msgContainer = document.querySelector('.msg-container');
const msg = document.querySelector('#msg');
const difficultySelect = document.getElementById('difficulty');
const resetScoreBtn = document.getElementById('reset-score-btn');

// Initialize UI
updateScoreBoard();
document.getElementById('year').textContent = new Date().getFullYear();

// ---------------------
// 2. AUDIO SYSTEM (Web Audio API)
// ---------------------
// Generates beeps without external files
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'win') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    } else if (type === 'draw') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(200, audioCtx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    }
}

// ---------------------
// 3. GAMEPLAY
// ---------------------
boxes.forEach((box, index) => {
    box.addEventListener("click", () => {
        if (!gameOver && board[index] === "" && !isAiTurn) {
            handleHumanMove(index);
        }
    });
});

resetBtn.addEventListener('click', resetGame);
newGameBtn.addEventListener('click', resetGame);
resetScoreBtn.addEventListener('click', resetScores);

function handleHumanMove(index) {
    playSound('click');
    makeMove(index, human);

    if (!gameOver) {
        isAiTurn = true;
        document.body.style.cursor = "wait"; // Visual indicator
        
        // Random delay 400-800ms for realism
        const delay = Math.floor(Math.random() * 400) + 400;
        setTimeout(() => {
            makeAiMove();
            isAiTurn = false;
            document.body.style.cursor = "default";
        }, delay);
    }
}

function makeAiMove() {
    const difficulty = difficultySelect.value;
    let moveIndex;

    if (difficulty === "easy") {
        moveIndex = (Math.random() < 0.2) ? getBestMove() : getRandomMove();
    } else if (difficulty === "medium") {
        moveIndex = (Math.random() < 0.6) ? getBestMove() : getRandomMove();
    } else {
        moveIndex = getBestMove(); // Hard (Unbeatable)
    }
    
    playSound('click');
    makeMove(moveIndex, ai);
}

function makeMove(index, player) {
    board[index] = player;
    const box = boxes[index];
    box.innerText = player;
    box.classList.add(player === human ? 'x-move' : 'o-move');
    box.style.pointerEvents = "none";

    // Check Win/Draw
    const winningPattern = checkWinPattern(board, player);
    if (winningPattern) {
        highlightWin(winningPattern);
        endGame(player === human ? "You Win!" : "AI Wins!");
    } else if (isDraw(board)) {
        playSound('draw');
        endGame("It's a Draw!");
    }
}

// ---------------------
// 4. GAME ENDING & VISUALS
// ---------------------
function endGame(message) {
    gameOver = true;
    msg.innerText = message;
    
    // Update Score
    if (message.includes("You")) scores.x++;
    else if (message.includes("AI")) scores.o++;
    else scores.tie++;
    
    localStorage.setItem('tttScores', JSON.stringify(scores));
    updateScoreBoard();

    // Trigger Effects
    if (message.includes("You") || message.includes("AI")) {
        playSound('win');
        triggerConfetti();
    }

    setTimeout(() => msgContainer.classList.remove('hide'), 500);
}

function highlightWin(pattern) {
    pattern.forEach(index => boxes[index].classList.add('win-box'));
}

function resetGame() {
    board.fill("");
    gameOver = false;
    isAiTurn = false;
    msgContainer.classList.add('hide');
    
    boxes.forEach(box => {
        box.innerText = "";
        box.className = "box"; // Reset classes
        box.style.pointerEvents = "auto";
    });
}

function resetScores() {
    if(confirm("Reset all scores?")) {
        scores = { x: 0, o: 0, tie: 0 };
        localStorage.setItem('tttScores', JSON.stringify(scores));
        updateScoreBoard();
    }
}

function updateScoreBoard() {
    document.getElementById('score-x').innerText = scores.x;
    document.getElementById('score-o').innerText = scores.o;
    document.getElementById('score-tie').innerText = scores.tie;
}

function triggerConfetti() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00f2ff', '#ff0055', '#ffd700']
    });
}

// ---------------------
// 5. AI LOGIC (MINIMAX)
// ---------------------
function getRandomMove() {
    let available = [];
    board.forEach((cell, index) => { if (cell === "") available.push(index); });
    return available[Math.floor(Math.random() * available.length)];
}

function getBestMove() {
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

function minimax(currentBoard, depth, isMaximizing) {
    if (checkWinPattern(currentBoard, ai)) return 10 - depth;
    if (checkWinPattern(currentBoard, human)) return depth - 10;
    if (isDraw(currentBoard)) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (currentBoard[i] === "") {
                currentBoard[i] = ai;
                let score = minimax(currentBoard, depth + 1, false);
                currentBoard[i] = "";
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (currentBoard[i] === "") {
                currentBoard[i] = human;
                let score = minimax(currentBoard, depth + 1, true);
                currentBoard[i] = "";
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinPattern(boardState, player) {
    const wins = [
        [0,1,2], [3,4,5], [6,7,8], 
        [0,3,6], [1,4,7], [2,5,8], 
        [0,4,8], [2,4,6]
    ];
    // Returns the array of indices if winner, else null
    return wins.find(pattern => pattern.every(index => boardState[index] === player));
}

function isDraw(boardState) {
    return boardState.every(cell => cell !== "");
}