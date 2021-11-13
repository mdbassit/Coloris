 /*!
 * Copyright (c) 2021 Momo Bassit.
 * Licensed under the MIT License (MIT)
 * https://github.com/mdbassit/Coloris
 */

(function (window, document, Math) {
  var ctx = document.createElement('canvas').getContext('2d');
  var currentColor = { r: 0, g: 0, b: 0, h: 0, s: 0, v: 0, a: 1 };
  var picker, colorArea, colorAreaDims, colorMarker, colorPreview, colorValue, clearButton,
  hueSlider, hueMarker, alphaSlider, alphaMarker, currentEl, currentFormat, oldColor;

  // Default settings
  var settings = {
    el: '[data-coloris]',
    parent: null,
    theme: 'default',
    themeMode: 'light',
    wrap: true,
    margin: 2,
    format: 'hex',
    formatToggle: false,
    swatches: [],
    alpha: true,
    clearButton: {
      show: false,
      label: 'Clear' },

    a11y: {
      open: 'Open color picker',
      close: 'Close color picker',
      marker: 'Saturation: {s}. Brightness: {v}.',
      hueSlider: 'Hue slider',
      alphaSlider: 'Opacity slider',
      input: 'Color value field',
      format: 'Color format',
      swatch: 'Color swatch',
      instruction: 'Saturation and brightness selector. Use up, down, left and right arrow keys to select.' } };



  /**
   * Configure the color picker.
   * @param {object} options Configuration options.
   */
  function configure(options) {
    if (typeof options !== 'object') {
      return;
    }

    for (var key in options) {
      switch (key) {
        case 'el':
          bindFields(options.el);
          if (options.wrap !== false) {
            wrapFields(options.el);
          }
          break;
        case 'parent':
          settings.parent = document.querySelector(options.parent);
          if (settings.parent) {
            settings.parent.appendChild(picker);
          }
          break;
        case 'themeMode':
          settings.themeMode = options.themeMode;
          if (options.themeMode === 'auto' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            settings.themeMode = 'dark';
          }
        // The lack of a break statement is intentional
        case 'theme':
          if (options.theme) {
            settings.theme = options.theme;
          }
          picker.className = "clr-picker clr-" + settings.theme + " clr-" + settings.themeMode;
          break;
        case 'margin':
          options.margin *= 1;
          settings.margin = !isNaN(options.margin) ? options.margin : settings.margin;
          break;
        case 'wrap':
          if (options.el && options.wrap) {
            wrapFields(options.el);
          }
          break;
        case 'format':
          settings.format = options.format;
          break;
        case 'formatToggle':
          getEl('clr-format').style.display = options.formatToggle ? 'block' : 'none';
          if (options.formatToggle) {
            settings.format = 'auto';
          }
          break;
        case 'swatches':
          if (Array.isArray(options.swatches)) {(function () {
              var swatches = [];

              options.swatches.forEach(function (swatch, i) {
                swatches.push("<button id=\"clr-swatch-" + i + "\" aria-labelledby=\"clr-swatch-label clr-swatch-" + i + "\" style=\"color: " + swatch + ";\">" + swatch + "</button>");
              });

              if (swatches.length) {
                getEl('clr-swatches').innerHTML = "<div>" + swatches.join('') + "</div>";
              }})();
          }
          break;
        case 'alpha':
          settings.alpha = !!options.alpha;
          picker.setAttribute('data-alpha', settings.alpha);
          break;
        case 'clearButton':
          var display = 'none';

          if (options.clearButton.show) {
            display = 'block';
          }

          if (options.clearButton.label) {
            clearButton.innerHTML = options.clearButton.label;
          }

          clearButton.style.display = display;
          break;
        case 'a11y':
          var labels = options.a11y;
          var update = false;

          if (typeof labels === 'object') {
            for (var label in labels) {
              if (labels[label] && settings.a11y[label]) {
                settings.a11y[label] = labels[label];
                update = true;
              }
            }
          }

          if (update) {
            var openLabel = getEl('clr-open-label');
            var swatchLabel = getEl('clr-swatch-label');

            openLabel.innerHTML = settings.a11y.open;
            swatchLabel.innerHTML = settings.a11y.swatch;
            colorPreview.setAttribute('aria-label', settings.a11y.close);
            hueSlider.setAttribute('aria-label', settings.a11y.hueSlider);
            alphaSlider.setAttribute('aria-label', settings.a11y.alphaSlider);
            colorValue.setAttribute('aria-label', settings.a11y.input);
            colorArea.setAttribute('aria-label', settings.a11y.instruction);
          }}

    }
  }

  /**
   * Bind the color picker to input fields that match the selector.
   * @param {string} selector One or more selectors pointing to input fields.
   */
  function bindFields(selector) {
    // Show the color picker on click on the input fields that match the selector
    addListener(document, 'click', selector, function (event) {
      var parent = settings.parent;
      var coords = event.target.getBoundingClientRect();
      var scrollY = window.scrollY;
      var reposition = { left: false, top: false };
      var offset = { x: 0, y: 0 };
      var left = coords.x;
      var top = scrollY + coords.y + coords.height + settings.margin;

      currentEl = event.target;
      oldColor = currentEl.value;
      currentFormat = getColorFormatFromStr(oldColor);
      picker.classList.add('clr-open');

      var pickerWidth = picker.offsetWidth;
      var pickerHeight = picker.offsetHeight;

      // If the color picker is inside a custom container
      // set the position relative to it
      if (parent) {
        var style = window.getComputedStyle(parent);
        var marginTop = parseFloat(style.marginTop);
        var borderTop = parseFloat(style.borderTopWidth);

        offset = parent.getBoundingClientRect();
        offset.y += borderTop + scrollY;
        left -= offset.x;
        top -= offset.y;

        if (left + pickerWidth > parent.clientWidth) {
          left += coords.width - pickerWidth;
          reposition.left = true;
        }

        if (top + pickerHeight > parent.clientHeight - marginTop) {
          top -= coords.height + pickerHeight + settings.margin * 2;
          reposition.top = true;
        }

        top += parent.scrollTop;

        // Otherwise set the position relative to the whole document
      } else {
        if (left + pickerWidth > document.documentElement.clientWidth) {
          left += coords.width - pickerWidth;
          reposition.left = true;
        }

        if (top + pickerHeight - scrollY > document.documentElement.clientHeight) {
          top = scrollY + coords.y - pickerHeight - settings.margin;
          reposition.top = true;
        }
      }

      picker.classList.toggle('clr-left', reposition.left);
      picker.classList.toggle('clr-top', reposition.top);
      picker.style.left = left + "px";
      picker.style.top = top + "px";
      colorAreaDims = {
        width: colorArea.offsetWidth,
        height: colorArea.offsetHeight,
        x: picker.offsetLeft + colorArea.offsetLeft + offset.x,
        y: picker.offsetTop + colorArea.offsetTop + offset.y };


      setColorFromStr(oldColor);
      colorValue.focus({ preventScroll: true });
    });

    // Update the color preview of the input fields that match the selector
    addListener(document, 'input', selector, function (event) {
      var parent = event.target.parentNode;

      // Only update the preview if the field has been previously wrapped
      if (parent.classList.contains('clr-field')) {
        parent.style.color = event.target.value;
      }
    });
  }

  /**
   * Wrap the linked input fields in a div that adds a color preview.
   * @param {string} selector One or more selectors pointing to input fields.
   */
  function wrapFields(selector) {
    document.querySelectorAll(selector).forEach(function (field) {
      var parentNode = field.parentNode;

      if (!parentNode.classList.contains('clr-field')) {
        var wrapper = document.createElement('div');

        wrapper.innerHTML = "<button aria-labelledby=\"clr-open-label\"></button>";
        parentNode.insertBefore(wrapper, field);
        wrapper.setAttribute('class', 'clr-field');
        wrapper.style.color = field.value;
        wrapper.appendChild(field);
      }
    });
  }

  /**
   * Close the color picker.
   * @param {boolean} [revert] If true, revert the color to the original value.
   */
  function closePicker(revert) {
    if (currentEl) {
      // Revert the color to the original value if needed
      if (revert && oldColor !== currentEl.value) {
        currentEl.value = oldColor;

        // Trigger an "input" event to force update the thumbnail next to the input field
        currentEl.dispatchEvent(new Event('input', { bubbles: true }));
      }

      if (oldColor !== currentEl.value) {
        currentEl.dispatchEvent(new Event('change', { bubbles: true }));
      }

      picker.classList.remove('clr-open');
      currentEl.focus({ preventScroll: true });
      currentEl = null;
    }
  }

  /**
   * Set the active color from a string.
   * @param {string} str String representing a color.
   */
  function setColorFromStr(str) {
    var rgba = strToRGBA(str);
    var hsva = RGBAtoHSVA(rgba);

    updateMarkerA11yLabel(hsva.s, hsva.v);
    updateColor(rgba, hsva);

    // Update the UI
    hueSlider.value = hsva.h;
    picker.style.color = "hsl(" + hsva.h + ", 100%, 50%)";
    hueMarker.style.left = hsva.h / 360 * 100 + "%";

    colorMarker.style.left = colorAreaDims.width * hsva.s / 100 + "px";
    colorMarker.style.top = colorAreaDims.height - colorAreaDims.height * hsva.v / 100 + "px";

    alphaSlider.value = hsva.a * 100;
    alphaMarker.style.left = hsva.a * 100 + "%";
  }

  /**
   * Guess the color format from a string.
   * @param {string} str String representing a color.
   * @return {string} The color format.
   */
  function getColorFormatFromStr(str) {
    var format = str.substring(0, 3).toLowerCase();

    if (format === 'rgb' || format === 'hsl') {
      return format;
    }

    return 'hex';
  }

  /**
   * Copy the active color to the linked input field.
   * @param {number} [color] Color value to override the active color.
   */
  function pickColor(color) {
    if (currentEl) {
      currentEl.value = color || colorValue.value;
      currentEl.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  /**
   * Set the active color based on a specific point in the color gradient.
   * @param {number} x Left position.
   * @param {number} y Top position.
   */
  function setColorAtPosition(x, y) {
    var hsva = {
      h: hueSlider.value * 1,
      s: x / colorAreaDims.width * 100,
      v: 100 - y / colorAreaDims.height * 100,
      a: alphaSlider.value / 100 };

    var rgba = HSVAtoRGBA(hsva);

    updateMarkerA11yLabel(hsva.s, hsva.v);
    updateColor(rgba, hsva);
    pickColor();
  }

  /**
   * Update the color marker's accessibility label.
   * @param {number} saturation
   * @param {number} value
   */
  function updateMarkerA11yLabel(saturation, value) {
    var label = settings.a11y.marker;

    saturation = saturation.toFixed(1) * 1;
    value = value.toFixed(1) * 1;
    label = label.replace('{s}', saturation);
    label = label.replace('{v}', value);
    colorMarker.setAttribute('aria-label', label);
  }

  //
  /**
   * Get the pageX and pageY positions of the pointer.
   * @param {object} event The MouseEvent or TouchEvent object.
   * @return {object} The pageX and pageY positions.
   */
  function getPointerPosition(event) {
    return {
      pageX: event.changedTouches ? event.changedTouches[0].pageX : event.pageX,
      pageY: event.changedTouches ? event.changedTouches[0].pageY : event.pageY };

  }

  /**
   * Move the color marker when dragged.
   * @param {object} event The MouseEvent object.
   */
  function moveMarker(event) {
    var pointer = getPointerPosition(event);
    var x = pointer.pageX - colorAreaDims.x;
    var y = pointer.pageY - colorAreaDims.y;

    if (settings.parent) {
      y += settings.parent.scrollTop;
    }

    x = x < 0 ? 0 : x > colorAreaDims.width ? colorAreaDims.width : x;
    y = y < 0 ? 0 : y > colorAreaDims.height ? colorAreaDims.height : y;

    colorMarker.style.left = x + "px";
    colorMarker.style.top = y + "px";

    setColorAtPosition(x, y);

    // Prevent scrolling while dragging the marker
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * Move the color marker when the arrow keys are pressed.
   * @param {number} offsetX The horizontal amount to move.
   * * @param {number} offsetY The vertical amount to move.
   */
  function moveMarkerOnKeydown(offsetX, offsetY) {
    var x = colorMarker.style.left.replace('px', '') * 1 + offsetX;
    var y = colorMarker.style.top.replace('px', '') * 1 + offsetY;

    colorMarker.style.left = x + "px";
    colorMarker.style.top = y + "px";

    setColorAtPosition(x, y);
  }

  /**
   * Update the color picker's input field and preview thumb.
   * @param {Object} rgba Red, green, blue and alpha values.
   * @param {Object} [hsva] Hue, saturation, value and alpha values.
   */
  function updateColor(rgba, hsva) {if (rgba === void 0) {rgba = {};}if (hsva === void 0) {hsva = {};}
    var format = settings.format;

    for (var key in rgba) {
      currentColor[key] = rgba[key];
    }

    for (var _key in hsva) {
      currentColor[_key] = hsva[_key];
    }

    var hex = RGBAToHex(currentColor);
    var opaqueHex = hex.substring(0, 7);

    colorMarker.style.color = opaqueHex;
    alphaMarker.parentNode.style.color = opaqueHex;
    alphaMarker.style.color = hex;
    colorPreview.style.color = hex;

    // Force repaint the color and alpha gradients as a workaround for a Google Chrome bug
    colorArea.style.display = 'none';
    colorArea.offsetHeight;
    colorArea.style.display = '';
    alphaMarker.nextElementSibling.style.display = 'none';
    alphaMarker.nextElementSibling.offsetHeight;
    alphaMarker.nextElementSibling.style.display = '';

    if (format === 'mixed') {
      format = currentColor.a === 1 ? 'hex' : 'rgb';
    } else if (format === 'auto') {
      format = currentFormat;
    }

    switch (format) {
      case 'hex':
        colorValue.value = hex;
        break;
      case 'rgb':
        colorValue.value = RGBAToStr(currentColor);
        break;
      case 'hsl':
        colorValue.value = HSLAToStr(HSVAtoHSLA(currentColor));
        break;}


    // Select the current format in the format switcher
    document.querySelector(".clr-format [value=\"" + format + "\"]").checked = true;
  }

  /**
   * Set the hue when its slider is moved.
   */
  function setHue() {
    var hue = hueSlider.value * 1;
    var x = colorMarker.style.left.replace('px', '') * 1;
    var y = colorMarker.style.top.replace('px', '') * 1;

    picker.style.color = "hsl(" + hue + ", 100%, 50%)";
    hueMarker.style.left = hue / 360 * 100 + "%";

    setColorAtPosition(x, y);
  }

  /**
   * Set the alpha when its slider is moved.
   */
  function setAlpha() {
    var alpha = alphaSlider.value / 100;

    alphaMarker.style.left = alpha * 100 + "%";
    updateColor({ a: alpha });
    pickColor();
  }

  /**
   * Convert HSVA to RGBA.
   * @param {object} hsva Hue, saturation, value and alpha values.
   * @return {object} Red, green, blue and alpha values.
   */
  function HSVAtoRGBA(hsva) {
    var saturation = hsva.s / 100;
    var value = hsva.v / 100;
    var chroma = saturation * value;
    var hueBy60 = hsva.h / 60;
    var x = chroma * (1 - Math.abs(hueBy60 % 2 - 1));
    var m = value - chroma;

    chroma = chroma + m;
    x = x + m;

    var index = Math.floor(hueBy60) % 6;
    var red = [chroma, x, m, m, x, chroma][index];
    var green = [x, chroma, chroma, x, m, m][index];
    var blue = [m, m, x, chroma, chroma, x][index];

    return {
      r: Math.round(red * 255),
      g: Math.round(green * 255),
      b: Math.round(blue * 255),
      a: hsva.a };

  }

  /**
   * Convert HSVA to HSLA.
   * @param {object} hsva Hue, saturation, value and alpha values.
   * @return {object} Hue, saturation, lightness and alpha values.
   */
  function HSVAtoHSLA(hsva) {
    var value = hsva.v / 100;
    var lightness = value * (1 - hsva.s / 100 / 2);
    var saturation;

    if (lightness > 0 && lightness < 1) {
      saturation = Math.round((value - lightness) / Math.min(lightness, 1 - lightness) * 100);
    }

    return {
      h: hsva.h,
      s: saturation || 0,
      l: Math.round(lightness * 100),
      a: hsva.a };

  }

  /**
   * Convert RGBA to HSVA.
   * @param {object} rgba Red, green, blue and alpha values.
   * @return {object} Hue, saturation, value and alpha values.
   */
  function RGBAtoHSVA(rgba) {
    var red = rgba.r / 255;
    var green = rgba.g / 255;
    var blue = rgba.b / 255;
    var xmax = Math.max(red, green, blue);
    var xmin = Math.min(red, green, blue);
    var chroma = xmax - xmin;
    var value = xmax;
    var hue = 0;
    var saturation = 0;

    if (chroma) {
      if (xmax === red) {hue = (green - blue) / chroma;}
      if (xmax === green) {hue = 2 + (blue - red) / chroma;}
      if (xmax === blue) {hue = 4 + (red - green) / chroma;}
      if (xmax) {saturation = chroma / xmax;}
    }

    hue = Math.floor(hue * 60);

    return {
      h: hue < 0 ? hue + 360 : hue,
      s: Math.round(saturation * 100),
      v: Math.round(value * 100),
      a: rgba.a };

  }

  /**
   * Parse a string to RGBA.
   * @param {string} str String representing a color.
   * @return {object} Red, green, blue and alpha values.
   */
  function strToRGBA(str) {
    var regex = /^((rgba)|rgb)[\D]+([\d.]+)[\D]+([\d.]+)[\D]+([\d.]+)[\D]*?([\d.]+|$)/i;
    var match, rgba;

    // Default to black for invalid color strings
    ctx.fillStyle = '#000';

    // Use canvas to convert the string to a valid color string
    ctx.fillStyle = str;
    match = regex.exec(ctx.fillStyle);

    if (match) {
      rgba = {
        r: match[3] * 1,
        g: match[4] * 1,
        b: match[5] * 1,
        a: match[6] * 1 };


    } else {
      match = ctx.fillStyle.replace('#', '').match(/.{2}/g).map(function (h) {return parseInt(h, 16);});
      rgba = {
        r: match[0],
        g: match[1],
        b: match[2],
        a: 1 };

    }

    return rgba;
  }

  /**
   * Convert RGBA to Hex.
   * @param {object} rgba Red, green, blue and alpha values.
   * @return {string} Hex color string.
   */
  function RGBAToHex(rgba) {
    var R = rgba.r.toString(16);
    var G = rgba.g.toString(16);
    var B = rgba.b.toString(16);
    var A = '';

    if (rgba.r < 16) {
      R = '0' + R;
    }

    if (rgba.g < 16) {
      G = '0' + G;
    }

    if (rgba.b < 16) {
      B = '0' + B;
    }

    if (settings.alpha && rgba.a < 1) {
      var alpha = rgba.a * 255 | 0;
      A = alpha.toString(16);

      if (alpha < 16) {
        A = '0' + A;
      }
    }

    return '#' + R + G + B + A;
  }

  /**
   * Convert RGBA values to a CSS rgb/rgba string.
   * @param {object} rgba Red, green, blue and alpha values.
   * @return {string} CSS color string.
   */
  function RGBAToStr(rgba) {
    if (!settings.alpha || rgba.a === 1) {
      return "rgb(" + rgba.r + ", " + rgba.g + ", " + rgba.b + ")";
    } else {
      return "rgba(" + rgba.r + ", " + rgba.g + ", " + rgba.b + ", " + rgba.a + ")";
    }
  }

  /**
   * Convert HSLA values to a CSS hsl/hsla string.
   * @param {object} hsla Hue, saturation, lightness and alpha values.
   * @return {string} CSS color string.
   */
  function HSLAToStr(hsla) {
    if (!settings.alpha || hsla.a === 1) {
      return "hsl(" + hsla.h + ", " + hsla.s + "%, " + hsla.l + "%)";
    } else {
      return "hsla(" + hsla.h + ", " + hsla.s + "%, " + hsla.l + "%, " + hsla.a + ")";
    }
  }

  /**
   * Init the color picker.
   */
  function init() {
    // Render the UI
    picker = document.createElement('div');
    picker.setAttribute('id', 'clr-picker');
    picker.className = 'clr-picker';
    picker.innerHTML =
    "<input id=\"clr-color-value\" class=\"clr-color\" type=\"text\" value=\"\" aria-label=\"" + settings.a11y.input + "\">" + ("<div id=\"clr-color-area\" class=\"clr-gradient\" role=\"application\" aria-label=\"" +
    settings.a11y.instruction + "\">") +
    '<div id="clr-color-marker" class="clr-marker" tabindex="0"></div>' +
    '</div>' +
    '<div class="clr-hue">' + ("<input id=\"clr-hue-slider\" type=\"range\" min=\"0\" max=\"360\" step=\"1\" aria-label=\"" +
    settings.a11y.hueSlider + "\">") +
    '<div id="clr-hue-marker"></div>' +
    '</div>' +
    '<div class="clr-alpha">' + ("<input id=\"clr-alpha-slider\" type=\"range\" min=\"0\" max=\"100\" step=\"1\" aria-label=\"" +
    settings.a11y.alphaSlider + "\">") +
    '<div id="clr-alpha-marker"></div>' +
    '<span></span>' +
    '</div>' +
    '<div id="clr-format" class="clr-format">' +
    '<fieldset class="clr-segmented">' + ("<legend>" +
    settings.a11y.format + "</legend>") +
    '<input id="clr-f1" type="radio" name="clr-format" value="hex">' +
    '<label for="clr-f1">Hex</label>' +
    '<input id="clr-f2" type="radio" name="clr-format" value="rgb">' +
    '<label for="clr-f2">RGB</label>' +
    '<input id="clr-f3" type="radio" name="clr-format" value="hsl">' +
    '<label for="clr-f3">HSL</label>' +
    '<span></span>' +
    '</fieldset>' +
    '</div>' +
    '<div id="clr-swatches" class="clr-swatches"></div>' + ("<button id=\"clr-clear\" class=\"clr-clear\">" +
    settings.clearButton.label + "</button>") + ("<button id=\"clr-color-preview\" class=\"clr-preview\" aria-label=\"" +
    settings.a11y.close + "\"></button>") + ("<span id=\"clr-open-label\" hidden>" +
    settings.a11y.open + "</span>") + ("<span id=\"clr-swatch-label\" hidden>" +
    settings.a11y.swatch + "</span>");

    // Append the color picker to the DOM
    document.body.appendChild(picker);

    // Reference the UI elements
    colorArea = getEl('clr-color-area');
    colorMarker = getEl('clr-color-marker');
    clearButton = getEl('clr-clear');
    colorPreview = getEl('clr-color-preview');
    colorValue = getEl('clr-color-value');
    hueSlider = getEl('clr-hue-slider');
    hueMarker = getEl('clr-hue-marker');
    alphaSlider = getEl('clr-alpha-slider');
    alphaMarker = getEl('clr-alpha-marker');

    // Bind the picker to the default selector
    bindFields(settings.el);
    wrapFields(settings.el);

    addListener(picker, 'mousedown', function (event) {
      picker.classList.remove('clr-keyboard-nav');
      event.stopPropagation();
    });

    addListener(colorArea, 'mousedown', function (event) {
      addListener(document, 'mousemove', moveMarker);
    });

    addListener(colorArea, 'touchstart', function (event) {
      document.addEventListener('touchmove', moveMarker, { passive: false });
    });

    addListener(colorMarker, 'mousedown', function (event) {
      addListener(document, 'mousemove', moveMarker);
    });

    addListener(colorMarker, 'touchstart', function (event) {
      document.addEventListener('touchmove', moveMarker, { passive: false });
    });

    addListener(colorValue, 'change', function (event) {
      setColorFromStr(colorValue.value);
      pickColor();
    });

    addListener(clearButton, 'click', function (event) {
      pickColor('');
      closePicker();
    });

    addListener(colorPreview, 'click', function (event) {
      pickColor();
      closePicker();
    });

    addListener(document, 'click', '.clr-format input', function (event) {
      currentFormat = event.target.value;
      updateColor();
      pickColor();
    });

    addListener(picker, 'click', '.clr-swatches button', function (event) {
      setColorFromStr(event.target.textContent);
      pickColor();
    });

    addListener(document, 'mouseup', function (event) {
      document.removeEventListener('mousemove', moveMarker);
    });

    addListener(document, 'touchend', function (event) {
      document.removeEventListener('touchmove', moveMarker);
    });

    addListener(document, 'mousedown', function (event) {
      picker.classList.remove('clr-keyboard-nav');
      closePicker();
    });

    addListener(document, 'keydown', function (event) {
      if (event.key === 'Escape') {
        closePicker(true);
      } else if (event.key === 'Tab') {
        picker.classList.add('clr-keyboard-nav');
      }
    });

    addListener(document, 'click', '.clr-field button', function (event) {
      event.target.nextElementSibling.dispatchEvent(new Event('click', { bubbles: true }));
    });

    addListener(colorMarker, 'keydown', function (event) {
      var movements = {
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0] };


      if (Object.keys(movements).indexOf(event.key) !== -1) {
        moveMarkerOnKeydown.apply(void 0, movements[event.key]);
        event.preventDefault();
      }
    });

    addListener(colorArea, 'click', moveMarker);
    addListener(hueSlider, 'input', setHue);
    addListener(alphaSlider, 'input', setAlpha);
  }

  /**
   * Shortcut for getElementById to optimize the minified JS.
   * @param {string} id The element id.
   * @return {object} The DOM element with the provided id.
   */
  function getEl(id) {
    return document.getElementById(id);
  }

  /**
   * Shortcut for addEventListener to optimize the minified JS.
   * @param {object} context The context to which the listener is attached.
   * @param {string} type Event type.
   * @param {(string|function)} selector Event target if delegation is used, event handler if not.
   * @param {function} [fn] Event handler if delegation is used.
   */
  function addListener(context, type, selector, fn) {
    var matches = Element.prototype.matches || Element.prototype.msMatchesSelector;

    // Delegate event to the target of the selector
    if (typeof selector === 'string') {
      context.addEventListener(type, function (event) {
        if (matches.call(event.target, selector)) {
          fn.call(event.target, event);
        }
      });

      // If the selector is not a string then it's a function
      // in which case we need regular event listener
    } else {
      fn = selector;
      context.addEventListener(type, fn);
    }
  }

  /**
   * Call a function only when the DOM is ready.
   * @param {function} fn The function to call.
   * @param {array} args Arguments to pass to the function.
   */
  function DOMReady(fn, args) {
    args = args !== undefined ? args : [];

    if (document.readyState !== 'loading') {
      fn.apply(void 0, args);
    } else {
      document.addEventListener('DOMContentLoaded', function () {
        fn.apply(void 0, args);
      });
    }
  }

  // Polyfill for Nodelist.forEach
  if (NodeList !== undefined && NodeList.prototype && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = Array.prototype.forEach;
  }

  // Expose the color picker to the global scope
  window.Coloris = function () {
    var methods = {
      set: configure,
      wrap: wrapFields,
      close: closePicker };


    function Coloris(options) {
      DOMReady(function () {
        if (options) {
          if (typeof options === 'string') {
            bindFields(options);
          } else {
            configure(options);
          }
        }
      });
    }var _loop = function _loop(

    key) {
      Coloris[key] = function () {for (var _len = arguments.length, args = new Array(_len), _key2 = 0; _key2 < _len; _key2++) {args[_key2] = arguments[_key2];}
        DOMReady(methods[key], args);
      };};for (var key in methods) {_loop(key);
    }

    return Coloris;
  }();

  // Init the color picker when the DOM is ready
  DOMReady(init);

})(window, document, Math);