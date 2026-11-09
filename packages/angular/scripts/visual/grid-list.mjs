/** Visual cases for grid-list; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-grid-list-';

export default [
    {
        // the counter and the navigation arrow (mirrored once in RTL)
        label: 'item toolbar (counter, navigation arrow)',
        // no min-height where fundamental-styles has the toolbar height as one: same height (not a row)
        ignore: ['min-height'],
        ours: {
            story: 'components-grid-list--states',
            selector: 'div:has(> span > fd-icon[glyph="navigation-right-arrow"])'
        },
        ref: { story: `${FS}grid-list--states`, selector: '.fd-grid-list__item-toolbar >> nth=0' }
    }
];
