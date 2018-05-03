import DIOInt from 'dio-intint';
import CallbackStorage from './CallbackStorage';

export default class GameCore extends CallbackStorage {
  constructor(mediator) {
    super();
    
    this.swipeCoordinates = {
      startX: null,
      startY: null,
      releasedX: null,
      releasedY: null,
      moveX: null,
      moveY: null
    };
    
    this.isPreview = true;
    this.isSwipedProp = false;
    
    // Webpack Define Plugin variable
    if (DEVELOPMENT) {
      window.pressXtoWin = this.win.bind(this);
    }
    
    // TODO: repetitive
    this.addCallbacks([
      this.setCoordinates.bind(this),
      this.onScreenTouchend.bind(this),
      this.onScreenTouchstart.bind(this),
      this.createWinScreen.bind(this),
      this.calculateAngle.bind(this),
      this.onScreenTouchmove.bind(this),
      this.onEventsOff.bind(this)
    ]);
  
    // TODO: repetitive
    this.mediatorEvents(mediator, 'subscribe');
  }
  
  static getRandomArbitrary (min, max) {
    return Math.random() * (max - min) + min;
  }
  
  static getRandomInt (min, max) {
    return Math.round(GameCore.getRandomArbitrary(min, max));
  }
  
  // TODO: repetitive
  mediatorEvents (mediator, action) {
    mediator[action]('screen/touchend', this.getCallback('onScreenTouchend'));
    mediator[action]('screen/touchstart', this.getCallback('onScreenTouchstart'));
    mediator[action]('core/create-winscreen', this.getCallback('createWinScreen'));
    mediator[action]('core/calculate-hand-angle', this.getCallback('calculateAngle'));
    mediator[action]('screen/touchmove', this.getCallback('onScreenTouchmove'));
    mediator[action]('all/events-off', this.getCallback('onEventsOff'));
  }
  
  // TODO: repetitive
  onEventsOff () {
    this.mediatorEvents(this.mediator, 'unsub')
  }
  
  onScreenTouchmove (coordinates) {
    this.getCallback('setCoordinates')(coordinates);
    this.updateIsSwiped();
    this.setReleasedSide(coordinates.moveX);
  }
  
  onScreenTouchstart (coordinates) {
    this.getCallback('setCoordinates')(coordinates);
    this.makePreviewStop();
    window.setTimeout(() => this.mediator.publish('ui/show-skip'), 2500);
  }
  
  onScreenTouchend (coordinates) {
    this.getCallback('setCoordinates')(coordinates);
    this.throwCard();
  }
  
  setReleasedSide (moveX) {
    this.releasedSide = this.getCursorPosition(moveX);
  }
  
  setCoordinates (coordinates) {
    for (let key in coordinates) {
      if (coordinates.hasOwnProperty(key)) {
        this.swipeCoordinates[key] = coordinates[key];
      }
    }
  }
  
  getReleasedSide () {
    return this.releasedSide;
  }
  
