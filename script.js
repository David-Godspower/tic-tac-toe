 // --------------------------------------------------
// 1. STATE & VARIABLES
// --------------------------------------------------
const X_CLASS = 'x';
const O_CLASS = 'o';
let board = Array(9).fill("");
let isGameActive = true;
let gameMode = 'pve'; // 'pve' (vs AI) or 'pvp' (vs Friend)
let currentPlayer = X_CLASS; // Tracks turn in PvP
let isAiProcessing = false; // Locks board during AI think time

// Load scores from local storage
let scores = JSON.parse(localStorage.getItem('tttScores')) || { x: 0, o: 0, tie: 0 };

// DOM Elements
const boxes = document.querySelectorAll('.box');
const msgContainer = document.querySelector('.msg-container');
const msgElement = document.getElementById('msg');
const turnIndicator = document.getElementById('turn-indicator');
const difficultySelect = document.getElementById('difficulty');
const difficultyGroup = document.getElementById('difficulty-group');
const modeBtn = document.getElementById('mode-btn');

// Initialize
updateScoreBoard();
updateTurnIndicator();
document.getElementById('year').textContent = new Date().getFullYear();

// --------------------------------------------------
// 2. AUDIO SYSTEM (No external files needed)
// --------------------------------------------------
// --------------------------------------------------
// UPDATED AUDIO SYSTEM (With Mute Logic)
// --------------------------------------------------
let isMuted = false;
const soundBtn = document.getElementById('sound-btn');
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Toggle Sound Listener
soundBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    const icon = soundBtn.querySelector('i');
    if (isMuted) {
        icon.className = 'fas fa-volume-mute';
        soundBtn.style.color = '#666'; // Dimmed when muted
    } else {
        icon.className = 'fas fa-volume-up';
        soundBtn.style.color = 'var(--neon-blue)';
    }
});

function playTone(type) {
    // 1. Check if Muted
    if (isMuted) return; 

    // 2. Resume Context (Browsers block audio until interaction)
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    
    // ... (Keep your existing frequency logic below) ...
    if (type === 'click') {
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    } else if (type === 'win') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.linearRampToValueAtTime(1000, now + 0.1);
        osc.frequency.linearRampToValueAtTime(500, now + 0.3);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
    } else if (type === 'draw') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, now);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    }
}
// --------------------------------------------------
// 3. EVENT LISTENERS
// --------------------------------------------------
boxes.forEach((box, index) => {
    box.addEventListener('click', () => handleBoxClick(index));
});

document.getElementById('reset').addEventListener('click', resetGame);
document.getElementById('new-btn').addEventListener('click', resetGame);

document.getElementById('reset-score-btn').addEventListener('click', () => {
    if(confirm("Reset scoreboard?")) {
        scores = { x: 0, o: 0, tie: 0 };
        localStorage.setItem('tttScores', JSON.stringify(scores));
        updateScoreBoard();
    }
});

modeBtn.addEventListener('click', () => {
    // Toggle Mode
    gameMode = (gameMode === 'pve') ? 'pvp' : 'pve';
    
    // Update UI Button
    const icon = modeBtn.querySelector('i');
    const text = modeBtn.querySelector('span');
    
    if (gameMode === 'pvp') {
        modeBtn.classList.add('pvp');
        icon.className = 'fas fa-user-friends';
        text.innerText = "Vs Friend";
        difficultyGroup.classList.add('disabled'); // Disable AI difficulty
    } else {
        modeBtn.classList.remove('pvp');
        icon.className = 'fas fa-robot';
        text.innerText = "Vs AI";
        difficultyGroup.classList.remove('disabled');
    }
    resetGame();
});

// --------------------------------------------------
// 4. GAME LOGIC
// --------------------------------------------------
function handleBoxClick(index) {
    // Validation: Block if box filled, game over, or AI is thinking
    if (board[index] !== "" || !isGameActive || isAiProcessing) return;

    if (gameMode === 'pve') {
        // --- Player vs AI ---
        playTone('click');
        makeMove(index, X_CLASS);
        
        if (isGameActive) {
            isAiProcessing = true;
            turnIndicator.innerText = "AI is thinking...";
            
            // Random delay for realism
            setTimeout(() => {
                makeAiMove();
                isAiProcessing = false;
                if(isGameActive) updateTurnIndicator();
            }, 500);
        }
    } else {
        // --- Player vs Player ---
        playTone('click');
        makeMove(index, currentPlayer);
        
        if (isGameActive) {
            // Swap turns
            currentPlayer = currentPlayer === X_CLASS ? O_CLASS : X_CLASS;
            updateTurnIndicator();
        }
    }
}

