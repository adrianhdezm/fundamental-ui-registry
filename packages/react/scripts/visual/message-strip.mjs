/** Visual cases for message-strip; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';
const MS = `${FS}message-strip--`;

const TYPES = 'components-message-strip--types';
const NO_ICONS = 'components-message-strip--without-icons';
const COLORS = 'components-message-strip--indication-colors';
const LINKS = 'components-message-strip--custom-content-and-links';
const NOTE = '[role=note]';

export default [
    {
        label: 'warning',
        ours: { story: TYPES, selector: `${NOTE} >> nth=0` },
        ref: { story: `${MS}warning`, selector: '.fd-message-strip' }
    },
    {
        label: 'information',
        ours: { story: TYPES, selector: `${NOTE} >> nth=2` },
        ref: { story: `${MS}information`, selector: '.fd-message-strip' }
    },
    {
        label: 'default',
        ours: { story: TYPES, selector: `${NOTE} >> nth=4` },
        ref: { story: `${MS}default-strip`, selector: '.fd-message-strip' }
    },
    {
        label: 'icon',
        ours: { story: TYPES, selector: `${NOTE} >> nth=0 >> div[aria-hidden=true]` },
        ref: { story: `${MS}warning`, selector: '.fd-message-strip__icon-container' }
    },
    // the type glyphs are fundamental-ngx's (alert, sys-enter-2, error, information), fundamental-styles' message-*
    ...[
        ['success', 1],
        ['error', 3]
    ].map(([type, nth]) => ({
        label: `${type} icon`,
        ours: { story: TYPES, selector: `${NOTE} >> nth=${nth} >> div[aria-hidden=true]` },
        ref: { story: `${MS}${type}`, selector: '.fd-message-strip__icon-container' }
    })),
    {
        label: 'text',
        ours: { story: TYPES, selector: `${NOTE} >> nth=0 >> p` },
        ref: { story: `${MS}warning`, selector: '.fd-message-strip__text' }
    },
    ...[
        ['warning', 0],
        ['information', 2]
    ].map(([type, nth]) => ({
        label: `${type} dismissible no icon`,
        ours: { story: NO_ICONS, selector: `${NOTE} >> nth=${nth}` },
        ref: { story: `${MS}no-icons`, selector: `.fd-message-strip--${type}` }
    })),
    ...[
        ['success', 1],
        ['error', 3]
    ].map(([type, nth]) => ({
        label: `${type} no icon`,
        ours: { story: NO_ICONS, selector: `${NOTE} >> nth=${nth}` },
        ref: { story: `${MS}no-icons-not-dismissible`, selector: `.fd-message-strip--${type}` }
    })),
    {
        label: 'close button',
        ours: { story: TYPES, selector: `${NOTE} >> nth=0 >> button` },
        ref: { story: `${MS}warning`, selector: '.fd-message-strip__close' }
    },
    {
        label: 'close button hover',
        hover: true,
        ours: { story: TYPES, selector: `${NOTE} >> nth=0 >> button` },
        ref: { story: `${MS}warning`, selector: '.fd-message-strip__close' }
    },
    {
        label: 'close button focus',
        focus: true,
        refFocus: true,
        ours: { story: TYPES, selector: `${NOTE} >> nth=0 >> button` },
        ref: { story: `${MS}warning`, selector: '.fd-message-strip__close' }
    },
    {
        label: 'custom icon',
        ours: { story: COLORS, selector: `${NOTE} >> nth=0` },
        ref: { story: `${MS}message-strip-with-custom-icon`, selector: '.fd-message-strip >> nth=0' }
    },
    {
        label: 'custom icon error',
        ours: { story: COLORS, selector: `${NOTE} >> nth=1` },
        ref: { story: `${MS}message-strip-with-custom-icon`, selector: '.fd-message-strip >> nth=1' }
    },
    ...['1', '1b', '3b', '4', '4b', '6', '9', '9b', '10b'].map((color) => ({
        label: `indication ${color}`,
        ours: { story: COLORS, selector: `${NOTE}:has-text("indication color ${color} ")` },
        ref: {
            story: `${MS}message-strip-with-accent-colors`,
            selector: `.fd-message-strip--indication-color-${color}`
        }
    })),
    ...['4', '4b'].map((color) => ({
        label: `indication ${color} close hover`,
        hover: true,
        ours: { story: COLORS, selector: `${NOTE}:has-text("indication color ${color} ") >> button` },
        ref: {
            story: `${MS}message-strip-with-accent-colors`,
            selector: `.fd-message-strip--indication-color-${color} .fd-message-strip__close`
        }
    })),
    {
        label: 'indication 4 close focus',
        focus: true,
        refFocus: true,
        ours: { story: COLORS, selector: `${NOTE}:has-text("indication color 4 ") >> button` },
        ref: {
            story: `${MS}message-strip-with-accent-colors`,
            selector: '.fd-message-strip--indication-color-4 .fd-message-strip__close'
        }
    },
    {
        label: 'with link',
        ours: { story: LINKS, selector: `${NOTE} >> nth=0` },
        ref: { story: `${MS}message-strip-with-link`, selector: '.fd-message-strip >> nth=0' }
    },
    {
        label: 'link',
        ours: { story: LINKS, selector: `${NOTE} >> nth=0 >> a` },
        ref: { story: `${MS}message-strip-with-link`, selector: '.fd-message-strip >> nth=0 >> a' }
    },
    ...['1', '1b'].map((color) => ({
        label: `link on indication ${color}`,
        ours: { story: COLORS, selector: `${NOTE}:has-text("indication color ${color} ") >> a` },
        ref: {
            story: `${MS}message-strip-with-accent-colors`,
            selector: `.fd-message-strip--indication-color-${color} a`
        }
    }))
];
