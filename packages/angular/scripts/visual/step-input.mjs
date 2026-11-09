/** Visual cases for step-input; see ../visual.config.mjs for the fields. Adapted from the React package. */
const FS = 'sap-design-components-';
const REF = `${FS}step-input--`;

/** Our field around the input `#ours` in `story` against fundamental-styles' step input around `#ref`. */
const field = (label, story, ours, refStory, ref, extra = {}) => ({
    label,
    ours: { story: `components-step-input--${story}`, selector: `div:has(> #${ours})` },
    ref: { story: `${REF}${refStory}`, selector: `.fd-step-input:has(> #${ref})` },
    ...extra
});

/** The increment button next to the input `#ours` against fundamental-styles'. */
const button = (label, story, ours, refStory, ref, extra = {}) => ({
    label,
    ours: { story: `components-step-input--${story}`, selector: `#${ours} + button` },
    ref: { story: `${REF}${refStory}`, selector: `#${ref} + button` },
    ...extra
});

const STATES = 'validation-states';

export default [
    // value states (HC: the value and buttons stay regular, so the fields keep their width)
    field('success', STATES, 'si-state-success', 'states', 'step-5'),
    field('success hover', STATES, 'si-state-success', 'states', 'step-5', { hover: true }),
    field('information', STATES, 'si-state-information', 'states', 'step-6'),
    button('information button', STATES, 'si-state-information', 'states', 'step-6'),
    field('error', STATES, 'si-state-error', 'states', 'step-7'),
    field('error hover', STATES, 'si-state-error', 'states', 'step-7', { hover: true }),
    button('error button', STATES, 'si-state-error', 'states', 'step-7'),
    field('warning', STATES, 'si-state-warning', 'states', 'step-8'),
    field('warning hover', STATES, 'si-state-warning', 'states', 'step-8', { hover: true }),
    // focus: the "Focus" stories focus their input in `play`; fundamental-styles shows it with `is-focus`
    field('focus', 'focus-default', 'si-focus', 'focused', 'step-20'),
    field('focus success', 'focus-success', 'si-focus', 'focused', 'step-5'),
    field('focus error', 'focus-error', 'si-focus', 'focused', 'step-7'),
    field('focus warning', 'focus-warning', 'si-focus', 'focused', 'step-8'),
    button('focus error button', 'focus-error', 'si-focus', 'focused', 'step-7')
];
