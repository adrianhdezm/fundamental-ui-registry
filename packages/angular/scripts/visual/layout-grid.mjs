/** Visual cases for layout-grid; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-layouts-';

// The grid's typography (layout-grid-1): fundamental-styles sets the SAP text font, size, line height and colour on
// .fd-container, .fd-row and .fd-col. The columns' content is story decoration, so by computed style, without sizes.
const SIZES = ['width', 'height', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'min-height'];

export default [
    {
        label: 'grid',
        pixels: false,
        ignore: SIZES,
        ours: { story: 'components-layout-grid--basic', selector: 'fd-layout-grid >> nth=0' },
        ref: { story: `${FS}layout-grid--different-size-columns`, selector: '.fd-container' }
    },
    {
        label: 'column',
        pixels: false,
        ignore: [
            ...SIZES,
            'background-color',
            'border-top-left-radius',
            'border-top-right-radius',
            'border-bottom-right-radius',
            'border-bottom-left-radius'
        ],
        ours: { story: 'components-layout-grid--basic', selector: '[data-fd-col] >> nth=0' },
        ref: { story: `${FS}layout-grid--different-size-columns`, selector: '.fd-col >> nth=0' }
    }
];
