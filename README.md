# Smart Hint.

Simple, lightweight pure JavaScript component that implement customizable re-positioning hint.

## Demo

https://jagermesh.github.io/js-smart-hint/

## Usage:

1) Include the script:

~~~
<script type="text/javascript" src="smart-hint.js"></script>
~~~

2) Create SmartHint instance

~~~
const hint = new SmartHint();
~~~

3) Attach where needed

~~~
hint.attach('.has-hint');
~~~

4) Customize if needed

~~~
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
