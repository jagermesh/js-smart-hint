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
        position:absolute;
        background-color:black;
        color:white;
        z-index:10000;
        max-width:400px;
        padding: 5px 10px 5px 10px;
        font-size:10pt;
        word-break: break-word;

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
        if (item.getAttribute && item.getAttribute(`${componentClass}-attached`)) {
          destroyHintRenderer(item);
          break;
        } else
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

      let currentTop, currentLeft;

      function saveMousePos(event) {
        const pageX = event.pageX || event.touches[0].pageX;
        const pageY = event.pageY || event.touches[0].pageY;
        currentLeft = pageX;
        currentTop = pageY;
      }

      function reposition() {
        const documentHeight = parseFloat(getComputedStyle(document.body, null).height.replace('px', ''));
        const documentWidth = parseFloat(getComputedStyle(document.body, null).width.replace('px', ''));
        const contentHeight = hintOverlay.offsetHeight;
        const contentWidth = hintOverlay.offsetWidth;
        let deltaTop = 0;
        let deltaLeft = 0;
        if (currentLeft + contentWidth > documentWidth) {
          deltaLeft = contentWidth;
        }
        if (currentTop + contentHeight > documentHeight) {
          deltaTop = contentHeight;
        }
        let newPosition = {
          left: currentLeft - deltaLeft + (deltaLeft > 0 ? -10 : 10),
          top: currentTop - deltaTop + (deltaTop > 0 ? -10 : 10)
        };
        const windowHeight = window.innerHeight;
        const windowScrollTop = window.scrollY;
        let relativeTop = newPosition.top - windowScrollTop;
        if (relativeTop + contentHeight > windowHeight) {
          newPosition.top = newPosition.top - ((relativeTop + contentHeight) - windowHeight) - 10;
        } else
        if (newPosition.top < windowScrollTop) {
          newPosition.top = windowScrollTop + 10;
        }
        hintOverlay.style.left = `${newPosition.left}px`;
        hintOverlay.style.top = `${newPosition.top}px`;
      }

      _this.move = function(event) {
        saveMousePos(event);
        reposition();
      };

      _this.destroy = function() {
        hintOverlay.remove();
      };

      let hintOverlay = document.createElement('div');
      hintOverlay.classList.add(`${componentClass}-container`);
      hintOverlay.classList.add(`${componentClass}-hide`);
      hintOverlay.style.color = params.fgColor;
      hintOverlay.style.backgroundColor = params.bgColor;

      params.beautify(hintOverlay, selector);

      document.body.appendChild(hintOverlay);

      saveMousePos(event);

      params.getContent(selector).then(function(content) {
        if (content) {
          hintOverlay.innerHTML = content;
          reposition();
          hintOverlay.classList.add(`${componentClass}-show`);
          hintOverlay.classList.remove(`${componentClass}-hide`);
        }
      })

      return _this;
    }

    function createHintRenderer(element, event, params) {
      if (!element.classList.contains(componentClass)) {
        element.classList.add(componentClass);
      }
      if (activeRenderer) {
        activeRenderer.destroy();
        activeRenderer = null;
      }
      activeRenderer = new Renderer(element, event, params);
      element.setAttribute(`${componentClass}-attached`, true);
    }

    function syncHintRenderer(event) {
      if (activeRenderer) {
        activeRenderer.move(event);
      }
    }

    function destroyHintRenderer(element) {
      if (activeRenderer) {
        activeRenderer.destroy();
        activeRenderer = null;
      }
      if (element) {
        element.removeAttribute(`${componentClass}-attached`);
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
        createHintRenderer(this, event, params)
      });

      delegate('mousemove', selector, function(event) {
        syncHintRenderer(event);
      });

      delegate('mouseleave', selector, function() {
        destroyHintRenderer(this);
      });
    };

    return _this;
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = SmartHint; else window.SmartHint = SmartHint;

})(window);
