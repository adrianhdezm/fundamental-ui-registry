/** Visual cases for list; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

/** Item n (1-based) of our list with this aria-label. */
const item = (label, n) => `[aria-label="${label}"] > li:nth-child(${n})`;
/** Item n of the first fundamental-styles list in the story. */
const refItem = (n) => `.fd-list > li:nth-child(${n})`;

export default [
    // standard
    {
        label: 'item',
        ours: { story: 'components-list--default', selector: item('Standard list', 1) },
        ref: { story: `${FS}list-standard--standard`, selector: refItem(1) }
    },
    {
        label: 'title',
        ours: { story: 'components-list--default', selector: `${item('Standard list', 1)} [data-slot=list-title]` },
        ref: { story: `${FS}list-standard--standard`, selector: `${refItem(1)} .fd-list__title` }
    },
    // "Unread list item 3" here, "List item 1 Unread" in fundamental-styles: styles only
    {
        label: 'unread title',
        pixels: false,
        ignore: ['width'],
        ours: { story: 'components-list--default', selector: `${item('Standard list', 3)} [data-slot=list-title]` },
        ref: { story: `${FS}list-standard--unread`, selector: `${refItem(1)} .fd-list__title` }
    },
    {
        label: 'borderless item',
        ours: { story: 'components-list--default', selector: item('Borderless', 1) },
        ref: { story: `${FS}list-standard--borderless`, selector: refItem(1) }
    },
    // interactive
    {
        label: 'interactive',
        ours: { story: 'components-list--interactive', selector: item('Interactive', 1) },
        ref: { story: `${FS}list-standard--interactive`, selector: refItem(1) }
    },
    {
        label: 'interactive hover',
        hover: true,
        ours: { story: 'components-list--interactive', selector: item('Interactive', 1) },
        ref: { story: `${FS}list-standard--interactive`, selector: refItem(1) }
    },
    {
        label: 'interactive focus',
        focus: true,
        refFocus: true,
        ours: { story: 'components-list--interactive', selector: item('Interactive', 1) },
        ref: { story: `${FS}list-standard--interactive`, selector: refItem(1) }
    },
    {
        label: 'interactive selected',
        ours: { story: 'components-list--interactive', selector: item('Interactive', 2) },
        ref: { story: `${FS}list-standard--interactive`, selector: refItem(4) }
    },
    {
        label: 'interactive selected hover',
        hover: true,
        ours: { story: 'components-list--interactive', selector: item('Interactive', 2) },
        ref: { story: `${FS}list-standard--interactive`, selector: refItem(4) }
    },
    // secondary texts, counter, icons
    ...[
        ['positive', 2],
        ['critical', 3],
        ['negative', 4]
    ].map(([type, n]) => ({
        label: `secondary ${type}`,
        ours: {
            story: 'components-list--default',
            selector: `${item('Secondary text', n)} [data-slot=list-secondary]`
        },
        ref: { story: `${FS}list-standard--secondary-data`, selector: `${refItem(n)} .fd-list__secondary` }
    })),
    // "12,345" here (grouped, as Angular's number pipe), "12345" in fundamental-styles: styles only
    {
        label: 'counter',
        pixels: false,
        ignore: ['width'],
        ours: { story: 'components-list--default', selector: `${item('Secondary text', 6)} > span:last-child` },
        ref: { story: `${FS}list-standard--item-counter`, selector: `${refItem(4)} .fd-list__item-counter` }
    },
    {
        label: 'icon before',
        props: ['margin-left', 'margin-right'],
        ours: { story: 'components-list--default', selector: `${item('Icons', 1)} [data-slot=list-icon]` },
        ref: { story: `${FS}list-standard--icons`, selector: `${refItem(1)} .fd-list__icon` }
    },
    {
        label: 'icon after',
        props: ['margin-left', 'margin-right'],
        ours: { story: 'components-list--default', selector: `${item('Icons', 2)} [data-slot=list-icon]` },
        ref: { story: `${FS}list-standard--icons`, selector: `${refItem(3)} .fd-list__icon` }
    },
    // group header, growing list footer, actions
    {
        label: 'group header',
        ours: { story: 'components-list--interactive', selector: item('Grouped', 1) },
        ref: { story: `${FS}list-standard--groups`, selector: refItem(1) }
    },
    {
        label: 'footer',
        ours: { story: 'components-list--interactive', selector: `[aria-label="Grouped"] > li:last-child` },
        ref: { story: `${FS}list-standard--footer`, selector: '.fd-list__footer' }
    },
    {
        label: 'action item',
        ours: { story: 'components-list--interactive', selector: item('Actions', 2) },
        ref: { story: `${FS}list-standard--action-list`, selector: 'ul:nth-of-type(2) .fd-list__item--action' }
    },
    {
        label: 'action button',
        ours: { story: 'components-list--interactive', selector: `${item('Actions', 2)} button` },
        ref: { story: `${FS}list-standard--action-list`, selector: 'ul:nth-of-type(2) .fd-list__item--action button' }
    },
    {
        label: 'action button hover',
        hover: true,
        ours: { story: 'components-list--interactive', selector: `${item('Actions', 2)} button` },
        ref: { story: `${FS}list-standard--action-list`, selector: 'ul:nth-of-type(2) .fd-list__item--action button' }
    },
    // navigation
    {
        label: 'link item',
        ours: { story: 'components-list--navigation', selector: item('Navigation', 1) },
        ref: { story: `${FS}list-standard--navigation`, selector: refItem(1) }
    },
    {
        label: 'link',
        ours: { story: 'components-list--navigation', selector: `${item('Navigation', 1)} a` },
        ref: { story: `${FS}list-standard--navigation`, selector: `${refItem(1)} a` }
    },
    {
        label: 'link hover',
        hover: true,
        ours: { story: 'components-list--navigation', selector: `${item('Navigation', 1)} a` },
        ref: { story: `${FS}list-standard--navigation`, selector: `${refItem(1)} a` }
    },
    // different texts and icons: styles only
    {
        label: 'link with navigation indicator',
        pixels: false,
        props: ['padding-inline-end'],
        ours: { story: 'components-list--navigation', selector: `${item('Navigation indicator', 3)} a` },
        ref: { story: `${FS}list-standard--navigation-indicator`, selector: `${refItem(5)} a` }
    },
    // byline
    {
        label: 'byline item',
        ours: { story: 'components-list--byline', selector: item('Byline', 1) },
        ref: { story: `${FS}list-byline--standard`, selector: refItem(1) }
    },
    {
        label: 'byline thumbnail',
        ours: { story: 'components-list--byline', selector: `${item('Byline', 1)} [data-slot=list-thumbnail]` },
        ref: { story: `${FS}list-byline--standard`, selector: `${refItem(1)} .fd-list__thumbnail` }
    },
    {
        label: 'byline text',
        ours: { story: 'components-list--byline', selector: `${item('Byline', 1)} [data-slot=list-byline]` },
        ref: { story: `${FS}list-byline--standard`, selector: `${refItem(1)} .fd-list__byline` }
    },
    // the texts differ: styles only
    {
        label: 'two-column byline',
        pixels: false,
        ours: { story: 'components-list--byline', selector: `${item('Byline', 2)} [data-slot=list-byline]` },
        ref: { story: `${FS}list-byline--standard`, selector: `${refItem(3)} .fd-list__byline` }
    },
    {
        label: 'byline unread dot',
        ours: { story: 'components-list--byline-unread', selector: `${item('Unread byline', 1)} > [data-glyph]` },
        ref: { story: `${FS}list-byline--unread-notification`, selector: `${refItem(1)} .fd-list__notification` }
    },
    // selection
    {
        label: 'selection item',
        ours: { story: 'components-list--selection', selector: item('Multi selection', 3) },
        ref: { story: `${FS}list-standard--selection`, selector: refItem(3) }
    },
    {
        label: 'selection item hover',
        hover: true,
        ours: { story: 'components-list--selection', selector: item('Multi selection', 3) },
        ref: { story: `${FS}list-standard--selection`, selector: refItem(3) }
    },
    {
        label: 'selected checkbox',
        ours: { story: 'components-list--selection', selector: `${item('Multi selection', 1)} [data-slot=checkbox]` },
        ref: { story: `${FS}list-standard--selection`, selector: `${refItem(2)} .fd-checkbox__checkmark` }
    },
    // subline: "Jane Doe" / "Software Developer" here, "List Item Title" / "List Item Subline" there
    {
        label: 'subline title',
        pixels: false,
        ignore: ['width'],
        ours: { story: 'components-list--byline', selector: `${item('Subline', 1)} [data-slot=list-title]` },
        ref: { story: `${FS}list-subline--standard`, selector: `${refItem(1)} .fd-list__title` }
    },
    {
        label: 'subline',
        pixels: false,
        ignore: ['width'],
        ours: { story: 'components-list--byline', selector: `${item('Subline', 1)} [data-slot=list-subline]` },
        ref: { story: `${FS}list-subline--standard`, selector: `${refItem(1)} .fd-list__subline` }
    }
];
