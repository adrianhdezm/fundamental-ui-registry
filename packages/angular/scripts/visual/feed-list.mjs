/** Visual cases for feed-list; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

export default [
    {
        label: 'author link',
        // other names than fundamental-styles': styles only
        pixels: false,
        // text-underline-offset: the link's own difference, link-1
        ignore: ['width', 'text-underline-offset'],
        ours: { story: 'components-feed-list--default', selector: 'a[emphasized] >> nth=0' },
        ref: { story: `${FS}feed-list-and-item--linked`, selector: '.fd-feed-list__name a' }
    }
];
