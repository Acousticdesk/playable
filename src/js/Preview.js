export default class Preview {
	constructor(mediator) {
		this.interval = null;
		this.isPreviewStopped = false;
		// TODO:
		this.setInterval = this.setInterval.bind(this);
		this.stopPreview = this.stopPreview.bind(this);
		this.mediatorEvents(mediator, 'subscribe');
	};

	setInterval(interval) {
		this.interval = interval;
	};

	mediatorEvents(mediator, action) {
		mediator[action]('preview/set-interval', this.setInterval);
		mediator[action]('preview/stop', this.stopPreview);
	};

	getIsPreviewStopped() {
		return this.isPreviewStopped;
	};

	stopPreview() {
		this.isPreviewStopped = true;
		window.clearInterval(this.interval);
		this.mediator.publish('ui/hide-cta');
	};

	start() {
		const interval = window.setInterval(() => this.mediator.publish('core/start'), 3000);

		this.mediator.publish('preview/set-interval', interval);
	};
}
