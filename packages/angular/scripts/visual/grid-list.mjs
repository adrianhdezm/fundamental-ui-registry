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
    },
    {
        // the 0.75rem top margin of a group header after items (grid-list-3)
        label: 'group header after items',
        pixels: false,
        props: ['margin-top', 'margin-bottom'],
        ignore: ['width'],
        ours: { story: 'components-grid-list--group', selector: 'fd-grid-list-group-header >> nth=1' },
        ref: { story: `${FS}grid-list--states`, selector: '.fd-grid-list__group-header >> nth=1' }
    },
    {
        // the text colour of the title bar title (grid-list-2)
        label: 'title bar title',
        pixels: false,
        ignore: ['width', 'height', 'line-height', 'min-height', 'padding-left', 'padding-right'],
        ours: { story: 'components-grid-list--group', selector: 'fd-grid-list-title-bar [fd-toolbar-label]' },
        ref: { story: `${FS}selection--multi-select-mode`, selector: '.fd-toolbar--solid > span >> nth=0' }
    },
    {
        // the regular SAP font of the item title (grid-list-1)
        label: 'item title',
        pixels: false,
        ignore: ['width', 'height'],
        ours: { story: 'components-grid-list--states', selector: '[data-grid-list-item] [role=heading] >> nth=0' },
        ref: { story: `${FS}grid-list--states`, selector: '.fd-grid-list__item-title >> nth=0' }
    }
];
