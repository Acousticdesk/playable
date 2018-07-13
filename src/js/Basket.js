export default class Basket {
	isCollision () {
		const basketRect = this.mediator.getBasketMetrics();
		const elRect = this.mediator.getCardMetrics();
		const basketHoleOnPictureDiff = 20;
		const sideDiff = basketRect.width / 2;

		if (elRect.left < basketRect.left + basketRect.width - sideDiff &&
			elRect.left + elRect.width > basketRect.left + sideDiff &&
			elRect.top < basketRect.top + basketHoleOnPictureDiff &&
			elRect.height + elRect.top > basketRect.top + basketHoleOnPictureDiff) {
			return true;
		}
	}
}