import GameCore from './GameCore';

export default class Confetti {
  constructor (size, color, animationBox) {
    this.direction = {
      x: GameCore.getRandomInt(-1, 1) || 1,
      y: GameCore.getRandomInt(-1, 1) || 1
    };
    this.moveSpeed = GameCore.getRandomArbitrary(1, 2);
    this.animationBox = animationBox;
    this.createEl(size, color);
    this.setPosition(animationBox);
    this.updatePosition();
  }
  setPosition () {
    this.position = {
      x: GameCore.getRandomInt(0, this.animationBox.width) - this.el.clientWidth,
      y: GameCore.getRandomInt(0, this.animationBox.height) - this.el.clientHeight
    };
  }
  createEl (size, color) {
    this.el = document.createElement('div');
    this.el.classList.add('confetti');
    this.el.classList.add(color);
    this.el.classList.add(size);
  }
  updatePosition () {
    this.el.style.left = `${this.position.x}px`;
    this.el.style.top = `${this.position.y}px`;
  }
  updateDirection () {
    const elBox = this.el.getBoundingClientRect();
    
    if (this.position.x + elBox.width >= this.animationBox.width) {
      this.direction.x = -1;
    } else if (this.position.x <= 0) {
      this.direction.x = 1;
    }
    
    if (this.position.y + elBox.height >= this.animationBox.height) {
      this.direction.y = -1;
    } else if (this.position.y <= 0) {
      this.direction.y = 1;
    }
  }
  
  animate () {
    this.position.x += this.direction.x * this.moveSpeed;
    this.position.y += this.direction.y * this.moveSpeed;
    this.updatePosition();
    this.updateDirection();
    window.requestAnimationFrame(this.animate.bind(this));
  }
}
