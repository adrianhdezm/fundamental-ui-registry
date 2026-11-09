/** Visual cases for resizable-card-layout; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-layouts-';

// The first card in the middle of a resize (State: resizing, from `play`) against fundamental-styles' resizing story:
// the corner and its icon (resizable-card-layout-1/2/3). The cards differ, so by computed style; the box sizes of
// the corner and the icon are compared, and the corner's position along the card's bottom end.
const RESIZING = 'components-resizable-card-layout--resizing';
const REF = `${FS}resizable-card-layout--resize-card-horizontal-vertical-direction`;

export default [
    {
        label: 'resizing: corner',
        pixels: false,
        props: [
            'position',
            'z-index',
            'display',
            'align-items',
            'justify-content',
            'bottom',
            'inset-inline-end',
            'width'
        ],
        ours: { story: RESIZING, selector: '[data-resize-corner]' },
        ref: { story: REF, selector: '.fd-resizable-card-layout__icon-wrapper' }
    },
    {
        label: 'resizing: corner icon',
        pixels: false,
        props: ['position', 'z-index', 'display', 'transform', 'rotate', 'width'],
        ours: { story: RESIZING, selector: '[data-resize-corner] > div' },
        ref: { story: REF, selector: '.fd-resizable-card-layout__icon' }
    }
];
