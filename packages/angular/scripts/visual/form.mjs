/** Visual cases for form; see ../visual.config.mjs for the fields. Adapted from the React package. */
const FS = 'sap-design-components-';
const STORY = 'components-form--headers-and-messages';

export default [
    // the header line: 1px, 2px in high contrast
    {
        label: 'form header',
        pixels: false,
        ignore: ['width'],
        ours: { story: STORY, selector: '#formHeader' },
        ref: { story: `${FS}forms-form-header--primary`, selector: '.fd-form-header' }
    },
    {
        label: 'group header',
        // fundamental-styles' bar is as wide as its page and its title an inner <h4>: the bar's styles only
        pixels: false,
        ignore: ['width', 'font-family', 'font-size', 'font-weight'],
        ours: { story: STORY, selector: '#basicGroupHeader' },
        ref: { story: `${FS}forms-form-group--group-header`, selector: '.fd-form-group__header:has(#basicGroupHeader)' }
    },
    // a static message in a wide block is as wide as its text (fundamental-styles' message, the same text)
    {
        label: 'static message',
        ours: { story: STORY, selector: '#staticMessage' },
        ref: { story: `${FS}forms-form-message--information`, selector: '.fd-form-message' }
    }
];
