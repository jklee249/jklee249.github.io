(() => {
  const canvas = document.querySelector('#game-board');
  const ctx = canvas.getContext('2d');
  const game = new window.SnakeGame();
  const cell = canvas.width / game.width;
  let timer = null;
  const statusLabels = { idle: '준비됨', running: '진행 중', paused: '일시정지', gameover: '게임 오버' };

  function stopTimer() {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  }

  function draw() {
    ctx.fillStyle = '#050607';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#15191e';
    for (let x = 0; x <= canvas.width; x += cell) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
    for (let y = 0; y <= canvas.height; y += cell) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
    if (game.food) {
      ctx.fillStyle = game.food.color;
      ctx.beginPath();
      ctx.arc(game.food.x * cell + cell / 2, game.food.y * cell + cell / 2, cell * .35, 0, Math.PI * 2);
      ctx.fill();
    }
    game.snake.forEach((part, index) => {
      ctx.fillStyle = index === 0 ? '#f4f5f7' : '#67b7ff';
      ctx.fillRect(part.x * cell + 1, part.y * cell + 1, cell - 2, cell - 2);
    });
    if (game.status === 'gameover') {
      ctx.fillStyle = 'rgb(0 0 0 / 65%)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#f4f5f7';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
    }
  }

  function sync() {
    document.querySelector('#game-score').textContent = game.score;
    document.querySelector('#game-high-score').textContent = game.highScore;
    document.querySelector('#game-status').textContent = statusLabels[game.status];
    draw();
  }

  function startTimer() {
    if (timer !== null) return;
    timer = setInterval(() => {
      game.tick();
      sync();
      if (game.status === 'gameover') stopTimer();
    }, 140);
  }

  document.querySelector('#game-start').addEventListener('click', () => { game.start(); startTimer(); sync(); });
  document.querySelector('#game-pause').addEventListener('click', () => { game.pause(); if (game.status === 'paused') stopTimer(); sync(); });
  document.querySelector('#game-restart').addEventListener('click', () => { stopTimer(); game.restart(); startTimer(); sync(); });
  document.querySelectorAll('[data-direction]').forEach((button) => button.addEventListener('click', () => { game.setDirection(button.dataset.direction); }));
  document.addEventListener('keydown', (event) => {
    const keys = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' };
    const direction = keys[event.key];
    if (direction) { event.preventDefault(); game.setDirection(direction); }
    if (event.key === ' ') { event.preventDefault(); if (game.status === 'running') game.pause(); else game.start(); if (game.status === 'running') startTimer(); else stopTimer(); sync(); }
  });
  sync();
})();
