/** Visual cases for notification; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

// our fundamental-styles stories repeat fundamental-styles' texts, so pixels can be compared
const PRIMARY = 'components-notification--primary';
const GROUPS = 'components-notification--groups';
const BANNERS = 'components-notification--open-banners';
const REF = `${FS}notifications--primary`;
const REF_GROUPS = `${FS}notifications--notification-group`;
const REF_BANNERS = `${FS}notifications--notification-banner`;

export default [
    {
        label: 'unread, status icon, More link, object status',
        ours: { story: PRIMARY, selector: '[data-notification] >> nth=0' },
        ref: { story: REF, selector: '.fd-notification >> nth=0' }
    },
    {
        label: 'long texts clamped to two lines, two actions',
        ours: { story: PRIMARY, selector: '[data-notification] >> nth=1' },
        ref: { story: REF, selector: '.fd-notification >> nth=1' }
    },
    {
        label: 'without avatar',
        ours: { story: PRIMARY, selector: '[data-notification] >> nth=2' },
        ref: { story: REF, selector: '.fd-notification >> nth=2' }
    },
    {
        label: 'hover',
        hover: true,
        ours: { story: PRIMARY, selector: '[data-notification] >> nth=3' },
        ref: { story: REF, selector: '.fd-notification >> nth=3' }
    },
    {
        label: 'focus',
        focus: true,
        refFocus: true,
        props: ['outline-style', 'outline-width', 'outline-color', 'outline-offset'],
        ours: { story: PRIMARY, selector: '[data-notification] >> nth=3' },
        ref: { story: REF, selector: '.fd-notification >> nth=3' }
    },
    {
        label: 'unread title',
        ours: { story: PRIMARY, selector: '[data-nt-title] >> nth=0' },
        ref: { story: REF, selector: '.fd-notification__title >> nth=0' }
    },
    {
        label: 'read title, clamped, room for two actions',
        ours: { story: PRIMARY, selector: '[data-nt-title] >> nth=1' },
        ref: { story: REF, selector: '.fd-notification__title >> nth=1' }
    },
    {
        label: 'paragraph, clamped',
        ours: { story: PRIMARY, selector: '[data-nt-paragraph] >> nth=1' },
        ref: { story: REF, selector: '.fd-notification__paragraph >> nth=1' }
    },
    {
        // ours fills the content column (fundamental-styles': as wide as its footnotes, which truncates two short
        // footnotes against their own 50% maximum): styles only, without the width
        label: 'footer',
        pixels: false,
        ignore: ['width'],
        ours: { story: PRIMARY, selector: '[data-nt-footer] >> nth=0' },
        ref: { story: REF, selector: '.fd-notification__footer >> nth=0' }
    },
    {
        label: 'footnote',
        props: ['max-width', 'text-overflow', 'white-space'],
        ours: { story: PRIMARY, selector: '[data-nt-footer] >> nth=0 >> span >> nth=0' },
        ref: { story: REF, selector: '.fd-notification__footer-content >> nth=0' }
    },
    {
        label: 'separator',
        props: ['margin-left', 'margin-right'],
        ours: { story: PRIMARY, selector: '[data-nt-footer] >> nth=0 >> span[aria-hidden="true"] >> nth=0' },
        ref: { story: REF, selector: '.fd-notification__separator >> nth=0' }
    },
    {
        label: 'More link',
        props: ['margin-left', 'margin-right'],
        ours: { story: PRIMARY, selector: '[data-nt-footer] >> nth=0 >> a' },
        ref: { story: REF, selector: '.fd-notification__link >> nth=0' }
    },
    {
        label: 'actions',
        ours: { story: PRIMARY, selector: '[data-nt-actions] >> nth=1' },
        ref: { story: REF, selector: '.fd-notification__actions >> nth=1' }
    },
    {
        label: 'group header, expanded',
        ours: { story: GROUPS, selector: '[role="button"][aria-expanded] >> nth=0' },
        ref: { story: REF_GROUPS, selector: '.fd-notification-group__header >> nth=0' }
    },
    {
        label: 'group header, collapsed',
        ours: { story: GROUPS, selector: '[role="button"][aria-expanded="false"] >> nth=0' },
        ref: { story: REF_GROUPS, selector: '.fd-notification-group__header >> nth=2' }
    },
    {
        label: 'group header title',
        ours: { story: GROUPS, selector: '[role="heading"] >> nth=0' },
        ref: { story: REF_GROUPS, selector: '.fd-notification-group__header-title >> nth=0' }
    },
    {
        label: 'notification in a group',
        ours: { story: GROUPS, selector: 'ul ul > [data-notification] >> nth=0' },
        ref: { story: REF_GROUPS, selector: '.fd-notification-group__list .fd-notification >> nth=0' }
    },
    {
        label: 'growing item',
        ours: { story: GROUPS, selector: '[role="button"][aria-label="More"]' },
        ref: { story: REF_GROUPS, selector: '.fd-notification-group__growing-item' }
    },
    {
        label: 'growing item hover',
        hover: true,
        ours: { story: GROUPS, selector: '[role="button"][aria-label="More"]' },
        ref: { story: REF_GROUPS, selector: '.fd-notification-group__growing-item' }
    },
    {
        label: 'message strip in the popover',
        ours: { story: GROUPS, selector: '[role="note"] >> xpath=..' },
        ref: { story: REF_GROUPS, selector: '.fd-notification-message-strip' }
    },
    {
        label: 'banner (service)',
        ours: { story: BANNERS, selector: '[data-notification] >> nth=0' },
        ref: { story: REF_BANNERS, selector: '.fd-notification-banner .fd-notification >> nth=0' }
    }
];
