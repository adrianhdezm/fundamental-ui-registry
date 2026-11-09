/** Visual cases for progress-indicator; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';
const PI = 'components-progress-indicator--';

/** Our indicator `nth` of a story (the root around the progressbar). */
const ours = (story, nth, inner = '') => ({
    story: `${PI}${story}`,
    selector: `fd-progress-indicator >> nth=${nth}${inner}`
});
/** fundamental-styles' indicator `nth` of a story. */
const ref = (story, nth, inner = '') => ({
    story: `${FS}progress-indicator--${story}`,
    selector: `.fd-progress-indicator >> nth=${nth}${inner}`
});

const VALUES = ['0%', '42%', '69%', '100%', '80 of 100 MB'];
const STATES = ['neutral', 'informative', 'positive', 'critical', 'negative'];
/** Our stories are 576px wide, fundamental-styles' fill the page: root, track and bar compare without width. */
const WIDE = { pixels: false, ignore: ['width'] };

export default [
    ...VALUES.map((label, nth) => ({
        label: `value ${label}`,
        ...WIDE,
        ours: ours('values', nth),
        ref: ref('layout', nth),
        props: ['margin-top', 'margin-bottom']
    })),
    ...STATES.map((label, nth) => ({
        label: `state ${label}`,
        ...WIDE,
        ours: ours('states', nth),
        ref: ref('value-states', nth)
    })),
    ...STATES.map((label, nth) => ({
        label: `state ${label} track`,
        ...WIDE,
        ours: ours('states', nth, ' >> [role=progressbar]'),
        ref: ref('value-states', nth, ' >> .fd-progress-indicator__container')
    })),
    ...STATES.map((label, nth) => ({
        label: `state ${label} bar`,
        ...WIDE,
        ours: ours('states', nth, ' >> [role=progressbar] > div'),
        ref: ref('value-states', nth, ' >> .fd-progress-indicator__progress-bar')
    })),
    ...STATES.slice(1).map((label, nth) => ({
        label: `state ${label} icon`,
        ours: ours('states', nth + 1, ' >> [data-glyph]'),
        ref: ref('value-states', nth + 1, ' >> .fd-progress-indicator__icon')
    })),
    {
        label: 'label 42%',
        ours: ours('states', 0, ' >> span[aria-hidden]'),
        ref: ref('value-states', 0, ' >> .fd-progress-indicator__label')
    },
    {
        label: 'label 100%',
        ours: ours('values', 3, ' >> span[aria-hidden]'),
        ref: ref('layout', 3, ' >> .fd-progress-indicator__label')
    }
];
