(function () {
  'use strict';
  
  var IMAGES = [
    "[[{"type":"banner","width":320,"height":480}]]",
    "[[{"type":"banner","width":320,"height":480}]]",
    "[[{"type":"banner","width":320,"height":480}]]"
  ];
  var TITLE = "[[{"type":"title"}]]";
  var RATING = "[[{"type":"rating"}]]";
  // var IMAGES = [
  //   'http://wallpaperstock.net/banner-peak_wallpapers_27665_320x480.jpg',
  //   'http://wallpaperstock.net/banner-peak_wallpapers_27665_320x480.jpg',
  //   'http://wallpaperstock.net/banner-peak_wallpapers_27665_320x480.jpg'
  //
  // ];
  // var TITLE = 'Hello world!';
  // var RATING = 3;
  
  var helpers = {
    DOMCollectionApply: function (domCollection, cb) {
      Array.prototype.slice.call(domCollection).forEach(cb);
    }
  };
  
  var UI = {
    isPortraitOrientation: function () {
      return window.innerHeight > window.innerWidth;
    },
    killDefaultDragDrop: function () {
      document.ondragstart = function () {
        return false;
      };
    }
  };
  
  // TODO: Remove global variable
  window.Ad = {
    enums: {
      STAR_CHECKED_CLASS: 'info__star--checked'
    },
    adjustForOrientation: function () {
      this.el.querySelector('.mode--portrait').classList.toggle('hidden', !UI.isPortraitOrientation());
      this.el.querySelector('.mode--landscape').classList.toggle('hidden', UI.isPortraitOrientation());
    },
    // adjustSliderHeight: function () {
    //   this.slider.adjustTapeHeight();
    // },
    delegateEvents: function () {
      window.addEventListener('resize', this.onWindowResize);
    },
    onWindowResize: function () {
      this.adjustForOrientation();
      // this.adjustSliderHeight();
      if (!UI.isPortraitOrientation()) {
        this.el.style.width = '100%';
      }
    },
    initBanner: function () {
      helpers.DOMCollectionApply(this.el.querySelectorAll('.info__img'), function (image) {
        image.src = IMAGES[0];
      });
    },
    applyTitle: function () {
      helpers.DOMCollectionApply(this.el.querySelectorAll('.info__text'), function (titleEl) {
        titleEl.textContent = TITLE;
      });
    },
    applyRating: function () {
      helpers.DOMCollectionApply(this.el.querySelectorAll('[data-rating]'), function (starEl) {
        starEl.classList.remove(this.enums.STAR_CHECKED_CLASS);
        if ( window.parseInt(starEl.dataset.rating) <= RATING ) {
          starEl.classList.add(this.enums.STAR_CHECKED_CLASS);
        }
      }.bind(this))
    },
    show: function () {
      this.el.style.opacity = 1;
    },
    create: function () {
      this.el = document.querySelector('.dio-intint-container');
      this.slider = slider;
      this.slider.ad = this;
      this.onWindowResize = this.onWindowResize.bind(this);
      this.delegateEvents();
      this.adjustForOrientation();
      this.initBanner();
      this.applyTitle();
      this.applyRating();
      this.slider.create();
    }
  };
  
  var slider = {
    cache: {},
    currentSlideIndex: 0,
    imagesLoaded: 0,
    onBannerLoad: function (banner) {
      // this.adjustTapeHeight();
      this.imagesLoaded += 1;
      if (this.imagesLoaded === this.getSlideNodesCount()) {
        this.updateCardDeck();
        this.ad.show();
        window.setTimeout(function () {
          this.toggleAnimation(true);
        }.bind(this), 0);
        banner.removeEventListener('load', this.onBannerLoad);
      }
    },
    toggleAnimation: function (state) {
      this.tape.classList.toggle('tape--animated', state);
    },
    createSlides: function () {
      IMAGES.forEach(function (src, index) {
        var slideEl = this.createSlide(src);
        var img = slideEl.querySelector('img');
        this.tape.appendChild(slideEl);
        img.addEventListener('load', this.onBannerLoad.bind(this, img));
      }.bind(this));
    },
    createSlide: function (src) {
      var slideEl = document.createElement('div');
      var img = document.createElement('img');
      slideEl.classList.add('slider__slide');
      img.classList.add('dio-intint-banner');
      img.src = src;
      slideEl.appendChild(img);
      return slideEl;
    },
    // adjustTapeHeight: function () {
    //   this.tape.style.height =
    //     this.tape.children[this.currentSlideIndex].clientHeight + 'px';
    // },
    cacheCoords: function (x) {
      this.cache.x = x;
    },
    shouldSlide: function (x) {
      var DIFF_TO_SLIDE = 30;
      var delta = x - this.cache.x;
      var xAbs = Math.abs(delta);
      return [xAbs > DIFF_TO_SLIDE, delta];
    },
    resetActiveClass: function () {
      this.el.querySelector('.slider__slide--active').classList.remove('slider__slide--active');
    },
    addActiveClass: function () {
      this.getSlideNodes()[this.currentSlideIndex].classList.add('slider__slide--active');
    },
    performSlide: function (delta) {
      this.updateSlideIndex(delta);
      // this.adjustTapeHeight();
      this.resetActiveClass();
      this.addActiveClass();
      this.updateCardDeck();
    },
    updateSlideIndex: function (delta) {
      if (delta < 0 && this.canSlide('forward')) {
        this.currentSlideIndex += 1;
      } else if (delta > 0 && this.canSlide('backward')) {
        this.currentSlideIndex -= 1;
      }
    },
    slide: function (x) {
      var shouldSlideRes = this.shouldSlide(x);
      var shouldSlide = shouldSlideRes[0];
      var delta = shouldSlideRes[1];
      if (shouldSlide) {
        this.performSlide(delta);
      }
    },
    getSlideNodes: function () {
      return Array.prototype.slice.call(this.tape.children);
    },
    getSlideNodesCount: function () {
      return this.getSlideNodes().length;
    },
    setSlidesCount: function () {
      this.slidesCount = this.getSlideNodesCount();
    },
    setTape: function () {
      this.tape = this.el.querySelector('.slider__tape');
    },
    updateCardDeck: function () {
      var slides = this.getSlideNodes();
      var offset = slides.reduce(function (v, s, i) {
        if (i < this.currentSlideIndex) {
          return v + s.clientWidth;
        } return v;
      }.bind(this), 0);
      this.tape.style.left = (this.el.clientWidth / 2 - slides[this.currentSlideIndex].clientWidth / 2) - offset + 'px';
    },
    bindContext: function () {
      this.onWindowResize = this.onWindowResize.bind(this);
      this.onTouchstart = this.onTouchstart.bind(this);
      this.onTouchend = this.onTouchend.bind(this);
    },
    create: function () {
      this.el = document.querySelector('.dio-intint-slider');
      this.bindContext();
      this.setTape();
      this.createSlides();
      this.setSlidesCount();
      this.setInitialSlideIndex();
      this.addActiveClass();
      this.delegateEvents();
    },
    setInitialSlideIndex: function () {
      this.currentSlideIndex = Math.round(this.getSlideNodesCount() / 2) - 1;
    },
    // resetTapeOffset: function () {
    //   // this.tape.style.left = 0;
    // },
    canSlide: function (_case) {
      if (_case === 'backward') {
        return this.currentSlideIndex > 0;
      }
      return this.currentSlideIndex < this.slidesCount - 1;
    },
    onWindowResize: function () {
      this.toggleAnimation(false);
      this.updateCardDeck();
      window.setTimeout(function () {
        this.toggleAnimation(true);
      }.bind(this), 0);
    },
    delegateEvents: function () {
      this.el.addEventListener('touchstart', this.onTouchstart);
      this.el.addEventListener('mousedown', this.onTouchstart);
      this.el.addEventListener('touchend', this.onTouchend);
      this.el.addEventListener('mouseup', this.onTouchend);
      window.addEventListener('resize', this.onWindowResize);
    },
    onTouchstart: function (e) {
      var x = (e.changedTouches && e.changedTouches[0].clientX) || e.pageX;
      this.cacheCoords(x);
    },
    onTouchend: function (e) {
      var x = (e.changedTouches && e.changedTouches[0].clientX) || e.pageX;
      this.slide(x);
    }
  };
  
  UI.killDefaultDragDrop();
})();

