const instances = {};
let currentInstanceId = '';
let defaultInstance = {};
let hasInstance = false;

function setInstance(selector, options) {
  if (typeof selector === 'string' && typeof options === 'object') {
    instances[selector] = options;
    hasInstance = true;
  }
}

function removeInstance(selector) {
  delete instances[selector];

  if (Object.keys(instances).length === 0) {
    hasInstance = false;

    if (selector === currentInstanceId) {
      resetInstance();
    }
  }
}

function resetInstance() {
  if (Object.keys(defaultInstance).length > 0) {
    Coloris.set(defaultInstance);
    currentInstanceId = '';
    defaultInstance = {};
  }
}

function attachVirtualInstance(element) {
  if (hasInstance) {
    // These options can only be set globally, not per instance
    const unsupportedOptions = ['el', 'wrap', 'inline', 'defaultColor', 'a11y'];

    for (let selector in instances) {
      const options = instances[selector];

      // If the element matches an instance's CSS selector
      if (element.matches(selector)) {
        currentInstanceId = selector;
        defaultInstance = {};

        // Delete unsupported options
        unsupportedOptions.forEach(option => delete options[option]);

        // Back up the default options so we can restore them later
        for (let option in options) {
          defaultInstance[option] = Array.isArray(settings[option]) ? settings[option].slice() : settings[option];
        }

        // Set the instance's options
        Coloris.set(options);
        break;
      }
    }
  }
}

function resetVirtualInstance() {
  if (hasInstance) {
    resetInstance();
  }
}
