export default class Card {
  constructor (mediator) {
    this.width = 50;
    this.height = 80;
    this.speed = 10;
    this.el = null;
    
    // TODO: repeated
    this.onCreateCard = this.onCreateCard.bind(this);
    this.onRemoveCard = this.onRemoveCard.bind(this);
    this.updatePosition = this.updatePosition.bind(this);
    this.onEventsOff = this.onEventsOff.bind(this);
    
    this.mediatorEvents(mediator, 'subscribe');
  }
  
  // TODO: repeated
  mediatorEvents (mediator, action) {
    mediator[action]('card/create', this.onCreateCard);
    mediator[action]('card/remove', this.onRemoveCard);
    mediator[action]('card/update-position', this.updatePosition);
    mediator[action]('all/events-off', this.onEventsOff);
  }
  
  // TODO: repeated
  onEventsOff () {
    this.mediatorEvents(this.mediator, 'unsub');
  }
  
  isOnScreen () {
    return this.el;
  }
  
  onCreateCard (options) {
    this.create(options);
    this.mediator.publish('screen/add-card', this.el);
  }
  
  onRemoveCard () {
    if (this.el) {
      this.el.remove();
      this.el = null;
    }
  }
  
  create (options) {
    this.el = document.createElement('div');
    this.el.style.width = this.width + 'px';
    this.el.style.height = this.height + 'px';
    this.el.style.top = options.y + 'px';
    this.el.style.left = options.x - options.offset + 'px';
    this.el.classList.add('card');
    this.el.classList.toggle('placeholder', options.isPlaceholder);
  }
  
  getSpeed () {
    return this.speed;
  }
  
  getMetrics () {
    return this.el.getBoundingClientRect();
  }
  
  updatePosition (options) {
    this.el.style.left = options.left + 'px';
    this.el.style.top = options.top + 'px';
  }
}