  createWinScreen () {
    // images: [
    // "[[{"type":"banner","width":320,"height":480}]]",
    // "[[{"type":"banner","width":320,"height":480}]]",
    // "[[{"type":"banner","width":320,"height":480}]]"
    // ],
    // title: "[[{"type":"title"}]]",
    // rating: [[{"type":"rating"}]]
    const data = DEVELOPMENT ? {
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
  
  getSwipeCoordinates () {
    return this.swipeCoordinates;
  }
  
  updateIsSwiped () {
    this.isSwipedProp =
      this.swipeCoordinates.startX !== this.swipeCoordinates.moveX ||
      this.swipeCoordinates.startY !== this.swipeCoordinates.moveY;
  }
  
  isSwiped () {
    return this.isSwipedProp;
  }
  
  getCursorPosition (releasedX) {
    // TODO: Prevent all 'getScreenMetrics' calls
    return releasedX < this.mediator.getScreenMetrics().width / 2 ? 'left' : 'right';
  }
  
  throwCard () {
    if (
      !this.mediator.isCardOnScreen() &&
      this.isSwiped() &&
      this.canThrow()
    // && this.isValidHandPosition()
    ) {
      this.mediator.publish('card/create', {
        isPlaceholder: false,
        x: this.swipeCoordinates.startX,
        y: this.swipeCoordinates.startY,
        offset: this.mediator.getHandMetrics().width / 2
      });
      this.requestAnimation(
        this.swipeCoordinates.releasedX - this.mediator.getBasketMetrics().width / 2,
        this.swipeCoordinates.releasedY
      );
      this.mediator.publish('ui/hand-empty');
    } else {
      this.mediator.publish('ui/reset-hand-angle');
    }
  }
  
  // isValidHandPosition () {
  //   return this.swipeCoordinates.moveY > this.mediator.getScreenMetrics().height / 2 + this.mediator.getHandMetrics().width;
  // }
  
  // Map coordinates from browser's ones to Math ones
  getCorrectCoordinates (value) {
    return this.mediator.getScreenMetrics().height - value;
  }
  
  canThrow () {
    const validSwipeDistance = 20;
    const isSwipeReleased =
      Math.abs(this.swipeCoordinates.releasedX - this.swipeCoordinates.startX) > validSwipeDistance ||
      Math.abs(this.swipeCoordinates.releasedY - this.swipeCoordinates.startY) > validSwipeDistance;
    
    return this.swipeCoordinates.startX && this.swipeCoordinates.startY && isSwipeReleased;
  }
  
  // TODO: Why getting through params, instead of Class props?
  requestAnimation (releasedX, releasedY) {
    this.firstReleasedX = releasedX;
    
    const hyperB = this.mediator.getScreenMetrics().height + this.mediator.getBasketMetrics().height;
    const hyperA = hyperB / 1.75;
    
    window.requestAnimationFrame(this.updateCardCoords.bind(this,
      this.swipeCoordinates.startX,
      this.getCorrectCoordinates(this.swipeCoordinates.startY),
      releasedX,
      this.getCorrectCoordinates(releasedY),
      // parabolaParam
      hyperA,
      hyperB
    ));
  }
  
  isBasketCollision () {
    const basketRect = this.mediator.getBasketMetrics();
    const elRect = this.mediator.getCardMetrics();
    const basketHoleOnPictureDiff = 20;
    const sideDiff = basketRect.width / 2;
    
    if (elRect.left < basketRect.left + basketRect.width - sideDiff &&
      elRect.left + elRect.width > basketRect.left + sideDiff &&
      elRect.top < basketRect.top + basketHoleOnPictureDiff &&
      elRect.height + elRect.top > basketRect.top + basketHoleOnPictureDiff) {
      return true;
    }
  }
  
  updateCardCoords (x1, y1, x2, y2, hyperA, hyperB) {
    let nextX;
    const nextY = y2 + this.mediator.getCardSpeed();
    
    if (this.releasedSide === 'left' || !this.releasedSide) {
      nextX = -(Math.sqrt( Math.pow(hyperA, 2) * (1 - Math.pow(nextY, 2) / Math.pow(hyperB, 2)) )) +  hyperA + this.firstReleasedX;
    } else if (this.releasedSide === 'right') {
      nextX = Math.sqrt( Math.pow(hyperA, 2) * (1 - Math.pow(nextY, 2) / Math.pow(hyperB, 2)) ) + this.firstReleasedX - hyperA;
    }
    const cardLeft = window.parseInt(nextX);
    const cardTop = this.mediator.getScreenMetrics().height - window.parseInt(nextY);
    
    if (
      cardLeft > this.mediator.getScreenMetrics().width || cardTop > this.mediator.getScreenMetrics().height ||
      cardLeft < 0 || cardTop < 0
    ) {
      this.mediator.publish('card/remove');
      this.setCoordinates({
        startX: null,
        startY: null
      });
      this.mediator.publish('ui/reset-assets-classes');
      return;
    }
    
    if (this.isBasketCollision() && !this.isPreview) {
      this.win();
      return;
    }
    
    this.mediator.publish('card/update-position', {
      left: cardLeft,
      top: cardTop
    });
    
    window.requestAnimationFrame(this.updateCardCoords.bind(this,
      x2,
      y2,
      nextX,
      nextY,
      hyperA,
      hyperB
    ));
  }
  
  win () {
    this.mediator.publish('card/remove');
    this.mediator.publish('ui/basket-hit');
    this.mediator.publish('ui/show-winscreen');
  }
  
  preview (random) {
    let handBox;
    
    if (!this.card) {
      handBox = this.mediator.getHandMetrics();
      this.swipeCoordinates.startX = handBox.left + handBox.width / 2 + random;
      this.swipeCoordinates.startY = handBox.top;
      this.mediator.publish('card/create', {
        isPlaceholder: true,
        x: this.swipeCoordinates.startX,
        y: this.swipeCoordinates.startY,
        offset: handBox.width / 2
      });
      this.requestAnimation(
        this.swipeCoordinates.startX,
        this.swipeCoordinates.startY
      );
    }
  }
  
  stopPreview () {
    window.clearInterval(this.previewInterval);
    this.mediator.publish('ui/hide-cta');
    this.isPreview = false;
  }
  
  // TODO: Change formula for hand pre-throw 
  calculateAngle () {
    const maxHeight = this.mediator.getScreenMetrics().width / 2;
    const cursorY = this.mediator.getScreenMetrics().height - this.swipeCoordinates.moveY;
    let deg;
    
    if (cursorY > maxHeight) {
      deg = 90;
    } else {
      deg = cursorY / maxHeight * 90;
    }
    
    this.mediator.publish('ui/update-hand-position', {
      deg: deg
    });
  }
  
  makePreviewStop () {
    this.shouldStopPreview = true;
  }
  
  startPreview () {
    this.previewInterval = window.setInterval(() => {
      let random;
      
      if (this.shouldStopPreview) {
        this.stopPreview();
        return;
      }
      
      if (document.hasFocus()) {
        random = GameCore.getRandomArbitrary(-20, 20);
        this.preview(random);
      } else {
        // TODO: Remove redundant link
        if (this.card) {
          this.card.remove();
          this.card = null;
        }
      }
    }, 3000);
  }
};

