/** Visual cases for search-input; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';
const IG = `${FS}forms-input-group--`;
const COMBOBOX = 'sap-design-patterns-combobox-input--';
const OURS = 'components-search-input--';

/** The input group around our input `#ours` in `story` against fundamental-styles' group around `#ref`. */
const group = (label, story, ours, refStory, ref, extra = {}) => ({
    label,
    ours: { story: `${OURS}${story}`, selector: `div:has(> ${ours})` },
    ref: { story: `${IG}${refStory}`, selector: `.fd-input-group:has(> #${ref})` },
    ...extra
});

/** Our popup (the surface around the list) in an "Open: …" story. */
const POPUP = 'div:has(> div > ul[role="listbox"])';

export default [
    // the field: fundamental-styles' "Input with 2 icon actions" (clear and search buttons, value 100)
    group('field', 'default', '#search-value', 'input-with-actions', 'input-two-icon-actions'),
    group('field hover', 'default', '#search-value', 'input-with-actions', 'input-two-icon-actions', { hover: true }),
    {
        label: 'clear button',
        ours: { story: `${OURS}default`, selector: '#search-value + span button' },
        ref: { story: `${IG}input-with-actions`, selector: '#input-two-icon-actions + .fd-input-group__addon button' }
    },
    {
        label: 'clear button hover',
        hover: true,
        ours: { story: `${OURS}default`, selector: '#search-value + span button' },
        ref: { story: `${IG}input-with-actions`, selector: '#input-two-icon-actions + .fd-input-group__addon button' }
    },
    {
        label: 'search button',
        ours: { story: `${OURS}default`, selector: '#search-value + span + span button' },
        ref: { story: `${IG}input-with-actions`, selector: '#input-two-icon-actions + span + span button' }
    },
    {
        label: 'search button hover',
        hover: true,
        ours: { story: `${OURS}default`, selector: '#search-value + span + span button' },
        ref: { story: `${IG}input-with-actions`, selector: '#input-two-icon-actions + span + span button' }
    },
    // fundamental-styles' "Input with icon action" has a value and a dropdown arrow: styles only
    group('field without text', 'default', '#search-default', 'input-with-actions', 'input-icon-action-right', {
        pixels: false
    }),
    // states, read-only and disabled: fundamental-styles' States groups have other addons, so styles only
    group('error', 'validation-states', 'input[placeholder="Error"]', 'states', 'input-error-1', { pixels: false }),
    group('warning', 'validation-states', 'input[placeholder="Warning"]', 'states', 'input-warning-1', {
        pixels: false
    }),
    group('success', 'validation-states', 'input[placeholder="Success"]', 'states', 'input-success-1', {
        pixels: false
    }),
    group('information', 'validation-states', 'input[placeholder="Information"]', 'states', 'input-info-1', {
        pixels: false
    }),
    group('disabled', 'disabled', 'input[placeholder="Placeholder"]', 'states', 'input-disabled-1', { pixels: false }),
    group('read-only', 'read-only', 'input[placeholder="Read Only"]', 'states', 'input-readonly-1', { pixels: false }),
    // focus: the "Focus: default" story focuses its input; fundamental-styles shows it with `is-focus`
    {
        label: 'focus',
        pixels: false,
        ours: { story: `${OURS}focus`, selector: 'div:has(> #search-focus)' },
        ref: { story: `${IG}focus`, selector: '.fd-input-group:has(> #input-default)' }
    },
    // the suggestions against fundamental-styles' combobox popover
    {
        label: 'popup',
        pixels: false,
        // the body holds 9 suggestions here and 13 (cut by a docs height) there
        ignore: ['height'],
        ours: { story: `${OURS}open-default`, selector: POPUP },
        ref: { story: `${COMBOBOX}as-form-item`, selector: '#amsfiaufuaskhjd' }
    },
    {
        label: 'list',
        pixels: false,
        ignore: ['height'],
        ours: { story: `${OURS}open-default`, selector: 'ul[role="listbox"]' },
        ref: { story: `${COMBOBOX}as-form-item`, selector: '#amsfiaufuaskhjd ul' }
    },
    {
        label: 'item',
        ours: { story: `${OURS}open-default`, selector: '[role="option"]:nth-child(9)' },
        ref: { story: `${COMBOBOX}as-form-item`, selector: '#amsfiaufuaskhjd li:nth-child(2)' }
    },
    {
        label: 'item hover',
        hover: true,
        ours: { story: `${OURS}open-default`, selector: '[role="option"]:nth-child(9)' },
        ref: { story: `${COMBOBOX}as-form-item`, selector: '#amsfiaufuaskhjd li:nth-child(2)' }
    },
    {
        // our highlighted suggestion (aria-activedescendant) against fundamental-styles' focused item
        label: 'item highlighted',
        pixels: false,
        refFocus: true,
        ours: { story: `${OURS}open-filtered`, selector: '[role="option"][data-active]' },
        ref: { story: `${COMBOBOX}as-form-item`, selector: '#amsfiaufuaskhjd li:nth-child(2)' }
    },
    {
        label: 'bold search text',
        pixels: false,
        ignore: ['width', 'height'],
        ours: { story: `${OURS}open-filtered`, selector: '[role="option"] b' },
        ref: { story: `${COMBOBOX}as-form-item`, selector: '#amsfiaufuaskhjd .fd-list__bold' }
    },
    {
        label: 'no result',
        pixels: false,
        // the "No result" row is not an option and cannot be chosen: no pointer cursor (a list item there)
        ignore: ['width', 'cursor'],
        ours: { story: `${OURS}open-no-result`, selector: '[role="status"] > div' },
        ref: { story: `${COMBOBOX}as-form-item`, selector: '#amsfiaufuaskhjd li:nth-child(2)' }
    },
    {
        label: 'state message',
        pixels: false,
        ignore: ['width'],
        ours: { story: `${OURS}open-success`, selector: '[data-slot="list-message"]' },
        ref: { story: `${COMBOBOX}semantic`, selector: '.fd-list__message--success' }
    }
];
