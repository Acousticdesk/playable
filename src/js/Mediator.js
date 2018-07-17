import PubSub from './PubSub';
import Screen from './Screen';
import Apple from './Apple';
import GameCore from './GameCore';
import GameUI from './GameUI';
import Preview from './Preview';
import Finger from './Finger';
import Basket from './Basket';

export default class PlayableAdMediator extends PubSub {
  constructor() {
    super();
  
    this.screen = new Screen(this);
    this.apple = new Apple(this);
    this.gameCore = new GameCore(this);
    this.gameUI = new GameUI(this);
    this.preview = new Preview(this);
    this.finger = new Finger(this);
    this.basket = new Basket(this);
  
    this.register(
      this.screen,
      this.apple,
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
    return this.basket.getMetrics();
  }
  
  getHandMetrics() {
    return this.gameUI.getHandMetrics();
  }
  
  getAppleMetrics() {
    return this.apple.getMetrics();
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
  
  removeBasketHitClass() {
		this.basket.hitStyleClass('remove');
  }
  
  isDevelopmentEnv() {
    return this.gameCore.isDevelopmentEnv();
  }
  
  throwApple(previewOptions) {
    this.apple.throw(previewOptions);
  }
  
  updateFingerCoordinates() {
    this.finger.updateCoordinates();
  }
}
