export default class GameCore {
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
	
  // Map coordinates from browser's ones to Math ones
  static mathToBrowserCoordinates (mediator, value) {
    return mediator.getScreenMetrics().height - value;
  }
  
  getHandAngle() {
    const {moveY} = this.mediator.getFingerCoordinates();
    const maxHeight = this.mediator.getScreenMetrics().width / 2;
    const cursorY = this.mediator.getScreenMetrics().height - moveY;
    let deg;
    
    if (cursorY > maxHeight) {
      deg = 90;
    } else {
      deg = cursorY / maxHeight * 90;
    }
    
    return deg;
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

