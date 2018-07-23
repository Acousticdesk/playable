export default class CoordinatesManager {
	constructor(mediator) {
		this.coordinates = {
			startX: null,
			startY: null,
			releasedX: null,
			releasedY: null,
			moveX: null,
			moveY: null
		};

		this.isSwiped = false;

		this.updateIsSwiped = this.updateIsSwiped.bind(this);
		this.onEventsOff = this.onEventsOff.bind(this);
		this.mediatorEvents(mediator, 'subscribe');
	}

	mediatorEvents(mediator, action) {
		mediator[action]('screen/touchmove', this.updateIsSwiped);
		mediator[action]('all/events-off', this.onEventsOff);
	}

	updateCoordinates (coordinates) {
		for (let key in coordinates) {
			if (coordinates.hasOwnProperty(key)) {
				this.coordinates[key] = coordinates[key];
			}
		}
	}

	getCoordinates() {
		return this.coordinates;
	}

	getIsSwiped() {
		return this.isSwiped;
	}

	updateIsSwiped() {
		this.isSwiped =
			this.coordinates.startX !== this.coordinates.moveX ||
			this.coordinates.startY !== this.coordinates.moveY;
	}

	isValidSwipe() {
		const validSwipeDistance = 20;
		const { startX, startY, releasedX, releasedY } = this.coordinates;
		const isSwipeReleased =
			Math.abs(releasedX - startX) > validSwipeDistance ||
			Math.abs(releasedY - startY) > validSwipeDistance;

		return startX && startY && isSwipeReleased;
	}
	
	onEventsOff() {
		this.mediatorEvents(this.mediator, 'unsub');
	}
}