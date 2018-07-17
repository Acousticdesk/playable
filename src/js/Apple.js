import GameCore from './GameCore';

export default class Apple {
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
    mediator[action]('core/win', this.remove);
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
  }
  
  remove() {
    if (this.el) {
      this.el.remove();
      this.el = null;
    }
  }
  
  createView({x, y, isPlaceholder, offset}) {
    this.el = document.createElement('div');
    this.el.style.width = this.width + 'px';
    this.el.style.height = this.height + 'px';
    this.el.style.top = y + 'px';
    this.el.style.left = x - offset + 'px';
    this.el.classList.add('card');
    this.el.classList.toggle('placeholder', !!isPlaceholder);
  }
  
  getMetrics() {
    return this.el.getBoundingClientRect();
  }
  
  updatePosition({top, left}) {
    this.el.style.left = left + 'px';
    this.el.style.top = top + 'px';
  }
  
  canBeThrown() {
		return !this.isOnScreen() && this.mediator.getIsSwiped() && this.mediator.isValidSwipe();
  }
  
  throw(preview) {
		if (this.canBeThrown() || preview) {
			const {startX, startY} = preview ? preview : this.mediator.getFingerCoordinates();
			const createOptions = {
				isPlaceholder: preview && preview.isPlaceholder,
				x: startX,
				y: startY,
				offset: this.mediator.getHandMetrics().width / 2
			};

			this.create(createOptions);
			this.requestAnimation(preview);
			this.mediator.publish('ui/hand-empty');
		} else {
			this.mediator.publish('ui/reset-hand-angle');
		}
  }

	requestAnimation(preview) {
		// ellipsis path params
		const {hyperA, hyperB} = GameCore.getEllipsisParams(this.mediator);
		
		const {releasedX: x1, releasedY} = preview ? preview : this.mediator.getFingerCoordinates();
		const y1 = GameCore.mathToBrowserCoordinates(this.mediator, releasedY);
		const y2 = GameCore.mathToBrowserCoordinates(this.mediator, releasedY + this.speed);
		
		const x2 = GameCore.getNextXEllipsis(x1, y2, hyperA, hyperB);

		this.updateCoordinates(x1, y1, x2, y2, hyperA, hyperB);
	}
	
	isAppleOutOfScreen ({top, left}) {
		if (
			left > this.mediator.getScreenMetrics().width || top > this.mediator.getScreenMetrics().height ||
			left < 0 || top < 0
		) {
			return true;
		}
	}
	
	appleOutOfScreenCase() {
		const resetFingerCoordinates = {
			startX: null,
			startY: null
		};

		this.remove();
		
		this.mediator
			.updateFingerCoordinates(resetFingerCoordinates)
			.publish('ui/reset-assets-classes');
	}

	updateCoordinates(x1, y1, x2, y2, hyperA, hyperB) {
		const nextY = y2 + this.speed;
		const formula = GameCore.getNextXFormula(this.mediator);
		const nextX = formula(x1, nextY, hyperA, hyperB);
		const left = window.parseInt(nextX);
		const top = this.mediator.getScreenMetrics().height - window.parseInt(nextY);
		const newPosition = {top, left};
		
		if (this.isAppleOutOfScreen(newPosition)) {
			this.appleOutOfScreenCase();
			return;
		}

		if (this.mediator.isBasketCollision() && this.mediator.getIsPreviewStopped()) {
			this.mediator.publish('core/win');
			return;
		}

		this.updatePosition({ left, top });
		
		window.requestAnimationFrame(() => this.updateCoordinates(x2, y2, nextX, nextY, hyperA, hyperB));
	}

	previewThrow() {
		const random = GameCore.getRandomArbitrary(-20, 20);
		const handBox = this.mediator.getHandMetrics();
		const updateFingerCoordinates = {
			startX: handBox.left + handBox.width / 2 + random,
			startY: handBox.top
		};

		this.mediator.updateFingerCoordinates(updateFingerCoordinates);

		this.throw({
			startX: updateFingerCoordinates.startX,
			startY: updateFingerCoordinates.startY,
			releasedX: updateFingerCoordinates.startX,
			releasedY: updateFingerCoordinates.startY,
			isPlaceholder: true
		});
	}
}
