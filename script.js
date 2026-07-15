const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
const canvas = document.querySelector('#snake-canvas');
const scoreEl = document.querySelector('#score');
const bestScoreEl = document.querySelector('#best-score');
const statusEl = document.querySelector('#game-status');
const overlayEl = document.querySelector('#game-overlay');
const actionButtons = document.querySelectorAll('[data-action]');
const directionButtons = document.querySelectorAll('[data-direction]');

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    siteNav.classList.toggle('is-open');
  });
}

if (!canvas || !scoreEl || !bestScoreEl || !statusEl || !overlayEl) {
  throw new Error('Snake game elements are missing.');
}

const ctx = canvas.getContext('2d');
const GRID_SIZE = 20;
const STORAGE_KEY = 'tenyearslove-snake-best-score';
const START_STEP = 140;
const MIN_STEP = 75;

let frameId = 0;
let lastFrame = 0;
let accumulator = 0;
let stepMs = START_STEP;
let score = 0;
let bestScore = Number(window.localStorage.getItem(STORAGE_KEY) || 0);
let state = 'idle';
let currentDirection = { x: 1, y: 0 };
let queuedDirection = { x: 1, y: 0 };
let snake = [];
let food = { x: 10, y: 10 };
let cellSize = canvas.width / GRID_SIZE;
let swipeStart = null;

function updateScoreboard() {
  scoreEl.textContent = String(score);
  bestScoreEl.textContent = String(bestScore);
}

function setStatus(text, showOverlay = false) {
  statusEl.textContent = text;
  overlayEl.textContent = text;
  overlayEl.classList.toggle('is-visible', showOverlay);
}

function syncBestScore(nextScore) {
  if (nextScore > bestScore) {
    bestScore = nextScore;
    window.localStorage.setItem(STORAGE_KEY, String(bestScore));
  }
}

function resizeCanvas() {
  const size = Math.max(280, Math.floor(canvas.clientWidth));
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(size * dpr);
  canvas.height = Math.floor(size * dpr);
  canvas.style.height = `${size}px`;
  cellSize = canvas.width / GRID_SIZE;
  draw();
}

function resetGame() {
  score = 0;
  stepMs = START_STEP;
  currentDirection = { x: 1, y: 0 };
  queuedDirection = { x: 1, y: 0 };
  snake = [
    { x: 9, y: 10 },
    { x: 8, y: 10 },
    { x: 7, y: 10 }
  ];
  food = spawnFood();
  state = 'idle';
  accumulator = 0;
  updateScoreboard();
  setStatus('Ready', true);
}

function spawnFood() {
  let next = { x: 0, y: 0 };
  do {
    next = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
  } while (snake.some((segment) => segment.x === next.x && segment.y === next.y));
  return next;
}

function startGame() {
  if (state === 'gameover') {
    resetGame();
  }
  state = 'running';
  setStatus('Running', false);
}

function togglePause() {
  if (state === 'running') {
    state = 'paused';
    setStatus('Paused', true);
    return;
  }
  if (state === 'paused') {
    state = 'running';
    setStatus('Running', false);
  }
}

function restartGame() {
  resetGame();
  startGame();
}

function gameOver() {
  state = 'gameover';
  setStatus('Game Over', true);
  syncBestScore(score);
  updateScoreboard();
}

function canTurn(nextDirection) {
  return !(
    nextDirection.x === -currentDirection.x &&
    nextDirection.y === -currentDirection.y
  ) && !(
    nextDirection.x === -queuedDirection.x &&
    nextDirection.y === -queuedDirection.y
  );
}

function setDirection(dx, dy) {
  const nextDirection = { x: dx, y: dy };
  if (!canTurn(nextDirection)) {
    return;
  }

  queuedDirection = nextDirection;

  if (state === 'idle') {
    startGame();
  }
}

function eatFood() {
  score += 1;
  syncBestScore(score);
  updateScoreboard();
  stepMs = Math.max(MIN_STEP, START_STEP - Math.floor(score / 4) * 4);
  food = spawnFood();
}

function step() {
  currentDirection = queuedDirection;
  const head = snake[0];
  const nextHead = {
    x: head.x + currentDirection.x,
    y: head.y + currentDirection.y
  };
  const willGrow = nextHead.x === food.x && nextHead.y === food.y;
  const bodyToCheck = willGrow ? snake : snake.slice(0, -1);

  const outOfBounds =
    nextHead.x < 0 ||
    nextHead.x >= GRID_SIZE ||
    nextHead.y < 0 ||
    nextHead.y >= GRID_SIZE;

  const bitesSelf = bodyToCheck.some((segment) => segment.x === nextHead.x && segment.y === nextHead.y);

  if (outOfBounds || bitesSelf) {
    gameOver();
    return;
  }

  snake.unshift(nextHead);

  if (willGrow) {
    eatFood();
  } else {
    snake.pop();
  }
}

