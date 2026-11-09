/** Visual cases for info-label; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

export default [
    ...[1, 2, 6, 10].map((c) => ({
        label: `color ${c}`,
        // our texts ("Default 1") differ from fundamental-styles': styles only; vertical-align is the issue
        pixels: false,
        ignore: ['width'],
        props: ['vertical-align'],
        ours: { story: 'components-info-label--colors', selector: `fd-info-label >> nth=${c - 1}` },
        ref: { story: `${FS}info-label--color-flavors`, selector: `.fd-info-label >> nth=${c - 1}` }
    }))
];
