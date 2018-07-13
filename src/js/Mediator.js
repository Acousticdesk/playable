// TODO: Refactor event names
// TODO: Preview bug fix
// TODO: isSwiped check doesn't work
import PubSub from './PubSub';
import Screen from './Screen';
import Card from './Card';
import GameCore from './GameCore';
import GameUI from './GameUI';
import Preview from './Preview';
import Finger from './Finger';

// Mediator
// TODO: Is not compatible with Internet explorer
// var mediator = Object.assign({
//   create: function (screen) {
//     this.screen = new Screen(screen);
//     this.game = game;
//    
//     this.subscribe('screen/touchstart', this.game.onScreenTouchstart.bind(this));
//     this.subscribe('screen/touchend', this.game.throwCard.bind(this));
//     this.subscribe('screen/touchmove', this.game.trackHandPosition.bind(this));
//    
//     this.game.start();
//   },
//   getScreenMetrics: function() {
//     return this.screen.el.getBoundingClientRect();
//   }
// }, pubSub);

export default class PlayableAdMediator extends PubSub {
  constructor() {
    super();
  
    this.screen = new Screen(this);
    this.card = new Card(this);
    this.gameCore = new GameCore(this);
    this.gameUI = new GameUI(this);
    this.preview = new Preview(this);
    this.finger = new Finger(this);
    this.basket = new Basket(this);
  
    this.register(
      this.screen,
      this.card,
      this.gameCore,
      this.gameUI,
      this.preview,
      this.finger,
      this.basket
    );
  
    this.preview.start();
  }
  
  register (...queue) {
    queue.forEach((p) => {
      p.mediator = this;
    });
  }
  
  getScreenMetrics() {
    return this.screen.getMetrics();
  }
  
  getFingerCoordinates() {
    return this.finger.getCoordinates();
  }
  
  getBasketMetrics() {
    return this.gameUI.getBasketMetrics();
  }
  
  getHandMetrics() {
    return this.gameUI.getHandMetrics();
  }
  
  getCardMetrics() {
    return this.card.getMetrics();
  }
  
  getIsPreviewStopped() {
    return this.preview.getIsPreviewStopped();
  }
  
  getIsSwiped() {
    return this.finger.getIsSwiped();
  }
  
  isValidSwipe() {
    return this.finger.isValidSwipe();
  }
  
  getFingerPositionOnScreen() {
    return this.screen.getFingerPosition();
  }
  
  isBasketCollision() {
    return this.basket.isCollision();
  }
  
  getReleasedSide() {
    return this.gameCore.getReleasedSide();
  }
}
