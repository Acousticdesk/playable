import CallbackStorage from './CallbackStorage';

export default class Card extends CallbackStorage{
  constructor (mediator) {
    super();
    
    this.width = 50;
    this.height = 80;
    this.speed = 10;
    this.el = null;
    
    // TODO: repeated
    this.addCallbacks([
      this.onCreateCard.bind(this),
      this.onRemoveCard.bind(this),
      this.updatePosition.bind(this),
      this.onEventsOff.bind(this)
    ]);
    
    this.mediatorEvents(mediator, 'subscribe');
  }
  
  // TODO: repeated
  mediatorEvents (mediator, action) {
    mediator[action]('card/create', this.getCallback('onCreateCard'));
    mediator[action]('card/remove', this.getCallback('onRemoveCard'));
    mediator[action]('card/update-position', this.getCallback('updatePosition'));
    mediator[action]('all/events-off', this.getCallback('onEventsOff'));
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
