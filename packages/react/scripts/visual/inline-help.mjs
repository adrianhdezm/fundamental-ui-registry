/** Visual cases for inline-help; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

/**
 * fundamental-styles has no inline help story any more, only the `fd-popover__body--inline-help` modifier
 * (0.75rem padding, the small font size), which the spec checks. Our open help bodies in the Help bodies story are
 * compared with the popover bodies of the Placement and No Arrow stories by computed style: background, radius,
 * shadow, border and typography. Their bodies hold menus, ours a line of text: no sizes or pixels; the padding and
 * the font size are the modifier's.
 */
const surface = (label, ours, story, selector) => ({
    label,
    pixels: false,
    ignore: ['width', 'height', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'font-size'],
    ours: { story: 'components-inline-help--bodies', selector: `#body-${ours}` },
    ref: { story: `${FS}popover--${story}`, selector }
});

export default [
    surface('body below, arrow on top', 'arrow-top', 'placement', '#popoverF1i'),
    surface('body above, arrow at the bottom', 'arrow-bottom', 'placement', '#popoverF1'),
    surface('body after, arrow at the start', 'arrow-left', 'placement', '#popoverF1d'),
    surface('body before, arrow at the end', 'arrow-right', 'placement', '#popoverF1c'),
    surface('body without arrow', 'no-arrow', 'no-arrow', '#popoverF1')
];
