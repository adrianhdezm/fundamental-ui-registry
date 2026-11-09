/** Visual cases for input; see ../visual.config.mjs for the fields. Adapted from the React package. */
const FS = 'sap-design-components-';
const INPUT = `${FS}forms-input--primary`;
const TEXTAREA = `${FS}forms-textarea--primary`;

/** Our field `#ours` in `story` against fundamental-styles' `#ref` in `refStory`. */
const field = (label, story, ours, refStory, ref, extra = {}) => ({
    label,
    ours: { story: `components-input--${story}`, selector: `#${ours}` },
    ref: { story: refStory, selector: `#${ref}` },
    // fundamental-styles' fields fill their page: styles only, the height included
    pixels: false,
    ignore: ['width'],
    ...extra
});

export default [
    field('input', 'examples', 'input-1', INPUT, 'input-default'),
    field('input hover', 'examples', 'input-1', INPUT, 'input-hover', { hover: true }),
    field('input disabled', 'states', 'state-dis', INPUT, 'input-disabled'),
    field('input read-only', 'states', 'state-ro', INPUT, 'input-readonly'),
    // a 4-row textarea, also in compact density (its height follows the rows)
    field('textarea', 'textarea', 'textarea-12', TEXTAREA, 'textarea-1'),
    field('textarea hover', 'textarea', 'textarea-12', TEXTAREA, 'textarea-1', { hover: true })
];
