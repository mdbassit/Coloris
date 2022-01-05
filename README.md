
# Coloris

![Coloris in light, dark and polaroid themes](https://raw.githubusercontent.com/mdbassit/Coloris/gh-pages/images/coloris-light-dark-polaroid.jpg)

A lightweight and elegant JavaScript color picker written in vanilla ES6.  
Convert any text input field into a color field.

[**View demo**](https://coloris.js.org/examples.html)

## Features

* Zero dependencies
* Very easy to use
* Customizable
* Themes and dark mode
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

### What about NPM and TypeScript?

Thanks to [@melloware](https://github.com/melloware), NPM and TypeScript support is available in a fork of this project. Head over to [@melloware's fork](https://github.com/melloware/coloris-npm) or to their [NPM repo](https://www.npmjs.com/package/@melloware/coloris) for more information.

### Options

```js
Coloris({
  // The default behavior is to append the color picker's dialog to the end of the document's
  // body. but it is possible to append it to a custom parent instead. This is especially useful
  // if the color fields are in a scrollable container and you want color picker' dialog to stay
  // anchored to them. You will need to set the position of the container to relative or absolute.
  // Note: This should be a scrollable container with enough space to display the picker.
  parent: '.container',

  // A custom selector to bind the color picker to. This must point to input fields.
  el: '.color-field',

  // The bound input fields are wrapped in a div that adds a thumbnail showing the current color
  // and a button to open the color picker (for accessibility only). If you wish to keep your
  // fields unaltered, set this to false, in which case you will lose the color thumbnail and
  // the accessible button (not recommended).
  // Note: This only works if you specify a custom selector to bind the picker (option above),
  // it doesn't work on the default [data-coloris] attribute selector.
  wrap: true,

  // Available themes: default, large, polaroid.
  // More themes might be added in the future.
  theme: 'default',

  // Set the theme to light or dark mode:
  // * light: light mode (default).
  // * dark: dark mode.
  // * auto: automatically enables dark mode when the user prefers a dark color scheme.
  themeMode: 'light',

  // The margin in pixels between the input fields and the color picker's dialog.
  margin: 2,

  // Set the preferred color string format:
  // * hex: outputs #RRGGBB or #RRGGBBAA (default).
  // * rgb: outputs rgb(R, G, B) or rgba(R, G, B, A).
  // * hsl: outputs hsl(H, S, L) or hsla(H, S, L, A).
  // * auto: guesses the format from the active input field. Defaults to hex if it fails.
  // * mixed: outputs #RRGGBB when alpha is 1; otherwise rgba(R, G, B, A).
  format: 'hex',

  // Set to true to enable format toggle buttons in the color picker dialog.
  // This will also force the format (above) to auto.
  formatToggle: false,

  // Enable or disable alpha support.
  // When disabled, it will strip the alpha value from the existing color value in all formats.
  alpha: true,

  // Set to true to hide all the color picker widgets (spectrum, hue, ...) except the swatches.
  swatchesOnly: false,

  // Focus the color value input when the color picker dialog is opened.
  focusInput: true,

  // Show an optional clear button and set its label
  clearButton: {
    show: true,
    label: 'Clear'
  },

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
    'rgba(0,119,182,0.8)'
  ]
});
```

### Accessibility and internationalization

Several labels are used to describe the various widgets of the color picker, which can be read aloud by a screen reader for people with low vision. If you wish to customize or translate those labels, you need to add an "a11y" option to the global Coloris object:

```js
Coloris({
  a11y: {
    open: 'Open color picker',
    close: 'Close color picker',
    marker: 'Saturation: {s}. Brightness: {v}.',
    hueSlider: 'Hue slider',
    alphaSlider: 'Opacity slider',
    input: 'Color value field',
    format: 'Color format',
    swatch: 'Color swatch',
    instruction: 'Saturation and brightness selector. Use up, down, left and right arrow keys to select.'
  }
});
```

### Events

An `input` event is triggered on the bound input field whenever a new color is selected.  
A `change` event is triggered when the color picker is closed and if the color has changed since it was opened.

### Closing the color picker

The color picker dialog can be closed by clicking anywhere on the page or by pressing the ESC on the keyboard. The later will also revert the color to its original value.

If you would like to close the dialog programmatically, you can do so by calling the close() method:
```js
// Close the dialog
Coloris.close();

// Close the dialog and revert the color to its original value
Coloris.close(true);
```

## Building from source

Clone the git repo:
```bash
git clone git@github.com:mdbassit/Coloris.git
```

Enter the Coloris directory and install the development dependencies:
```bash
cd Coloris && npm install
```

Run the build script:
```bash
npm run build
```
The built version will be in the `dist` directory in both minified and full copies.

Alternatively, you can start a gulp watch task to automatically build when the source files are modified:
```bash
npm run start
```

## License

Copyright (c) 2021 Momo Bassit.  
**Coloris** is licensed under the [MIT license](https://github.com/mdbassit/Coloris/blob/main/LICENSE).
