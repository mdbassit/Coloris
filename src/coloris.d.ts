declare namespace Coloris {
  /**
   * All color themes supported by the color picker. More themes might be added
   * in the future.
   */
  export type ColorTheme =
    | "light"
    | "dark"
    | "polaroid"
    | "polaroid-dark";

  /**
   * Color format used by the color picker. The format affects which value is
   * shown in the input field.
   * - `hex` outputs `#RRGGBB` or `#RRGGBBAA`.
   * - `rgb` outputs `rgb(R, G, B)` or `rgba(R, G, B, A)`.
   * - `hsl` outputs `hsl(H, S, L)` or `hsla(H, S, L, A)`.
   * - `mixed` outputs `#RRGGBB` when alpha is 1; otherwise `rgba(R, G, B, A)`.
   */
  export type ColorFormat =
    | "hex"
    | "rgb"
    | "hsl"
    | "mixed";

  export interface Accessibility {
    /**
     * @default "Open color picker"
     */
    open: string;

    /**
     * @default "Close color picker"
     */
    close: string;

    /**
     * @default "Saturation: {s}. Brightness: {v}."
     */
    marker: string;

    /**
     * @default "Hue slider"
     */
    hueSlider: string;

    /**
     * @default "Opacity slider"
     */
    alphaSlider: string;

    /**
     * @default "Color swatch"
     */
    input: string;

    /**
     * @default "Color swatch"
     */
    swatch: string;

    /**
     * @default "Saturation and brightness selector. Use up, down, left and right arrow keys to select."
     */
    instruction: string;
  }

  /**
   * Configuration for the optional clear button on the color picker.
   */
  export interface ClearButtonOptions {
    /**
     * Whether the clear button is displayed when the color picker is opened.
     */
    show: boolean;

    /**
     * The label text shown on the clear button.
     */
    label: string;
  }

  export interface ColorisOptions {
    /**
     * A custom CSS selector to bind the color picker to. This must point to
     * one or more {@link HTMLInputElement}s.
     */
    el: string;

    /**
     * CSS selector for the parent.
     *
     * When `null`, the default behaviour is to append the color picker's dialog
     * to the end of the document's body. But it is possible to append it to a
     * custom parent instead. This is especially useful if the color fields are
     * in a scrollable container and you want color picker' dialog to stay
     * anchored to them. You will need to set the position of the container to
     * relative or absolute.
     *
     * @default null
     */
    parent?: null | string;

    /**
     * The bound input fields are wrapped in a div that adds a thumbnail
     * showing the current color and a button to open the color picker (for
     * accessibility only).
     *
     * If you wish to keep your fields unaltered, set this to `false`, in which
     * case you will lose the color thumbnail and the accessible button (not
     * recommended).
     *
     * @default true
     */
    wrap?: boolean;

    /**
     * The color theme to use for the color picker. More themes might be added
     * in the future.
     *
     * @default "light"
     */
    theme?: ColorTheme;

    /**
     * The margin in pixels between the input fields and the color picker's
     * dialog.
     *
     * @default 2
     */
    margin?: number;

    /**
     * Sets the preferred color string format. The format affects which value is
     * shown in the input field. See {@link ColorFormat} for more details.
     *
     * @default "hex"
     */
    format?: ColorFormat;

    /**
     * Enable or disable alpha support.
     *
     * When disabled, it will strip the alpha value from the existing color
     * value in all formats.
     *
     * @default true
     */
    alpha?: boolean;

    /**
     * Shows a clear button and set its label. By default, no clear button is
     * shown.
     *
     * @default undefined
     */
    clearButton?: ClearButtonOptions;

    /**
     * An array of the desired color swatches to display. If omitted or the
     * array is empty, the color swatches will be disabled.
     *
     * @default []
     */
    swatches?: string[];

    /**
     * Accessibility messages for various aria attribute etc.
     */
    a11y?: Accessibility;
  }

  /**
   * The main entry point or namespace for Coloris. This object is callable and
   * can be used to initialize Coloris. It also contains several utility
   * methods.
   */
  export interface ColorisEntryPoint {
    /**
     * Converts an input field to a color picker input.
     */
    (opts: ColorisOptions): void;

    /**
     * The color picker dialog can be closed by clicking anywhere on the
     * page or by pressing the ESC on the keyboard. The later will also
     * revert the color to its original value.
     *
     * If you would like to close the dialog programmatically, you can do so
     * by calling this method.
     *
     * @param {boolean} revert When `true`, resets the color to its original
     * value. Defaults to `false`.
     */
    close: (revert?: boolean) => void;
  }
}

/**
 * The main entry point or namespace for Coloris. This object is callable and
 * can be used to initialize Coloris. It also contains several utility
 * methods.
 */
declare const Coloris: Coloris.ColorisEntryPoint;