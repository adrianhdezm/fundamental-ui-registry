/** Visual cases for combobox; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';
const IG = `${FS}forms-input-group--`;
const COMBOBOX = 'sap-design-patterns-combobox-input--';
const OURS = 'components-combobox--';

/** Our input group around the input `#id` in `story`. */
const ourGroup = (story, id) => ({ story: `${OURS}${story}`, selector: `div[role=group]:has(> #${id})` });
/** fundamental-styles' input group around the input `#id` in `story`. */
const refGroup = (story, id) => ({ story, selector: `.fd-input-group:has(> #${id})` });

/** fundamental-styles' "As form item" popover body. */
const BODY = '#amsfiaufuaskhjd';
/** Our popup (the surface around the list) in an "Open: …" story. */
const POPUP = 'div:has(> ul[role=listbox])';

export default [
    // the field, against fundamental-styles' "As form item" combobox ("Select Fruit")
    {
        label: 'field',
        ours: ourGroup('as-form-item', 'cb-fs'),
        ref: refGroup(`${COMBOBOX}as-form-item`, 'comboboxAsFormItem')
    },
    {
        label: 'field hover',
        hover: true,
        ours: ourGroup('as-form-item', 'cb-fs'),
        ref: refGroup(`${COMBOBOX}as-form-item`, 'comboboxAsFormItem')
    },
    {
        label: 'dropdown button',
        ours: { story: `${OURS}as-form-item`, selector: '#cb-fs + span button' },
        ref: { story: `${COMBOBOX}as-form-item`, selector: '#ansid87arfgj' }
    },
    {
        label: 'dropdown button hover',
        hover: true,
        ours: { story: `${OURS}as-form-item`, selector: '#cb-fs + span button' },
        ref: { story: `${COMBOBOX}as-form-item`, selector: '#ansid87arfgj' }
    },
    // the focused field: fundamental-styles shows focus with `is-focus` on an input group
    {
        label: 'focus',
        pixels: false,
        ours: ourGroup('focus', 'cb-fs'),
        ref: { story: `${IG}focus`, selector: '.fd-input-group:has(> #input-default)' }
    },
    // value states, disabled and read-only: other texts and layouts (four fields in a row here), so styles without
    // the width
    {
        label: 'error',
        pixels: false,
        ignore: ['width'],
        ours: ourGroup('validation-states', 'cb-state-error'),
        ref: refGroup(`${IG}states`, 'input-error-1')
    },
    {
        label: 'warning',
        pixels: false,
        ignore: ['width'],
        ours: ourGroup('validation-states', 'cb-state-warning'),
        ref: refGroup(`${IG}states`, 'input-warning-1')
    },
    {
        label: 'information',
        pixels: false,
        ignore: ['width'],
        ours: ourGroup('validation-states', 'cb-state-information'),
        ref: refGroup(`${IG}states`, 'input-info-1')
    },
    {
        label: 'success',
        pixels: false,
        ignore: ['width'],
        ours: ourGroup('validation-states', 'cb-state-success'),
        ref: refGroup(`${COMBOBOX}semantic`, 'semanticCombobox')
    },
    {
        label: 'disabled',
        pixels: false,
        ignore: ['width'],
        ours: ourGroup('disabled-and-read-only', 'cb-disabled'),
        ref: refGroup(`${COMBOBOX}disabled-and-read-only`, 'disabledCombobox')
    },
    {
        // the combobox's read-only example is a bare input; compare with the read-only input group
        label: 'read-only',
        pixels: false,
        ignore: ['width'],
        ours: ourGroup('disabled-and-read-only', 'cb-readonly'),
        ref: refGroup(`${IG}states`, 'input-readonly-1')
    },
    // the open list, against the "As form item" popover
    {
        label: 'popup',
        pixels: false,
        // ours holds 13 items in 50vh, theirs 13 in a docs height
        ignore: ['height'],
        ours: { story: `${OURS}open-as-form-item`, selector: POPUP },
        ref: { story: `${COMBOBOX}as-form-item`, selector: BODY }
    },
    {
        label: 'list',
        pixels: false,
        ignore: ['height'],
        ours: { story: `${OURS}open-as-form-item`, selector: 'ul[role=listbox]' },
        ref: { story: `${COMBOBOX}as-form-item`, selector: `${BODY} ul` }
    },
    {
        label: 'item',
        ours: { story: `${OURS}open-as-form-item`, selector: '[role=option]:nth-child(2)' },
        ref: { story: `${COMBOBOX}as-form-item`, selector: `${BODY} li:nth-child(2)` }
    },
    {
        label: 'item hover',
        hover: true,
        ours: { story: `${OURS}open-as-form-item`, selector: '[role=option]:nth-child(2)' },
        ref: { story: `${COMBOBOX}as-form-item`, selector: `${BODY} li:nth-child(2)` }
    },
    {
        // their selected "Apple" has the bold search text "App"
        label: 'item selected',
        pixels: false,
        ours: { story: `${OURS}open-selected`, selector: '[role=option][aria-selected=true]' },
        ref: { story: `${COMBOBOX}as-form-item`, selector: `${BODY} li.is-selected` }
    },
    {
        // our highlighted item (aria-activedescendant), which the arrow key also chose, against their focused
        // selected item
        label: 'item highlighted',
        pixels: false,
        refFocus: true,
        ours: { story: `${OURS}open-filtered`, selector: '[role=option][data-active]' },
        ref: { story: `${COMBOBOX}as-form-item`, selector: `${BODY} li.is-selected` }
    },
    {
        label: 'bold search text',
        pixels: false,
        ignore: ['width'],
        ours: { story: `${OURS}open-filtered`, selector: '[role=option] b' },
        ref: { story: `${COMBOBOX}as-form-item`, selector: `${BODY} .fd-list__bold` }
    },
    // groups: their header is a <label> before each list, ours a presentational item of the group
    {
        label: 'group header',
        pixels: false,
        ignore: ['width'],
        ours: { story: `${OURS}open-groups`, selector: '[role=group] > li[role=presentation]' },
        ref: { story: `${COMBOBOX}two-items-and-items-grouping`, selector: '#fruitListHeader' }
    },
    {
        label: 'group header title',
        // their header shrinks to the text ("Fruits" in a label), ours fills the list; their title keeps the 1rem
        // minimum height of item titles, not visible on its 2rem line
        pixels: false,
        ignore: ['width', 'min-height'],
        ours: { story: `${OURS}open-groups`, selector: '[role=group] > li[role=presentation] [data-slot=list-title]' },
        ref: { story: `${COMBOBOX}two-items-and-items-grouping`, selector: '#fruitListHeader .fd-list__title' }
    },
    // two columns: a title and a secondary text
    {
        label: 'two-column item',
        // their field and list are as wide as the content (a flex column), ours as wide as the form item
        pixels: false,
        ignore: ['width'],
        ours: { story: `${OURS}open-two-items`, selector: '[role=option]:nth-child(2)' },
        ref: { story: `${COMBOBOX}two-items-and-items-grouping`, selector: '#F4GRTGLK6 li:nth-child(2)' }
    },
    {
        label: 'secondary text',
        // theirs grows in the item with the text at its end, ours is pushed to the end: the text sits at the same
        // place (two-column item above)
        pixels: false,
        ignore: ['width'],
        ours: { story: `${OURS}open-two-items`, selector: '[role=option]:nth-child(2) [data-slot=list-secondary]' },
        ref: {
            story: `${COMBOBOX}two-items-and-items-grouping`,
            selector: '#F4GRTGLK6 li:nth-child(2) .fd-list__secondary'
        }
    },
    // the value state message on top of the list
    {
        label: 'state message',
        pixels: false,
        ignore: ['width'],
        ours: { story: `${OURS}open-success`, selector: '[data-slot=list-message]' },
        ref: { story: `${COMBOBOX}semantic`, selector: '.fd-list__message--success' }
    }
];
