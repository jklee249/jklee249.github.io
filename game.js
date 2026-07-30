(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SnakeGame = factory().SnakeGame;
})(typeof window === 'undefined' ? globalThis : window, function () {
  const WIDTH = 36;
  const HEIGHT = 24;
  const INITIAL_LENGTH = 5;
  const MAX_LENGTH = 80;
  const ITEM_COUNT = 10;
  const DIRECTIONS = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
  };
  const ITEMS = [
    { id: 'item1', name: 'Item 1', chance: 0.6, score: 1, threshold: 10, effect: 'length', color: '#67b7ff' },
    { id: 'item2', name: 'Item 2', chance: 0.3, score: 3, threshold: 5, effect: 'length', color: '#b98cff' },
    { id: 'item3', name: 'Item 3', chance: 0.1, score: 6, threshold: 5, effect: 'thickness', color: '#ffca67' }
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
      this.thickness = 1;
      this.itemCounts = { item1: 0, item2: 0, item3: 0 };
      this.score = 0;
      this.status = 'idle';
      this.foods = [];
      for (let index = 0; index < ITEM_COUNT; index += 1) this.spawnFood();
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
      const eatingIndex = this.foods.findIndex((food) => food.x === nextHead.x && food.y === nextHead.y);
      const eating = eatingIndex >= 0;
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
        const item = this.foods.splice(eatingIndex, 1)[0];
        this.score += item.score;
        this.itemCounts[item.id] += 1;
        if (this.itemCounts[item.id] % item.threshold === 0) {
          if (item.effect === 'thickness') this.thickness += 1;
          else this.targetLength = Math.min(MAX_LENGTH, this.targetLength + 1);
        }
        this.highScore = Math.max(this.highScore, this.score);
        this.spawnFood();
      }
      while (this.snake.length > this.targetLength) this.snake.pop();
      return true;
    }

    spawnFood() {
      const occupied = new Set(this.snake.map((part) => `${part.x}:${part.y}`));
      this.foods.forEach((food) => occupied.add(`${food.x}:${food.y}`));
      const free = [];
      for (let y = 0; y < this.height; y += 1) {
        for (let x = 0; x < this.width; x += 1) {
          if (!occupied.has(`${x}:${y}`)) free.push({ x, y });
        }
      }
      if (!free.length) return;
      const roll = this.random();
      const type = roll < ITEMS[0].chance ? ITEMS[0] : roll < ITEMS[0].chance + ITEMS[1].chance ? ITEMS[1] : ITEMS[2];
      this.foods.push({ ...free[Math.floor(this.random() * free.length)], ...type });
    }

    snapshot() {
      return {
        snake: this.snake.map((part) => ({ ...part })),
        foods: this.foods.map((food) => ({ ...food })),
        score: this.score,
        highScore: this.highScore,
        status: this.status,
        targetLength: this.targetLength,
        thickness: this.thickness,
        itemCounts: { ...this.itemCounts }
      };
    }
  }

  return { SnakeGame, ITEMS, WIDTH, HEIGHT, INITIAL_LENGTH, MAX_LENGTH, ITEM_COUNT };
});
