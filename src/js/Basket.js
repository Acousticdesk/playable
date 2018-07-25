export default class Basket {
	constructor(mediator) {
		this.el = document.querySelector('.basket');
		
		this.onWin = this.onWin.bind(this);
		this.onEventsOff = this.onEventsOff.bind(this);
		
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
		mediator[action]('all/events-off', this.onEventsOff);
	}
	
	hitStyleClass(action) {
		this.el.classList[action]('hit');
	}
	
	animationStart() {
		this.el.classList.add('animation');
	}
	
	onWin() {
		this.hitStyleClass('add');
	}

	onEventsOff() {
		this.mediatorEvents(this.mediator, 'unsub');
	}
	
	getKeyframes(screenSize) {
		const metrics = this.getMetrics();
		const translate = window.parseInt(screenSize - metrics.width);
		
		return '@-webkit-keyframes sliding {\n' +
			'    0% {\n' +
			'        -webkit-transform: translateX(0);\n' +
			'                transform: translateX(0);\n' +
			'    }\n' +
			'    50% {\n' +
			'        -webkit-transform: translateX(' + `${translate}px` + ');\n' +
			'                transform: translateX(' + `${translate}px` + ');\n' +
			'    }\n' +
			'    100% {\n' +
			'        -webkit-transform: translateX(0);\n' +
			'                transform: translateX(0);\n' +
			'    }\n' +
			'}\n' +
			'@keyframes sliding {\n' +
			'    0% {\n' +
			'        -webkit-transform: translateX(0);\n' +
			'                transform: translateX(0);\n' +
			'    }\n' +
			'    50% {\n' +
			'        -webkit-transform: translateX(' + `${translate}px` + ');\n' +
			'                transform: translateX(' + `${translate}px` + ');\n' +
			'    }\n' +
			'    100% {\n' +
			'        -webkit-transform: translateX(0);\n' +
			'                transform: translateX(0);\n' +
			'    }\n' +
			'}'
	}
}