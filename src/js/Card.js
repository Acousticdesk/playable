import GameCore from './GameCore';

export default class Card {
  constructor(mediator) {
    this.width = 50;
    this.height = 80;
    this.speed = 10;
    this.el = null;
    
    this.create = this.create.bind(this);
    this.remove = this.remove.bind(this);
    this.onEventsOff = this.onEventsOff.bind(this);
    this.throw = this.throw.bind(this);
    this.updateCoordinates = this.updateCoordinates.bind(this);
    this.requestAnimation = this.requestAnimation.bind(this);
    
    this.mediatorEvents(mediator, 'subscribe');
  }
  
  mediatorEvents(mediator, action) {
    mediator[action]('card/create', this.create);
    mediator[action]('card/remove', this.remove);
    mediator[action]('card/request-animation', this.requestAnimation);
    mediator[action]('all/events-off', this.onEventsOff);
    mediator[action]('screen/touchend', this.throw);
  }
  
  onEventsOff() {
    this.mediatorEvents(this.mediator, 'unsub');
  }
  
  isOnScreen() {
    return this.el;
  }
  
  create(options) {
    this.createView(options);
    this.mediator.publish('screen/add-card', this.el);
    this.mediator.publish('screen/touchend');
  }
  
  remove() {
    if (this.el) {
      this.el.remove();
      this.el = null;
    }
  }
  
  createView(options) {
    this.el = document.createElement('div');
    this.el.style.width = this.width + 'px';
    this.el.style.height = this.height + 'px';
    this.el.style.top = options.y + 'px';
    this.el.style.left = options.x - options.offset + 'px';
    this.el.classList.add('card');
    this.el.classList.toggle('placeholder', options.isPlaceholder);
  }
  
  getMetrics() {
    return this.el.getBoundingClientRect();
  }
  
  updatePosition(options) {
    this.el.style.left = options.left + 'px';
    this.el.style.top = options.top + 'px';
  }
  
  canBeThrown() {
		return !this.isOnScreen() && this.mediator.getIsSwiped() && this.mediator.isValidSwipe();
  }
  
  throw() {
		if (this.canBeThrown()) {
			const { startX, startY, releasedX, releasedY } = this.mediator.getFingerCoordinates();
			const createOptions = {
				isPlaceholder: false,
				x: startX,
				y: startY,
				offset: this.mediator.getHandMetrics().width / 2
			};

			this.create(createOptions);
			this.requestAnimation({
				releaseX: releasedX -this.mediator.getBasketMetrics().width / 2,
				releasedY
			});
			this.mediator.publish('ui/hand-empty');
		} else {
			this.mediator.publish('ui/reset-hand-angle');
		}
  }

	requestAnimation({releasedX, releasedY}) {
		const hyperB = this.mediator.getScreenMetrics().height + this.mediator.getBasketMetrics().height;
		const hyperA = hyperB / 1.75;
		const { startX, startY } = this.mediator.getFingerCoordinates();

		window.requestAnimationFrame(() => {
			this.updateCoordinates(
				startX,
				GameCore.mathToBrowserCoordinates(this.mediator, startY),
				releasedX,
				GameCore.mathToBrowserCoordinates(this.mediator, releasedY),
				// parabolaParam
				hyperA,
				hyperB
			);
		});
	}

	updateCoordinates(x1, y1, x2, y2, hyperA, hyperB) {
		let formula;
		const nextY = y2 + this.speed;
		const fingerPosition = this.mediator.getFingerPositionOnScreen();
		const {releasedX} = this.mediator.getFingerCoordinates();

		if (fingerPosition === 'left' || !fingerPosition) {
			formula = GameCore.getNextXHyperbola;
		} else if (fingerPosition === 'right') {
			formula = GameCore.getNextXHyperbolaMirrored;
		}

		const nextX = formula(hyperA, hyperB, releasedX, nextY);
		const cardLeft = window.parseInt(nextX);
		const cardTop = this.mediator.getScreenMetrics().height - window.parseInt(nextY);

		if (
			cardLeft > this.mediator.getScreenMetrics().width || cardTop > this.mediator.getScreenMetrics().height ||
			cardLeft < 0 || cardTop < 0
		) {
			const resetFingerCoordinates = {
				startX: null,
				startY: null
			};

			this.remove();
			this.mediator.publish('finger/update-coordinates', resetFingerCoordinates);
			this.mediator.publish('ui/reset-assets-classes');
			return;
		}

		if (this.mediator.isBasketCollision() && this.mediator.getIsPreviewStopped()) {
			this.mediator.publish('core/win');
			return;
		}

		const newPosition = {
			left: cardLeft,
			top: cardTop
		};

		this.updatePosition(newPosition);

		window.requestAnimationFrame(() => this.updateCoordinates(x2, y2, nextX, nextY, hyperA, hyperB));
	}
}
