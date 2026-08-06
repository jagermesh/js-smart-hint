# Smart Hint.

Simple, lightweight pure JavaScript component that implement customizable re-positioning hint.

## Demo

https://jagermesh.github.io/js-smart-hint/

Or just open [`demo.html`](./demo.html) directly in a browser — no build step needed.

## Installation

### As an ES module (npm / bundler)

~~~
npm install js-smart-hint
~~~

~~~js
import SmartHint from 'js-smart-hint';
~~~

### As a plain `<script>` tag

~~~html
<script src="https://unpkg.com/js-smart-hint/dist/smart-hint.min.js"></script>
~~~

This creates a global `window.SmartHint` you can use directly, exactly as in the examples below.

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

That's all.

Have fun. Send PR if you find any glitches or want to make improvements.

:)
