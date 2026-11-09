/** Visual cases for status-indicator; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

export default [
    {
        // the root's typography: --sapFontSize, line-height normal and --sapTextColor for a neutral indicator
        // (status-indicator-1); ours is lg at 35%, fundamental-styles' neutral one xl at 0%: styles only
        label: 'neutral root',
        pixels: false,
        ignore: ['width', 'height', 'min-height'],
        ours: { story: 'components-status-indicator--default', selector: 'fd-status-indicator >> nth=0' },
        ref: { story: `${FS}status-indicator--sizes`, selector: '.fd-status-indicator >> nth=3' }
    }
];
