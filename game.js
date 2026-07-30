(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SnakeGame = factory().SnakeGame;
})(typeof window === 'undefined' ? globalThis : window, function () {
  const WIDTH = 24;
  const HEIGHT = 16;
  const INITIAL_LENGTH = 5;
  const MAX_LENGTH = 80;
  const DIRECTIONS = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
  };
  const ITEMS = [
    { name: 'normal', chance: 0.6, growth: 1, color: '#67b7ff' },
    { name: 'rare', chance: 0.3, growth: 3, color: '#b98cff' },
    { name: 'bonus', chance: 0.1, growth: 6, color: '#ffca67' }
  ];

  class SnakeGame {
    constructor({ random = Math.random, width = WIDTH, height = HEIGHT } = {}) {
      this.random = random;
      this.width = width;
      this.height = height;
      this.highScore = 0;
      this.reset();
    }

    reset() {
      const x = Math.floor(this.width / 2);
      const y = Math.floor(this.height / 2);
      this.snake = Array.from({ length: INITIAL_LENGTH }, (_, index) => ({ x: x - index, y }));
      this.direction = { ...DIRECTIONS.right };
      this.nextDirection = { ...DIRECTIONS.right };
      this.targetLength = INITIAL_LENGTH;
      this.score = 0;
      this.status = 'idle';
      this.food = null;
      this.spawnFood();
    }

    start() {
      if (this.status === 'gameover') this.reset();
      this.status = 'running';
    }

    pause() {
      if (this.status === 'running') this.status = 'paused';
    }

    restart() {
      this.reset();
      this.start();
    }

    setDirection(name) {
      const next = DIRECTIONS[name];
      if (!next || (next.x + this.direction.x === 0 && next.y + this.direction.y === 0)) return false;
      this.nextDirection = { ...next };
      return true;
    }

    tick() {
      if (this.status !== 'running') return false;
      this.direction = { ...this.nextDirection };
      const head = this.snake[0];
      const nextHead = { x: head.x + this.direction.x, y: head.y + this.direction.y };
      const eating = this.food && nextHead.x === this.food.x && nextHead.y === this.food.y;
      const bodyToCheck = eating ? this.snake : this.snake.slice(0, -1);
      const hitWall = nextHead.x < 0 || nextHead.x >= this.width || nextHead.y < 0 || nextHead.y >= this.height;
      const hitSelf = bodyToCheck.some((part) => part.x === nextHead.x && part.y === nextHead.y);
      if (hitWall || hitSelf) {
        this.status = 'gameover';
        this.highScore = Math.max(this.highScore, this.score);
        return false;
      }

      this.snake.unshift(nextHead);
      if (eating) {
        this.score += this.food.growth;
        this.targetLength = Math.min(MAX_LENGTH, this.targetLength + this.food.growth);
        this.highScore = Math.max(this.highScore, this.score);
        this.spawnFood();
      }
      while (this.snake.length > this.targetLength) this.snake.pop();
      return true;
    }

    spawnFood() {
      const free = [];
      for (let y = 0; y < this.height; y += 1) {
        for (let x = 0; x < this.width; x += 1) {
          if (!this.snake.some((part) => part.x === x && part.y === y)) free.push({ x, y });
        }
      }
      if (!free.length) {
        this.food = null;
        return;
      }
      const roll = this.random();
      const type = roll < ITEMS[0].chance ? ITEMS[0] : roll < ITEMS[0].chance + ITEMS[1].chance ? ITEMS[1] : ITEMS[2];
      this.food = { ...free[Math.floor(this.random() * free.length)], ...type };
    }

    snapshot() {
      return { snake: this.snake.map((part) => ({ ...part })), food: this.food && { ...this.food }, score: this.score, highScore: this.highScore, status: this.status, targetLength: this.targetLength };
    }
  }

  return { SnakeGame, ITEMS, INITIAL_LENGTH, MAX_LENGTH };
});
