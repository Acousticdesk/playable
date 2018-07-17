export default class Basket {
	isCollision () {
		const basketRect = this.mediator.getBasketMetrics();
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
}