/** Visual cases for icon; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

export default [
    {
        label: 'size md',
        ours: { story: 'components-icon--sizes', selector: 'fd-icon[data-glyph] >> nth=1' },
        ref: { story: `${FS}icons-sap-icons--sizes`, selector: '.sap-icon >> nth=1' }
    },
    {
        label: 'size xxl',
        ours: { story: 'components-icon--sizes', selector: 'fd-icon[data-glyph] >> nth=4' },
        ref: { story: `${FS}icons-sap-icons--sizes`, selector: '.sap-icon >> nth=4' }
    },
    {
        label: 'narrow glyph',
        ours: { story: 'components-icon--rtl', selector: 'fd-icon[data-glyph] >> nth=0' },
        ref: { story: `${FS}icons-sap-icons--sizes`, selector: '.sap-icon >> nth=1' },
        // a different glyph: only the box is compared
        pixels: false,
        ignore: ['height', 'font-size', 'line-height', 'color']
    },
    {
        label: 'color default',
        ours: { story: 'components-icon--colors', selector: 'fd-icon[data-glyph] >> nth=0' },
        ref: { story: `${FS}icons-sap-icons--colors`, selector: '.sap-icon--color-default' }
    },
    {
        label: 'color negative',
        ours: { story: 'components-icon--colors', selector: 'fd-icon[data-glyph] >> nth=6' },
        ref: { story: `${FS}icons-sap-icons--colors`, selector: '.sap-icon--color-negative' }
    },
    {
        label: 'color information',
        ours: { story: 'components-icon--colors', selector: 'fd-icon[data-glyph] >> nth=9' },
        ref: { story: `${FS}icons-sap-icons--colors`, selector: '.sap-icon--color-information' }
    }
];
