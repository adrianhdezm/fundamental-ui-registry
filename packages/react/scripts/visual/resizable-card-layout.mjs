/** Visual cases for resizable-card-layout; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

// Our Resizable cards story, and its State: resizing story (the first card in the middle of a resize, from `play`),
// against fundamental-styles' Resizable Card Layout stories: the layout, the parts of a card (frame, card area, the
// end and bottom edges) and, while resizing, the dashed frame, the corner and its icon. The cards differ (Angular's
// list cards in our sizes, fundamental-styles' cards in theirs), so the parts compare by computed style without the
// sizes the cards decide. The corner icon is the same glyph pixel for pixel, but the dashed frame around the card
// shows through its box with another dash phase (the frames differ in size): styles only.
const OURS = 'components-resizable-card-layout--default';
const RESIZING = 'components-resizable-card-layout--resizing';
const LAYOUTS = FS.replace('components-', 'layouts-');
const REF = `${LAYOUTS}resizable-card-layout--resize-card-layout`;
const REF_RESIZING = `${LAYOUTS}resizable-card-layout--resize-card-horizontal-vertical-direction`;
const ITEM = '[id^="fd-card-item-"] >> nth=0';
const BOX = '[data-resizable-card-box] >> nth=0';

export default [
    {
        label: 'layout',
        pixels: false,
        props: ['position', 'margin-top'],
        ignore: ['width', 'height'],
        ours: { story: OURS, selector: 'div:has(> [id^="fd-card-item-"])' },
        ref: { story: REF, selector: '.fd-resizable-card-layout' }
    },
    {
        label: 'card frame',
        pixels: false,
        props: ['display', 'flex-direction', 'position', 'min-width'],
        ignore: ['width', 'height'],
        ours: { story: OURS, selector: `${ITEM} >> :scope > div` },
        ref: { story: REF, selector: '.fd-resizable-card-layout__item >> nth=0' }
    },
    {
        label: 'card area',
        pixels: false,
        props: ['order', 'flex-grow', 'flex-shrink', 'flex-basis', 'position'],
        ignore: ['width', 'height'],
        ours: { story: OURS, selector: `${BOX} >> :scope > div:first-child` },
        ref: { story: REF, selector: '.fd-resizable-card-layout__card >> nth=0' }
    },
    {
        label: 'end edge (horizontal resize)',
        pixels: false,
        props: ['order', 'z-index'],
        ignore: ['height'],
        ours: { story: OURS, selector: `${BOX} >> .cursor-ew-resize` },
        ref: { story: REF, selector: '.fd-resizable-card-layout__resize--vertical >> nth=0' }
    },
    {
        label: 'bottom edge (vertical resize)',
        pixels: false,
        props: ['position', 'bottom', 'z-index'],
        ignore: ['width'],
        ours: { story: OURS, selector: `${BOX} >> .cursor-ns-resize` },
        ref: { story: REF, selector: '.fd-resizable-card-layout__resize--horizontal >> nth=0' }
    },
    {
        label: 'resizing: dashed frame',
        pixels: false,
        props: ['display', 'flex-direction', 'position', 'min-width'],
        ignore: ['width', 'height'],
        ours: { story: RESIZING, selector: `${ITEM} >> :scope > div` },
        ref: { story: REF_RESIZING, selector: '.fd-resizable-card-layout__indication-border' }
    },
    {
        label: 'resizing: corner',
        pixels: false,
        props: [
            'position',
            'z-index',
            'display',
            'align-items',
            'justify-content',
            'min-width',
            'bottom',
            'inset-inline-end'
        ],
        ours: { story: RESIZING, selector: '[data-resize-corner]' },
        ref: { story: REF_RESIZING, selector: '.fd-resizable-card-layout__icon-wrapper' }
    },
    {
        label: 'resizing: corner icon',
        pixels: false,
        props: ['position', 'z-index', 'display', 'font-family', 'transform'],
        ours: { story: RESIZING, selector: '[data-resize-corner] > div' },
        ref: { story: REF_RESIZING, selector: '.fd-resizable-card-layout__icon' }
    }
];
