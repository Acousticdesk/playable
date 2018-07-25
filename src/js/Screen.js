export default class Screen  {
  constructor (mediator) {
    this.el = document.querySelector('.screen');
    // this.closeBtn = document.querySelector('.close-btn');
    
    this.addApple = this.addApple.bind(this);
    this.onEventsOff = this.onEventsOff.bind(this);
    this.remove = this.remove.bind(this);
    
    this.mediatorEvents(mediator, 'subscribe');
    // this.closeBtnEvent('add');
    this.domEvents('add');
  }
  
  // closeBtnEvent (action) {
  //   this.closeBtn[action + 'EventListener']('click', this.remove);
  // }
  
  onEventsOff () {
    this.domEvents('remove');
    this.mediatorEvents(this.mediator, 'unsub');
  }
  
  mediatorEvents (mediator, action) {
    mediator[action]('screen/add-card', this.addApple);
    mediator[action]('all/events-off', this.onEventsOff);
  }
  
  addApple (apple) {
    this.el.appendChild(apple);
  }
  
  onTouchstart (e) {
		this.mediator.publish('screen/touchstart');
		this.mediator
      .stopPreview()
      .updateFingerCoordinates({
        startX: e.changedTouches && e.changedTouches[0].clientX,
        startY: e.changedTouches && e.changedTouches[0].clientY
      });
  }
  
  onTouchend (e) {
		this.mediator.updateFingerCoordinates({
			releasedX: e.changedTouches && e.changedTouches[0].clientX,
			releasedY: e.changedTouches && e.changedTouches[0].clientY
		});
		this.mediator.publish('screen/touchend');
  }
  
  onTouchmove (e) {
    const data = {
			moveX: e.changedTouches && e.changedTouches[0].clientX,
			moveY: e.changedTouches && e.changedTouches[0].clientY
		};
    
    this.mediator.publish('screen/touchmove', data);
    this.mediator.updateFingerCoordinates(data);
    
		this.fingerPosition = data.moveX < this.getMetrics().width / 2 ? 'left' : 'right';
  }
  
  remove () {
    // this.closeBtnEvent('remove');
    this.el.parentElement.removeChild(this.el);
  }
  
  getMetrics() {
		return this.el.getBoundingClientRect();
  }
  
  domEvents (action) {
    this.el[action + 'EventListener']('touchstart', this.onTouchstart.bind(this));
    this.el[action + 'EventListener']('touchend', this.onTouchend.bind(this));
    this.el[action + 'EventListener']('touchmove', this.onTouchmove.bind(this));
  }
  
  getFingerPosition() {
    return this.fingerPosition;
  }
  
  getWindowWidth() {
  	return document.documentElement.clientWidth;
	}
}
