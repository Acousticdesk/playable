export default function Card (mediator) {
  this.width = 50;
  this.height = 80;
  this.speed = 10;
  this.el = null;
  
  this.mediatorEvents(mediator);
}

Card.prototype.mediatorEvents = function (mediator) {
  mediator.subscribe('card/create', this.onCreateCard.bind(this));
  mediator.subscribe('card/remove', this.onRemoveCard.bind(this));
  mediator.subscribe('card/update-position', this.updatePosition.bind(this));
};

Card.prototype.isOnScreen = function () {
  return this.el;
};

Card.prototype.onCreateCard = function (options) {
  this.create(options);
  this.mediator.publish('screen/add-card', this.el);
};

Card.prototype.onRemoveCard = function () {
  this.el.remove();
  this.el = null;
};

Card.prototype.create = function (options) {
  this.el = document.createElement('div');
  this.el.style.width = this.width + 'px';
  this.el.style.height = this.height + 'px';
  this.el.style.top = options.y + 'px';
  this.el.style.left = options.x - options.offset + 'px';
  this.el.classList.add('card');
  this.el.classList.toggle('placeholder', options.isPlaceholder);
};

Card.prototype.getSpeed = function () {
  return this.speed;
};

Card.prototype.getMetrics = function () {
  return this.el.getBoundingClientRect();
};

Card.prototype.updatePosition = function (options) {
  this.el.style.left = options.left + 'px';
  this.el.style.top = options.top + 'px';
};
