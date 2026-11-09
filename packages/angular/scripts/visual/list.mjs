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
        // transparent where fundamental-styles' icon inherits the item background: same pixels (not a row; the
        // React port sets bg-inherit)
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
        ref: { story: `${FS}list-byline--unread-notification`, selector: `${refItem(1)} .fd-list__notification` }
    }
];
