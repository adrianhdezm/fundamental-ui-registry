/** Visual cases for input-group; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';
const REF = `${FS}forms-input-group--`;

/** Our group around the input `#ours` in `story` against fundamental-styles' group around `#ref`. */
const group = (label, story, ours, refStory, ref, extra = {}) => ({
    label,
    ours: { story: `components-input-group--${story}`, selector: `div:has(> #${ours})` },
    ref: { story: `${REF}${refStory}`, selector: `.fd-input-group:has(> #${ref})` },
    ...extra
});

/** The addon button next to the input `#ours` against fundamental-styles' next to `#ref`. */
const button = (label, story, ours, refStory, ref, extra = {}) => ({
    label,
    ours: { story: `components-input-group--${story}`, selector: `#${ours} + span button` },
    ref: { story: `${REF}${refStory}`, selector: `#${ref} + .fd-input-group__addon button` },
    ...extra
});

export default [
    // text addons
    group('text before', 'text-addon', 'ig-text-1', 'text-add-on', 'amount-usd-left'),
    group('text before hover', 'text-addon', 'ig-text-1', 'text-add-on', 'amount-usd-left', { hover: true }),
    group('text after', 'text-addon', 'ig-text-2', 'text-add-on', 'amount-euro-right'),
    group('text both sides', 'text-addon', 'ig-text-3', 'text-add-on', 'amount-usd-both'),
    {
        label: 'text addon',
        ours: { story: 'components-input-group--text-addon', selector: 'span:has(+ #ig-text-1)' },
        ref: { story: `${REF}text-add-on`, selector: '.fd-input-group__addon:has(+ #amount-usd-left)' }
    },
    {
        label: 'input',
        ours: { story: 'components-input-group--text-addon', selector: '#ig-text-2' },
        ref: { story: `${REF}text-add-on`, selector: '#amount-euro-right' },
        // fundamental-styles' input keeps the field's min-height and corner radius; the input fills the group and
        // has no background or border, so neither shows
        ignore: [
            'min-height',
            'border-top-left-radius',
            'border-top-right-radius',
            'border-bottom-right-radius',
            'border-bottom-left-radius'
        ]
    },
    // icon addons
    group('icon before', 'icon-addon', 'ig-icon-1', 'input-with-icons', 'input-icon-left'),
    group('icon after', 'icon-addon', 'ig-icon-2', 'input-with-icons', 'input-icon-right'),
    // button addons
    group('text button', 'button-addon', 'ig-button-1', 'input-with-actions', 'input-text-action-right'),
    button('text button, button', 'button-addon', 'ig-button-1', 'input-with-actions', 'input-text-action-right'),
    button(
        'text button, button hover',
        'button-addon',
        'ig-button-1',
        'input-with-actions',
        'input-text-action-right',
        {
            hover: true
        }
    ),
    group('icon button', 'button-addon', 'ig-button-2', 'input-with-actions', 'input-icon-action-right'),
    button('icon button, button', 'button-addon', 'ig-button-2', 'input-with-actions', 'input-icon-action-right'),
    button(
        'icon button, button hover',
        'button-addon',
        'ig-button-2',
        'input-with-actions',
        'input-icon-action-right',
        {
            hover: true
        }
    ),
    group('two icon buttons', 'button-addon', 'ig-button-3', 'input-with-actions', 'input-two-icon-actions'),
    group('text button before', 'button-addon', 'ig-button-4', 'input-with-actions', 'input-text-action-left'),
    // states
    group('success', 'states', 'ig-state-success', 'states', 'input-success-1'),
    group('success hover', 'states', 'ig-state-success', 'states', 'input-success-1', { hover: true }),
    group('error', 'states', 'ig-state-error', 'states', 'input-error-1'),
    group('error hover', 'states', 'ig-state-error', 'states', 'input-error-1', { hover: true }),
    group('warning', 'states', 'ig-state-warning', 'states', 'input-warning-1'),
    group('warning hover', 'states', 'ig-state-warning', 'states', 'input-warning-1', { hover: true }),
    group('information', 'states', 'ig-state-information', 'states', 'input-info-1'),
    group('information hover', 'states', 'ig-state-information', 'states', 'input-info-1', { hover: true }),
    button('information, button', 'states', 'ig-state-information', 'states', 'input-info-1'),
    group('disabled', 'states', 'ig-state-disabled', 'states', 'input-disabled-1'),
    group('read-only', 'states', 'ig-state-readonly', 'states', 'input-readonly-1'),
    group('read-only hover', 'states', 'ig-state-readonly', 'states', 'input-readonly-1', { hover: true }),
    // focus: the "Focus: …" stories focus their input in `play`; fundamental-styles shows it with `is-focus`
    group('focus', 'focus-default', 'ig-focus', 'focus', 'input-default'),
    group('focus error', 'focus-error', 'ig-focus', 'focus', 'input-error'),
    group('focus success', 'focus-success', 'ig-focus', 'focus', 'input-success'),
    group('focus warning', 'focus-warning', 'ig-focus', 'focus', 'input-warning'),
    group('focus information', 'focus-information', 'ig-focus', 'focus', 'input-info')
];
