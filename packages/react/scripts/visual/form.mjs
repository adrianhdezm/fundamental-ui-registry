/** Visual cases for form; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

/**
 * Our label `for` in the Labels story against a fundamental-styles label story. Our `<label>` is a flex row (as
 * Angular's, room for the inline help) and its text span carries fundamental-styles' `.fd-form-label` styles.
 */
const label = (name, htmlFor, story) => ({
    label: name,
    ours: { story: 'components-form--labels', selector: `label[for="${htmlFor}"] > span` },
    ref: { story: `${FS}forms-form-label--${story}`, selector: '.fd-form-label' }
});

/** Our message of a type in the Messages story against fundamental-styles' Form Message story. */
const message = (type) => ({
    label: `message ${type}`,
    ours: { story: 'components-form--messages', selector: `[data-type="${type}"]` },
    ref: { story: `${FS}forms-form-message--${type}`, selector: '.fd-form-message' }
});

export default [
    label('label', 'l1', 'primary'),
    label('label required', 'l2', 'required'),
    label('label colon', 'l3', 'colon'),
    label('label disabled', 'l6', 'disabled'),
    {
        label: 'form item',
        ours: { story: 'components-form--items', selector: '[data-slot=form-item]:has(#item-1) > label > span' },
        ref: { story: `${FS}forms-form-item--primary`, selector: '.fd-form-item > label' }
    },
    {
        label: 'form item required',
        ours: { story: 'components-form--items', selector: '[data-slot=form-item]:has(#item-2) > label > span' },
        ref: { story: `${FS}forms-form-item--required`, selector: '.fd-form-item > label' }
    },
    {
        label: 'form header',
        pixels: false,
        ignore: ['width'],
        ours: { story: 'components-form--fieldset-and-groups', selector: 'h4:has(> span)' },
        ref: { story: `${FS}forms-form-header--primary`, selector: '.fd-form-header' }
    },
    {
        label: 'form header text',
        ours: { story: 'components-form--fieldset-and-groups', selector: 'h4 > span' },
        ref: { story: `${FS}forms-form-header--primary`, selector: '.fd-form-header__text' }
    },
    ...[
        ['group header', 'basicGroupHeader'],
        ['group header without padding', 'noPaddingGroupHeader'],
        ['group header without border', 'noBorderGroupHeader']
    ].map(([name, id]) => ({
        label: name,
        // fundamental-styles' bar is as wide as its page; the title text is an inner <h4>, compared below
        pixels: false,
        ignore: ['width', 'font-family', 'font-size', 'font-weight'],
        ours: { story: 'components-form--fieldset-and-groups', selector: `#${id}` },
        ref: { story: `${FS}forms-form-group--group-header`, selector: `.fd-form-group__header:has(#${id})` }
    })),
    {
        label: 'group header text',
        // our title is the bar itself (Angular), theirs an inner <h4>: only the typography compares
        pixels: false,
        ignore: [
            'width',
            'height',
            'min-height',
            'padding-left',
            'padding-right',
            'background-color',
            'border-bottom-width',
            'border-bottom-color',
            'border-bottom-style'
        ],
        ours: { story: 'components-form--fieldset-and-groups', selector: '#basicGroupHeader' },
        ref: { story: `${FS}forms-form-group--group-header`, selector: '#basicGroupHeader' }
    },
    {
        label: 'legend',
        ours: { story: 'components-form--radio-button-groups', selector: 'legend >> nth=0' },
        ref: { story: `${FS}forms-field-set--radio-button-groups`, selector: 'legend' }
    },
    message('success'),
    message('error'),
    message('warning'),
    message('information')
];
