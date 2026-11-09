/** Visual cases for feed-list; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

const DEFAULT = 'components-feed-list--default';
const ITEM = (n) => `[role=listitem] >> nth=${n}`;
const MORE = '[role=listitem] p a:has-text("more") >> nth=0';
const REF_MORE = '.fd-feed-list__link--more';
const POSITION = ['margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'float', 'top', 'left', 'right'];

export default [
    // the posts differ: styles only, without the size
    {
        label: 'list',
        pixels: false,
        ignore: ['height'],
        ours: { story: DEFAULT, selector: '[role=list]' },
        ref: { story: `${FS}feed-list-and-item--group`, selector: '.fd-feed-list' }
    },
    {
        label: 'first item',
        pixels: false,
        ignore: ['height'],
        ours: { story: DEFAULT, selector: ITEM(0) },
        ref: { story: `${FS}feed-list-and-item--group`, selector: '.fd-feed-list__body >> nth=0' }
    },
    {
        label: 'middle item (border)',
        pixels: false,
        ignore: ['height'],
        ours: { story: DEFAULT, selector: ITEM(1) },
        ref: { story: `${FS}feed-list-and-item--group`, selector: '.fd-feed-list__body >> nth=1' }
    },
    {
        label: 'last item (borders)',
        pixels: false,
        ignore: ['height'],
        ours: { story: DEFAULT, selector: ITEM(2) },
        ref: { story: `${FS}feed-list-and-item--group`, selector: '.fd-feed-list__body >> nth=2' }
    },
    {
        label: 'borderless first item',
        pixels: false,
        ignore: ['height'],
        ours: { story: 'components-feed-list--borderless', selector: ITEM(0) },
        ref: { story: `${FS}feed-list-and-item--borderless`, selector: '.fd-feed-list__body >> nth=0' }
    },
    {
        label: 'borderless middle item',
        pixels: false,
        ignore: ['height'],
        ours: { story: 'components-feed-list--borderless', selector: ITEM(1) },
        ref: { story: `${FS}feed-list-and-item--borderless`, selector: '.fd-feed-list__body >> nth=1' }
    },
    {
        label: 'borderless last item',
        pixels: false,
        ignore: ['height'],
        ours: { story: 'components-feed-list--borderless', selector: ITEM(2) },
        ref: { story: `${FS}feed-list-and-item--borderless`, selector: '.fd-feed-list__body >> nth=2' }
    },
    // our wrapper (FeedListAvatar) carries the size and the end margin of fundamental-styles' thumbnail avatar
    {
        label: 'avatar box',
        pixels: false,
        props: POSITION,
        ignore: [
            'min-height',
            'background-color',
            'background-image',
            'color',
            'border-top-width',
            'border-right-width',
            'border-bottom-width',
            'border-left-width',
            'border-top-style',
            'border-top-left-radius',
            'border-top-right-radius',
            'border-bottom-right-radius',
            'border-bottom-left-radius'
        ],
        ours: { story: DEFAULT, selector: `${ITEM(0)} >> .basis-12` },
        ref: { story: `${FS}feed-list-and-item--standard`, selector: '.fd-feed-list__thumb' }
    },
    // our initials (accent colour) against fundamental-styles' photo thumbnail: size and radius. The thumbnail has no
    // border and no text; the initials' border and font size are the Avatar's own (see avatar.md)
    {
        label: 'avatar',
        pixels: false,
        ignore: [
            'font-size',
            'border-top-width',
            'border-right-width',
            'border-bottom-width',
            'border-left-width',
            'border-top-style',
            'background-color',
            'background-image',
            'color',
            'border-top-color',
            'border-right-color',
            'border-bottom-color',
            'border-left-color'
        ],
        ours: { story: DEFAULT, selector: `${ITEM(0)} >> .basis-12 > [role=img]` },
        ref: { story: `${FS}feed-list-and-item--standard`, selector: '.fd-feed-list__thumb' }
    },
    // another name: styles only. fundamental-styles spaces the name from the text with a space character ("Joe Doe: "
    // then a line break); ours with a 0.25rem end margin (the colon comes from CSS): the same gap, other margins
    {
        label: 'author',
        pixels: false,
        ignore: ['width', 'margin-left', 'margin-right'],
        props: POSITION,
        ours: { story: DEFAULT, selector: `${ITEM(1)} >> p > span >> nth=0` },
        ref: { story: `${FS}feed-list-and-item--group`, selector: '.fd-feed-list__name >> nth=0' }
    },
    {
        label: 'author link',
        pixels: false,
        ignore: ['width'],
        ours: { story: DEFAULT, selector: 'a[title="John Doe"]' },
        ref: { story: `${FS}feed-list-and-item--linked`, selector: '.fd-feed-list__name a' }
    },
    {
        label: 'text',
        pixels: false,
        ignore: ['width', 'height'],
        props: POSITION,
        ours: { story: DEFAULT, selector: `${ITEM(1)} >> p` },
        ref: { story: `${FS}feed-list-and-item--group`, selector: '.fd-feed-list__text >> nth=0' }
    },
    // "100 more" against "More": styles only. fundamental-styles capitalises its "More"; ours shows `moreLabel` as
    // written (custom labels such as "Show less" stay as given). The 0.25rem start margin stands in for
    // fundamental-styles' space before the link, as for the author
    {
        label: 'more',
        pixels: false,
        ignore: ['width', 'text-transform', 'margin-left', 'margin-right'],
        props: POSITION,
        ours: { story: DEFAULT, selector: MORE },
        ref: { story: `${FS}feed-list-and-item--show-more`, selector: REF_MORE }
    },
    {
        label: 'more hover',
        hover: true,
        pixels: false,
        ignore: ['width', 'text-transform'],
        ours: { story: DEFAULT, selector: MORE },
        ref: { story: `${FS}feed-list-and-item--show-more`, selector: REF_MORE }
    },
    {
        label: 'more focus',
        focus: true,
        refFocus: true,
        pixels: false,
        ignore: ['width', 'text-transform'],
        ours: { story: DEFAULT, selector: MORE },
        ref: { story: `${FS}feed-list-and-item--show-more`, selector: REF_MORE }
    },
    // our Reply is a link: styles only
    {
        label: 'footer',
        pixels: false,
        ignore: ['width'],
        ours: { story: DEFAULT, selector: `${ITEM(1)} >> small >> nth=0 >> xpath=..` },
        ref: { story: `${FS}feed-list-and-item--group`, selector: '.fd-feed-list__footer >> nth=0' }
    },
    // the same date, with its bullet
    {
        label: 'byline',
        ours: { story: DEFAULT, selector: `${ITEM(1)} >> small >> nth=0` },
        ref: { story: `${FS}feed-list-and-item--group`, selector: '.fd-feed-list__footer--byline >> nth=0' }
    },
    // `float: inline-end` (ours) is right in LTR and left in RTL, as fundamental-styles' physical floats
    {
        label: 'actions',
        pixels: false,
        props: POSITION,
        ignore: ['float'],
        ours: { story: 'components-feed-list--with-actions', selector: `${ITEM(0)} >> [aria-haspopup] >> xpath=..` },
        ref: { story: `${FS}feed-list-and-item--with-actions`, selector: '.fd-feed-list__actions' }
    },
    {
        label: 'actions button',
        ours: { story: 'components-feed-list--with-actions', selector: `${ITEM(0)} >> [aria-haspopup]` },
        ref: { story: `${FS}feed-list-and-item--with-actions`, selector: '.fd-feed-list__actions button' }
    },
    {
        label: 'mobile header',
        pixels: false,
        ignore: ['width', 'height'],
        ours: { story: 'components-feed-list--mobile', selector: `${ITEM(0)} >> div >> nth=0` },
        ref: { story: `${FS}feed-list-and-item--mobile`, selector: '.fd-feed-list__wrapper >> nth=0' }
    },
    // a float has no effect on a flex item: fundamental-styles' `float: right` in the flex header does nothing
    {
        label: 'mobile actions',
        pixels: false,
        props: POSITION,
        ignore: ['float'],
        ours: { story: 'components-feed-list--mobile', selector: `${ITEM(0)} >> [aria-haspopup] >> xpath=..` },
        ref: { story: `${FS}feed-list-and-item--mobile`, selector: '.fd-feed-list__actions' }
    },
    {
        label: 'mobile text',
        pixels: false,
        ignore: ['width', 'height'],
        props: POSITION,
        ours: { story: 'components-feed-list--mobile', selector: `${ITEM(0)} >> p` },
        ref: { story: `${FS}feed-list-and-item--mobile`, selector: '.fd-feed-list__text' }
    }
];
