
# Coloris

<img src="https://raw.githubusercontent.com/mdbassit/Coloris/gh-pages/images/coloris-light-dark.png" alt="Coloris in light and dark themes" width="473"/>

A lightweight and elegant JavaScript color picker written in vanilla ES6.  
Convert any text input field into a color field.

[**View demo**](https://coloris.js.org/examples.html)

## Features

* Zero dependencies
* Very easy to use
* Customizable
* Dark theme
* Opacity support
* Color swatches
* Multiple color formats
* Touch support
* Fully accessible
* Works on all modern browsers (no IE support)

## Getting Started

### Basic usage

Download the [latest version](https://github.com/mdbassit/Coloris/releases/latest), and add the script and style to your page:
```html
<link rel="stylesheet" href="coloris.min.css"/>
<script src="coloris.min.js"></script>
```

Or include from a CDN:
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/mdbassit/Coloris@latest/dist/coloris.min.css"/>
<script src="https://cdn.jsdelivr.net/gh/mdbassit/Coloris@latest/dist/coloris.min.js"></script>
```

Then just add the data-coloris attribute to your input fields:
```html
<input type="text" data-coloris>
```

That's it. All done!

### Options

```js
Coloris({
  // The default behavious is to append the color picker's dialog to the end of the document's
  // body. but it is possible to append it to a custom parent instead. This is especially useful
  // if the color fields are in a scrollable container and you want color picker' dialog to stay
  // anchored to them. You will need to set the position of the container to relative or absolute.
  parent: '.container',

  // A custom selector to bind the color picker to. This must point to input fields.
  el: '.color-field',

  // The bound input fields are wrapped in a div that adds a thumbnail showing the current color
  // and a button to open the color picker (for accessibility only). If you wish to keep your 
  // fields unaltered, set this to false, in which case you will lose the color thumbnail and 
  // the accessible button (not recommended).
  wrap: true,

  // Available themes: light, dark, polaroid, polaroid-dark.
  // More themes might be added in the future.
  theme: 'light',

  // The margin between the input fields and the color picker's dialog.
  margin: 2,

  // Set the prefered color string format:
  //  * hex: outputs #RRGGBB or #RRGGBBAA.
  //  * rgb: outputs rgb(R,G,B) or rgba(R,G,B,A).
  //  * mixed: defaults to #RRGGBB when alpha is 1, otherwise rgba(R,G,B,A).
  format: 'mixed',

  // An array of the desired color swatches to display. If omitted or the array is empty,
  // the color swatches will be disabled.
  swatches: [
    '#264653',
    '#2a9d8f',
    '#e9c46a',
    'rgb(244,162,97)',
    '#e76f51',
    '#d62828',
    'navy',
    '#07b',
    '#0096c7',
    '#00b4d880',
    'rgba(0,119,182,0.8)',
  ]
});
```

### Events

An "input" event is triggered on the bound input field whenever a new color is selected.  
A "change" event is triggered when the color picker is closed and if the color has changed since it was opened.

### Closing the color picker

The color picker dialog can be closed by clicking anywhere on the page or by pressing the ESC on the keyboard.

If you would like to close the dialog programmatically, you can do so by calling the close() method:
```js
// Close the dialog
Coloris.close();

// Close the dialog and trigger a change event if the color has changed
Coloris.close(true);
```

## License

Copyright (c) 2021 Momo Bassit.
**Coloris** is licensed under the [MIT license](https://github.com/mdbassit/Coloris/blob/main/LICENSE).