/******/ (function(modules) { // webpackBootstrap
  /******/ 	// The module cache
  /******/ 	var installedModules = {};
  /******/
  /******/ 	// The require function
  /******/ 	function __webpack_require__(moduleId) {
    /******/
    /******/ 		// Check if module is in cache
    /******/ 		if(installedModules[moduleId]) {
      /******/ 			return installedModules[moduleId].exports;
      /******/ 		}
    /******/ 		// Create a new module (and put it into the cache)
    /******/ 		var module = installedModules[moduleId] = {
      /******/ 			i: moduleId,
      /******/ 			l: false,
      /******/ 			exports: {}
      /******/ 		};
    /******/
    /******/ 		// Execute the module function
    /******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    /******/
    /******/ 		// Flag the module as loaded
    /******/ 		module.l = true;
    /******/
    /******/ 		// Return the exports of the module
    /******/ 		return module.exports;
    /******/ 	}
  /******/
  /******/
  /******/ 	// expose the modules object (__webpack_modules__)
  /******/ 	__webpack_require__.m = modules;
  /******/
  /******/ 	// expose the module cache
  /******/ 	__webpack_require__.c = installedModules;
  /******/
  /******/ 	// define getter function for harmony exports
  /******/ 	__webpack_require__.d = function(exports, name, getter) {
    /******/ 		if(!__webpack_require__.o(exports, name)) {
      /******/ 			Object.defineProperty(exports, name, {
        /******/ 				configurable: false,
        /******/ 				enumerable: true,
        /******/ 				get: getter
        /******/ 			});
      /******/ 		}
    /******/ 	};
  /******/
  /******/ 	// define __esModule on exports
  /******/ 	__webpack_require__.r = function(exports) {
    /******/ 		Object.defineProperty(exports, '__esModule', { value: true });
    /******/ 	};
  /******/
  /******/ 	// getDefaultExport function for compatibility with non-harmony modules
  /******/ 	__webpack_require__.n = function(module) {
    /******/ 		var getter = module && module.__esModule ?
      /******/ 			function getDefault() { return module['default']; } :
      /******/ 			function getModuleExports() { return module; };
    /******/ 		__webpack_require__.d(getter, 'a', getter);
    /******/ 		return getter;
    /******/ 	};
  /******/
  /******/ 	// Object.prototype.hasOwnProperty.call
  /******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
  /******/
  /******/ 	// __webpack_public_path__
  /******/ 	__webpack_require__.p = "";
  /******/
  /******/
  /******/ 	// Load entry module and return exports
  /******/ 	return __webpack_require__(__webpack_require__.s = "./js/index.js");
  /******/ })
