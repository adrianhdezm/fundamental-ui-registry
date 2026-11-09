/** Visual cases for bar; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

const OURS = 'components-bar--designs';
const REF = `${FS}bar--`;

// The areas stretch to the bar's height (bar-1). Their contents differ from fundamental-styles' (texts, an avatar,
// compact footer buttons) and the bars are as wide as their container: computed styles and heights are compared.
export default [
    {
        label: 'left area with a title',
        pixels: false,
        ignore: ['width'],
        ours: { story: OURS, selector: '[aria-label="Bar with title"] > [fd-bar-left]' },
        ref: { story: `${REF}default`, selector: '.fd-bar >> nth=0 >> .fd-bar__left' }
    },
    {
        label: 'right area',
        pixels: false,
        ignore: ['width'],
        ours: { story: OURS, selector: '[aria-label="Bar with title"] > [fd-bar-right]' },
        ref: { story: `${REF}default`, selector: '.fd-bar >> nth=0 >> .fd-bar__right' }
    },
    {
        label: 'footer actions',
        pixels: false,
        ignore: ['width'],
        ours: { story: OURS, selector: '[aria-label="Footer"] > [fd-bar-right]' },
        ref: { story: `${REF}footer`, selector: '.fd-bar__right' }
    }
];
