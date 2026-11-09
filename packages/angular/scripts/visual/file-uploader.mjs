/** Visual cases for file-uploader; see ../visual.config.mjs for the fields. Adapted from the React package. */
const FS = 'sap-design-components-';
const PRIMARY = `${FS}file-uploader--primary`;
const OURS = 'components-file-uploader--default';
const FIELD = 'input[type=text] >> nth=0';

export default [
    // the drop zone around field and button: 44px high in cozy (the field keeps its margins)
    {
        label: 'uploader',
        ours: { story: OURS, selector: '[fdfiledragndrop] >> nth=0' },
        ref: { story: PRIMARY, selector: '.fd-file-uploader__container' },
        // the placeholder texts may differ: the size and box are compared by the styles
        pixels: false
    },
    {
        label: 'field',
        pixels: false,
        ignore: ['width'],
        props: ['margin-top', 'margin-bottom'],
        ours: { story: OURS, selector: FIELD },
        ref: { story: PRIMARY, selector: '#browse_input1' }
    },
    {
        label: 'field hover',
        hover: true,
        pixels: false,
        ignore: ['width'],
        ours: { story: OURS, selector: FIELD },
        ref: { story: PRIMARY, selector: '#browse_input1' }
    },
    {
        label: 'button',
        ours: { story: OURS, selector: 'button:has-text("Browse") >> nth=0' },
        ref: { story: PRIMARY, selector: '#file-uploader-button-1' }
    }
];
