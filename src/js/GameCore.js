export default function GameCore (mediator) {
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
  
  this.mediatorEvents(mediator);
}

GameCore.prototype = {
  mediatorEvents: function (mediator) {
    var setCoordinates = this.setCoordinates.bind(this);
    
    mediator.subscribe('screen/touchend', function (coordinates) {
      setCoordinates(coordinates);
      this.throwCard();
    }.bind(this));
    mediator.subscribe('screen/touchstart', function (coordinates) {
      setCoordinates(coordinates);
      this.makePreviewStop();
    }.bind(this));
    mediator.subscribe('core/create-winscreen', this.createWinScreen.bind(this));
    mediator.subscribe('core/calculate-hand-angle', this.calculateAngle.bind(this));
    mediator.subscribe('screen/touchmove', function (coordinates) {
      setCoordinates(coordinates);
      this.updateIsSwiped();
      this.setReleasedSide(coordinates.moveX);
    }.bind(this));
  },
  setReleasedSide: function (moveX) {
    this.releasedSide = this.getCursorPosition(moveX);
  },
  setCoordinates: function (coordinates) {
    for (var key in coordinates) {
      if (coordinates.hasOwnProperty(key)) {
        this.swipeCoordinates[key] = coordinates[key];
      }
    }
  },
  getReleasedSide: function () {
    return this.releasedSide;
  },
  createWinScreen: function () {
    window.Ad.create();
  },
  getSwipeCoordinates: function () {
    return this.swipeCoordinates;
  },
  updateIsSwiped: function () {
    this.isSwipedProp =
      this.swipeCoordinates.startX !== this.swipeCoordinates.moveX ||
      this.swipeCoordinates.startY !== this.swipeCoordinates.moveY;
  },
  isSwiped: function () {
    return this.isSwipedProp;
  },
  getCursorPosition: function (releasedX) {
    // TODO: Prevent all 'getScreenMetrics' calls
    return releasedX < this.mediator.getScreenMetrics().width / 2 ? 'left' : 'right';
  },
  throwCard: function () {
    if (
      !this.mediator.isCardOnScreen() &&
      this.isSwiped() &&
      this.canThrow() &&
      this.isValidHandPosition()
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
  },
  isValidHandPosition: function () {
    return this.swipeCoordinates.moveY > this.mediator.getScreenMetrics().height / 2 + this.mediator.getHandMetrics().width;
  },
  // Map coordinates from browser's ones to Math ones
  getCorrectCoordinates: function (value) {
    return this.mediator.getScreenMetrics().height - value;
  },
  canThrow: function () {
    return this.swipeCoordinates.startX && this.swipeCoordinates.startY;
  },
  // TODO: Why getting through params, instead of Class props?
  requestAnimation: function (releasedX, releasedY) {
    this.firstReleasedX = releasedX;
    
    var hyperB = this.mediator.getScreenMetrics().height + this.mediator.getBasketMetrics().height;
    var hyperA = hyperB / 1.75;
    
    window.requestAnimationFrame(this.updateCardCoords.bind(this,
      this.swipeCoordinates.startX,
      this.getCorrectCoordinates(this.swipeCoordinates.startY),
      releasedX,
      this.getCorrectCoordinates(releasedY),
      // parabolaParam
      hyperA,
      hyperB
    ));
  },
  isBasketCollision: function () {
    var basketRect = this.mediator.getBasketMetrics();
    var elRect = this.mediator.getCardMetrics();
    var basketHoleOnPictureDiff = 20;
    var basketHoleDiffBottom = basketRect.height - basketHoleOnPictureDiff;
    var basketHoleDiffTop = basketRect.height / 4;
    var sideDiff = basketRect.width / 2;
    
    if (elRect.left < basketRect.left + basketRect.width - sideDiff &&
      elRect.left + elRect.width > basketRect.left + sideDiff &&
      elRect.top < basketRect.top + basketHoleOnPictureDiff &&
      elRect.height + elRect.top > basketRect.top + basketHoleOnPictureDiff) {
      return true;
    }
  },
  updateCardCoords: function (x1, y1, x2, y2, hyperA, hyperB) {
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
      this.mediator.publish('card/remove');
      this.mediator.publish('ui/basket-hit');
      this.mediator.publish('ui/show-winscreen');
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
  },
  preview: function (random) {
    var handBox;
    
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
  },
  getRandomArbitrary: function (min, max) {
    return Math.random() * (max - min) + min;
  },
  stopPreview: function () {
    window.clearInterval(this.previewInterval);
    this.mediator.publish('ui/hide-cta');
    this.isPreview = false;
  },
  // TODO: Change formula for hand pre-throw 
  calculateAngle: function () {
    var maxHeight = this.mediator.getScreenMetrics().width / 2,
      deg,
      cursorY = this.mediator.getScreenMetrics().height - this.swipeCoordinates.moveY;
    
    if (cursorY > maxHeight) {
      deg = 90;
    } else {
      deg = cursorY / maxHeight * 90;
    }
    
    this.mediator.publish('ui/update-hand-position', {
      deg: deg
    });
  },
  makePreviewStop: function () {
    this.shouldStopPreview = true;
  },
  startPreview: function () {
    this.previewInterval = window.setInterval(function () {
      var random;
      
      if (this.shouldStopPreview) {
        this.stopPreview();
        return;
      }
      
      if (document.hasFocus()) {
        random = this.getRandomArbitrary(-20, 20);
        this.preview(random);
      } else {
        // TODO: Remove redundant link
        if (this.card) {
          this.card.remove();
          this.card = null;
        }
      }
    }.bind(this), 3000);
  }
};
