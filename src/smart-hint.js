(function(window) {

  function SmartHint() {
    const _this = this;

    const componentClass = 'smart-hint';
    const styleClass = `${componentClass}-styles`;

    let stylesContainer = document.head.querySelectorAll(`style.${styleClass}`);
    let activeRenderer;

    if (stylesContainer.length === 0) {
      stylesContainer = document.createElement('style');
      stylesContainer.className = styleClass;
      stylesContainer.textContent = `
      .${componentClass}-container {
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
      }
      .${componentClass}:hover {
        cursor: pointer;
      }
      .${componentClass}-show {
        transition: opacity 400ms;
        -webkit-transition: opacity 400ms;
        opacity: 1;
      }
      .${componentClass}-hide {
        transition: opacity 800ms;
        -webkit-transition: opacity 800ms;
        opacity: 0;
      }
    `;
      document.head.append(stylesContainer);
    }

    const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

    function checkForHintRenderer(nodeList) {
      for (let i = 0; i < nodeList.length; i++) {
        let item = nodeList[i];
        if (item.smartHintRenderer) {
          left(item);
        }
        if (item.childNodes) {
          checkForHintRenderer(item.childNodes);
        }
      }
    }

    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if ((mutation.type === 'childList') && (mutation.removedNodes.length > 0)) {
          checkForHintRenderer(mutation.removedNodes);
        }
      });
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true
    });

    function Renderer(selector, event, params) {
      const _this = this;

      _this.element = selector;

      let currentTop;
      let currentLeft;
      let currentClientTop;

      function saveMousePos(event) {
        currentLeft = event.pageX;
        currentTop = event.pageY;
        currentClientTop = event.clientY;
      }

      function reposition() {
        hintOverlay.style.left = '0px';
        hintOverlay.style.top = '0px';

        const windowWidth = window.innerWidth;
        const contentHeight = hintOverlay.getBoundingClientRect().height;
        const contentWidth = hintOverlay.getBoundingClientRect().width;

        let newPosition = { };
        if (currentClientTop - contentHeight - 20 < 0) {
          newPosition.top = currentTop;
        } else {
          newPosition.top = currentTop - contentHeight - 20;
        }

        newPosition.left = currentLeft;
        if (currentLeft + contentWidth + 20 > windowWidth) {
          newPosition.left = (windowWidth - contentWidth) - 20;
        }

        if (newPosition.left < 0) {
          newPosition.left = 0;
        }

        hintOverlay.style.left = `${newPosition.left}px`;
        hintOverlay.style.top = `${newPosition.top}px`;
      }

      _this.move = function(event) {
        saveMousePos(event);
        reposition();
      };

      _this.hide = function() {
        hintOverlay.classList.remove(`${componentClass}-show`);
        hintOverlay.classList.add(`${componentClass}-hide`);
      };

      _this.show = function() {
        if (hintOverlay.innerHTML) {
          hintOverlay.classList.add(`${componentClass}-show`);
          hintOverlay.classList.remove(`${componentClass}-hide`);
        }
      };

      _this.destroy = function() {
        hintOverlay.remove();
      };

      let hintOverlay = document.createElement('div');
      hintOverlay.classList.add(`${componentClass}-container`);
      hintOverlay.classList.add(`${componentClass}-hide`);
      hintOverlay.style.left = '0px';
      hintOverlay.style.top = '0px';
      hintOverlay.style.color = params.fgColor;
      hintOverlay.style.backgroundColor = params.bgColor;

      params.beautify(hintOverlay, selector);

      document.body.appendChild(hintOverlay);

      saveMousePos(event);

      params.getContent(selector).then(function(content) {
        if (content) {
          hintOverlay.innerHTML = content;
          hintOverlay.classList.add(`${componentClass}-show`);
          hintOverlay.classList.remove(`${componentClass}-hide`);
        }
      })

      return _this;
    }

    function entered(element, event, params) {
      if (!element.classList.contains(componentClass)) {
        element.classList.add(componentClass);
      }
      moved(element, event, params);
    }

    function moved(element, event, params) {
      if (activeRenderer && (activeRenderer != element.smartHintRenderer)) {
        activeRenderer.hide();
      }
      if (element.smartHintRenderer) {
        element.smartHintRenderer.show();
      } else {
        element.smartHintRenderer = new Renderer(element, event, params);
      }
      activeRenderer = element.smartHintRenderer;
      activeRenderer.move(event);
    }

    function left(element) {
      if (element.smartHintRenderer) {
        if (element.smartHintRenderer == activeRenderer) {
          activeRenderer = null;
        }
        element.smartHintRenderer.destroy();
        element.smartHintRenderer = null;
      }
    }

    function delegate(eventName, selector, handler) {
      document.addEventListener(eventName, function(event) {
        for (let target = event.target; target && target != this; target = target.parentNode) {
          if (target.matches(selector)) {
            handler.call(target, event);
            break;
          }
        }
      }, true);
    }

    _this.attach = function(selector, settings) {
      const params = Object.assign({
        bgColor: 'black',
        fgColor: 'white',
        getContent: function(selector) {
          return new Promise(function(resolve) {
            resolve(selector.getAttribute('data-hint'));
          });
        },
        beautify: function() {
        //
        }
      }, settings);

      delegate('mouseenter', selector, function(event) {
        entered(this, event, params)
      });

      delegate('mousemove', selector, function(event) {
        moved(this, event, params);
      });

      delegate('mouseleave', selector, function() {
        left(this);
      });
    };

    return _this;
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = SmartHint; else window.SmartHint = SmartHint;

})(window);
