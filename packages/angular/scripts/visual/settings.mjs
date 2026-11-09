/** Visual cases for settings; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

const BACK = '[fd-settings-detail-area] button[aria-label="Navigate Back"]';
const REF_BACK = '.fd-settings__header .fd-button >> nth=0';

export default [
    {
        // 72 Bold with a normal line height (settings-1); the names differ, so by computed style
        label: 'profile card name',
        pixels: false,
        props: ['margin-top'],
        ignore: ['width'],
        ours: { story: 'components-settings--open-dialog', selector: '[fd-settings-profile-card-name]', overlay: true },
        ref: { story: `${FS}settings--user-account`, selector: '.fd-settings__profile-card-name' }
    },
    // the back button of a pushed view: its arrow points left in LTR and right in RTL, mirrored once by the icon
    // (settings-2); fundamental-styles' small settings show the same button in their detail header, but do not
    // mirror its arrow in RTL (it still points left): the RTL pixels differ there, on purpose
    {
        label: 'back button',
        ours: { story: 'components-settings--inline-pushed-view', selector: BACK },
        ref: { story: `${FS}settings--sm`, selector: REF_BACK }
    },
    {
        label: 'back button icon',
        // the glyph is drawn by ::before in the icon font; the element's own font is the button's (inherited)
        ignore: ['font-family'],
        ours: { story: 'components-settings--inline-pushed-view', selector: `${BACK} fd-icon` },
        ref: { story: `${FS}settings--sm`, selector: `${REF_BACK} >> i` }
    }
];
