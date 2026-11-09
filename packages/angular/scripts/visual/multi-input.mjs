/** Visual cases for multi-input; see ../visual.config.mjs for the fields. */
const MI = 'sap-design-patterns-multi-input--';
const OURS = 'components-multi-input--';

/** The field (tokenizer and addon button) of our "As form item" story. */
const FIELD = '#mi-form-item div:has(> div > #formItemMultiInput)';
/** Our popup: the popover surface around the list. */
const POPUP = 'div:has(> div > ul[role="listbox"])';

/** fundamental-styles' option spacing is on the form item around its check box, ours on the option. */
const OPTION = { ignore: ['min-height', 'padding-left', 'padding-right'] };

/** fundamental-styles' "As Form Item" multi input, the field and its open list. */
const item = (label, ours, ref, { open = false, ...extra } = {}) => ({
    label,
    ours: { story: `${OURS}${open ? 'open-default' : 'as-form-item'}`, selector: ours, overlay: open },
    ref: { story: `${MI}as-form-item`, selector: ref },
    ...extra
});

export default [
    // fundamental-styles' input group sets no minimum height; ours keeps the field height as its minimum
    item('field', FIELD, '.fd-input-group--control', { ignore: ['min-height'] }),
    item('field hover', FIELD, '.fd-input-group--control', { hover: true, ignore: ['min-height'] }),
    item('token', `${FIELD} [role=option] >> nth=0`, '.fd-token >> nth=0', { props: ['margin-left', 'margin-right'] }),
    item('input', '#formItemMultiInput', '#formItemMultiInput', {
        // fundamental-styles' input keeps its own min-height (100%); ours stretches to the field (see token). Its
        // input group input class pads the end (10px) instead of the tokenizer input's 5px on both sides
        ignore: ['min-height', 'padding-left', 'padding-right', 'width'],
        // the input is as wide as the room the tokens leave
        pixels: false
    }),
    item('addon button', `${FIELD} button[aria-haspopup]`, '.fd-input-group__button'),
    item('addon button hover', `${FIELD} button[aria-haspopup]`, '.fd-input-group__button', { hover: true }),
    // fundamental-styles' list leaves its token "Kiwi" unselected; ours selects all four tokens, and a selected option
    // is 1px taller (its selection line): styles only, without the height
    item('popup', POPUP, '.fd-popover__body', { open: true, pixels: false, ignore: ['height'] }),
    item('list', 'ul[role="listbox"]', '.fd-list--multi-input', { open: true, pixels: false, ignore: ['height'] }),
    item(
        'selected option',
        'ul[role="listbox"] [role="option"] >> nth=0',
        '.fd-list--multi-input .fd-list__item >> nth=0',
        {
            open: true,
            ...OPTION
        }
    ),
    item('option', 'ul[role="listbox"] [role="option"] >> nth=4', '.fd-list--multi-input .fd-list__item >> nth=4', {
        open: true,
        ...OPTION
    }),
    item(
        'option hover',
        'ul[role="listbox"] [role="option"] >> nth=4',
        '.fd-list--multi-input .fd-list__item >> nth=4',
        { open: true, hover: true, ...OPTION }
    ),
    item(
        'selected option hover',
        'ul[role="listbox"] [role="option"] >> nth=0',
        '.fd-list--multi-input .fd-list__item >> nth=0',
        { open: true, hover: true, ...OPTION }
    ),
    item(
        'check box',
        'ul[role="listbox"] [role="option"] >> nth=0 >> span[aria-hidden="true"]',
        '.fd-list--multi-input .fd-list__item >> nth=0 >> .fd-checkbox__checkmark',
        // fundamental-styles draws the box and the check mark on the label of a hidden checkbox
        { open: true, pixels: false }
    ),
    item(
        'option title',
        'ul[role="listbox"] [role="option"] >> nth=4 >> span:not([aria-hidden])',
        '.fd-list--multi-input .fd-list__item >> nth=4 >> .fd-list__title',
        // ours fills the option, theirs takes the room the check box leaves: styles only
        { open: true, pixels: false, ignore: ['width'] }
    ),
    // the mobile dialog: fundamental-styles' list fills a docs dialog of another width, so styles only
    {
        label: 'mobile option',
        pixels: false,
        ignore: ['width', ...OPTION.ignore],
        ours: { story: `${OURS}open-mobile`, selector: '[role="dialog"] ul [role="option"] >> nth=4', overlay: true },
        ref: { story: `${MI}mobile-mode`, selector: '.fd-dialog .fd-list__item >> nth=0' }
    },
    {
        label: 'mobile select all button',
        ours: {
            story: `${OURS}open-mobile`,
            selector: '[role="dialog"] button[aria-label="Select all"]',
            overlay: true
        },
        ref: { story: `${MI}mobile-mode`, selector: '.fd-dialog__subheader .fd-bar__element >> nth=1 >> button' }
    }
];
