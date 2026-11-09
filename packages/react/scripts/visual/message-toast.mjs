/** Visual cases for message-toast; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

// our toasts are opened by the story's play function into the story root (`container`); fundamental-styles'
// Default toast story shows the same two messages as static elements
const OURS = 'components-message-toast--open-texts';
const REF = `${FS}message-toast--default-toast`;

export default [
    {
        label: 'short message',
        ours: { story: OURS, selector: '[data-message-toast]:has-text("Product added")' },
        ref: { story: REF, selector: '.fd-message-toast:has-text("Product added")' }
    },
    {
        label: 'long message, at most 15rem wide',
        props: ['max-width', 'text-align'],
        ours: { story: OURS, selector: '[data-message-toast]:has-text("Lorem ipsum")' },
        ref: { story: REF, selector: '.fd-message-toast:has-text("Lorem ipsum")' }
    }
];
