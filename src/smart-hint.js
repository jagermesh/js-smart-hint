const COMPONENT_CLASS = 'jm-smart-hint';
const STYLE_CLASS = `${COMPONENT_CLASS}-styles`;
const H_EDGE_GAP = 40;
const V_EDGE_GAP = 20;
const POSITION_GAP = 20;

const STYLE_CSS = `
  .${COMPONENT_CLASS}-container {
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
  .${COMPONENT_CLASS}:hover {
    cursor: pointer;
  }
  .${COMPONENT_CLASS}-show {
    transition: opacity 400ms;
    -webkit-transition: opacity 400ms;
    opacity: 1;
  }
  .${COMPONENT_CLASS}-hide {
    transition: opacity 800ms;
    -webkit-transition: opacity 800ms;
    opacity: 0.0001;
  }
`;

/**
 * SmartHintRenderer is purely internal machinery: one instance is created per
 * currently-shown hint to handle its positioning/rendering. It is never
 * exported and consumers never interact with it directly.
 */
class SmartHintRenderer {
  #currentTop = null;
  #currentLeft = null;
  #currentClientTop = null;

  #hintOverlay;

  constructor(selector, event, params) {
    this.#hintOverlay = document.createElement('div');
    this.#hintOverlay.classList.add(`${COMPONENT_CLASS}-container`);
    this.#hintOverlay.classList.add(`${COMPONENT_CLASS}-hide`);
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
    if (this.#currentLeft + contentWidth + H_EDGE_GAP > windowWidth) {
      newPosition.left = this.#currentLeft - contentWidth - POSITION_GAP;
    }

    if (newPosition.left < 0) {
      newPosition.left = 0;
    }

    this.#hintOverlay.style.left = `${newPosition.left}px`;

    if (this.#currentClientTop - contentHeight - V_EDGE_GAP < 0) {
      newPosition.top = this.#currentTop;
    } else {
      newPosition.top = this.#currentTop - POSITION_GAP - contentHeight;
    }

    this.#hintOverlay.style.top = `${newPosition.top}px`;
  }

  move(event) {
    this.#saveMousePos(event);
    this.#reposition();
  }

  hide() {
    this.#hintOverlay.classList.remove(`${COMPONENT_CLASS}-show`);
    this.#hintOverlay.classList.add(`${COMPONENT_CLASS}-hide`);
  }

  #show() {
    if (this.#hintOverlay.innerHTML) {
      this.#reposition();
      this.#hintOverlay.classList.add(`${COMPONENT_CLASS}-show`);
      this.#hintOverlay.classList.remove(`${COMPONENT_CLASS}-hide`);
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
  #activeRenderer = null;

  #imperativeRenderer = null;

  constructor() {
    let stylesContainer = document.head.querySelectorAll(`style.${STYLE_CLASS}`);

    if (stylesContainer.length === 0) {
      stylesContainer = document.createElement('style');
      stylesContainer.className = STYLE_CLASS;
      stylesContainer.textContent = STYLE_CSS;
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
    if (!element.classList.contains(COMPONENT_CLASS)) {
      element.classList.add(COMPONENT_CLASS);
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

    return this;
  }

  /**
   * Show a hint for a virtual target such as a canvas control.
   * @param {string|Promise<string>} content
   * @param {{pageX: number, pageY: number, clientY: number}} event
   * @param {{bgColor?: string, fgColor?: string, target?: *, beautify?: Function}} settings
   * @returns {SmartHint}
   */
  show(content, event, settings) {
    this.hide();

    const params = Object.assign({
      bgColor: 'black',
      fgColor: 'white',
      target: null,
      beautify: () => {
      //
      },
    }, settings);

    params.getContent = () => Promise.resolve(content);
    this.#imperativeRenderer = new SmartHintRenderer(params.target, event, params);
    return this;
  }

  /**
   * Move the currently visible imperative hint.
   * @param {{pageX: number, pageY: number, clientY: number}} event
   * @returns {SmartHint}
   */
  move(event) {
    this.#imperativeRenderer?.move(event);
    return this;
  }

  /**
   * Remove the currently visible imperative hint.
   * @returns {SmartHint}
   */
  hide() {
    this.#imperativeRenderer?.destroy();
    this.#imperativeRenderer = null;
    return this;
  }
}

export default SmartHint;
