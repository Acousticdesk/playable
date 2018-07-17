export default class Basket {
	constructor(mediator) {
		this.el = document.querySelector('.basket');
		
		this.onWin = this.onWin.bind(this);
		
		this.mediatorEvents(mediator, 'subscribe');
	}
	
	getMetrics() {
		return this.el.getBoundingClientRect();
	}
	
	isCollision () {
		const basketRect = this.getMetrics();
		const appleRect = this.mediator.getAppleMetrics();
		const basketHoleOnPictureDiff = 20;
		const sideDiff = basketRect.width / 2;

		if (appleRect.left < basketRect.left + basketRect.width - sideDiff &&
			appleRect.left + appleRect.width > basketRect.left + sideDiff &&
			appleRect.top < basketRect.top + basketHoleOnPictureDiff &&
			appleRect.height + appleRect.top > basketRect.top + basketHoleOnPictureDiff) {
			return true;
		}
	}
	
	mediatorEvents(mediator, action) {
		mediator[action]('core/win', this.onWin);
	}
	
	hitStyleClass(action) {
		this.el.classList[action]('hit');
	}
	
	onWin() {
		this.hitStyleClass('add');
	}
}