/************************************************************************/
/******/ ({
  
  /***/ "./js/Card.js":
  /*!********************!*\
    !*** ./js/Card.js ***!
    \********************/
  /*! no static exports found */
  /***/ (function(module, exports, __webpack_require__) {
    
    "use strict";
    eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.default = Card;\nfunction Card(mediator) {\n  this.width = 50;\n  this.height = 80;\n  this.speed = 10;\n  this.el = null;\n\n  this.mediatorEvents(mediator);\n}\n\nCard.prototype.mediatorEvents = function (mediator) {\n  mediator.subscribe('card/create', this.onCreateCard.bind(this));\n  mediator.subscribe('card/remove', this.onRemoveCard.bind(this));\n  mediator.subscribe('card/update-position', this.updatePosition.bind(this));\n};\n\nCard.prototype.isOnScreen = function () {\n  return this.el;\n};\n\nCard.prototype.onCreateCard = function (options) {\n  this.create(options);\n  this.mediator.publish('screen/add-card', this.el);\n};\n\nCard.prototype.onRemoveCard = function () {\n  this.el.remove();\n  this.el = null;\n};\n\nCard.prototype.create = function (options) {\n  this.el = document.createElement('div');\n  this.el.style.width = this.width + 'px';\n  this.el.style.height = this.height + 'px';\n  this.el.style.top = options.y + 'px';\n  this.el.style.left = options.x - options.offset + 'px';\n  this.el.classList.add('card');\n  this.el.classList.toggle('placeholder', options.isPlaceholder);\n};\n\nCard.prototype.getSpeed = function () {\n  return this.speed;\n};\n\nCard.prototype.getMetrics = function () {\n  return this.el.getBoundingClientRect();\n};\n\nCard.prototype.updatePosition = function (options) {\n  this.el.style.left = options.left + 'px';\n  this.el.style.top = options.top + 'px';\n};\n\n//# sourceURL=webpack:///./js/Card.js?");
    
    /***/ }),
  
  /***/ "./js/GameCore.js":
  /*!************************!*\
    !*** ./js/GameCore.js ***!
    \************************/
  /*! no static exports found */
  /***/ (function(module, exports, __webpack_require__) {
    
    "use strict";
    eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.default = GameCore;\nfunction GameCore(mediator) {\n  this.swipeCoordinates = {\n    startX: null,\n    startY: null,\n    releasedX: null,\n    releasedY: null,\n    moveX: null,\n    moveY: null\n  };\n\n  this.isPreview = true;\n  this.isSwipedProp = false;\n\n  this.mediatorEvents(mediator);\n}\n\nGameCore.prototype = {\n  mediatorEvents: function mediatorEvents(mediator) {\n    var setCoordinates = this.setCoordinates.bind(this);\n\n    mediator.subscribe('screen/touchend', function (coordinates) {\n      setCoordinates(coordinates);\n      this.throwCard();\n    }.bind(this));\n    mediator.subscribe('screen/touchstart', function (coordinates) {\n      setCoordinates(coordinates);\n      this.makePreviewStop();\n    }.bind(this));\n    mediator.subscribe('core/create-winscreen', this.createWinScreen.bind(this));\n    mediator.subscribe('core/calculate-hand-angle', this.calculateAngle.bind(this));\n    mediator.subscribe('screen/touchmove', function (coordinates) {\n      setCoordinates(coordinates);\n      this.updateIsSwiped();\n      this.setReleasedSide(coordinates.moveX);\n    }.bind(this));\n  },\n  setReleasedSide: function setReleasedSide(moveX) {\n    this.releasedSide = this.getCursorPosition(moveX);\n  },\n  setCoordinates: function setCoordinates(coordinates) {\n    for (var key in coordinates) {\n      if (coordinates.hasOwnProperty(key)) {\n        this.swipeCoordinates[key] = coordinates[key];\n      }\n    }\n  },\n  getReleasedSide: function getReleasedSide() {\n    return this.releasedSide;\n  },\n  createWinScreen: function createWinScreen() {\n    window.Ad.create();\n  },\n  getSwipeCoordinates: function getSwipeCoordinates() {\n    return this.swipeCoordinates;\n  },\n  updateIsSwiped: function updateIsSwiped() {\n    this.isSwipedProp = this.swipeCoordinates.startX !== this.swipeCoordinates.moveX || this.swipeCoordinates.startY !== this.swipeCoordinates.moveY;\n  },\n  isSwiped: function isSwiped() {\n    return this.isSwipedProp;\n  },\n  getCursorPosition: function getCursorPosition(releasedX) {\n    // TODO: Prevent all 'getScreenMetrics' calls\n    return releasedX < this.mediator.getScreenMetrics().width / 2 ? 'left' : 'right';\n  },\n  throwCard: function throwCard() {\n    if (!this.mediator.isCardOnScreen() && this.isSwiped() && this.canThrow()\n    // && this.isValidHandPosition()\n    ) {\n        this.mediator.publish('card/create', {\n          isPlaceholder: false,\n          x: this.swipeCoordinates.startX,\n          y: this.swipeCoordinates.startY,\n          offset: this.mediator.getHandMetrics().width / 2\n        });\n        this.requestAnimation(this.swipeCoordinates.releasedX - this.mediator.getBasketMetrics().width / 2, this.swipeCoordinates.releasedY);\n        this.mediator.publish('ui/hand-empty');\n      } else {\n      this.mediator.publish('ui/reset-hand-angle');\n    }\n  },\n  // isValidHandPosition: function () {\n  //   return this.swipeCoordinates.moveY > this.mediator.getScreenMetrics().height / 2 + this.mediator.getHandMetrics().width;\n  // },\n  // Map coordinates from browser's ones to Math ones\n  getCorrectCoordinates: function getCorrectCoordinates(value) {\n    return this.mediator.getScreenMetrics().height - value;\n  },\n  canThrow: function canThrow() {\n    return this.swipeCoordinates.startX && this.swipeCoordinates.startY;\n  },\n  // TODO: Why getting through params, instead of Class props?\n  requestAnimation: function requestAnimation(releasedX, releasedY) {\n    this.firstReleasedX = releasedX;\n\n    var hyperB = this.mediator.getScreenMetrics().height + this.mediator.getBasketMetrics().height;\n    var hyperA = hyperB / 1.75;\n\n    window.requestAnimationFrame(this.updateCardCoords.bind(this, this.swipeCoordinates.startX, this.getCorrectCoordinates(this.swipeCoordinates.startY), releasedX, this.getCorrectCoordinates(releasedY),\n    // parabolaParam\n    hyperA, hyperB));\n  },\n  isBasketCollision: function isBasketCollision() {\n    var basketRect = this.mediator.getBasketMetrics();\n    var elRect = this.mediator.getCardMetrics();\n    var basketHoleOnPictureDiff = 20;\n    var basketHoleDiffBottom = basketRect.height - basketHoleOnPictureDiff;\n    var basketHoleDiffTop = basketRect.height / 4;\n    var sideDiff = basketRect.width / 2;\n\n    if (elRect.left < basketRect.left + basketRect.width - sideDiff && elRect.left + elRect.width > basketRect.left + sideDiff && elRect.top < basketRect.top + basketHoleOnPictureDiff && elRect.height + elRect.top > basketRect.top + basketHoleOnPictureDiff) {\n      return true;\n    }\n  },\n  updateCardCoords: function updateCardCoords(x1, y1, x2, y2, hyperA, hyperB) {\n    var nextX = void 0;\n    var nextY = y2 + this.mediator.getCardSpeed();\n\n    if (this.releasedSide === 'left' || !this.releasedSide) {\n      nextX = -Math.sqrt(Math.pow(hyperA, 2) * (1 - Math.pow(nextY, 2) / Math.pow(hyperB, 2))) + hyperA + this.firstReleasedX;\n    } else if (this.releasedSide === 'right') {\n      nextX = Math.sqrt(Math.pow(hyperA, 2) * (1 - Math.pow(nextY, 2) / Math.pow(hyperB, 2))) + this.firstReleasedX - hyperA;\n    }\n    var cardLeft = window.parseInt(nextX);\n    var cardTop = this.mediator.getScreenMetrics().height - window.parseInt(nextY);\n\n    if (cardLeft > this.mediator.getScreenMetrics().width || cardTop > this.mediator.getScreenMetrics().height || cardLeft < 0 || cardTop < 0) {\n      this.mediator.publish('card/remove');\n      this.setCoordinates({\n        startX: null,\n        startY: null\n      });\n      this.mediator.publish('ui/reset-assets-classes');\n      return;\n    }\n\n    if (this.isBasketCollision() && !this.isPreview) {\n      this.mediator.publish('card/remove');\n      this.mediator.publish('ui/basket-hit');\n      this.mediator.publish('ui/show-winscreen');\n      return;\n    }\n\n    this.mediator.publish('card/update-position', {\n      left: cardLeft,\n      top: cardTop\n    });\n\n    window.requestAnimationFrame(this.updateCardCoords.bind(this, x2, y2, nextX, nextY, hyperA, hyperB));\n  },\n  preview: function preview(random) {\n    var handBox;\n\n    if (!this.card) {\n      handBox = this.mediator.getHandMetrics();\n      this.swipeCoordinates.startX = handBox.left + handBox.width / 2 + random;\n      this.swipeCoordinates.startY = handBox.top;\n      this.mediator.publish('card/create', {\n        isPlaceholder: true,\n        x: this.swipeCoordinates.startX,\n        y: this.swipeCoordinates.startY,\n        offset: handBox.width / 2\n      });\n      this.requestAnimation(this.swipeCoordinates.startX, this.swipeCoordinates.startY);\n    }\n  },\n  getRandomArbitrary: function getRandomArbitrary(min, max) {\n    return Math.random() * (max - min) + min;\n  },\n  stopPreview: function stopPreview() {\n    window.clearInterval(this.previewInterval);\n    this.mediator.publish('ui/hide-cta');\n    this.isPreview = false;\n  },\n  // TODO: Change formula for hand pre-throw \n  calculateAngle: function calculateAngle() {\n    var maxHeight = this.mediator.getScreenMetrics().width / 2,\n        deg,\n        cursorY = this.mediator.getScreenMetrics().height - this.swipeCoordinates.moveY;\n\n    if (cursorY > maxHeight) {\n      deg = 90;\n    } else {\n      deg = cursorY / maxHeight * 90;\n    }\n\n    this.mediator.publish('ui/update-hand-position', {\n      deg: deg\n    });\n  },\n  makePreviewStop: function makePreviewStop() {\n    this.shouldStopPreview = true;\n  },\n  startPreview: function startPreview() {\n    this.previewInterval = window.setInterval(function () {\n      var random;\n\n      if (this.shouldStopPreview) {\n        this.stopPreview();\n        return;\n      }\n\n      if (document.hasFocus()) {\n        random = this.getRandomArbitrary(-20, 20);\n        this.preview(random);\n      } else {\n        // TODO: Remove redundant link\n        if (this.card) {\n          this.card.remove();\n          this.card = null;\n        }\n      }\n    }.bind(this), 3000);\n  }\n};\n\n//# sourceURL=webpack:///./js/GameCore.js?");
    
    /***/ }),
  
  /***/ "./js/GameUI.js":
  /*!**********************!*\
    !*** ./js/GameUI.js ***!
    \**********************/
  /*! no static exports found */
  /***/ (function(module, exports, __webpack_require__) {
    
    "use strict";
    eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nvar GameUI = function () {\n  function GameUI(mediator) {\n    _classCallCheck(this, GameUI);\n\n    this.hand = document.querySelector('.hand');\n    this.basket = document.querySelector('.basket');\n    this.winScreen = document.querySelector('.win-screen');\n    this.cta = document.querySelector('.cta');\n\n    this.mediatorEvents(mediator);\n  }\n\n  _createClass(GameUI, [{\n    key: 'mediatorEvents',\n    value: function mediatorEvents(mediator) {\n      mediator.subscribe('screen/touchmove', this.trackHandPosition.bind(this));\n      mediator.subscribe('ui/reset-assets-classes', this.resetAssetsClasses.bind(this));\n      mediator.subscribe('ui/basket-hit', this.onBasketHit.bind(this));\n      mediator.subscribe('ui/show-winscreen', this.showWinScreen.bind(this));\n      mediator.subscribe('ui/update-hand-position', this.updateHandPosition.bind(this));\n      mediator.subscribe('ui/hide-cta', this.hideCta.bind(this));\n      mediator.subscribe('ui/reset-hand-angle', this.resetHandAnglePosition.bind(this));\n      mediator.subscribe('ui/hand-empty', this.applyHandEmptyClass.bind(this));\n    }\n  }, {\n    key: 'hideCta',\n    value: function hideCta() {\n      this.cta.style.display = 'none';\n    }\n  }, {\n    key: 'onBasketHit',\n    value: function onBasketHit() {\n      this.basket.classList.add('hit');\n    }\n  }, {\n    key: 'resetAssetsClasses',\n    value: function resetAssetsClasses() {\n      var _this = this;\n\n      window.setTimeout(function () {\n        _this.basket.classList.remove('hit');\n        _this.hand.classList.add('waiting');\n        // TODO: May be a problem\n        _this.resetHandAnglePosition();\n      }, 1000);\n    }\n  }, {\n    key: 'resetHandAnglePosition',\n    value: function resetHandAnglePosition() {\n      this.hand.classList.add('original');\n      this.hand.classList.remove('inverted');\n      this.hand.classList.remove('original-empty');\n      this.hand.classList.remove('inverted-empty');\n      this.hand.style.left = '';\n      this.hand.style.top = '';\n    }\n  }, {\n    key: 'showWinScreen',\n    value: function showWinScreen() {\n      var _this2 = this;\n\n      var onTransitionend = function onTransitionend(e) {\n        if (e.target === _this2.winScreen) {\n          _this2.mediator.publish('core/create-winscreen');\n          _this2.winScreen.removeEventListener('transitionend', onTransitionend);\n        }\n      };\n\n      this.winScreen.addEventListener('transitionend', onTransitionend);\n      this.winScreen.classList.add('show');\n    }\n  }, {\n    key: 'applyHandEmptyClass',\n    value: function applyHandEmptyClass() {\n      var releasedSide = this.mediator.getReleasedSide();\n      // TODO: Make it cross-browser\n      this.hand.classList.toggle('original-empty', releasedSide === 'left');\n      this.hand.classList.toggle('inverted-empty', releasedSide === 'right');\n    }\n  }, {\n    key: 'applyHandPositionClass',\n    value: function applyHandPositionClass() {\n      var releasedSide = this.mediator.getReleasedSide();\n      // TODO: Make it cross-browser\n      this.hand.classList.toggle('original', releasedSide === 'left');\n      this.hand.classList.toggle('inverted', releasedSide === 'right');\n    }\n  }, {\n    key: 'moveHand',\n    value: function moveHand() {\n      var swipeCoordinates = this.mediator.getSwipeCoordinates();\n      var cursorX = swipeCoordinates.moveX;\n      var cursorY = swipeCoordinates.moveY;\n\n      this.hand.style.left = cursorX + 'px';\n      this.hand.style.top = cursorY - this.hand.clientHeight / 2 + 'px';\n    }\n  }, {\n    key: 'getBasketMetrics',\n    value: function getBasketMetrics() {\n      return this.basket.getBoundingClientRect();\n    }\n  }, {\n    key: 'getHandMetrics',\n    value: function getHandMetrics() {\n      return this.hand.getBoundingClientRect();\n    }\n  }, {\n    key: 'trackHandPosition',\n    value: function trackHandPosition() {\n      var releasedSide = this.mediator.getReleasedSide();\n\n      // if ( !this.mediator.isValidHandPosition() ) {\n      //   return;\n      // }\n\n      this.mediator.publish('core/calculate-hand-angle');\n      // this.moveHand();\n      this.applyHandPositionClass(releasedSide);\n    }\n  }, {\n    key: 'updateHandPosition',\n    value: function updateHandPosition(options) {\n      var releasedSide = this.mediator.getReleasedSide();\n\n      this.hand.classList.remove('waiting');\n      this.hand.style.transform = 'rotate(' + (releasedSide === 'right' ? options.deg : -options.deg) + 'deg)';\n    }\n  }]);\n\n  return GameUI;\n}();\n\nexports.default = GameUI;\n\n//# sourceURL=webpack:///./js/GameUI.js?");
    
    /***/ }),
  
  /***/ "./js/Mediator.js":
  /*!************************!*\
    !*** ./js/Mediator.js ***!
    \************************/
  /*! no static exports found */
  /***/ (function(module, exports, __webpack_require__) {
    
    "use strict";
    eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();\n\nvar _PubSub2 = __webpack_require__(/*! ./PubSub */ \"./js/PubSub.js\");\n\nvar _PubSub3 = _interopRequireDefault(_PubSub2);\n\nvar _Screen = __webpack_require__(/*! ./Screen */ \"./js/Screen.js\");\n\nvar _Screen2 = _interopRequireDefault(_Screen);\n\nvar _Card = __webpack_require__(/*! ./Card */ \"./js/Card.js\");\n\nvar _Card2 = _interopRequireDefault(_Card);\n\nvar _GameCore = __webpack_require__(/*! ./GameCore */ \"./js/GameCore.js\");\n\nvar _GameCore2 = _interopRequireDefault(_GameCore);\n\nvar _GameUI = __webpack_require__(/*! ./GameUI */ \"./js/GameUI.js\");\n\nvar _GameUI2 = _interopRequireDefault(_GameUI);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\"); } return call && (typeof call === \"object\" || typeof call === \"function\") ? call : self; }\n\nfunction _inherits(subClass, superClass) { if (typeof superClass !== \"function\" && superClass !== null) { throw new TypeError(\"Super expression must either be null or a function, not \" + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // TODO: Refactor event names\n// TODO: Preview bug fix\n// TODO: isSwiped check doesn't work\n\n\n// Mediator\n// TODO: Is not compatible with SHIT Internet explorer\n// var mediator = Object.assign({\n//   create: function (screen) {\n//     this.screen = new Screen(screen);\n//     this.game = game;\n//    \n//     this.subscribe('screen/touchstart', this.game.onScreenTouchstart.bind(this));\n//     this.subscribe('screen/touchend', this.game.throwCard.bind(this));\n//     this.subscribe('screen/touchmove', this.game.trackHandPosition.bind(this));\n//    \n//     this.game.start();\n//   },\n//   getScreenMetrics: function () {\n//     return this.screen.el.getBoundingClientRect();\n//   }\n// }, pubSub);\n\nvar PlayableAdMediator = function (_PubSub) {\n  _inherits(PlayableAdMediator, _PubSub);\n\n  function PlayableAdMediator() {\n    _classCallCheck(this, PlayableAdMediator);\n\n    var _this = _possibleConstructorReturn(this, (PlayableAdMediator.__proto__ || Object.getPrototypeOf(PlayableAdMediator)).call(this));\n\n    _this.screen = new _Screen2.default(_this);\n    _this.card = new _Card2.default(_this);\n    _this.gameCore = new _GameCore2.default(_this);\n    _this.gameUI = new _GameUI2.default(_this);\n\n    _this.register(_this.screen, _this.card, _this.gameCore, _this.gameUI);\n\n    _this.gameCore.startPreview();\n    return _this;\n  }\n\n  _createClass(PlayableAdMediator, [{\n    key: 'register',\n    value: function register() {\n      var _this2 = this;\n\n      for (var _len = arguments.length, queue = Array(_len), _key = 0; _key < _len; _key++) {\n        queue[_key] = arguments[_key];\n      }\n\n      queue.forEach(function (p) {\n        p.mediator = _this2;\n      });\n    }\n  }, {\n    key: 'getScreenMetrics',\n    value: function getScreenMetrics() {\n      return this.screen.el.getBoundingClientRect();\n    }\n  }, {\n    key: 'isCardOnScreen',\n    value: function isCardOnScreen() {\n      return this.card.isOnScreen();\n    }\n  }, {\n    key: 'getSwipeCoordinates',\n    value: function getSwipeCoordinates() {\n      return this.gameCore.getSwipeCoordinates();\n    }\n  }, {\n    key: 'getBasketMetrics',\n    value: function getBasketMetrics() {\n      return this.gameUI.getBasketMetrics();\n    }\n  }, {\n    key: 'getHandMetrics',\n    value: function getHandMetrics() {\n      return this.gameUI.getHandMetrics();\n    }\n  }, {\n    key: 'getCardSpeed',\n    value: function getCardSpeed() {\n      return this.card.getSpeed();\n    }\n  }, {\n    key: 'getCardMetrics',\n    value: function getCardMetrics() {\n      return this.card.getMetrics();\n    }\n\n    // isValidHandPosition () {\n    //   return this.gameCore.isValidHandPosition();\n    // }\n\n  }, {\n    key: 'getReleasedSide',\n    value: function getReleasedSide() {\n      return this.gameCore.getReleasedSide();\n    }\n  }]);\n\n  return PlayableAdMediator;\n}(_PubSub3.default);\n\nexports.default = PlayableAdMediator;\n\n//# sourceURL=webpack:///./js/Mediator.js?");
    
    /***/ }),
  
  /***/ "./js/PubSub.js":
  /*!**********************!*\
    !*** ./js/PubSub.js ***!
    \**********************/
  /*! no static exports found */
  /***/ (function(module, exports, __webpack_require__) {
    
    "use strict";
    eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.default = PubSub;\nfunction PubSub() {\n  this.events = {};\n}\n\nPubSub.prototype = {\n  subscribe: function subscribe(event, cb) {\n    if (!this.events[event]) {\n      this.events[event] = [];\n    }\n\n    this.events[event].push(cb);\n  },\n  publish: function publish(event, data) {\n    if (Array.isArray(this.events[event])) {\n      this.events[event].forEach(function (cb) {\n        cb(data);\n      });\n    }\n  }\n};\n\n//# sourceURL=webpack:///./js/PubSub.js?");
    
    /***/ }),
  
  /***/ "./js/Screen.js":
  /*!**********************!*\
    !*** ./js/Screen.js ***!
    \**********************/
  /*! no static exports found */
  /***/ (function(module, exports, __webpack_require__) {
    
    "use strict";
    eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.default = Screen;\n// Screen\nfunction Screen(mediator) {\n  this.el = document.querySelector('.screen');\n  this.closeBtn = document.querySelector('.close-btn');\n\n  mediator.subscribe('screen/add-card', this.addCard.bind(this));\n  this.domEvents('add');\n}\n\nScreen.prototype = {\n  addCard: function addCard(card) {\n    this.el.appendChild(card);\n  },\n  onTouchstart: function onTouchstart(e) {\n    this.mediator.publish('screen/touchstart', {\n      startX: e.changedTouches && e.changedTouches[0].clientX,\n      startY: e.changedTouches && e.changedTouches[0].clientY\n    });\n  },\n  onTouchend: function onTouchend(e) {\n    this.mediator.publish('screen/touchend', {\n      releasedX: e.changedTouches && e.changedTouches[0].clientX,\n      releasedY: e.changedTouches && e.changedTouches[0].clientY\n    });\n  },\n  onTouchmove: function onTouchmove(e) {\n    this.mediator.publish('screen/touchmove', {\n      moveX: e.changedTouches && e.changedTouches[0].clientX,\n      moveY: e.changedTouches && e.changedTouches[0].clientY\n    });\n  },\n  remove: function remove() {\n    this.domEvents('remove');\n    this.el.parentElement.removeChild(this.el);\n  },\n  domEvents: function domEvents(state) {\n    this.el[state + 'EventListener']('touchstart', this.onTouchstart.bind(this));\n    this.el[state + 'EventListener']('touchend', this.onTouchend.bind(this));\n    this.el[state + 'EventListener']('touchmove', this.onTouchmove.bind(this));\n    this.closeBtn[state + 'EventListener']('click', this.remove.bind(this));\n  }\n};\n\n//# sourceURL=webpack:///./js/Screen.js?");
    
    /***/ }),
  
  /***/ "./js/index.js":
  /*!*********************!*\
    !*** ./js/index.js ***!
    \*********************/
  /*! no static exports found */
  /***/ (function(module, exports, __webpack_require__) {
    
    "use strict";
    eval("\n\nvar _Mediator = __webpack_require__(/*! ./Mediator */ \"./js/Mediator.js\");\n\nvar _Mediator2 = _interopRequireDefault(_Mediator);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nvar playableAd = new _Mediator2.default(); /* Old updateCardCoords\n                                                 * \n                                                 * updateCardCoords: function (x1, y1, x2, y2, hyperA, hyperB, releasedSide) {\n                                                     var nextX;\n                                                     // TODO: Straight line\n                                                     // var nextY = y2 + this.cardSpeed;\n                                                     // var nextX = x1 + (nextY - y1) * ((x2 - x1) / (y2 - y1));\n                                                     // TODO: Parabola\n                                                     // var nextY = y2 + this.cardSpeed;\n                                                     // var nextX = Math.pow(nextY, 2) / (2 * parabolaParam) + this.startHereX;\n                                                     // TODO: :Log(x)\n                                                     // var nextY = y2 + this.cardSpeed;\n                                                     // var logX = Math.pow(nextY, 2)/ 50000;\n                                                     // var nextX = -Math.pow(2, logX) + this.startHereX;\n                                                     // TODO: Hyperbola\n                                                     // var nextY = y2 + this.cardSpeed;\n                                                     // var nextX = Math.sqrt( Math.pow(hyperA, 2) * (Math.pow(nextY, 2) / Math.pow(hyperB, 2) + 1) ) + this.startHereX - hyperA;\n                                                     // TODO: Ellipsis\n                                                     var nextY = y2 + this.mediator.getCardSpeed();\n                                                     // var nextX = Math.sqrt( Math.pow(hyperA, 2) * (Math.pow(nextY, 2) / Math.pow(hyperB, 2) + 1) ) + this.startHereX - hyperA;\n                                                     // var nextX = Math.sqrt( Math.pow(hyperA, 2) * (1 - Math.pow(nextY, 2) / Math.pow(hyperB, 2)) ) + this.startHereX - hyperA;\n                                                     if (releasedSide === 'left') {\n                                                       nextX = -(Math.sqrt( Math.pow(hyperA, 2) * (1 - Math.pow(nextY, 2) / Math.pow(hyperB, 2)) )) +  hyperA + this.firstReleasedX;\n                                                     } else if (releasedSide === 'right') {\n                                                       nextX = Math.sqrt( Math.pow(hyperA, 2) * (1 - Math.pow(nextY, 2) / Math.pow(hyperB, 2)) ) + this.firstReleasedX - hyperA;\n                                                     }\n                                                     var cardLeft = window.parseInt(nextX);\n                                                     var cardTop = this.mediator.getScreenMetrics().height - window.parseInt(nextY);\n                                             \n                                                     if (\n                                                       cardLeft > this.mediator.getScreenMetrics().width || cardTop > this.mediator.getScreenMetrics().height ||\n                                                       cardLeft < 0 || cardTop < 0\n                                                     ) {\n                                                       this.removeCard();\n                                                       this.resetHandAnglePosition();\n                                                       return;\n                                                     }\n                                             \n                                                     if (this.isBasketCollision()) {\n                                                       this.removeCard();\n                                                       this.basket.classList.add('hit');\n                                                       this.win();\n                                                       this.resetHandAnglePosition();\n                                                       return;\n                                                     }\n                                             \n                                                     this.card.style.left = cardLeft + 'px';\n                                                     this.card.style.top = cardTop + 'px';\n                                             \n                                                     window.requestAnimationFrame(this.updateCardCoords.bind(this,\n                                                       x2,\n                                                       y2,\n                                                       nextX,\n                                                       nextY,\n                                                       hyperA,\n                                                       hyperB,\n                                                       releasedSide\n                                                     ));\n                                                   }\n                                                 * \n                                                 * */\n\n// this.hand.classList.remove('waiting');\n// var tg = this.getCorrectCoordinates(cursorY) / cursorX;\n// var angleRad = Math.atan(tg);\n// var angleDeg = angleRad * 180 / Math.PI;\n// var delta = 30;\n// angleDeg = releasedSide === 'right' ? angleDeg - delta : -angleDeg + delta;\n// this.hand.style.transform = 'rotate(' + angleDeg + 'deg)';\n\n/*\n* \n* \n* requestAnimation: function (releasedX, releasedY) {\n      // TODO: Parabola\n      // var parabolaParam;\n      // var param = 200;\n      // TODO: ???\n      this.firstReleasedX = releasedX;\n      this.releasedSide = this.getCursorPosition(releasedX);\n      // if (releasedX < this.mediator.getScreenMetrics().width / 2) {\n      //   parabolaParam = param;\n      // } else {\n      //   parabolaParam = -param;\n      // }\n      // TODO: Log(x)\n      // var parabolaParam = 500;\n      // TODO: Hyperbola, Ellipsis Params\n      var hyperB = this.mediator.getScreenMetrics().height + this.mediator.getBasketMetrics().height;\n      var hyperA = hyperB / 1.75;\n\n      window.requestAnimationFrame(this.updateCardCoords.bind(this,\n        this.swipeCoordinates.startX,\n        this.getCorrectCoordinates(this.swipeCoordinates.startY),\n        releasedX,\n        this.getCorrectCoordinates(releasedY),\n        // parabolaParam\n        hyperA,\n        hyperB,\n        releasedSide\n      ));\n    },\n* \n* */\n\n//# sourceURL=webpack:///./js/index.js?");
    
    /***/ })
  
  /******/ });