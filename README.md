jquery-ticker
=============

A lightweight jQuery plugin for animating a simple news ticker


## Installation

Include script after the jQuery library:

```html
<script src="/path/to/jquery.ticker.js"></script>
```


## Usage

Add an HTML tag for the ticker container (like a `div` or a `span`) with one unordered list containing the ticker items inside. Other content may be inside the ticker container as well.

Ticker headlines (the `li` tags) may contain the following basic HTML tags: `<a>`, `<b>`, `<strong>`, `<i>`, `<em>`, `<u>`, and `<span>`.

```html
<div class="ticker">
  <strong>News:</strong>
  <ul>
    <li>Ticker item #1</li>
    <li>Ticker item #2</li>
    <li><em>Another</em> ticker item</li>
    ...
  </ul>
</div>
```

And initiate it

```javascript
$('.ticker').ticker();
```

You can even add some styling

```css
.ticker {
  width: 500px;
  margin: 10px auto;
}
 /* The HTML list gets replaced with a single div,
    which contains the active ticker item, so you
    can easily style that as well */
.ticker div {
  display: inline-block;
  word-wrap: break-word;
}
```


## Ticker Options

Ticker attributes can be set globally by setting properties of the `$.ticker.defaults` object or individually for each call to `ticker()` by passing a plain object to the options argument. Per-call options override the default options.

```javascript
$.fn.ticker.defaults = {
  random:        false, // Whether to display ticker items in a random order
  itemSpeed:     3000,  // The pause on each ticker item before being replaced
  cursorSpeed:   50,    // Speed at which the characters are typed
  pauseOnHover:  true,  // Whether to pause when the mouse hovers over the ticker
  finishOnHover: true,  // Whether or not to complete the ticker item instantly when moused over
  cursorOne:     '_',   // The symbol for the first part of the cursor
  cursorTwo:     '-',   // The symbol for the second part of the cursor
  fade:          true,  // Whether to fade between ticker items or not
  fadeInSpeed:   600,   // Speed of the fade-in animation
  fadeOutSpeed:  300    // Speed of the fade-out animation
};
```


## Authors

[Benjamin Harris](https://github.com/BenjaminRH)
