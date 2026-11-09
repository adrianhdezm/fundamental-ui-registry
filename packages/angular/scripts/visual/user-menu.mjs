/** Visual cases for user-menu; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

// the mobile user menu is a dialog in the CDK overlay: "Open: mobile submenu" opens a submenu, which shows the back
// button; fundamental-styles' mobile menu has the same back button in its submenu dialog
const BACK = '.cdk-overlay-container [role=dialog] button[aria-label="Go back"]';
const REF_BACK = 'button[aria-label="Show main menu options"]';

export default [
    // the back arrow points left in LTR and right in RTL, mirrored once by the icon (user-menu-1). fundamental-styles'
    // static example does not mirror its arrow in RTL (it still points left): the RTL pixels differ there, on purpose
    {
        label: 'mobile back button',
        ours: { story: 'components-user-menu--open-mobile-submenu', selector: BACK, overlay: true },
        ref: { story: `${FS}menu--mobile-mode`, selector: REF_BACK }
    },
    {
        label: 'mobile back button icon',
        // the glyph is drawn by ::before in the icon font; the element's own font is the button's (inherited)
        ignore: ['font-family'],
        ours: { story: 'components-user-menu--open-mobile-submenu', selector: `${BACK} fd-icon`, overlay: true },
        ref: { story: `${FS}menu--mobile-mode`, selector: `${REF_BACK} i` }
    }
];
