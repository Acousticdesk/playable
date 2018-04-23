// TODO: Refactor event names
// TODO: Preview bug fix
// TODO: isSwiped check doesn't work
import PubSub from './PubSub';
import Screen from './Screen';
import Card from './Card';
import GameCore from './GameCore';
import GameUI from './GameUI';

// Mediator
// TODO: Is not compatible with SHIT Internet explorer
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
//   getScreenMetrics: function () {
//     return this.screen.el.getBoundingClientRect();
//   }
// }, pubSub);

export default class PlayableAdMediator extends PubSub {
  constructor () {
    super();
  
    this.screen = new Screen(this);
    this.card = new Card(this);
    this.gameCore = new GameCore(this);
    this.gameUI = new GameUI(this);
  
    this.register(
      this.screen,
      this.card,
      this.gameCore,
      this.gameUI
    );
  
    this.gameCore.startPreview();
  }
  
  register (...queue) {
    queue.forEach((p) => {
      p.mediator = this;
    });
  }
  
  getScreenMetrics () {
    return this.screen.el.getBoundingClientRect();
  }
  
  isCardOnScreen () {
    return this.card.isOnScreen();
  }
  
  getSwipeCoordinates () {
    return this.gameCore.getSwipeCoordinates();
  }
  
  getBasketMetrics () {
    return this.gameUI.getBasketMetrics();
  }
  
  getHandMetrics () {
    return this.gameUI.getHandMetrics();
  }
  
  getCardSpeed () {
    return this.card.getSpeed();
  }
  
  getCardMetrics () {
    return this.card.getMetrics();
  }
  
  // isValidHandPosition () {
  //   return this.gameCore.isValidHandPosition();
  // }
  
  getReleasedSide () {
    return this.gameCore.getReleasedSide();
  }
}