function roundRect(x, y, w, h, radius) {
  const r = Math.min(radius, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawGrid() {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = Math.max(1, cellSize * 0.04);

  for (let i = 0; i <= GRID_SIZE; i += 1) {
    const offset = i * cellSize;
    ctx.beginPath();
    ctx.moveTo(offset, 0);
    ctx.lineTo(offset, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, offset);
    ctx.lineTo(canvas.width, offset);
    ctx.stroke();
  }

  ctx.restore();
}

function drawBoard() {
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#1e1710');
  gradient.addColorStop(1, '#0f0c09');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawGrid();
}

function drawFood() {
  const cx = (food.x + 0.5) * cellSize;
  const cy = (food.y + 0.5) * cellSize;
  const radius = cellSize * 0.34;
  const gradient = ctx.createRadialGradient(cx - radius * 0.25, cy - radius * 0.25, radius * 0.15, cx, cy, radius);
  gradient.addColorStop(0, '#fff2b6');
  gradient.addColorStop(1, '#c9891b');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawSnake() {
  snake.forEach((segment, index) => {
    const x = segment.x * cellSize + cellSize * 0.08;
    const y = segment.y * cellSize + cellSize * 0.08;
    const size = cellSize * 0.84;
    const radius = index === 0 ? cellSize * 0.24 : cellSize * 0.18;

    ctx.fillStyle = index === 0 ? '#f5d08a' : '#8fbf7a';
    roundRect(x, y, size, size, radius);
    ctx.fill();

    if (index === 0) {
      ctx.fillStyle = '#2c241b';
      const eyeOffset = cellSize * 0.18;
      const eyeRadius = Math.max(1.5, cellSize * 0.05);
      ctx.beginPath();
      ctx.arc(x + eyeOffset, y + eyeOffset, eyeRadius, 0, Math.PI * 2);
      ctx.arc(x + size - eyeOffset, y + eyeOffset, eyeRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function drawOverlayHint() {
  if (state === 'running') {
    overlayEl.classList.remove('is-visible');
    return;
  }

  overlayEl.classList.add('is-visible');
}

function draw() {
  if (!ctx || !canvas.width || !canvas.height) {
    return;
  }

  drawBoard();
  drawFood();
  drawSnake();
  drawOverlayHint();
}

function frame(timestamp) {
  if (!lastFrame) {
    lastFrame = timestamp;
  }

  const delta = timestamp - lastFrame;
  lastFrame = timestamp;

  if (state === 'running') {
    accumulator += delta;

    while (accumulator >= stepMs) {
      step();
      accumulator -= stepMs;
      if (state !== 'running') {
        break;
      }
    }
  }

  draw();
  frameId = window.requestAnimationFrame(frame);
}

function ensureLoop() {
  if (!frameId) {
    frameId = window.requestAnimationFrame(frame);
  }
}

function handleKeydown(event) {
  const key = event.key.toLowerCase();
  const map = {
    arrowup: [0, -1],
    w: [0, -1],
    arrowdown: [0, 1],
    s: [0, 1],
    arrowleft: [-1, 0],
    a: [-1, 0],
    arrowright: [1, 0],
    d: [1, 0]
  };

  if (key in map) {
    event.preventDefault();
    setDirection(...map[key]);
    return;
  }

  if (event.code === 'Space') {
    event.preventDefault();
    if (state === 'idle') {
      startGame();
      return;
    }
    togglePause();
    return;
  }

  if (key === 'enter') {
    event.preventDefault();
    if (state === 'gameover') {
      restartGame();
    } else {
      startGame();
    }
    return;
  }

  if (key === 'r') {
    event.preventDefault();
    restartGame();
  }
}

function handlePointerDown(event) {
  swipeStart = { x: event.clientX, y: event.clientY };
}

function handlePointerUp(event) {
  if (!swipeStart) {
    return;
  }

  const dx = event.clientX - swipeStart.x;
  const dy = event.clientY - swipeStart.y;
  const distance = Math.hypot(dx, dy);
  swipeStart = null;

  if (distance < 18) {
    return;
  }

  if (Math.abs(dx) > Math.abs(dy)) {
    setDirection(dx > 0 ? 1 : -1, 0);
  } else {
    setDirection(0, dy > 0 ? 1 : -1);
  }
}

actionButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;
    if (action === 'start') {
      startGame();
    } else if (action === 'pause') {
      togglePause();
    } else if (action === 'restart') {
      restartGame();
    }
  });
});

directionButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const direction = button.dataset.direction;
    if (direction === 'up') setDirection(0, -1);
    if (direction === 'down') setDirection(0, 1);
    if (direction === 'left') setDirection(-1, 0);
    if (direction === 'right') setDirection(1, 0);
  });
});

canvas.addEventListener('pointerdown', handlePointerDown);
canvas.addEventListener('pointerup', handlePointerUp);
canvas.addEventListener('pointerleave', () => {
  swipeStart = null;
});

window.addEventListener('keydown', handleKeydown, { passive: false });
window.addEventListener('resize', resizeCanvas);

resetGame();
resizeCanvas();
ensureLoop();
