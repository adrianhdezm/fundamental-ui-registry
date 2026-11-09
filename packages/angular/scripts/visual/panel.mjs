/** Visual cases for panel; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

export default [
    {
        label: 'title',
        // other texts and widths than fundamental-styles': styles only
        pixels: false,
        ignore: ['width'],
        props: ['white-space', 'flex-grow'],
        ours: { story: 'components-panel--expandable', selector: '[fd-panel-title] >> nth=0' },
        ref: { story: `${FS}panel--expandable`, selector: '.fd-panel__title >> nth=0' }
    },
    {
        label: 'expand button',
        ours: { story: 'components-panel--expandable', selector: 'fd-panel button >> nth=0' },
        ref: { story: `${FS}panel--expandable`, selector: '.fd-panel__button >> nth=0' }
    }
];
