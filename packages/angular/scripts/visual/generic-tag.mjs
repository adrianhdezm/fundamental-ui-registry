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
    },
    // pressed (hovered too): the active background wins over the hover one (generic-tag-2); styles only, as above
    ...[
        ['neutral pressed', 0, 0],
        ['error pressed', 1, 1]
    ].map(([label, ours, ref]) => ({
        label,
        active: true,
        pixels: false,
        ignore: ['width'],
        ours: { story: 'components-generic-tag--default', selector: tag(ours) },
        ref: { story: REF, selector: `.fd-generic-tag >> nth=${ref}` }
    }))
];
