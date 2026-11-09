/** Visual cases for multi-combobox; see ../visual.config.mjs for the fields. */
const MC = 'sap-design-patterns-multi-combobox--';
const OURS = 'components-multi-combobox--';

/** The field (tokenizer and addon button) of our "As form item" story. */
const FIELD = '#mcb-form-item div:has(> div > #formItemMultiCombobox)';
/** Our popup: the popover surface around the list. */
const POPUP = 'div:has(> div > ul[role="listbox"])';
const OPTION_SEL = (n) => `ul[role="listbox"] [role="option"] >> nth=${n}`;
const REF_OPTION = (n) => `.fd-list--multi-input .fd-list__item >> nth=${n}`;

/** fundamental-styles' option spacing is on the form item around its check box, ours on the option. */
const OPTION = { ignore: ['min-height', 'padding-left', 'padding-right'] };

/** fundamental-styles' "As Form Item" multi combobox, the field and its open list. */
const item = (label, ours, ref, { open = false, ...extra } = {}) => ({
    label,
    ours: { story: `${OURS}${open ? 'open-default' : 'as-form-item'}`, selector: ours },
    ref: { story: `${MC}as-form-item`, selector: ref },
    ...extra
});

export default [
    // fundamental-styles' input group sets no minimum height; ours keeps the field height as its minimum
    item('field', FIELD, '.fd-input-group--control', { ignore: ['min-height'] }),
    item('field hover', FIELD, '.fd-input-group--control', { hover: true, ignore: ['min-height'] }),
    item('token', `${FIELD} [role=option] >> nth=0`, '.fd-token >> nth=0', { props: ['margin-left', 'margin-right'] }),
    item('input', '#formItemMultiCombobox', '.fd-tokenizer__input', {
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
    item('selected option', OPTION_SEL(0), REF_OPTION(0), { open: true, ...OPTION }),
    item('option', OPTION_SEL(4), REF_OPTION(4), { open: true, ...OPTION }),
    item('option hover', OPTION_SEL(4), REF_OPTION(4), { open: true, hover: true, ...OPTION }),
    item('selected option hover', OPTION_SEL(0), REF_OPTION(0), { open: true, hover: true, ...OPTION }),
    item(
        'check box',
        `${OPTION_SEL(0)} >> span[aria-hidden="true"]`,
        `${REF_OPTION(0)} >> .fd-checkbox__checkmark`,
        // fundamental-styles draws the box and the check mark on the label of a hidden checkbox
        { open: true, pixels: false }
    ),
    item(
        'option title',
        `${OPTION_SEL(4)} >> span:not([aria-hidden])`,
        `${REF_OPTION(4)} >> .fd-list__title`,
        // ours fills the option, theirs takes the room the check box leaves: styles only
        { open: true, pixels: false, ignore: ['width'] }
    ),
    // "Two Column Combo Box": the secondary text. fundamental-styles' titles show a search text in bold, which changes
    // how title and secondary text share the row: styles only, without the width
    {
        label: 'secondary text',
        pixels: false,
        ignore: ['width'],
        ours: { story: `${OURS}open-two-columns`, selector: `${OPTION_SEL(0)} >> span[title] >> nth=1` },
        ref: { story: `${MC}two-column-combo-box`, selector: '.fd-list__secondary >> nth=0' }
    },
    // "Semantic": the message on top of the list
    {
        label: 'list message',
        ours: { story: `${OURS}open-semantic`, selector: 'div:has(+ ul[role="listbox"])' },
        ref: { story: `${MC}semantic`, selector: '.fd-list__message' }
    },
    // the mobile dialog: fundamental-styles' list fills a docs dialog of another width, so styles only
    {
        label: 'mobile option',
        pixels: false,
        ignore: ['width', ...OPTION.ignore],
        ours: { story: `${OURS}open-mobile`, selector: '[role="dialog"] ul [role="option"] >> nth=4' },
        ref: { story: `${MC}mobile-mode`, selector: '.fd-dialog .fd-list__item >> nth=3' }
    }
];
