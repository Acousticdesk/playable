import GameCore from './GameCore';
import Confetti from './Confetti';
import DIOInt from 'dio-intint';

export default class GameUI {
  constructor (mediator) {
    this.hand = document.querySelector('.hand');
    this.winScreen = document.querySelector('.win-screen');
    this.cta = document.querySelector('.cta');
    this.animation = document.querySelector('.win-animation');
    this.skipBtn = document.querySelector('.skip-game');
  
    this.adjustHandView = this.adjustHandView.bind(this);
    this.resetAssetsClasses = this.resetAssetsClasses.bind(this);
    this.showWinScreen = this.showWinScreen.bind(this);
    this.updateHandPosition = this.updateHandPosition.bind(this);
    this.hideCta = this.hideCta.bind(this);
    this.resetHandAnglePosition = this.resetHandAnglePosition.bind(this);
    this.applyHandEmptyClass = this.applyHandEmptyClass.bind(this);
    this.showSkipBtn = this.showSkipBtn.bind(this);
    this.onEventsOff = this.onEventsOff.bind(this);
    this.onScreenTouchstart = this.onScreenTouchstart.bind(this);
  
    this.delegateUIEvents();
    this.mediatorEvents(mediator, 'subscribe');
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
    mediator[action]('screen/touchmove', this.adjustHandView);
    mediator[action]('screen/touchstart', this.onScreenTouchstart);
    mediator[action]('ui/reset-assets-classes', this.resetAssetsClasses);
    mediator[action]('core/win', this.showWinScreen);
    mediator[action]('preview/stop', this.hideCta);
    mediator[action]('ui/reset-hand-angle', this.resetHandAnglePosition);
    mediator[action]('ui/hand-empty', this.applyHandEmptyClass);
    mediator[action]('all/events-off', this.onEventsOff);
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
  
  resetAssetsClasses () {
    window.setTimeout(() => {
      this.mediator.removeBasketHitClass();
      this.hand.classList.add('waiting');
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
        this.createWinScreen();
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
    const releasedSide = this.mediator.getFingerPositionOnScreen();
    // TODO: Make it cross-browser
    this.hand.classList.toggle('original-empty', releasedSide === 'left');
    this.hand.classList.toggle('inverted-empty', releasedSide === 'right');
  }
  
  applyHandPositionClass () {
    const releasedSide = this.mediator.getFingerPositionOnScreen();
    // TODO: Make it cross-browser
    this.hand.classList.toggle('original', releasedSide === 'left');
    this.hand.classList.toggle('inverted', releasedSide === 'right');
  }
  
  moveHand () {
    const swipeCoordinates = this.mediator.getFingerCoordinates();
    const cursorX = swipeCoordinates.moveX;
    const cursorY = swipeCoordinates.moveY;
    
    this.hand.style.left = cursorX + 'px';
    this.hand.style.top = cursorY - this.hand.clientHeight / 2 + 'px';
  }
  
  getHandMetrics () {
    return this.hand.getBoundingClientRect();
  }
  
  adjustHandView () {
    const releasedSide = this.mediator.getFingerPositionOnScreen();
    const handAngle = this.mediator.getHandAngle();
    
    this.updateHandPosition(handAngle);
    this.applyHandPositionClass(releasedSide);
  }
  
  updateHandPosition (deg) {
    const releasedSide = this.mediator.getFingerPositionOnScreen();
    
    this.hand.classList.remove('waiting');
    this.hand.style.transform =
      'rotate(' + (releasedSide === 'right' ? deg : -deg) + 'deg)';
  }

	onScreenTouchstart() {
		window.setTimeout(() => this.showSkipBtn(), 2500);
	}

	createWinScreen() {
		// images: [
		// "[[{"type":"banner","width":320,"height":480}]]",
		// "[[{"type":"banner","width":320,"height":480}]]",
		// "[[{"type":"banner","width":320,"height":480}]]"
		// ],
		// title: "[[{"type":"title"}]]",
		// rating: "[[{"type":"rating"}]]"
		const data = this.mediator.isDevelopmentEnv() ? {
			images: [
				'http://wallpaperstock.net/banner-peak_wallpapers_27665_320x480.jpg',
				'http://wallpaperstock.net/banner-peak_wallpapers_27665_320x480.jpg',
				'http://wallpaperstock.net/banner-peak_wallpapers_27665_320x480.jpg'
			],
			title: 'Hello world!',
			rating: 3
		} : {
			images: [],
			title: '',
			rating: ''
		};

		DIOInt(data);
	}
}