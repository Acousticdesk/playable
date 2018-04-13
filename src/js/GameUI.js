export default function GameUI (mediator) {
  this.hand = document.querySelector('.hand');
  this.basket = document.querySelector('.basket');
  this.winScreen = document.querySelector('.win-screen');
  this.cta = document.querySelector('.cta');
  
  this.mediatorEvents(mediator);
}

GameUI.prototype = {
  mediatorEvents: function (mediator) {
    mediator.subscribe('screen/touchmove', this.trackHandPosition.bind(this));
    mediator.subscribe('ui/reset-assets-classes', this.resetAssetsClasses.bind(this));
    mediator.subscribe('ui/basket-hit', this.onBasketHit.bind(this));
    mediator.subscribe('ui/show-winscreen', this.showWinScreen.bind(this));
    mediator.subscribe('ui/update-hand-position', this.updateHandPosition.bind(this));
    mediator.subscribe('ui/hide-cta', this.hideCta.bind(this));
    mediator.subscribe('ui/reset-hand-angle', this.resetHandAnglePosition.bind(this));
    mediator.subscribe('ui/hand-empty', this.applyHandEmptyClass.bind(this));
  },
  hideCta: function () {
    this.cta.style.display = 'none';
  },
  onBasketHit: function () {
    this.basket.classList.add('hit');
  },
  resetAssetsClasses: function () {
    window.setTimeout(function () {
      this.basket.classList.remove('hit');
      this.hand.classList.add('waiting');
      // TODO: May be a problem
      this.resetHandAnglePosition();
    }.bind(this), 1000);
  },
  resetHandAnglePosition: function () {
    this.hand.classList.add('original');
    this.hand.classList.remove('inverted');
    this.hand.classList.remove('original-empty');
    this.hand.classList.remove('inverted-empty');
    this.hand.style.left = '';
    this.hand.style.top = '';
  },
  showWinScreen: function () {
    var onTransitionend = function (e) {
      if (e.target === this.winScreen) {
        this.mediator.publish('core/create-winscreen');
        this.winScreen.removeEventListener('transitionend', onTransitionend);
      }
    }.bind(this);
    
    this.winScreen.addEventListener('transitionend', onTransitionend);
    this.winScreen.classList.add('show');
  },
  applyHandEmptyClass: function () {
    var releasedSide = this.mediator.getReleasedSide();
    // TODO: Make it cross-browser
    this.hand.classList.toggle('original-empty', releasedSide === 'left');
    this.hand.classList.toggle('inverted-empty', releasedSide === 'right');
  },
  applyHandPositionClass: function () {
    var releasedSide = this.mediator.getReleasedSide();
    // TODO: Make it cross-browser
    this.hand.classList.toggle('original', releasedSide === 'left');
    this.hand.classList.toggle('inverted', releasedSide === 'right');
  },
  moveHand: function () {
    var swipeCoordinates = this.mediator.getSwipeCoordinates();
    var cursorX = swipeCoordinates.moveX;
    var cursorY = swipeCoordinates.moveY;
    
    this.hand.style.left = cursorX + 'px';
    this.hand.style.top = cursorY - this.hand.clientHeight / 2 + 'px';
  },
  getBasketMetrics: function () {
    return this.basket.getBoundingClientRect();
  },
  getHandMetrics: function () {
    return this.hand.getBoundingClientRect();
  },
  trackHandPosition: function () {
    var releasedSide = this.mediator.getReleasedSide();
    
    if ( !this.mediator.isValidHandPosition() ) {
      return;
    }
    
    this.mediator.publish('core/calculate-hand-angle');
    this.moveHand();
    this.applyHandPositionClass(releasedSide);
  },
  updateHandPosition: function (options) {
    var releasedSide = this.mediator.getReleasedSide();
    
    this.hand.classList.remove('waiting');
    this.hand.style.transform =
      'rotate(' + (releasedSide === 'right' ? options.deg : -options.deg) + 'deg)';
  }
};