/** Visual cases for toolbar; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

// Our Info types story has fundamental-styles' info toolbars ("3 item selected", a spacer and the undo icon): the
// label in the bar's text colour (toolbar-1), the icons of the active bar in --sapList_TextColor (toolbar-2) and its
// focus frame inset by 1px (toolbar-3).
const INFO = 'components-toolbar--info-types';
const REF_TYPES = `${FS}toolbar--types`;
const TOOLBAR = '[role="toolbar"]';

export default [
    // in RTL our icon component mirrors the undo glyph (SAP icon metadata), fundamental-styles' does not
    {
        label: 'info',
        ours: { story: INFO, selector: `${TOOLBAR} >> nth=0` },
        ref: { story: REF_TYPES, selector: '.fd-toolbar--info >> nth=0' }
    },
    {
        // an active info toolbar is clickable: a pointer cursor, as Angular and UI5's active toolbar
        // (fundamental-styles leaves the cursor as it is)
        label: 'info, active',
        ignore: ['cursor'],
        ours: { story: INFO, selector: `${TOOLBAR} >> nth=1` },
        ref: { story: REF_TYPES, selector: '.fd-toolbar--active >> nth=0' }
    },
    {
        label: 'info, active, focus',
        focus: true,
        refFocus: true,
        ignore: ['cursor'],
        ours: { story: INFO, selector: `${TOOLBAR} >> nth=1` },
        ref: { story: REF_TYPES, selector: '.fd-toolbar--active >> nth=0' }
    },
    {
        label: 'label, info',
        ours: { story: INFO, selector: `${TOOLBAR} >> nth=0 >> [data-toolbar-label]` },
        ref: { story: REF_TYPES, selector: '.fd-toolbar--info >> nth=0 >> span >> nth=0' }
    },
    {
        label: 'label, info active',
        ignore: ['cursor'],
        ours: { story: INFO, selector: `${TOOLBAR} >> nth=1 >> [data-toolbar-label]` },
        ref: { story: REF_TYPES, selector: '.fd-toolbar--active >> nth=0 >> span >> nth=0' }
    },
    {
        label: 'icon, info active',
        // styles only: in RTL our undo glyph is mirrored (see above)
        pixels: false,
        ignore: ['cursor'],
        ours: { story: INFO, selector: `${TOOLBAR} >> nth=1 >> fd-icon` },
        ref: { story: REF_TYPES, selector: '.fd-toolbar--active >> nth=0 >> i' }
    }
];
