import DIOInt from 'dio-intint';

export default class GameCore {
  constructor(mediator) {
    // Webpack Define Plugin variable
    if (DEVELOPMENT) {
      window.pressXtoWin = this.win.bind(this);
    }
    
    this.createWinScreen = this.createWinScreen.bind(this);
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
  
  static getNextXHyperbola(aParam, bParam, x1, y2) {
		return -(
		  Math.sqrt( Math.pow(aParam, 2) * (1 - Math.pow(y2, 2) /
      Math.pow(bParam, 2)) )
    ) +  aParam + x1
  }
  
  static getNextXHyperbolaMirrored(aParam, bParam, x1, y2) {
    return Math.sqrt(
      Math.pow(aParam, 2) * (1 - Math.pow(y2, 2) /
      Math.pow(bParam, 2))
    ) + x1 - aParam;
  }
  
  mediatorEvents (mediator, action) {
    mediator[action]('core/create-winscreen', this.createWinScreen);
    mediator[action]('core/calculate-hand-angle', this.calculateAngle);
    mediator[action]('core/win', this.win);
    mediator[action]('all/events-off', this.onEventsOff);
    mediator[action]('core/start', this.start);
  }
  
  onEventsOff() {
    this.mediatorEvents(this.mediator, 'unsub')
  }
  
  createWinScreen() {
    // images: [
    // "[[{"type":"banner","width":320,"height":480}]]",
    // "[[{"type":"banner","width":320,"height":480}]]",
    // "[[{"type":"banner","width":320,"height":480}]]"
    // ],
    // title: "[[{"type":"title"}]]",
    // rating: "[[{"type":"rating"}]]"
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
      deg: deg
    });
  }
  
  start() {
		const random = GameCore.getRandomArbitrary(-20, 20);
		const handBox = this.mediator.getHandMetrics();
		const updateFingerCoordinates = {
		  startX: handBox.left + handBox.width / 2 + random,
			startY: handBox.top
		};

		// this.fingerCoordinates.startX = handBox.left + handBox.width / 2 + random;
		// this.fingerCoordinates.startY = handBox.top;
    
    this.mediator.publish('finger/update-coordinates', updateFingerCoordinates);
    
		this.mediator.publish('card/create', {
			isPlaceholder: true,
			x: updateFingerCoordinates.startX,
			y: updateFingerCoordinates.startY,
			offset: handBox.width / 2
		});
		this.mediator.publish('card/request-animation',
			updateFingerCoordinates.startX,
			updateFingerCoordinates.startY
		);
  }
};

