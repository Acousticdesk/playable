import GameCore from './GameCore';
import Confetti from './Confetti';
import CallbackStorage from './CallbackStorage';

export default class GameUI extends CallbackStorage {
  constructor (mediator) {
    super();
    
    this.hand = document.querySelector('.hand');
    this.basket = document.querySelector('.basket');
    this.winScreen = document.querySelector('.win-screen');
    this.cta = document.querySelector('.cta');
    this.animation = document.querySelector('.win-animation');
    this.skipBtn = document.querySelector('.skip-game');
  
    this.saveCallbacks();
    this.delegateUIEvents();
    this.mediatorEvents(mediator, 'subscribe');
  }
  
  saveCallbacks () {
    this.addCallbacks([
      this.trackHandPosition.bind(this),
      this.resetAssetsClasses.bind(this),
      this.onBasketHit.bind(this),
      this.showWinScreen.bind(this),
      this.updateHandPosition.bind(this),
      this.hideCta.bind(this),
      this.resetHandAnglePosition.bind(this),
      this.applyHandEmptyClass.bind(this),
      this.showSkipBtn.bind(this),
      this.onEventsOff.bind(this)
    ]);
  }
  
  eraseUI () {
    const eraseElsArr = [...document.querySelectorAll('[data-erasable]')];
    
    eraseElsArr.forEach((el) => el.parentElement.removeChild(el))
  }
  
  delegateUIEvents () {
    const handler = (e) => {
      e.preventDefault();
      this.showWinScreen({
        skipBravoAnimation: true,
        immediate: true
      });
      e.currentTarget.removeEventListener('click', handler)
    };
    
    this.skipBtn.addEventListener('click', handler);
  }
  
  mediatorEvents (mediator, action) {
    // TODO: Rename events
    mediator[action]('screen/touchmove', this.getCallback('trackHandPosition'));
    mediator[action]('ui/reset-assets-classes', this.getCallback('resetAssetsClasses'));
    mediator[action]('ui/basket-hit', this.getCallback('onBasketHit'));
    mediator[action]('ui/show-winscreen', this.getCallback('showWinScreen'));
    mediator[action]('ui/update-hand-position', this.getCallback('updateHandPosition'));
    mediator[action]('ui/hide-cta', this.getCallback('hideCta'));
    mediator[action]('ui/reset-hand-angle', this.getCallback('resetHandAnglePosition'));
    mediator[action]('ui/hand-empty', this.getCallback('applyHandEmptyClass'));
    mediator[action]('ui/show-skip', this.getCallback('showSkipBtn'));
    mediator[action]('all/events-off', this.getCallback('onEventsOff'));
  }
  
  onEventsOff () {
    this.mediatorEvents(this.mediator, 'unsub');
  }
  
  showSkipBtn () {
    this.skipBtn.classList.add('visible');
    this.skipBtn.classList.remove('hidden');
  }
  
  createWinAnimation (confettiCount) {
    let colors = ['red', 'orange', 'lime', 'blue'],
      sizes = ['big', 'med', 'small'],
      confetti;
  
    this.animation.classList.remove('hidden');
    this.animation.classList.add('appearance');
  
    const animationBox = this.animation.getBoundingClientRect();
    
    for (let i = 0; i < confettiCount; i += 1) {
      let size = sizes[GameCore.getRandomInt(0, sizes.length - 1)];
      let color = colors[GameCore.getRandomInt(0, colors.length - 1)];
      confetti = new Confetti(size, color, animationBox);
      
      this.animation.appendChild(confetti.el);
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
  
  showWinScreen (options) {
    options = options || {};
    
    const onTransitionend = (e) => {
      if (e.target === this.winScreen) {
        this.mediator.publish('core/create-winscreen');
        this.mediator.publish('all/events-off');
        this.winScreen.removeEventListener('transitionend', onTransitionend);
      }
    };
    
    const showScreen = () => {
      this.winScreen.addEventListener('transitionend', onTransitionend);
      this.winScreen.classList.add('show');
  
      if (options.skipBravoAnimation) {
        this.eraseUI();
        return;
      }
  
      window.setTimeout(() => {
        this.animation.classList.remove('appearance');
        window.setTimeout(() => {
          this.animation.classList.add('hidden');
          this.eraseUI();
        }, 300);
      }, 750);
    };
    
    if (!options.skipBravoAnimation) {
      this.createWinAnimation(30);
    }
    
    if (options.immediate) {
      showScreen();
    } else {
      window.setTimeout(showScreen, 2000);
    }
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