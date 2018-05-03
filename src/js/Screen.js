export default class Screen  {
  constructor (mediator) {
    this.el = document.querySelector('.screen');
    this.closeBtn = document.querySelector('.close-btn');
  
    // TODO: repetitive
    this.addCard = this.addCard.bind(this);
    this.onEventsOff = this.onEventsOff.bind(this);
    this.remove = this.remove.bind(this);
  
    // TODO: repetitive
    this.mediatorEvents(mediator, 'subscribe');
    this.closeBtnEvent('add');
    this.domEvents('add');
  }
  
  closeBtnEvent (action) {
    this.closeBtn[action + 'EventListener']('click', this.remove);
  }
  
  // TODO: repetitive
  onEventsOff () {
    this.domEvents('remove');
    this.mediatorEvents(this.mediator, 'unsub');
  }
  
  // TODO: repetitive
  mediatorEvents (mediator, action) {
    mediator[action]('screen/add-card', this.addCard);
    mediator[action]('all/events-off', this.onEventsOff);
  }
  
  addCard (card) {
    this.el.appendChild(card);
  }
  
  onTouchstart (e) {
    this.mediator.publish('screen/touchstart', {
      startX: e.changedTouches && e.changedTouches[0].clientX,
      startY: e.changedTouches && e.changedTouches[0].clientY
    });
  }
  
  onTouchend (e) {
    this.mediator.publish('screen/touchend', {
      releasedX: e.changedTouches && e.changedTouches[0].clientX,
      releasedY: e.changedTouches && e.changedTouches[0].clientY
    });
  }
  
  onTouchmove (e) {
    this.mediator.publish('screen/touchmove', {
      moveX: e.changedTouches && e.changedTouches[0].clientX,
      moveY: e.changedTouches && e.changedTouches[0].clientY
    });
  }
  
  remove () {
    this.closeBtnEvent('remove');
    this.el.parentElement.removeChild(this.el);
  }
  
  domEvents (action) {
    this.el[action + 'EventListener']('touchstart', this.onTouchstart.bind(this));
    this.el[action + 'EventListener']('touchend', this.onTouchend.bind(this));
    this.el[action + 'EventListener']('touchmove', this.onTouchmove.bind(this));
  }
}
