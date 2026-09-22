# Smart Hint

Simple, lightweight pure JavaScript component that implement customizable re-positioning hint.

## Demo

Open `demo.html` from this repo directly in your browser (no build step required) to see it in action.

## Installation

### As an ES module (npm / bundler)

~~~
npm install @jagermesh/js-smart-hint
~~~

~~~js
import SmartHint from '@jagermesh/js-smart-hint';

const hint = new SmartHint();
hint.attach('.has-hint');
~~~

### As a plain `<script>` tag

~~~html
<script src="https://unpkg.com/@jagermesh/js-smart-hint/dist/smart-hint.min.js"></script>
<script>
  const hint = new window.SmartHint();
  hint.attach('.has-hint');
</script>
~~~

## Usage:

1) Create a `SmartHint` instance

~~~js
const hint = new SmartHint();
~~~

2) Attach where needed

~~~js
hint.attach('.has-hint');
~~~

By default, the hint content comes from the element's `data-hint` attribute.

3) Customize if needed

~~~js
hint.attach('.has-custom-hint', {
  getContent: function(selector) {
    return new Promise(function(resolve) {
      resolve('Hint Text');
    });
  },
  beautify: function(hintOverlay, selector) {
    hintOverlay.style.fontSize = `${Math.floor(Math.random() * 10)+8}pt`;
    hintOverlay.style.backgroundColor = 'red';
    hintOverlay.style.color = 'white';
  }
});
~~~

### Hints for canvas and other virtual targets

Elements drawn inside a canvas are not DOM nodes, so they cannot be matched by
`attach()`. Use the imperative API instead:

~~~js
hint.show('Move', pointerEvent);
hint.move(pointerEvent);
hint.hide();
~~~

`show()` accepts the same visual settings as `attach()`, plus an optional
`target` value passed to `beautify`:

~~~js
hint.show('Delete', pointerEvent, {
  bgColor: 'black',
  fgColor: 'white',
  target: fabricControl,
  beautify: function(hintOverlay, target) {
    hintOverlay.dataset.control = target.actionName;
  }
});
~~~

All three imperative methods return the `SmartHint` instance and can be
chained. `content` may be a string or a promise resolving to a string.
