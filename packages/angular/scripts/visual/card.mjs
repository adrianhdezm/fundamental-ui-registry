/** Visual cases for card; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

export default [
    {
        label: 'title',
        // other texts than fundamental-styles': styles only
        pixels: false,
        ignore: ['width'],
        ours: { story: 'components-card--standard', selector: '[fd-card-title] >> nth=0' },
        ref: { story: `${FS}card-card--card-anatomy`, selector: '.fd-card__title >> nth=0' }
    }
];
