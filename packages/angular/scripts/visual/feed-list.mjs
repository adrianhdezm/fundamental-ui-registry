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
    },
    {
        // the borderless last item's 16px bottom padding (feed-list-2); the texts differ, so by computed style
        label: 'borderless last item',
        pixels: false,
        ignore: ['width', 'height'],
        ours: { story: 'components-feed-list--borderless', selector: 'fd-feed-list-item >> nth=-1' },
        ref: { story: `${FS}feed-list-and-item--borderless`, selector: '.fd-feed-list__body >> nth=2' }
    },
    // a footer with a Reply link is 17px high, its bylines 10px (feed-list-4); fundamental-styles' Reply is plain
    // text, ours a link (its colour): the footer and the Reply byline by computed style, the date by pixels too
    {
        label: 'footer',
        pixels: false,
        ignore: ['width'],
        ours: { story: 'components-feed-list--default', selector: 'fd-feed-list-footer >> nth=0' },
        ref: { story: `${FS}feed-list-and-item--standard`, selector: '.fd-feed-list__footer >> nth=0' }
    },
    {
        label: 'footer date byline',
        ours: { story: 'components-feed-list--default', selector: 'fd-feed-list-footer >> nth=0 >> small >> nth=0' },
        ref: { story: `${FS}feed-list-and-item--standard`, selector: '.fd-feed-list__footer--byline >> nth=0' }
    },
    {
        label: 'footer Reply byline',
        pixels: false,
        ours: { story: 'components-feed-list--default', selector: 'fd-feed-list-footer >> nth=0 >> small >> nth=1' },
        ref: { story: `${FS}feed-list-and-item--standard`, selector: '.fd-feed-list__footer--byline >> nth=1' }
    },
    // the desktop actions sit at the end of the item: right in LTR, left in RTL (feed-list-1)
    {
        label: 'actions',
        ours: {
            story: 'components-feed-list--with-actions',
            selector: 'fd-feed-list-action >> nth=0',
            within: 'fd-feed-list-item'
        },
        ref: {
            story: `${FS}feed-list-and-item--with-actions`,
            selector: '.fd-feed-list__actions',
            within: '.fd-feed-list__body'
        }
    }
];
