/** Visual cases for message-strip; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';
const MS = `${FS}message-strip--`;

const TYPES = 'components-message-strip--types';
const COLORS = 'components-message-strip--indication-colors';
const LINKS = 'components-message-strip--links';
const NOTE = '[role=note]';

export default [
    {
        // the icon box: a 1rem font with a normal line height (message-strip-1). By computed style: the type glyphs
        // are fundamental-ngx's (alert for warning), fundamental-styles' are message-* (as React keeps them)
        label: 'icon',
        pixels: false,
        ours: { story: TYPES, selector: `${NOTE} >> nth=0 >> div[aria-hidden=true]` },
        ref: { story: `${MS}warning`, selector: '.fd-message-strip__icon-container' }
    },
    {
        label: 'close button',
        ours: { story: TYPES, selector: `${NOTE} >> nth=0 >> button` },
        ref: { story: `${MS}warning`, selector: '.fd-message-strip__close' }
    },
    {
        // the focused close button of an indication colour strip: no background or border (message-strip-2)
        label: 'indication 4 close focus',
        focus: true,
        refFocus: true,
        ours: { story: COLORS, selector: `${NOTE}:has-text('color "4"') >> button` },
        ref: {
            story: `${MS}message-strip-with-accent-colors`,
            selector: '.fd-message-strip--indication-color-4 .fd-message-strip__close'
        }
    },
    {
        label: 'indication 4b close focus',
        focus: true,
        refFocus: true,
        ours: { story: COLORS, selector: `${NOTE}:has-text('color "4b"') >> button` },
        ref: {
            story: `${MS}message-strip-with-accent-colors`,
            selector: '.fd-message-strip--indication-color-4b .fd-message-strip__close'
        }
    },
    // links (message-strip-3): the texts differ, so the links compare by computed style, with the margins
    {
        label: 'link',
        pixels: false,
        props: ['margin-left', 'margin-right'],
        ignore: ['width'],
        ours: { story: LINKS, selector: `${NOTE} >> nth=0 >> a` },
        ref: { story: `${MS}message-strip-with-link`, selector: '.fd-message-strip >> nth=0 >> a' }
    },
    ...['1', '1b'].map((color, n) => ({
        label: `link on indication ${color}`,
        pixels: false,
        props: ['margin-left', 'margin-right', 'text-shadow'],
        ignore: ['width'],
        ours: { story: LINKS, selector: `${NOTE} >> nth=${n + 1} >> a` },
        ref: {
            story: `${MS}message-strip-with-accent-colors`,
            selector: `.fd-message-strip--indication-color-${color} a`
        }
    }))
];
