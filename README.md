
# Coloris

<img src="https://github.com/mdbassit/Coloris/blob/main/images/coloris-light-dark.png?raw=true" alt="Coloris in light and dark themes" width="473"/>

A lightweight and elegant JavaScript color picker. Written in vanilla ES6, no dependencies. Accessible.
Convert any text input field into a color field.

## Features

* Zero dependencies
* Very ease to use
* Customizable
* Dark theme
* Opacity support
* Color swatches
* Multiple color formats
* Fully accessible
* Works on all modern browsers (released after 2017)

## Getting Started

### Basic usage

Download the [latest version](https://github.com/mdbassit/Coloris/releases/latest), and add the script and style to your page:
```html
<link rel="stylesheet" href="coloris.min.css"/>
<script src="coloris.min.js"></script>
```

Or include from a CDN:
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/mdbassit/Coloris@main/dist/coloris.min.css"/>
<script src="https://cdn.jsdelivr.net/gh/mdbassit/Coloris@main/dist/coloris.min.js"></script>
```

Then just add the data-coloris attribute to your input fields:
```html
<input type="text" data-coloris>
```

That's it. All done!

### Options

```js
Coloris({
  parent: '.container',
  el: '.color-field',
  wrap: true,
  theme: 'light',
  margin: 2,
  format: 'mixed',
  swatches: [
    '#264653',
    '#2a9d8f',
    '#e9c46a',
    'rgb(244,162,97)',
    '#e76f51',
    '#d62828',
    '#023e8a',
    '#07b',
    '#0096c7',
    '#00b4d880',
    'rgba(0,119,182,0.8)',
  ]
});
```

### Closing the color picker

The color picker dialog can be closed by clicking anywhere on the page or by pressing the ESC on the keyboard.

If you would like to close the dialog programmatically, you can do so by calling the close() method:
```js
Coloris.close();
```

## Customize

### Theme

### Custom widget

## TODO

* Touch support
* Re-position on window resize

## License

Copyright (c) 2021 Momo Bassit.
**Coloris** is licensed under the [MIT license](https://github.com/mdbassit/Coloris/blob/main/LICENSE).

