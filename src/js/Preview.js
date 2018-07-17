export default class Preview {
	constructor() {
		this.interval = null;
		this.isPreviewStopped = false;
		this.setInterval = this.setInterval.bind(this);
		this.stop = this.stop.bind(this);
	};

	setInterval(interval) {
		this.interval = interval;
	};

	getIsPreviewStopped() {
		return this.isPreviewStopped;
	};

	stop() {
		this.isPreviewStopped = true;
		window.clearInterval(this.interval);
		this.mediator.publish('preview/stop');
	};

	start() {
		const interval = window.setInterval(() => this.mediator.previewThrow(), 3000);

		this.setInterval(interval);
	};
}
