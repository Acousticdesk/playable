/* Old updateCardCoords
      * 
      * updateCardCoords: function (x1, y1, x2, y2, hyperA, hyperB, releasedSide) {
          var nextX;
          // TODO: Straight line
          // var nextY = y2 + this.cardSpeed;
          // var nextX = x1 + (nextY - y1) * ((x2 - x1) / (y2 - y1));
          // TODO: Parabola
          // var nextY = y2 + this.cardSpeed;
          // var nextX = Math.pow(nextY, 2) / (2 * parabolaParam) + this.startHereX;
          // TODO: :Log(x)
          // var nextY = y2 + this.cardSpeed;
          // var logX = Math.pow(nextY, 2)/ 50000;
          // var nextX = -Math.pow(2, logX) + this.startHereX;
          // TODO: Hyperbola
          // var nextY = y2 + this.cardSpeed;
          // var nextX = Math.sqrt( Math.pow(hyperA, 2) * (Math.pow(nextY, 2) / Math.pow(hyperB, 2) + 1) ) + this.startHereX - hyperA;
          // TODO: Ellipsis
          var nextY = y2 + this.mediator.getCardSpeed();
          // var nextX = Math.sqrt( Math.pow(hyperA, 2) * (Math.pow(nextY, 2) / Math.pow(hyperB, 2) + 1) ) + this.startHereX - hyperA;
          // var nextX = Math.sqrt( Math.pow(hyperA, 2) * (1 - Math.pow(nextY, 2) / Math.pow(hyperB, 2)) ) + this.startHereX - hyperA;
          if (releasedSide === 'left') {
            nextX = -(Math.sqrt( Math.pow(hyperA, 2) * (1 - Math.pow(nextY, 2) / Math.pow(hyperB, 2)) )) +  hyperA + this.firstReleasedX;
          } else if (releasedSide === 'right') {
            nextX = Math.sqrt( Math.pow(hyperA, 2) * (1 - Math.pow(nextY, 2) / Math.pow(hyperB, 2)) ) + this.firstReleasedX - hyperA;
          }
          var cardLeft = window.parseInt(nextX);
          var cardTop = this.mediator.getScreenMetrics().height - window.parseInt(nextY);
  
          if (
            cardLeft > this.mediator.getScreenMetrics().width || cardTop > this.mediator.getScreenMetrics().height ||
            cardLeft < 0 || cardTop < 0
          ) {
            this.removeCard();
            this.resetHandAnglePosition();
            return;
          }
  
          if (this.isBasketCollision()) {
            this.removeCard();
            this.basket.classList.add('hit');
            this.win();
            this.resetHandAnglePosition();
            return;
          }
  
          this.card.style.left = cardLeft + 'px';
          this.card.style.top = cardTop + 'px';
  
          window.requestAnimationFrame(this.updateCardCoords.bind(this,
            x2,
            y2,
            nextX,
            nextY,
            hyperA,
            hyperB,
            releasedSide
          ));
        }
      * 
      * */

// this.hand.classList.remove('waiting');
// var tg = this.getCorrectCoordinates(cursorY) / cursorX;
// var angleRad = Math.atan(tg);
// var angleDeg = angleRad * 180 / Math.PI;
// var delta = 30;
// angleDeg = releasedSide === 'right' ? angleDeg - delta : -angleDeg + delta;
// this.hand.style.transform = 'rotate(' + angleDeg + 'deg)';

/*
* 
* 
* requestAnimation: function (releasedX, releasedY) {
      // TODO: Parabola
      // var parabolaParam;
      // var param = 200;
      // TODO: ???
      this.firstReleasedX = releasedX;
      this.releasedSide = this.getCursorPosition(releasedX);
      // if (releasedX < this.mediator.getScreenMetrics().width / 2) {
      //   parabolaParam = param;
      // } else {
      //   parabolaParam = -param;
      // }
      // TODO: Log(x)
      // var parabolaParam = 500;
      // TODO: Hyperbola, Ellipsis Params
      var hyperB = this.mediator.getScreenMetrics().height + this.mediator.getBasketMetrics().height;
      var hyperA = hyperB / 1.75;

      window.requestAnimationFrame(this.updateCardCoords.bind(this,
        this.swipeCoordinates.startX,
        this.getCorrectCoordinates(this.swipeCoordinates.startY),
        releasedX,
        this.getCorrectCoordinates(releasedY),
        // parabolaParam
        hyperA,
        hyperB,
        releasedSide
      ));
    },
* 
* */

import PlayableAdMediator from './Mediator';


const playableAd = new PlayableAdMediator();
