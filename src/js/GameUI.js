import GameCore from './GameCore';

class Confetti {
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
      console.log('go back x ');
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

export default class GameUI {
  constructor (mediator) {
    this.hand = document.querySelector('.hand');
    this.basket = document.querySelector('.basket');
    this.winScreen = document.querySelector('.win-screen');
    this.cta = document.querySelector('.cta');
    
    this.createWinAnimation(30);
  
    this.mediatorEvents(mediator);
  }
  
  mediatorEvents (mediator) {
    mediator.subscribe('screen/touchmove', this.trackHandPosition.bind(this));
    mediator.subscribe('ui/reset-assets-classes', this.resetAssetsClasses.bind(this));
    mediator.subscribe('ui/basket-hit', this.onBasketHit.bind(this));
    mediator.subscribe('ui/show-winscreen', this.showWinScreen.bind(this));
    mediator.subscribe('ui/update-hand-position', this.updateHandPosition.bind(this));
    mediator.subscribe('ui/hide-cta', this.hideCta.bind(this));
    mediator.subscribe('ui/reset-hand-angle', this.resetHandAnglePosition.bind(this));
    mediator.subscribe('ui/hand-empty', this.applyHandEmptyClass.bind(this));
  }
  
  createWinAnimation (confettiCount) {
    let animation = document.querySelector('.win-animation'),
      animationBox = animation.getBoundingClientRect(),
      colors = ['red', 'orange', 'lime', 'blue'],
      sizes = ['big', 'med', 'small'],
      confetti;
    
    for (let i = 0; i < confettiCount; i += 1) {
      let size = sizes[GameCore.getRandomInt(0, sizes.length - 1)];
      let color = colors[GameCore.getRandomInt(0, colors.length - 1)];
      confetti = new Confetti(size, color, animationBox);
      
      animation.appendChild(confetti.el);
      confetti.animate();
    }
  }
  
  hideCta () {
    this.cta.style.display = 'none';
  }
  
  onBasketHit () {
    this.basket.classList.add('hit');
  }
  
  resetAssetsClasses () {
    window.setTimeout(() => {
      this.basket.classList.remove('hit');
      this.hand.classList.add('waiting');
      // TODO: May be a problem
      this.resetHandAnglePosition();
    }, 1000);
  }
  
  resetHandAnglePosition () {
    this.hand.classList.add('original');
    this.hand.classList.remove('inverted');
    this.hand.classList.remove('original-empty');
    this.hand.classList.remove('inverted-empty');
    this.hand.style.left = '';
    this.hand.style.top = '';
  }
  
  showWinScreen () {
    const onTransitionend = (e) => {
      if (e.target === this.winScreen) {
        this.mediator.publish('core/create-winscreen');
        this.winScreen.removeEventListener('transitionend', onTransitionend);
      }
    };
    
    this.winScreen.addEventListener('transitionend', onTransitionend);
    this.winScreen.classList.add('show');
  }
  
  applyHandEmptyClass () {
    const releasedSide = this.mediator.getReleasedSide();
    // TODO: Make it cross-browser
    this.hand.classList.toggle('original-empty', releasedSide === 'left');
    this.hand.classList.toggle('inverted-empty', releasedSide === 'right');
  }
  
  applyHandPositionClass () {
    const releasedSide = this.mediator.getReleasedSide();
    // TODO: Make it cross-browser
    this.hand.classList.toggle('original', releasedSide === 'left');
    this.hand.classList.toggle('inverted', releasedSide === 'right');
  }
  
  moveHand () {
    const swipeCoordinates = this.mediator.getSwipeCoordinates();
    const cursorX = swipeCoordinates.moveX;
    const cursorY = swipeCoordinates.moveY;
    
    this.hand.style.left = cursorX + 'px';
    this.hand.style.top = cursorY - this.hand.clientHeight / 2 + 'px';
  }
  
  getBasketMetrics () {
    return this.basket.getBoundingClientRect();
  }
  
  getHandMetrics () {
    return this.hand.getBoundingClientRect();
  }
  
  trackHandPosition () {
    const releasedSide = this.mediator.getReleasedSide();
    
    // if ( !this.mediator.isValidHandPosition() ) {
    //   return;
    // }
    
    this.mediator.publish('core/calculate-hand-angle');
    // this.moveHand();
    this.applyHandPositionClass(releasedSide);
  }
  
  updateHandPosition (options) {
    const releasedSide = this.mediator.getReleasedSide();
    
    this.hand.classList.remove('waiting');
    this.hand.style.transform =
      'rotate(' + (releasedSide === 'right' ? options.deg : -options.deg) + 'deg)';
  }
}