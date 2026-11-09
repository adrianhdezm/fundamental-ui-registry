/** Visual cases for layout-panel; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-layouts-';

export default [
    {
        label: 'title',
        // fundamental-styles' text is the class name of the part, ours a readable text: styles only; ours is the
        // heading itself, fundamental-styles wraps an h5 in a div
        pixels: false,
        ignore: ['width'],
        ours: { story: 'components-layout-panel--transparent', selector: '[fd-layout-panel-title]' },
        ref: { story: `${FS}layout-panel--transparent-background`, selector: '.fd-layout-panel__title h5' }
    }
];
