/** Visual cases for input; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';
const INPUT = `${FS}forms-input--primary`;
const TEXTAREA = `${FS}forms-textarea--primary`;
const TEXTAREA_STATES = `${FS}forms-textarea--states`;

/** Our field `#ours` in `story` against fundamental-styles' `#ref` in `refStory`. */
const field = (label, story, ours, refStory, ref, extra = {}) => ({
    label,
    ours: { story: `components-input--${story}`, selector: `#${ours}` },
    ref: { story: refStory, selector: `#${ref}` },
    ...extra
});

export default [
    field('input', 'examples', 'input-default', INPUT, 'input-default'),
    field('input hover', 'examples', 'input-default', INPUT, 'input-hover', { hover: true }),
    field('input error', 'states', 'state-error', INPUT, 'input-error'),
    field('input error hover', 'states', 'state-error', INPUT, 'input-error-hover', { hover: true }),
    field('input success', 'states', 'state-success', INPUT, 'input-success'),
    field('input success hover', 'states', 'state-success', INPUT, 'input-success-hover', { hover: true }),
    field('input warning', 'states', 'state-warning', INPUT, 'input-warning'),
    field('input warning hover', 'states', 'state-warning', INPUT, 'input-warning-hover', { hover: true }),
    field('input information', 'states', 'state-information', INPUT, 'input-info'),
    field('input information hover', 'states', 'state-information', INPUT, 'input-info-hover', { hover: true }),
    field('input disabled', 'states', 'state-disabled', INPUT, 'input-disabled'),
    field('input read-only', 'states', 'state-readonly', INPUT, 'input-readonly'),
    field('textarea', 'textarea-examples', 'textarea-required', TEXTAREA, 'textarea-1'),
    field('textarea hover', 'textarea-examples', 'textarea-required', TEXTAREA, 'textarea-1', { hover: true }),
    field(
        'textarea counter field',
        'textarea-counter',
        'textarea-counter',
        `${FS}forms-textarea--counter`,
        'textarea-2'
    ),
    {
        label: 'textarea counter',
        ours: { story: 'components-input--textarea-counter', selector: '#textarea-counter + div' },
        ref: { story: `${FS}forms-textarea--counter`, selector: '.fd-textarea-counter' }
    },
    field('textarea success', 'textarea-states', 'textarea-success', TEXTAREA_STATES, 'textarea-3'),
    field('textarea error', 'textarea-states', 'textarea-error', TEXTAREA_STATES, 'textarea-4'),
    field('textarea warning', 'textarea-states', 'textarea-warning', TEXTAREA_STATES, 'textarea-5'),
    field('textarea information', 'textarea-states', 'textarea-information', TEXTAREA_STATES, 'textarea-6'),
    field(
        'textarea disabled',
        'textarea-states',
        'textarea-disabled',
        `${FS}forms-textarea--disabled-and-read-only`,
        'textarea-7'
    ),
    field(
        'textarea read-only',
        'textarea-states',
        'textarea-readonly',
        `${FS}forms-textarea--disabled-and-read-only`,
        'textarea-8'
    )
];
