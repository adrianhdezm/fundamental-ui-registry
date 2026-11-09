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
    },
    {
        // a transparent panel keeps its header background (panel-3); the titles differ, so by computed style
        label: 'transparent header',
        pixels: false,
        ignore: ['width', 'height', 'padding-left', 'padding-right'],
        ours: { story: 'components-panel--fixed', selector: 'fd-panel >> nth=3 >> > div >> nth=0' },
        ref: { story: `${FS}panel--transparent`, selector: '.fd-panel__header >> nth=0' }
    }
];
