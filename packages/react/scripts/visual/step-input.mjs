/** Visual cases for step-input; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';
const REF = `${FS}step-input--`;

/** Our field around the input `#ours` in `story` against fundamental-styles' step input around `#ref`. */
const field = (label, story, ours, refStory, ref, extra = {}) => ({
    label,
    ours: { story: `components-step-input--${story}`, selector: `[role=group]:has(> #${ours})` },
    ref: { story: `${REF}${refStory}`, selector: `.fd-step-input:has(> #${ref})` },
    ...extra
});

/** The increment (`+`) or decrement (`-`) button next to the input `#ours` against fundamental-styles'. */
const button = (label, which, story, ours, refStory, ref, extra = {}) => ({
    label,
    ours: {
        story: `components-step-input--${story}`,
        selector: which === '+' ? `#${ours} + button` : `button:has(+ #${ours})`
    },
    ref: {
        story: `${REF}${refStory}`,
        selector: which === '+' ? `#${ref} + button` : `button:has(+ #${ref})`
    },
    ...extra
});

export default [
    // primary
    field('primary', 'primary', 'si-primary', 'primary', 'step-3'),
    field('primary hover', 'primary', 'si-primary', 'primary', 'step-3', { hover: true }),
    button('decrement button', '-', 'primary', 'si-primary', 'primary', 'step-3'),
    button('increment button', '+', 'primary', 'si-primary', 'primary', 'step-3'),
    button('increment button hover', '+', 'primary', 'si-primary', 'primary', 'step-3', { hover: true }),
    {
        label: 'input',
        ours: { story: 'components-step-input--primary', selector: '#si-primary' },
        ref: { story: `${REF}primary`, selector: '#step-3' },
        // fundamental-styles' input keeps the field's height, min-height and corner radius and is clipped by the
        // field (in HC, whose 2px border leaves 32px inside); ours fills the field and has no background or border:
        // not visible, styles only (the field cases compare the pixels)
        pixels: false,
        ignore: [
            'height',
            'min-height',
            'border-top-left-radius',
            'border-top-right-radius',
            'border-bottom-right-radius',
            'border-bottom-left-radius'
        ]
    },
    // value states
    field('success', 'states', 'si-state-success', 'states', 'step-5'),
    field('success hover', 'states', 'si-state-success', 'states', 'step-5', { hover: true }),
    button('success button hover', '+', 'states', 'si-state-success', 'states', 'step-5', { hover: true }),
    field('information', 'states', 'si-state-information', 'states', 'step-6'),
    field('information hover', 'states', 'si-state-information', 'states', 'step-6', { hover: true }),
    button('information button', '+', 'states', 'si-state-information', 'states', 'step-6'),
    button('information button hover', '+', 'states', 'si-state-information', 'states', 'step-6', {
        hover: true
    }),
    field('error', 'states', 'si-state-error', 'states', 'step-7'),
    field('error hover', 'states', 'si-state-error', 'states', 'step-7', { hover: true }),
    button('error button', '+', 'states', 'si-state-error', 'states', 'step-7'),
    button('error button hover', '+', 'states', 'si-state-error', 'states', 'step-7', { hover: true }),
    field('warning', 'states', 'si-state-warning', 'states', 'step-8'),
    field('warning hover', 'states', 'si-state-warning', 'states', 'step-8', { hover: true }),
    button('warning button hover', '+', 'states', 'si-state-warning', 'states', 'step-8', { hover: true }),
    // disabled, read-only, full width
    field('disabled', 'disabled', 'si-disabled', 'disabled', 'step-13'),
    // the dimmed field takes no pointer events, so the cursor of its disabled button never shows
    button('disabled button', '+', 'disabled', 'si-disabled', 'disabled', 'step-13', { ignore: ['cursor'] }),
    field('read-only', 'read-only', 'si-readonly', 'read-only', 'step-14', {
        // fundamental-styles keeps the buttons of a read-only step input; Angular and the Fiori guidelines hide them,
        // so the field is narrower: styles only
        pixels: false,
        ignore: ['width']
    }),
    field('read-only hover', 'read-only', 'si-readonly', 'read-only', 'step-14', {
        hover: true,
        pixels: false,
        ignore: ['width']
    }),
    {
        label: 'read-only input',
        ours: { story: 'components-step-input--read-only', selector: '#si-readonly' },
        ref: { story: `${REF}read-only`, selector: '#step-14' },
        // without buttons the input takes the field padding, so it is wider; fundamental-styles' read-only input
        // repeats the field's read-only background and dashed line over it (same colours), ours is transparent on the
        // field; as the input case for height, min-height and radius
        pixels: false,
        ignore: [
            'width',
            'padding-left',
            'padding-right',
            'background-color',
            'background-image',
            'height',
            'min-height',
            'border-top-left-radius',
            'border-top-right-radius',
            'border-bottom-right-radius',
            'border-bottom-left-radius'
        ]
    },
    field('full width', 'full-width', 'si-full-default', 'full-width', 'step-3f'),
    field('full width error', 'full-width', 'si-full-error', 'full-width', 'step-7f'),
    // focus: the "Focus: …" stories focus their input in `play`; fundamental-styles shows it with `is-focus`
    field('focus', 'focus-default', 'si-focus', 'focused', 'step-20'),
    field('focus success', 'focus-success', 'si-focus', 'focused', 'step-5'),
    field('focus information', 'focus-information', 'si-focus', 'focused', 'step-6'),
    field('focus error', 'focus-error', 'si-focus', 'focused', 'step-7'),
    field('focus warning', 'focus-warning', 'si-focus', 'focused', 'step-8'),
    button('focus error button', '+', 'focus-error', 'si-focus', 'focused', 'step-7')
];
