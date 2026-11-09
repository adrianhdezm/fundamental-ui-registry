/** Visual cases for overflow-layout; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

// fundamental-styles has no overflow layout: its parts are compared with the components they are made of. The "more"
// control is a transparent menu button, the items are info labels and avatars. Texts differ ("2 more" against
// "Transparent Button"), so the button and the items are compared by computed style; the arrow icon also by pixels.
const PLAYGROUND = 'components-overflow-layout--playground';
const MORE = 'button[aria-haspopup="dialog"]';
const REF_MORE = '.fd-button--transparent.fd-button--menu:has(.fd-button__text)';
const REF_MENU = `${FS}buttons-button--menu-button`;

export default [
    {
        label: 'more button',
        pixels: false,
        // the label is shorter
        ignore: ['width'],
        ours: { story: PLAYGROUND, selector: MORE },
        ref: { story: REF_MENU, selector: REF_MORE }
    },
    {
        label: 'more button hover',
        hover: true,
        pixels: false,
        ignore: ['width'],
        ours: { story: PLAYGROUND, selector: MORE },
        ref: { story: REF_MENU, selector: REF_MORE }
    },
    {
        label: 'more button focus',
        focus: true,
        refFocus: true,
        pixels: false,
        ignore: ['width'],
        ours: { story: PLAYGROUND, selector: MORE },
        ref: { story: REF_MENU, selector: REF_MORE }
    },
    {
        label: 'more button text',
        pixels: false,
        ignore: ['width'],
        ours: { story: PLAYGROUND, selector: `${MORE} >> span >> nth=0` },
        ref: { story: REF_MENU, selector: `${REF_MORE} >> .fd-button__text` }
    },
    {
        label: 'more button arrow',
        // the arrow inherits the button's font in fundamental-styles ("72" on the <i>, Horizon and Dark), ours the
        // label's semibold font; the glyph comes from the icon font either way and the pixels match
        ignore: ['font-family'],
        ours: { story: PLAYGROUND, selector: `${MORE} >> [data-glyph] >> nth=-1` },
        ref: { story: REF_MENU, selector: `${REF_MORE} >> i` }
    },
    {
        label: 'info label in the row',
        pixels: false,
        // "Info label 1" against "color 1"
        ignore: ['width'],
        ours: { story: PLAYGROUND, selector: '[data-overflow-item] >> nth=0 >> span.box-border.inline-flex' },
        ref: { story: `${FS}info-label--color-flavors`, selector: '.fd-info-label >> nth=0' }
    },
    {
        label: 'avatar in the row',
        pixels: false,
        // a photo here, initials there; icon avatars are compared below
        ours: {
            story: 'components-overflow-layout--avatar-group',
            selector: '[data-overflow-item] >> nth=0 >> [role=button]'
        },
        ref: { story: `${FS}avatar-group--overflow`, selector: '.fd-avatar--thumbnail >> nth=0' },
        // the photos differ
        ignore: ['background-image']
    },
    {
        label: 'icon avatar in the row',
        pixels: false,
        // another glyph (account against person-placeholder)
        ours: {
            story: 'components-overflow-layout--avatar-group',
            selector: '[data-overflow-item] >> nth=1 >> [role=button]'
        },
        ref: { story: `${FS}avatar-group--overflow`, selector: '.fd-avatar:has(.fd-avatar__icon) >> nth=0' }
    }
];
