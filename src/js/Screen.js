// Screen
export default function Screen (mediator) {
  this.el = document.querySelector('.screen');
  this.closeBtn = document.querySelector('.close-btn');
  
  mediator.subscribe('screen/add-card', this.addCard.bind(this));
  this.domEvents('add');
}

Screen.prototype = {
  addCard: function (card) {
    this.el.appendChild(card);
  },
  onTouchstart: function (e) {
    this.mediator.publish('screen/touchstart', {
      startX: e.changedTouches && e.changedTouches[0].clientX,
      startY: e.changedTouches && e.changedTouches[0].clientY
    });
  },
  onTouchend: function (e) {
    this.mediator.publish('screen/touchend', {
      releasedX: e.changedTouches && e.changedTouches[0].clientX,
      releasedY: e.changedTouches && e.changedTouches[0].clientY
    });
  },
  onTouchmove: function (e) {
    this.mediator.publish('screen/touchmove', {
      moveX: e.changedTouches && e.changedTouches[0].clientX,
      moveY: e.changedTouches && e.changedTouches[0].clientY
    });
  },
  remove: function () {
    this.domEvents('remove');
    this.el.parentElement.removeChild(this.el);
  },
  domEvents: function (state) {
    this.el[state + 'EventListener']('touchstart', this.onTouchstart.bind(this));
    this.el[state + 'EventListener']('touchend', this.onTouchend.bind(this));
    this.el[state + 'EventListener']('touchmove', this.onTouchmove.bind(this));
    this.closeBtn[state + 'EventListener']('click', this.remove.bind(this));
  }
};
