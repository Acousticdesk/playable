export default class GameCore {
  constructor(mediator) {
    if (this.isDevelopmentEnv()) {
      window.pressXtoWin = this.win.bind(this);
    }
    
    this.calculateAngle = this.calculateAngle.bind(this);
    this.onEventsOff = this.onEventsOff.bind(this);
    this.start = this.start.bind(this);
    this.win = this.win.bind(this);
  
    this.mediatorEvents(mediator, 'subscribe');
  }
  
  static getRandomArbitrary (min, max) {
    return Math.random() * (max - min) + min;
  }
  
  static getRandomInt (min, max) {
    return Math.round(GameCore.getRandomArbitrary(min, max));
  }
  
  static getNextXEllipsis(x1, y2, aParam, bParam) {
		return -(
		  Math.sqrt( Math.pow(aParam, 2) * (1 - Math.pow(y2, 2) /
      Math.pow(bParam, 2)) )
    ) +  aParam + x1
  }
  
  static getNextXEllipsisMirrored(x1, y2, aParam, bParam) {
    return Math.sqrt(
      Math.pow(aParam, 2) * (1 - Math.pow(y2, 2) /
      Math.pow(bParam, 2))
    ) + x1 - aParam;
  }

	static getNextXFormula (mediator) {
		const fingerPosition = mediator.getFingerPositionOnScreen();

		if (fingerPosition === 'left' || !fingerPosition) {
			return GameCore.getNextXEllipsis;
		}

		return GameCore.getNextXEllipsisMirrored;
	}
  
  mediatorEvents (mediator, action) {
    mediator[action]('core/calculate-hand-angle', this.calculateAngle);
    mediator[action]('core/win', this.win);
    mediator[action]('all/events-off', this.onEventsOff);
    mediator[action]('core/start', this.start);
  }
  
  onEventsOff() {
    this.mediatorEvents(this.mediator, 'unsub')
  }
  
  // Map coordinates from browser's ones to Math ones
  static mathToBrowserCoordinates (mediator, value) {
    return mediator.getScreenMetrics().height - value;
  }
  
  win() {
    this.mediator.publish('card/remove');
    this.mediator.publish('ui/basket-hit');
    this.mediator.publish('ui/show-winscreen');
  }
  
  calculateAngle() {
    const {moveY} = this.mediator.getFingerCoordinates();
    const maxHeight = this.mediator.getScreenMetrics().width / 2;
    const cursorY = this.mediator.getScreenMetrics().height - moveY;
    let deg;
    
    if (cursorY > maxHeight) {
      deg = 90;
    } else {
      deg = cursorY / maxHeight * 90;
    }
    
    this.mediator.publish('ui/update-hand-position', {
      deg
    });
  }
  
  start() {
		const random = GameCore.getRandomArbitrary(-20, 20);
		const handBox = this.mediator.getHandMetrics();
		const updateFingerCoordinates = {
		  startX: handBox.left + handBox.width / 2 + random,
			startY: handBox.top
		};

		this.mediator.updateFingerCoordinates(updateFingerCoordinates);
		
		this.mediator.throwApple({
			startX: updateFingerCoordinates.startX,
			startY: updateFingerCoordinates.startY,
			releasedX: updateFingerCoordinates.startX,
			releasedY: updateFingerCoordinates.startY,
			isPlaceholder: true
		});
  }
  
  static getEllipsisParams(mediator) {
		const hyperB = mediator.getScreenMetrics().height + mediator.getBasketMetrics().height;
		const hyperA = hyperB / 20;
		
    return {hyperA, hyperB}; 
  }
  
  isDevelopmentEnv() {
		// Webpack Define Plugin variable
    return DEVELOPMENT;
  }
};

