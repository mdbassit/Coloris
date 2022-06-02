/*!
 * Copyright (c) 2021 Momo Bassit.
 * Licensed under the MIT License (MIT)
 * https://github.com/mdbassit/Coloris
 */

((window, document, Math) => {
  const ctx = document.createElement('canvas').getContext('2d');
  const currentColor = { r: 0, g: 0, b: 0, h: 0, s: 0, v: 0, a: 1 };
  let picker, colorArea, colorAreaDims, colorMarker, colorPreview, colorValue, clearButton,
      hueSlider, hueMarker, alphaSlider, alphaMarker, currentEl, currentFormat, oldColor;

  // Default settings
  const settings = {
    el: '[data-coloris]',
    parent: null,
    theme: 'default',
    themeMode: 'light',
    wrap: true,
    margin: 2,
    format: 'hex',
    formatToggle : false,
    swatches: [],
    swatchesOnly: false,
    alpha: true,
    forceAlpha: false,
    focusInput: true,
    selectInput: false,
    autoClose: false,
    inline: false,
    defaultColor: '#000000',
    clearButton: {
      show: false,
      label: 'Clear'
    },
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
  };

  /**
   * Configure the color picker.
   * @param {object} options Configuration options.
   */
  function configure(options) {
    if (typeof options !== 'object') {
      return;
    }

    for (const key in options) {
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

          // Set the theme and color scheme
          picker.className = `clr-picker clr-${settings.theme} clr-${settings.themeMode}`;

          // Update the color picker's position if inline mode is in use
          if (settings.inline) {
            updatePickerPosition();
          }
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
        case 'formatToggle':
          getEl('clr-format').style.display = options.formatToggle ? 'block' : 'none';
          if (options.formatToggle) {
            settings.format = 'auto';
          }
          break;
        case 'swatches':
          if (Array.isArray(options.swatches)) {
            const swatches = [];

            options.swatches.forEach((swatch, i) => {
              swatches.push(`<button type="button" id="clr-swatch-${i}" aria-labelledby="clr-swatch-label clr-swatch-${i}" style="color: ${swatch};">${swatch}</button>`);
            });

            getEl('clr-swatches').innerHTML = swatches.length ? `<div>${swatches.join('')}</div>` : '';
          }
          break;
        case 'swatchesOnly':
          settings.swatchesOnly = !!options.swatchesOnly;
          picker.setAttribute('data-minimal', settings.swatchesOnly);

          if (settings.swatchesOnly) {
            settings.autoClose = true;
          }
          break;
        case 'alpha':
          settings.alpha = !!options.alpha;
          picker.setAttribute('data-alpha', settings.alpha);
          break;
        case 'inline':
          settings.inline = !!options.inline;
          picker.setAttribute('data-inline', settings.inline);

          if (settings.inline) {
            const defaultColor = options.defaultColor || settings.defaultColor;
            
            currentFormat = getColorFormatFromStr(defaultColor);
            updatePickerPosition();
            setColorFromStr(defaultColor);
          }
          break;
        case 'clearButton':
          let display = 'none';

          if (options.clearButton.show) {
            display = 'block';
          }

          if (options.clearButton.label) {
            clearButton.innerHTML = options.clearButton.label;
          }

          clearButton.style.display = display;
          break;
        case 'a11y':
          const labels = options.a11y;
          let update = false;

          if (typeof labels === 'object') {
            for (const label in labels) {
              if (labels[label] && settings.a11y[label]) {
                settings.a11y[label] = labels[label];
                update = true;
              }
            }
          }

          if (update) {
            const openLabel = getEl('clr-open-label');
            const swatchLabel = getEl('clr-swatch-label');

            openLabel.innerHTML = settings.a11y.open;
            swatchLabel.innerHTML = settings.a11y.swatch;
            colorPreview.setAttribute('aria-label', settings.a11y.close);
            hueSlider.setAttribute('aria-label', settings.a11y.hueSlider);
            alphaSlider.setAttribute('aria-label', settings.a11y.alphaSlider);
            colorValue.setAttribute('aria-label', settings.a11y.input);
            colorArea.setAttribute('aria-label', settings.a11y.instruction);
          }
        default:
          settings[key] = options[key];
      }
    }
  }

  /**
   * Bind the color picker to input fields that match the selector.
   * @param {string} selector One or more selectors pointing to input fields.
   */
  function bindFields(selector) {
    // Show the color picker on click on the input fields that match the selector
    addListener(document, 'click', selector, event => {
      // Skip if inline mode is in use
      if (settings.inline) {
        return;
      }

      currentEl = event.target;
      oldColor = currentEl.value;
      currentFormat = getColorFormatFromStr(oldColor);
      picker.classList.add('clr-open');
      
      updatePickerPosition();
      setColorFromStr(oldColor);

      if (settings.focusInput || settings.selectInput) {
        colorValue.focus({ preventScroll: true });
      }
      
      if (settings.selectInput) {
        colorValue.select();
      }

      // Trigger an "open" event
      currentEl.dispatchEvent(new Event('open', { bubbles: true }));
    });

    // Update the color preview of the input fields that match the selector
    addListener(document, 'input', selector, event => {
      const parent = event.target.parentNode;

      // Only update the preview if the field has been previously wrapped
      if (parent.classList.contains('clr-field')) {
        parent.style.color = event.target.value;
      }
    });
  }

  /**
   * Update the color picker's position and the color gradient's offset
   */
  function updatePickerPosition() {
    const parent = settings.parent;
    const scrollY = window.scrollY;
    const pickerWidth = picker.offsetWidth;
    const pickerHeight = picker.offsetHeight;
    const reposition = { left: false, top: false };
    let parentStyle, parentMarginTop, parentBorderTop;
    let offset = { x: 0, y: 0 };

    if (parent) {
      parentStyle = window.getComputedStyle(parent);
      parentMarginTop = parseFloat(parentStyle.marginTop);
      parentBorderTop = parseFloat(parentStyle.borderTopWidth);

      offset = parent.getBoundingClientRect();
      offset.y += parentBorderTop + scrollY;
    }

    if (!settings.inline) {
      const coords = currentEl.getBoundingClientRect();
      let left = coords.x;
      let top = scrollY + coords.y + coords.height + settings.margin;

      // If the color picker is inside a custom container
      // set the position relative to it
      if (parent) {
        left -= offset.x;
        top -= offset.y;

        if (left + pickerWidth > parent.clientWidth) {
          left += coords.width - pickerWidth;
          reposition.left = true;
        }

        if (top + pickerHeight >  parent.clientHeight - parentMarginTop) {
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
      picker.style.left = `${left}px`;
      picker.style.top = `${top}px`;
    }
    
    colorAreaDims = {
      width: colorArea.offsetWidth,
      height: colorArea.offsetHeight,
      x: picker.offsetLeft + colorArea.offsetLeft + offset.x,
      y: picker.offsetTop + colorArea.offsetTop + offset.y
    };
  }

  /**
   * Wrap the linked input fields in a div that adds a color preview.
   * @param {string} selector One or more selectors pointing to input fields.
   */
  function wrapFields(selector) {
    document.querySelectorAll(selector).forEach(field => {
      const parentNode = field.parentNode;

      if (!parentNode.classList.contains('clr-field')) {
        const wrapper = document.createElement('div');

        wrapper.innerHTML = `<button type="button" aria-labelledby="clr-open-label"></button>`;
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
    if (currentEl && !settings.inline) {
      // Revert the color to the original value if needed
      if (revert && oldColor !== currentEl.value) {
        currentEl.value = oldColor;

        // Trigger an "input" event to force update the thumbnail next to the input field
        currentEl.dispatchEvent(new Event('input', { bubbles: true }));
      }

      if (oldColor !== currentEl.value) {
        currentEl.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // Hide the picker dialog
      picker.classList.remove('clr-open');

      // Trigger a "close" event
      currentEl.dispatchEvent(new Event('close', { bubbles: true }));

      if (settings.focusInput) {
        currentEl.focus({ preventScroll: true });
      }
      
      currentEl = null;
    }
  }

  /**
   * Set the active color from a string.
   * @param {string} str String representing a color.
   */
  function setColorFromStr(str) {
    const rgba = strToRGBA(str);
    const hsva = RGBAtoHSVA(rgba);

    updateMarkerA11yLabel(hsva.s, hsva.v);
    updateColor(rgba, hsva);

    // Update the UI
    hueSlider.value = hsva.h;
    picker.style.color = `hsl(${hsva.h}, 100%, 50%)`;
    hueMarker.style.left = `${hsva.h / 360 * 100}%`;

    colorMarker.style.left = `${colorAreaDims.width * hsva.s / 100}px`;
    colorMarker.style.top = `${colorAreaDims.height - (colorAreaDims.height * hsva.v / 100)}px`;

    alphaSlider.value = hsva.a * 100;
    alphaMarker.style.left = `${hsva.a * 100}%`;
  }

  /**
   * Guess the color format from a string.
   * @param {string} str String representing a color.
   * @return {string} The color format.
   */
  function getColorFormatFromStr(str) {
    const format = str.substring(0, 3).toLowerCase();

    if (format === 'rgb' || format === 'hsl' ) {
      return format;
    }

    return 'hex';
  }

  /**
   * Copy the active color to the linked input field.
   * @param {number} [color] Color value to override the active color.
   */
  function pickColor(color) {
    color = color !== undefined ? color : colorValue.value;

    if (currentEl) {
      currentEl.value = color;
      currentEl.dispatchEvent(new Event('input', { bubbles: true }));
    }

    document.dispatchEvent(new CustomEvent('coloris:pick', { detail: { color } }));
  }

  /**
   * Set the active color based on a specific point in the color gradient.
   * @param {number} x Left position.
   * @param {number} y Top position.
   */
  function setColorAtPosition(x, y) {
    const hsva = {
      h: hueSlider.value * 1,
      s: x / colorAreaDims.width * 100,
      v: 100 - (y / colorAreaDims.height * 100),
      a: alphaSlider.value / 100
    };
    const rgba = HSVAtoRGBA(hsva);

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
    let label = settings.a11y.marker;

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
      pageY: event.changedTouches ? event.changedTouches[0].pageY : event.pageY
    };
  }

  /**
   * Move the color marker when dragged.
   * @param {object} event The MouseEvent object.
   */
  function moveMarker(event) {
    const pointer = getPointerPosition(event);
    let x = pointer.pageX - colorAreaDims.x;
    let y = pointer.pageY - colorAreaDims.y;

    if (settings.parent) {
      y += settings.parent.scrollTop;
    }

    x = (x < 0) ? 0 : (x > colorAreaDims.width) ? colorAreaDims.width : x;
    y = (y < 0) ? 0 : (y > colorAreaDims.height) ? colorAreaDims.height : y;

    colorMarker.style.left = `${x}px`;
    colorMarker.style.top = `${y}px`;

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
    const x = colorMarker.style.left.replace('px', '') * 1 + offsetX;
    const y =  colorMarker.style.top.replace('px', '') * 1 + offsetY;

    colorMarker.style.left = `${x}px`;
    colorMarker.style.top = `${y}px`;

    setColorAtPosition(x, y);
  }

  /**
   * Update the color picker's input field and preview thumb.
   * @param {Object} rgba Red, green, blue and alpha values.
   * @param {Object} [hsva] Hue, saturation, value and alpha values.
   */
  function updateColor(rgba = {}, hsva = {}) {
    let format = settings.format;

    for (const key in rgba) {
      currentColor[key] = rgba[key];
    }

    for (const key in hsva) {
      currentColor[key] = hsva[key];
    }

    const hex = RGBAToHex(currentColor);
    const opaqueHex = hex.substring(0, 7);

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
        break;
    }

    // Select the current format in the format switcher
    document.querySelector(`.clr-format [value="${format}"]`).checked = true;
  }

  /**
   * Set the hue when its slider is moved.
   */
  function setHue() {
    const hue = hueSlider.value * 1;
    const x = colorMarker.style.left.replace('px', '') * 1;
    const y =  colorMarker.style.top.replace('px', '') * 1;

    picker.style.color = `hsl(${hue}, 100%, 50%)`;
    hueMarker.style.left = `${hue / 360 * 100}%`;

    setColorAtPosition(x, y);
  }

  /**
   * Set the alpha when its slider is moved.
   */
  function setAlpha() {
    const alpha = alphaSlider.value / 100;

    alphaMarker.style.left = `${alpha * 100}%`;
    updateColor({ a: alpha });
    pickColor();
  }

  /**
   * Convert HSVA to RGBA.
   * @param {object} hsva Hue, saturation, value and alpha values.
   * @return {object} Red, green, blue and alpha values.
   */
  function HSVAtoRGBA(hsva) {
    const saturation = hsva.s / 100;
    const value = hsva.v / 100;
    let chroma = saturation * value;
    let hueBy60 = hsva.h / 60;
    let x = chroma * (1 - Math.abs(hueBy60 % 2 - 1));
    let m = value - chroma;

    chroma = (chroma + m);
    x = (x + m);

    const index = Math.floor(hueBy60) % 6;
    const red = [chroma, x, m, m, x, chroma][index];
    const green = [x, chroma, chroma, x, m, m][index];
    const blue = [m, m, x, chroma, chroma, x][index];

    return {
      r: Math.round(red * 255),
      g: Math.round(green * 255),
      b: Math.round(blue * 255),
      a: hsva.a
    };
  }

  /**
   * Convert HSVA to HSLA.
   * @param {object} hsva Hue, saturation, value and alpha values.
   * @return {object} Hue, saturation, lightness and alpha values.
   */
  function HSVAtoHSLA(hsva) {
    const value = hsva.v / 100;
    const lightness = value * (1 - (hsva.s / 100) / 2);
    let saturation;

    if (lightness > 0 && lightness < 1) {
      saturation = Math.round((value - lightness) / Math.min(lightness, 1 - lightness) * 100);
    }

    return {
      h: hsva.h,
      s: saturation || 0,
      l: Math.round(lightness * 100),
      a: hsva.a
    };
  }

  /**
   * Convert RGBA to HSVA.
   * @param {object} rgba Red, green, blue and alpha values.
   * @return {object} Hue, saturation, value and alpha values.
   */
  function RGBAtoHSVA(rgba) {
    const red   = rgba.r / 255;
    const green = rgba.g / 255;
    const blue  = rgba.b / 255;
    const xmax = Math.max(red, green, blue);
    const xmin = Math.min(red, green, blue);
    const chroma = xmax - xmin;
    const value = xmax;
    let hue = 0;
    let saturation = 0;

    if (chroma) {
      if (xmax === red ) { hue = ((green - blue) / chroma); }
      if (xmax === green ) { hue = 2 + (blue - red) / chroma; }
      if (xmax === blue ) { hue = 4 + (red - green) / chroma; }
      if (xmax) { saturation = chroma / xmax; }
    }

    hue = Math.floor(hue * 60);

    return {
      h: hue < 0 ? hue + 360 : hue,
      s: Math.round(saturation * 100),
      v: Math.round(value * 100),
      a: rgba.a
    };
  }

  /**
   * Parse a string to RGBA.
   * @param {string} str String representing a color.
   * @return {object} Red, green, blue and alpha values.
   */
  function strToRGBA(str) {
    const regex = /^((rgba)|rgb)[\D]+([\d.]+)[\D]+([\d.]+)[\D]+([\d.]+)[\D]*?([\d.]+|$)/i;
    let match, rgba;

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
        a: match[6] * 1
      };

      // Workaround to mitigate a Chromium bug where the alpha value is rounded incorrectly
      rgba.a = +rgba.a.toFixed(2);

    } else {
      match = ctx.fillStyle.replace('#', '').match(/.{2}/g).map(h => parseInt(h, 16));
      rgba = {
        r: match[0],
        g: match[1],
        b: match[2],
        a: 1
      };
    }

    return rgba;
  }

  /**
   * Convert RGBA to Hex.
   * @param {object} rgba Red, green, blue and alpha values.
   * @return {string} Hex color string.
   */
  function RGBAToHex(rgba) {
    let R = rgba.r.toString(16);
    let G = rgba.g.toString(16);
    let B = rgba.b.toString(16);
    let A = '';

    if (rgba.r < 16) {
      R = '0' + R;
    }

    if (rgba.g < 16) {
      G = '0' + G;
    }

    if (rgba.b < 16) {
      B = '0' + B;
    }

    if (settings.alpha && (rgba.a < 1 || settings.forceAlpha)) {
      const alpha = rgba.a * 255 | 0;
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
    if (!settings.alpha || (rgba.a === 1 && !settings.forceAlpha)) {
      return `rgb(${rgba.r}, ${rgba.g}, ${rgba.b})`;
    } else {
      return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
    }
  }

  /**
   * Convert HSLA values to a CSS hsl/hsla string.
   * @param {object} hsla Hue, saturation, lightness and alpha values.
   * @return {string} CSS color string.
   */
  function HSLAToStr(hsla) {
    if (!settings.alpha || (hsla.a === 1 && !settings.forceAlpha)) {
      return `hsl(${hsla.h}, ${hsla.s}%, ${hsla.l}%)`;
    } else {
      return `hsla(${hsla.h}, ${hsla.s}%, ${hsla.l}%, ${hsla.a})`;
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
    `<input id="clr-color-value" class="clr-color" type="text" value="" spellcheck="false" aria-label="${settings.a11y.input}">`+
    `<div id="clr-color-area" class="clr-gradient" role="application" aria-label="${settings.a11y.instruction}">`+
      '<div id="clr-color-marker" class="clr-marker" tabindex="0"></div>'+
    '</div>'+
    '<div class="clr-hue">'+
      `<input id="clr-hue-slider" type="range" min="0" max="360" step="1" aria-label="${settings.a11y.hueSlider}">`+
      '<div id="clr-hue-marker"></div>'+
    '</div>'+
    '<div class="clr-alpha">'+
      `<input id="clr-alpha-slider" type="range" min="0" max="100" step="1" aria-label="${settings.a11y.alphaSlider}">`+
      '<div id="clr-alpha-marker"></div>'+
      '<span></span>'+
    '</div>'+
    '<div id="clr-format" class="clr-format">'+
      '<fieldset class="clr-segmented">'+
        `<legend>${settings.a11y.format}</legend>`+
        '<input id="clr-f1" type="radio" name="clr-format" value="hex">'+
        '<label for="clr-f1">Hex</label>'+
        '<input id="clr-f2" type="radio" name="clr-format" value="rgb">'+
        '<label for="clr-f2">RGB</label>'+
        '<input id="clr-f3" type="radio" name="clr-format" value="hsl">'+
        '<label for="clr-f3">HSL</label>'+
        '<span></span>'+
      '</fieldset>'+
    '</div>'+
    '<div id="clr-swatches" class="clr-swatches"></div>'+
    `<button type="button" id="clr-clear" class="clr-clear">${settings.clearButton.label}</button>`+
    `<button type="button" id="clr-color-preview" class="clr-preview" aria-label="${settings.a11y.close}"></button>`+
    `<span id="clr-open-label" hidden>${settings.a11y.open}</span>`+
    `<span id="clr-swatch-label" hidden>${settings.a11y.swatch}</span>`;

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

    addListener(picker, 'mousedown', event => {
      picker.classList.remove('clr-keyboard-nav');
      event.stopPropagation();
    });

    addListener(colorArea, 'mousedown', event => {
      addListener(document, 'mousemove', moveMarker);
    });

    addListener(colorArea, 'touchstart', event => {
      document.addEventListener('touchmove', moveMarker, { passive: false });
    });

    addListener(colorMarker, 'mousedown', event => {
      addListener(document, 'mousemove', moveMarker);
    });

    addListener(colorMarker, 'touchstart', event => {
      document.addEventListener('touchmove', moveMarker, { passive: false });
    });

    addListener(colorValue, 'change', event => {
      setColorFromStr(colorValue.value);
      pickColor();
    });

    addListener(clearButton, 'click', event => {
      pickColor('');
      closePicker();
    });

    addListener(colorPreview, 'click', event => {
      pickColor();
      closePicker();
    });

    addListener(document, 'click', '.clr-format input', event => {
      currentFormat = event.target.value;
      updateColor();
      pickColor();
    });

    addListener(picker, 'click', '.clr-swatches button', event => {
      setColorFromStr(event.target.textContent);
      pickColor();

      if (settings.autoClose) {
        closePicker();
      }
    });

    addListener(document, 'mouseup', event => {
      document.removeEventListener('mousemove', moveMarker);
    });

    addListener(document, 'touchend', event => {
      document.removeEventListener('touchmove', moveMarker);
    });

    addListener(document, 'mousedown', event => {
      picker.classList.remove('clr-keyboard-nav');
      closePicker();
    });

    addListener(document, 'keydown', event => {
      if (event.key === 'Escape') {
        closePicker(true);
      } else if (event.key === 'Tab') {
        picker.classList.add('clr-keyboard-nav');
      }
    });

    addListener(document, 'click', '.clr-field button', event => {
      event.target.nextElementSibling.dispatchEvent(new Event('click', { bubbles: true }));
    });

    addListener(colorMarker, 'keydown', event => {
      const movements = {
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0]
      };

      if (Object.keys(movements).indexOf(event.key) !== -1) {
        moveMarkerOnKeydown(...movements[event.key]);
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
    const matches = Element.prototype.matches || Element.prototype.msMatchesSelector;

    // Delegate event to the target of the selector
    if (typeof selector === 'string') {
      context.addEventListener(type, event => {
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
   * @param {array} [args] Arguments to pass to the function.
   */
  function DOMReady(fn, args) {
    args = args !== undefined ? args : [];

    if (document.readyState !== 'loading') {
      fn(...args);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        fn(...args);
      });
    }
  }

  // Polyfill for Nodelist.forEach
  if (NodeList !== undefined && NodeList.prototype && !NodeList.prototype.forEach) {
      NodeList.prototype.forEach = Array.prototype.forEach;
  }

  // Expose the color picker to the global scope
  window.Coloris = (() => {
    const methods = {
      set: configure,
      wrap: wrapFields,
      close: closePicker,
      updatePosition: updatePickerPosition
    };

    function Coloris(options) {
      DOMReady(() => {
        if (options) {
          if (typeof options === 'string') {
            bindFields(options);
          } else {
            configure(options);
          }
        }
      });
    }

    for (const key in methods) {
      Coloris[key] = (...args) => {
        DOMReady(methods[key], args);
      };
    }

    return Coloris;
  })();

  // Init the color picker when the DOM is ready
  DOMReady(init);

})(window, document, Math);