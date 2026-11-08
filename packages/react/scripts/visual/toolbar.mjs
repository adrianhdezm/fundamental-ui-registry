/** Visual cases for toolbar; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

const TYPES = 'components-toolbar--types';
const REF_TYPES = `${FS}toolbar--types`;
const TOOLBAR = '[role="toolbar"]';
// the overflow popover renders outside of the story root: reach it from the document
const PANEL = 'xpath=ancestor::body//*[@role="dialog"]//div[@data-toolbar-overflow]';
const OPEN = 'components-toolbar--open-overflow-popover';
const REF_OVERFLOW = `${FS}toolbar--overflow`;

// toolbars are as wide as their container, which differs between the two Storybooks: their computed styles and
// heights are compared, not pixels
const toolbar = (label, nth, ref, extra = {}) => ({
    label,
    pixels: false,
    ignore: ['width'],
    ours: { story: TYPES, selector: `${TOOLBAR} >> nth=${nth}` },
    ref: { story: REF_TYPES, selector: ref },
    ...extra
});

export default [
    toolbar('solid', 0, '.fd-toolbar--solid'),
    toolbar('transparent', 1, '.fd-toolbar--transparent'),
    toolbar('auto', 2, '.fd-toolbar--auto'),
    toolbar('clear border', 3, '.fd-toolbar--clear'),
    toolbar('info', 5, '.fd-toolbar--info >> nth=0'),
    // an active info toolbar is clickable: a pointer cursor, as Angular and UI5's active toolbar (fundamental-styles
    // leaves the cursor as it is)
    toolbar('info, active', 6, '.fd-toolbar--active >> nth=0', { ignore: ['width', 'cursor'] }),
    toolbar('info, active, hover', 6, '.fd-toolbar--active.is-hover', { hover: true, ignore: ['width', 'cursor'] }),
    toolbar('info, active, focus', 6, '.fd-toolbar--active >> nth=0', {
        focus: true,
        refFocus: true,
        ignore: ['width', 'cursor']
    }),
    toolbar('title', 8, '.fd-toolbar--title'),
    {
        // fundamental-styles' story does not load the title styles: its heading shows the browser's bold h4 at the
        // toolbar's font size, while its toolbar CSS asks for --sapGroup_Title_FontSize and the title font (as ours)
        label: 'title heading',
        pixels: false,
        ignore: ['width', 'height', 'font-family', 'font-size', 'font-weight'],
        ours: { story: TYPES, selector: '[role="heading"]' },
        ref: { story: REF_TYPES, selector: '.fd-toolbar__title' }
    },
    {
        // a ToolbarLabel is a label (--sapContent_LabelColor, as Angular and fd-label); fundamental-styles' toolbar
        // has plain text there, in the toolbar's --sapTextColor
        label: 'label',
        pixels: false,
        ignore: ['color'],
        ours: { story: TYPES, selector: `${TOOLBAR} >> nth=0 >> [data-toolbar-label]` },
        ref: { story: REF_TYPES, selector: '.fd-toolbar--solid > span >> nth=0' }
    },
    {
        // the pointer cursor of the active info toolbar, see above
        ignore: ['cursor'],
        label: 'label, info active',
        ours: { story: TYPES, selector: `${TOOLBAR} >> nth=6 >> [data-toolbar-label]` },
        ref: { story: REF_TYPES, selector: '.fd-toolbar--active >> nth=0 >> span >> nth=0' }
    },
    {
        label: 'icon, info',
        ours: { story: TYPES, selector: `${TOOLBAR} >> nth=5 >> [data-glyph]` },
        ref: { story: REF_TYPES, selector: '.fd-toolbar--info >> nth=0 >> i' }
    },
    {
        // the pointer cursor of the active info toolbar, see above
        ignore: ['cursor'],
        label: 'icon, info active',
        ours: { story: TYPES, selector: `${TOOLBAR} >> nth=6 >> [data-glyph]` },
        ref: { story: REF_TYPES, selector: '.fd-toolbar--active >> nth=0 >> i' }
    },
    {
        label: 'separator',
        ours: { story: TYPES, selector: `${TOOLBAR} >> nth=0 >> [role="separator"]` },
        ref: { story: REF_TYPES, selector: '.fd-toolbar--solid .fd-toolbar__separator' }
    },
    {
        label: 'flexible spacer',
        pixels: false,
        ignore: ['width'],
        ours: { story: TYPES, selector: `${TOOLBAR} >> nth=0 >> div.flex-\\[1_auto\\]` },
        ref: { story: REF_TYPES, selector: '.fd-toolbar--solid .fd-toolbar__spacer' }
    },
    {
        label: 'fixed spacer',
        ours: { story: 'components-toolbar--alignment', selector: '[style*="width: 50px"]' },
        ref: { story: `${FS}toolbar--alignment`, selector: '.fd-toolbar__spacer--fixed >> nth=0' }
    },
    {
        label: 'button in a toolbar',
        ours: { story: TYPES, selector: `${TOOLBAR} >> nth=0 >> button:has-text("Edit")` },
        ref: { story: REF_TYPES, selector: '.fd-toolbar--solid >> button:has-text("Edit")' }
    },
    {
        label: 'more button',
        ours: { story: 'components-toolbar--overflow-popover', selector: 'button[aria-label="More"]' },
        ref: { story: REF_OVERFLOW, selector: 'button[aria-label="More"]' }
    },
    {
        // the corners are rounded by the popover's scroll wrapper here, by a rule for the first child of the
        // popover body in fundamental-styles
        ignore: [
            'border-top-left-radius',
            'border-top-right-radius',
            'border-bottom-right-radius',
            'border-bottom-left-radius'
        ],
        label: 'overflow panel',
        ours: { story: OPEN, selector: PANEL },
        ref: { story: REF_OVERFLOW, selector: '.fd-toolbar__overflow' }
    },
    {
        label: 'overflow button',
        ours: { story: OPEN, selector: `${PANEL}//button[normalize-space()="Delete"]` },
        ref: { story: REF_OVERFLOW, selector: '.fd-toolbar__overflow-button:has-text("Delete")' }
    },
    {
        label: 'overflow button, hover',
        hover: true,
        ours: { story: OPEN, selector: `${PANEL}//button[normalize-space()="Assign"]` },
        ref: { story: REF_OVERFLOW, selector: '.fd-toolbar__overflow-button:has-text("Assign")' }
    },
    {
        label: 'overflow separator',
        ours: { story: OPEN, selector: `${PANEL}//*[@role="separator"]` },
        ref: { story: REF_OVERFLOW, selector: '.fd-toolbar__overflow .fd-toolbar__separator >> nth=0' }
    },
    {
        // fundamental-styles' story does not load the label styles (its fd-label inherits --sapTextColor and the
        // label element's default cursor); a ToolbarLabel keeps the label colour, see "label"
        pixels: false,
        ignore: ['color', 'cursor'],
        label: 'overflow label',
        ours: { story: OPEN, selector: `${PANEL}//*[@data-toolbar-label]` },
        ref: { story: REF_OVERFLOW, selector: '.fd-toolbar__overflow-label >> nth=0' }
    }
];
