/** Visual cases for input-group; see ../visual.config.mjs for the fields. Adapted from the React package. */
const FS = 'sap-design-components-';
const REF = `${FS}forms-input-group--`;

/** Our group around the input `#ours` in `story` against fundamental-styles' group around `#ref`. */
const group = (label, story, ours, refStory, ref, extra = {}) => ({
    label,
    ours: { story: `components-input-group--${story}`, selector: `fd-input-group:has(> #${ours})` },
    ref: { story: `${REF}${refStory}`, selector: `.fd-input-group:has(> #${ref})` },
    // fundamental-styles' groups fill their page and set no minimum height: styles only
    pixels: false,
    ignore: ['width', 'min-height'],
    ...extra
});

/** The addon button next to the input `#ours` against fundamental-styles' next to `#ref`. */
const button = (label, story, ours, refStory, ref, extra = {}) => ({
    label,
    ours: { story: `components-input-group--${story}`, selector: `#${ours} + span button` },
    ref: { story: `${REF}${refStory}`, selector: `#${ref} + .fd-input-group__addon button` },
    ...extra
});

/** Value states: different texts in both stories, styles only. */
const STATE = {};

export default [
    // text addons
    group('text after', 'text-addon', 'ig-text-2', 'text-add-on', 'amount-euro-right'),
    group('text after hover', 'text-addon', 'ig-text-2', 'text-add-on', 'amount-euro-right', { hover: true }),
    // a text button ("Submit" in both stories), at rest and hovered: its width and its HC background
    group('text button', 'button-addon', 'ig-button-2', 'input-with-actions', 'input-text-action-right'),
    button('text button, button', 'button-addon', 'ig-button-2', 'input-with-actions', 'input-text-action-right'),
    button(
        'text button, button hover',
        'button-addon',
        'ig-button-2',
        'input-with-actions',
        'input-text-action-right',
        {
            hover: true
        }
    ),
    // states
    group('success', 'states', 'ig-state-2', 'states', 'input-success-1', STATE),
    group('error', 'states', 'ig-state-4', 'states', 'input-error-1', STATE),
    group('warning', 'states', 'ig-state-3', 'states', 'input-warning-1', STATE),
    group('information', 'states', 'ig-state-1', 'states', 'input-info-1', STATE),
    button('information, button', 'states', 'ig-state-1', 'states', 'input-info-1', {
        pixels: false,
        ignore: ['width']
    }),
    group('read-only', 'states', 'ig-state-5', 'states', 'input-readonly-1', STATE)
];