function makeMove(index, player) {
    board[index] = player;
    const box = boxes[index];
    box.classList.add(player);
    box.innerText = player === X_CLASS ? "X" : "O";

    // Check Win/Draw
    if (checkWin(board, player)) {
        endGame(false, player);
    } else if (isDraw(board)) {
        endGame(true);
    }
}

function makeAiMove() {
    const difficulty = difficultySelect.value;
    let moveIndex;

    if (difficulty === 'easy') {
        moveIndex = (Math.random() < 0.3) ? getBestMove() : getRandomMove();
    } else if (difficulty === 'medium') {
        moveIndex = (Math.random() < 0.6) ? getBestMove() : getRandomMove();
    } else {
        moveIndex = getBestMove(); // Hard (Unbeatable)
    }

    playTone('click');
    makeMove(moveIndex, O_CLASS);
}

// --------------------------------------------------
// 5. GAME ENDING & UTILS
// --------------------------------------------------
function endGame(draw, winner) {
    isGameActive = false;
    
    if (draw) {
        msgElement.innerText = "It's a Draw!";
        scores.tie++;
        playTone('draw');
    } else {
        msgElement.innerText = winner === X_CLASS ? "Player X Wins!" : (gameMode === 'pve' ? "AI Wins!" : "Player O Wins!");
        if (winner === X_CLASS) scores.x++;
        else scores.o++;
        
        playTone('win');
        triggerConfetti();
        highlightWin(winner);
    }
    
    localStorage.setItem('tttScores', JSON.stringify(scores));
    updateScoreBoard();
    setTimeout(() => msgContainer.classList.remove('hide'), 800);
}

function resetGame() {
    board.fill("");
    isGameActive = true;
    currentPlayer = X_CLASS;
    msgContainer.classList.add('hide');
    
    boxes.forEach(box => {
        box.className = 'box'; // Remove X/O classes and win highlights
        box.innerText = "";
    });
    updateTurnIndicator();
}

function updateTurnIndicator() {
    if (gameMode === 'pve') {
        turnIndicator.innerText = "Your Turn (X)";
    } else {
        turnIndicator.innerText = `Player ${currentPlayer === X_CLASS ? 'X' : 'O'}'s Turn`;
    }
}

function updateScoreBoard() {
    document.getElementById('score-x').innerText = scores.x;
    document.getElementById('score-o').innerText = scores.o;
    document.getElementById('score-tie').innerText = scores.tie;
}

function highlightWin(player) {
    const wins = [
        [0,1,2], [3,4,5], [6,7,8], 
        [0,3,6], [1,4,7], [2,5,8], 
        [0,4,8], [2,4,6]
    ];
    const pattern = wins.find(p => p.every(i => board[i] === player));
    if (pattern) {
        pattern.forEach(i => boxes[i].classList.add('win'));
    }
}

function triggerConfetti() {
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00f3ff', '#ff0055', '#ffd700']
    });
}

// --------------------------------------------------
// 6. AI LOGIC (MINIMAX)
// --------------------------------------------------
function getRandomMove() {
    let available = [];
    board.forEach((cell, i) => { if(cell === "") available.push(i); });
    return available[Math.floor(Math.random() * available.length)];
}

function getBestMove() {
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
            board[i] = O_CLASS;
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
    if (checkWin(currentBoard, O_CLASS)) return 10 - depth;
    if (checkWin(currentBoard, X_CLASS)) return depth - 10;
    if (isDraw(currentBoard)) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (currentBoard[i] === "") {
                currentBoard[i] = O_CLASS;
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
                currentBoard[i] = X_CLASS;
                let score = minimax(currentBoard, depth + 1, true);
                currentBoard[i] = "";
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWin(currentBoard, player) {
    const wins = [
        [0,1,2], [3,4,5], [6,7,8], 
        [0,3,6], [1,4,7], [2,5,8], 
        [0,4,8], [2,4,6]
    ];
    return wins.some(pattern => pattern.every(i => currentBoard[i] === player));
}

function isDraw(currentBoard) {
    return currentBoard.every(cell => cell !== "");
}