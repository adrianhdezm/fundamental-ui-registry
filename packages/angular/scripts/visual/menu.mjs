/** Visual cases for menu; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

// our menus render in the CDK overlay: "Open: …" stories open them, `overlay` finds them in the page
const MENU = '.cdk-overlay-container [role=menu]';

export default [
    // the toggle check mark and the submenu arrow keep the icon's 1rem line height: 16px high (menu-2). Our icons are
    // 16px boxes, fundamental-styles' glyphs are inline (12px wide): styles only, without the width
    {
        label: 'toggle check mark',
        pixels: false,
        ignore: ['width'],
        ours: {
            story: 'components-menu--open-toggled',
            selector: `${MENU} [role=menuitemcheckbox] fd-icon[glyph=accept]`,
            overlay: true
        },
        ref: { story: `${FS}menu--toggle-button`, selector: '.fd-menu__checkmark' }
    },
    {
        // fundamental-styles draws its submenu arrow with ::after; its icon after an item (a check mark) instead,
        // which has the selected colour: the arrow has the icon colour of fundamental-styles' ::after arrow
        label: 'submenu arrow',
        pixels: false,
        ignore: ['width', 'color'],
        ours: {
            story: 'components-menu--open-submenus',
            selector: `${MENU} [aria-haspopup=menu] fd-icon[glyph=navigation-right-arrow] >> nth=0`,
            overlay: true
        },
        ref: { story: `${FS}menu--with-submenu`, selector: '.fd-menu__addon-after--active i >> nth=0' }
    },
    {
        // a mobile shortcut keeps the density's end padding, 0.5rem in compact (menu-1); other shortcut texts and our
        // dialog fills the window: styles only
        label: 'mobile shortcut',
        pixels: false,
        ignore: ['width'],
        ours: {
            story: 'components-menu--open-mobile-shortcuts',
            selector: '.cdk-overlay-container [fd-menu-shortcut]',
            overlay: true
        },
        ref: { story: `${FS}menu--mobile-mode`, selector: '#parent-menu .fd-menu__shortcut' }
    }
];
