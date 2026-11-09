/** Visual cases for quick-view; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

// Our "Company examples" story shows fundamental-styles' Popover, Without the header and Dialog examples in place,
// with their texts: the first two on a popover surface, the third in a dialog body. fundamental-styles' popover
// examples are static bodies, its dialog a static dialog. Its avatars are icons, as ours.
const ours = (selector) => ({ story: 'components-quick-view--examples', selector });
const popover = (selector) => ({ story: `${FS}quick-view--popover`, selector });
const noHeader = (selector) => ({ story: `${FS}quick-view--no-header`, selector });
const dialog = (selector) => ({ story: `${FS}quick-view--dialog`, selector });

const FIRST = '[data-quick-view] >> nth=0';
const FLEX = ['display', 'flex-direction', 'align-items', 'justify-content', 'column-gap', 'row-gap'];
const RADIUS = [
    'border-top-left-radius',
    'border-top-right-radius',
    'border-bottom-right-radius',
    'border-bottom-left-radius'
];
const MARGINS = ['margin-top', 'margin-bottom', 'margin-inline-start', 'margin-inline-end'];

export default [
    {
        label: 'quick view (popover, with header)',
        // fundamental-styles rounds the first and last child of a popover body (here the quick view); our popover
        // clips its content to its radius instead (the scroll wrapper has rounded-[inherit] and overflow-auto)
        ignore: RADIUS,
        props: ['min-width', 'display'],
        ours: ours(FIRST),
        ref: popover('.fd-quick-view')
    },
    {
        label: 'header bar',
        props: FLEX,
        ours: ours(`${FIRST} >> [data-bar-design=header]`),
        ref: popover('.fd-quick-view > .fd-bar--header')
    },
    {
        label: 'header title',
        ours: ours(`${FIRST} >> [data-bar-design=header] > div > div`),
        ref: popover('.fd-quick-view > .fd-bar--header .fd-bar__element')
    },
    {
        label: 'content',
        ours: ours(`${FIRST} >> [data-quick-view-content]`),
        ref: popover('.fd-quick-view__content')
    },
    {
        label: 'subheader',
        props: FLEX,
        ours: ours(`${FIRST} >> [data-quick-view-subheader]`),
        ref: popover('.fd-bar--header-with-subheader')
    },
    {
        label: 'subheader start area',
        props: FLEX,
        ours: ours(`${FIRST} >> [data-quick-view-subheader] > div`),
        ref: popover('.fd-bar--header-with-subheader .fd-bar__left')
    },
    {
        label: 'subheader avatar',
        props: MARGINS,
        ours: ours(`${FIRST} >> [data-quick-view-subheader] > div > :first-child`),
        ref: popover('.fd-bar--header-with-subheader .fd-avatar')
    },
    {
        label: 'subheader texts',
        props: [...FLEX, 'min-width', 'max-width'],
        ours: ours(`${FIRST} >> [data-quick-view-subheader-text]`),
        ref: popover('.fd-quick-view__subheader-text')
    },
    {
        label: 'subheader title',
        ours: ours(`${FIRST} >> [data-quick-view-subheader-text] h5`),
        ref: popover('.fd-quick-view__subheader-text .fd-title')
    },
    {
        label: 'subheader subtitle',
        props: ['white-space', 'text-overflow', 'overflow'],
        ours: ours(`${FIRST} >> [data-quick-view-subheader-text] > div`),
        ref: popover('.fd-quick-view__subtitle')
    },
    {
        label: 'group',
        props: FLEX,
        ours: ours(`${FIRST} >> [data-slot=form-group] >> nth=0`),
        ref: popover('.fd-form-group >> nth=0')
    },
    {
        label: 'second group',
        ours: ours(`${FIRST} >> [data-slot=form-group] >> nth=1`),
        ref: popover('.fd-form-group >> nth=1')
    },
    {
        label: 'group header',
        props: FLEX,
        // the header's own font (Angular's form group header) is not shown: its text is the heading, compared below
        ignore: ['font-family', 'font-size', 'font-weight'],
        ours: ours(`${FIRST} >> [data-quick-view-group-title] >> nth=0`),
        ref: popover('.fd-form-group__header >> nth=0')
    },
    {
        label: 'group title',
        ours: ours(`${FIRST} >> [data-quick-view-group-title] h4 >> nth=0`),
        ref: popover('.fd-form-group__header-text >> nth=0')
    },
    {
        label: 'item after the group title',
        props: FLEX,
        ours: ours(`${FIRST} >> [data-slot=form-item] >> nth=0`),
        ref: popover('.fd-form-item >> nth=0')
    },
    {
        label: 'item (two-line text)',
        props: FLEX,
        ours: ours(`${FIRST} >> [data-slot=form-item] >> nth=1`),
        ref: popover('.fd-form-item >> nth=1')
    },
    {
        label: 'label',
        ours: ours(`${FIRST} >> [data-slot=form-label-text] >> nth=0`),
        ref: popover('.fd-form-label >> nth=0')
    },
    {
        label: 'link value',
        ours: ours(`${FIRST} >> [data-slot=form-item] >> nth=0 >> a`),
        ref: popover('.fd-form-item >> nth=0 >> a')
    },
    {
        label: 'text value',
        ours: ours(`${FIRST} >> [data-slot=form-item] >> nth=1 >> [aria-labelledby]`),
        ref: popover('.fd-form-item >> nth=1 >> .fd-text')
    },
    {
        label: 'quick view without header',
        // fundamental-styles rounds the first and last child of a popover body (here the quick view); our popover
        // clips its content to its radius instead (the scroll wrapper has rounded-[inherit] and overflow-auto)
        ignore: RADIUS,
        ours: ours('[data-quick-view] >> nth=1'),
        ref: noHeader('.fd-quick-view')
    },
    {
        label: 'content without header',
        ours: ours('[data-quick-view] >> nth=1 >> [data-quick-view-content]'),
        ref: noHeader('.fd-quick-view__content')
    },
    {
        label: 'group without title',
        ours: ours('[data-quick-view] >> nth=1 >> [data-slot=form-group]'),
        ref: noHeader('.fd-form-group')
    },
    {
        label: 'content in a dialog body',
        // fundamental-styles' dialog is as wide as its content area; ours 25rem (Angular's story)
        pixels: false,
        ignore: ['width'],
        ours: ours('[data-quick-view] >> nth=2 >> [data-quick-view-content]'),
        ref: dialog('.fd-quick-view__content')
    },
    {
        label: 'subheader in a dialog body',
        pixels: false,
        ignore: ['width'],
        ours: ours('[data-quick-view] >> nth=2 >> [data-quick-view-subheader]'),
        ref: dialog('.fd-bar--header-with-subheader')
    }
];
