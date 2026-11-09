/** Visual cases for generic-tag; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';
const REF = `${FS}generic-tag--primary`;
const tag = (nth) => `[fd-generic-tag] >> nth=${nth}`;

export default [
    // the status icon's 1rem line height (generic-tag-1)
    {
        label: 'error icon',
        ours: { story: 'components-generic-tag--default', selector: `${tag(1)} >> fd-icon` },
        ref: { story: REF, selector: '.fd-generic-tag__icon >> nth=0' }
    },
    {
        label: 'error hover',
        hover: true,
        // "Error" against "Product Cost": styles only
        pixels: false,
        ignore: ['width'],
        ours: { story: 'components-generic-tag--default', selector: tag(1) },
        ref: { story: REF, selector: '.fd-generic-tag >> nth=6' }
    }
];
