(() => {
  const canvas = document.querySelector('#game-board');
  const ctx = canvas.getContext('2d');
  const game = new window.SnakeGame();
  const cell = Math.min(canvas.width / game.width, canvas.height / game.height);
  let timer = null;
  const statusLabels = { idle: '준비됨', running: '진행 중', paused: '일시정지', gameover: '게임 오버' };
  const snakeColors = ['#67b7ff', '#78c4ff', '#8bd0ff', '#9bd8ff'];

  function stopTimer() {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  }

  function roundedCell(x, y, size, radius) {
    const right = x + size;
    const bottom = y + size;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(right, y, right, bottom, radius);
    ctx.arcTo(right, bottom, x, bottom, radius);
    ctx.arcTo(x, bottom, x, y, radius);
    ctx.arcTo(x, y, right, y, radius);
    ctx.closePath();
  }

  function draw() {
    ctx.fillStyle = '#050607';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#15191e';
    for (let x = 0; x <= canvas.width; x += cell) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
    for (let y = 0; y <= canvas.height; y += cell) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }

    game.foods.forEach((food) => {
      ctx.fillStyle = food.color;
      ctx.beginPath();
      ctx.arc(food.x * cell + cell / 2, food.y * cell + cell / 2, cell * .34, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgb(255 255 255 / 65%)';
      ctx.beginPath();
      ctx.arc(food.x * cell + cell * .4, food.y * cell + cell * .38, cell * .08, 0, Math.PI * 2);
      ctx.fill();
    });

    const thickness = Math.min(cell * .86, cell * (.62 + game.thickness * .06));
    const inset = (cell - thickness) / 2;
    game.snake.forEach((part, index) => {
      const x = part.x * cell + inset;
      const y = part.y * cell + inset;
      ctx.fillStyle = index === 0 ? '#f4f5f7' : snakeColors[index % snakeColors.length];
      roundedCell(x, y, thickness, thickness * .32);
      ctx.fill();
      if (index === 0) {
        const eyeOffset = cell * .25;
        ctx.fillStyle = '#050607';
        ctx.beginPath();
        ctx.arc(x + thickness * .34, y + eyeOffset, cell * .055, 0, Math.PI * 2);
        ctx.arc(x + thickness * .66, y + eyeOffset, cell * .055, 0, Math.PI * 2);
        ctx.fill();
      }
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
    document.querySelector('#game-length').textContent = game.targetLength;
    document.querySelector('#game-thickness').textContent = game.thickness;
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
