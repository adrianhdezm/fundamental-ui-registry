/** Visual cases for list; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

/** Item n (1-based) of our list with this aria-label. */
const item = (label, n) => `[aria-label="${label}"] > li:nth-child(${n})`;
/** Item n of the first fundamental-styles list in the story. */
const refItem = (n) => `.fd-list > li:nth-child(${n})`;

export default [
    {
        label: 'icon before',
        props: ['margin-left', 'margin-right'],
        // transparent where fundamental-styles' icon inherits the item background: same pixels
        ignore: ['background-color'],
        ours: { story: 'components-list--default', selector: `${item('Icons', 1)} [data-list-icon]` },
        ref: { story: `${FS}list-standard--icons`, selector: `${refItem(1)} .fd-list__icon` }
    },
    {
        label: 'icon after',
        props: ['margin-left', 'margin-right'],
        ignore: ['background-color'],
        // our wrench against fundamental-styles' other glyph: styles only
        pixels: false,
        ours: { story: 'components-list--default', selector: `${item('Icons', 2)} [data-list-icon]` },
        ref: { story: `${FS}list-standard--icons`, selector: `${refItem(3)} .fd-list__icon` }
    },
    {
        label: 'byline unread dot',
        ours: { story: 'components-list--byline-unread', selector: '[fd-list-item] > fd-icon >> nth=0' },
        // fundamental-styles' first unread item is also selected (is-selected): its dot sits on the selection
        // background, which differs from the list background in the HC themes. The second is unread only, as ours
        ref: { story: `${FS}list-byline--unread-notification`, selector: `${refItem(2)} .fd-list__notification` }
    },
    {
        // the thumbnail's icon at 2rem (list-2); another glyph than fundamental-styles' avatar, so by computed style
        label: 'thumbnail icon',
        pixels: false,
        props: ['font-size'],
        // fundamental-styles' thumbnail rounds its icon element too (4px): no background, nothing shows
        ignore: [
            'width',
            'height',
            'line-height',
            'color',
            'font-family',
            'border-top-left-radius',
            'border-top-right-radius',
            'border-bottom-right-radius',
            'border-bottom-left-radius'
        ],
        ours: { story: 'components-list--byline-borderless', selector: '[fd-list-thumbnail] > [data-glyph] >> nth=0' },
        ref: { story: `${FS}list-byline--standard`, selector: '.fd-list__thumbnail > i >> nth=0' }
    },
    {
        // the list border colour under a hovered link (list-3); the texts differ, so by computed style
        label: 'link hover',
        hover: true,
        pixels: false,
        ignore: ['width'],
        ours: { story: 'components-list--navigation', selector: 'a[fd-list-link] >> nth=0' },
        ref: { story: `${FS}list-standard--navigation`, selector: `${refItem(1)} a` }
    }
];
