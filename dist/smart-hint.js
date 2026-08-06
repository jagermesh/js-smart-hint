(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["SmartHint"] = factory();
	else
		root["SmartHint"] = factory();
})(this, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	const __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter/value functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			if(Array.isArray(definition)) {
/******/ 				var i = 0;
/******/ 				while(i < definition.length) {
/******/ 					var key = definition[i++];
/******/ 					var binding = definition[i++];
/******/ 					if(!__webpack_require__.o(exports, key)) {
/******/ 						if(binding === 0) {
/******/ 							Object.defineProperty(exports, key, { enumerable: true, value: definition[i++] });
/******/ 						} else {
/******/ 							Object.defineProperty(exports, key, { enumerable: true, get: binding });
/******/ 						}
/******/ 					} else if(binding === 0) { i++; }
/******/ 				}
/******/ 			} else {
/******/ 				for(var key in definition) {
/******/ 					if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 						Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/************************************************************************/
let __webpack_exports__ = {};
/**
 * SmartHintRenderer is purely internal machinery: one instance is created per
 * currently-shown hint to handle its positioning/rendering. It is never
 * exported and consumers never interact with it directly.
 */
class SmartHintRenderer {
  #params;

  #H_EDGE_GAP = 40;
  #V_EDGE_GAP = 20;
  #POSITION_GAP = 20;

  #currentTop = null;
  #currentLeft = null;
  #currentClientTop = null;

  #hintOverlay;

  constructor(selector, event, params) {
    this.#params = params;

    this.#hintOverlay = document.createElement('div');
    this.#hintOverlay.classList.add(`${this.#params.componentClass}-container`);
    this.#hintOverlay.classList.add(`${this.#params.componentClass}-hide`);
    this.#hintOverlay.style.left = '0px';
    this.#hintOverlay.style.top = '0px';
    this.#hintOverlay.style.color = params.fgColor;
    this.#hintOverlay.style.backgroundColor = params.bgColor;

    params.beautify(this.#hintOverlay, selector);

    document.body.appendChild(this.#hintOverlay);

    this.#saveMousePos(event);

    params.getContent(selector).then((content) => {
      if (content) {
        this.#hintOverlay.innerHTML = content;
        this.#show();
      }
    });
  }

  #saveMousePos(event) {
    this.#currentLeft = event.pageX;
    this.#currentTop = event.pageY;
    this.#currentClientTop = event.clientY;
  }

  #reposition() {
    this.#hintOverlay.style.left = '0px';
    this.#hintOverlay.style.top = '0px';
    const windowWidth = window.innerWidth;
    const contentHeight = this.#hintOverlay.offsetHeight;
    const contentWidth = this.#hintOverlay.offsetWidth;

    let newPosition = { };

    newPosition.left = this.#currentLeft;
    if (this.#currentLeft + contentWidth + this.#H_EDGE_GAP > windowWidth) {
      newPosition.left = this.#currentLeft - contentWidth - this.#POSITION_GAP;
    }

    if (newPosition.left < 0) {
      newPosition.left = 0;
    }

    this.#hintOverlay.style.left = `${newPosition.left}px`;

    if (this.#currentClientTop - contentHeight - this.#V_EDGE_GAP < 0) {
      newPosition.top = this.#currentTop;
    } else {
      newPosition.top = this.#currentTop - this.#POSITION_GAP - contentHeight;
    }

    this.#hintOverlay.style.top = `${newPosition.top}px`;
  }

  move(event) {
    this.#saveMousePos(event);
    this.#reposition();
  }

  hide() {
    this.#hintOverlay.classList.remove(`${this.#params.componentClass}-show`);
    this.#hintOverlay.classList.add(`${this.#params.componentClass}-hide`);
  }

  #show() {
    if (this.#hintOverlay.innerHTML) {
      this.#reposition();
      this.#hintOverlay.classList.add(`${this.#params.componentClass}-show`);
      this.#hintOverlay.classList.remove(`${this.#params.componentClass}-hide`);
    }
  }

  destroy() {
    this.#hintOverlay.remove();
  }
}

/**
 * Public API. Create an instance, then call `.attach(selector, params)` for
 * every group of elements that should show a repositioning hint.
 */
class SmartHint {
  #componentClass;
  #activeRenderer = null;

  constructor() {
    this.#componentClass = 'smart-hint';
    const styleClass = `${this.#componentClass}-styles`;

    let stylesContainer = document.head.querySelectorAll(`style.${styleClass}`);

    if (stylesContainer.length === 0) {
      stylesContainer = document.createElement('style');
      stylesContainer.className = styleClass;
      stylesContainer.textContent = `
        .${this.#componentClass}-container {
          position: absolute;
          background-color: black;
          color: white;
          z-index: 10000;
          padding: 5px 10px 5px 10px;
          font-size: 10pt;
          overflow: hidden;
          margin: 10px;
          box-sizing: border-box;
          max-width: 400px;
          border: 1px solid #999;
          border: 1px solid rgba(0,0,0,.2);
          -webkit-border-radius: 6px;
          -moz-border-radius: 6px;
          border-radius: 6px;
          outline: 0;
          -webkit-box-shadow: 0 3px 7px rgba(0,0,0,.2);
          -moz-box-shadow: 0 3px 7px rgba(0,0,0,.2);
          box-shadow: 0 3px 7px rgba(0,0,0,.2);
          -webkit-background-clip: padding-box;
          -moz-background-clip: padding-box;
          background-clip: padding-box;
          opacity: 0.0001;
        }
        .${this.#componentClass}:hover {
          cursor: pointer;
        }
        .${this.#componentClass}-show {
          transition: opacity 400ms;
          -webkit-transition: opacity 400ms;
          opacity: 1;
        }
        .${this.#componentClass}-hide {
          transition: opacity 800ms;
          -webkit-transition: opacity 800ms;
          opacity: 0.0001;
        }
      `;
      document.head.append(stylesContainer);
    }

    const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if ((mutation.type === 'childList') && (mutation.removedNodes.length > 0)) {
          this.#checkForHintRenderer(mutation.removedNodes);
        }
      });
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
    });

  }

  #checkForHintRenderer(nodeList) {
    for (let i = 0; i < nodeList.length; i++) {
      let item = nodeList[i];
      if (item.smartHintRenderer) {
        this.#left(item);
      }
      if (item.childNodes) {
        this.#checkForHintRenderer(item.childNodes);
      }
    }
  }

  #entered(element, event, params) {
    if (!element.classList.contains(this.#componentClass)) {
      element.classList.add(this.#componentClass);
    }
    this.#moved(element, event, params);
  }

  #moved(element, event, params) {
    if (this.#activeRenderer && (this.#activeRenderer != element.smartHintRenderer)) {
      this.#activeRenderer.hide();
    }
    const wasNorenderer = !element.smartHintRenderer;
    if (wasNorenderer) {
      element.smartHintRenderer = new SmartHintRenderer(element, event, params);
    }
    this.#activeRenderer = element.smartHintRenderer;

    if (!wasNorenderer) {
      this.#activeRenderer.move(event);
    }
  }

  #left(element) {
    if (element.smartHintRenderer) {
      if (element.smartHintRenderer == this.#activeRenderer) {
        this.#activeRenderer = null;
      }
      element.smartHintRenderer.destroy();
      element.smartHintRenderer = null;
    }
  }

  #delegate(eventName, selector, handler) {
    document.addEventListener(eventName, (event) => {
      for (let target = event.target; target && target != this; target = target.parentNode) {
        if (target.matches && target.matches(selector)) {
          handler(target, event);
          break;
        }
      }
    }, true);
  }

  attach(selector, settings) {
    const params = Object.assign({
      bgColor: 'black',
      fgColor: 'white',
      getContent: (selector) => {
        return new Promise((resolve) => {
          resolve(selector.getAttribute('data-hint'));
        });
      },
      beautify: () => {
      //
      },
      componentClass: this.#componentClass,
    }, settings);

    this.#delegate('mouseenter', selector, (target, event) => {
      this.#entered(target, event, params);
    });

    this.#delegate('mousemove', selector, (target, event) => {
      this.#moved(target, event, params);
    });

    this.#delegate('mouseleave', selector, (target) => {
      this.#left(target);
    });
  }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (SmartHint);

/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "default", 0, /* export default binding */ __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ ]);

__webpack_exports__ = __webpack_exports__["default"];
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=smart-hint.js.map