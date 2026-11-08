/** Visual cases for breadcrumb; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

const SEPARATORS = 'components-breadcrumb--separators';
const CURRENT = 'components-breadcrumb--current-item';
const OVERFLOW = 'components-breadcrumb--overflow';
/** Our item `nth` (the `BreadcrumbItem` in its list item wrapper) of trail `trail`. */
const item = (trail, nth) => `nav >> nth=${trail} >> [role=listitem] > span >> nth=${nth}`;
const refItem = (trail, nth) => `.fd-breadcrumb >> nth=${trail} >> .fd-breadcrumb__item >> nth=${nth}`;

const STYLES = ['slash', 'backslash', 'double-slash', 'double-backslash', 'greater-than', 'double-greater-than'];

export default [
    // the items hold their separator, so pixels compare it too
    {
        label: 'item',
        ours: { story: SEPARATORS, selector: item(0, 0) },
        ref: { story: `${FS}breadcrumb--standard`, selector: refItem(0, 0) }
    },
    {
        label: 'item wide text',
        ours: { story: SEPARATORS, selector: item(0, 5) },
        ref: { story: `${FS}breadcrumb--standard`, selector: refItem(0, 5) }
    },
    {
        label: 'link',
        ours: { story: SEPARATORS, selector: `${item(0, 0)} >> a` },
        ref: { story: `${FS}breadcrumb--standard`, selector: `${refItem(0, 0)} >> .fd-link` }
    },
    {
        label: 'link text',
        ours: { story: SEPARATORS, selector: `${item(0, 0)} >> a >> span >> nth=0` },
        ref: { story: `${FS}breadcrumb--standard`, selector: `${refItem(0, 0)} >> .fd-link__content` }
    },
    {
        label: 'link hover',
        hover: true,
        ours: { story: SEPARATORS, selector: `${item(0, 1)} >> a` },
        ref: { story: `${FS}breadcrumb--standard`, selector: `${refItem(0, 1)} >> .fd-link` }
    },
    {
        label: 'link focus',
        focus: true,
        refFocus: true,
        ours: { story: SEPARATORS, selector: `${item(0, 0)} >> a` },
        ref: { story: `${FS}breadcrumb--standard`, selector: `${refItem(0, 0)} >> .fd-link` }
    },
    {
        label: 'current page (text)',
        ours: { story: SEPARATORS, selector: item(0, 6) },
        ref: { story: `${FS}breadcrumb--standard`, selector: refItem(0, 6) }
    },
    {
        label: 'current page text',
        ours: { story: CURRENT, selector: `${item(0, 6)} >> [aria-current=page]` },
        ref: { story: `${FS}breadcrumb--current-item`, selector: `${refItem(0, 6)} >> [aria-current=page]` }
    },
    {
        label: 'current page (link)',
        ours: { story: CURRENT, selector: item(1, 6) },
        ref: { story: `${FS}breadcrumb--current-item`, selector: refItem(1, 6) }
    },
    ...STYLES.map((style, trail) => ({
        label: `separator ${style}`,
        // a text span with padding against fundamental-styles' empty span whose ::after has a margin and the text:
        // the boxes are as wide and the pixels match
        ignore: ['padding-left', 'padding-right'],
        ours: { story: SEPARATORS, selector: `${item(trail, 0)} >> span[aria-hidden=true]` },
        ref: { story: `${FS}breadcrumb--styles`, selector: `${refItem(trail, 0)} >> .fd-breadcrumb__separator` }
    })),
    // fundamental-styles puts the separator inside the "more" link, so the link is wider: styles only
    {
        label: 'more link',
        pixels: false,
        ignore: ['width'],
        ours: { story: OVERFLOW, selector: '[data-breadcrumb-more] >> nth=0' },
        ref: { story: `${FS}breadcrumb--overflow`, selector: '.fd-link[role=button] >> nth=0' }
    },
    {
        label: 'more link overflow icon',
        ours: { story: OVERFLOW, selector: '[data-breadcrumb-more] >> nth=0 >> [data-glyph] >> nth=0' },
        ref: { story: `${FS}breadcrumb--overflow`, selector: '.fd-link[role=button] >> nth=0 >> .sap-icon--overflow' }
    },
    {
        label: 'more link arrow icon',
        ours: { story: OVERFLOW, selector: '[data-breadcrumb-more] >> nth=0 >> [data-glyph] >> nth=1' },
        ref: {
            story: `${FS}breadcrumb--overflow`,
            selector: '.fd-link[role=button] >> nth=0 >> .sap-icon--slim-arrow-down'
        }
    }
];
