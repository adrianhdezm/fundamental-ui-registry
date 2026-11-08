/** Visual cases for user-menu; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

// fundamental-styles' first example, open in a box of the page with its submenu open (`play` marks it ready)
const OURS = 'components-user-menu--variants';
const MENU = '[data-variant="Desktop"][data-ready]';
const LIST = `${MENU} [data-user-menu-list]`;
const SUBLIST = `${MENU} [role="menu"]:not([data-user-menu-list])`;
const item = (n) => `${LIST} > li:nth-child(${n}) > [role="menuitem"]`;
const subItem = (n) => `${SUBLIST} > li:nth-child(${n}) > [role="menuitem"]`;

const DEFAULT = `${FS}user-menu--default`;
const FS_LIST = '.fd-user-menu__menu-list';
const fsItem = (n) => `${FS_LIST} > .fd-menu__item:nth-child(${n}) > .fd-menu__link`;
const fsSubItem = (n) => `.fd-menu__sublist > .fd-menu__item:nth-child(${n}) > .fd-menu__link`;

// mobile mode: fundamental-styles' mobile example
const OURS_MOBILE = 'components-user-menu--variants-mobile';
const MOBILE = '[data-variant="Mobile"][data-ready]';
const MOBILE_REF = `${FS}user-menu--mobile`;

const pair = (label, ours, ref, extra = {}) => ({
    label,
    ours: { story: OURS, selector: ours },
    ref: { story: DEFAULT, selector: ref },
    ...extra
});

export default [
    // the surface; fundamental-styles' popover is static (no placement), its body is the full story width: styles
    pair('popover body', `${MENU} [data-user-menu-surface]`, '.fd-popover__body', {
        pixels: false,
        ignore: ['height']
    }),
    // fundamental-styles' avatar image does not load in its Storybook: the body is compared by styles
    pair('body', `${MENU} [data-user-menu-scroll] > div`, '.fd-user-menu__body', {
        pixels: false,
        ignore: ['height']
    }),
    pair(
        'header container',
        `${MENU} [data-user-menu-scroll] > div > div > div > div:nth-child(2)`,
        '.fd-user-menu__header-container'
    ),
    pair('user name', `${MENU} [id^="fd-user-menu-user-name"]`, '.fd-user-menu__user-name'),
    pair(
        'subline',
        `${MENU} [id^="fd-user-menu-user-name"] + div`,
        '.fd-user-menu__header-container > .fd-user-menu__subline'
    ),
    // fundamental-styles fills its content area with an aquamarine box: styles without the background
    pair(
        'header content area',
        `${MENU} [data-user-menu-scroll] > div > div > div > div:nth-child(3)`,
        '.fd-user-menu__header-content-area',
        { pixels: false, ignore: ['background-color', 'height'] }
    ),
    pair('menu list', LIST, FS_LIST),
    pair('item with icon', item(1), fsItem(1)),
    // our addons stretch over the item height (Angular's `self-stretch`) with the icon centred, fundamental-styles'
    // fit the icon: the columns are compared without the height, the glyphs on their own (1em wide, as in menu)
    pair('item icon column', `${item(1)} > span:nth-child(1)`, `${fsItem(1)} > .fd-menu__addon-before`, {
        pixels: false,
        ignore: ['height']
    }),
    pair('item icon', `${item(1)} > span:nth-child(1) > [data-glyph]`, `${fsItem(1)} > .fd-menu__addon-before > i`, {
        pixels: false,
        ignore: ['width']
    }),
    pair('item title', `${item(1)} > span:nth-child(2) > span`, `${fsItem(1)} > .fd-menu__title`, {
        // ours sits in a content column (Angular's markup): compared by styles
        pixels: false,
        ignore: ['width', 'height']
    }),
    pair('item, expanded with subtitle', item(2), fsItem(2)),
    pair('item subtitle', `${item(2)} > span:nth-child(2) > span:nth-child(2)`, `${fsItem(2)} .fd-menu__subtitle`),
    pair('submenu arrow', `${item(2)} > span:nth-child(3)`, `${fsItem(2)} > .fd-menu__addon-after--submenu`, {
        pixels: false,
        ignore: ['height']
    }),
    // a hovered item takes the focus (Angular, fundamental-ngx); the story opened its submenu from the keyboard, so
    // Chromium shows that focus as :focus-visible here (not after a mouse click): compared by styles
    pair('item, hover', item(3), fsItem(3), { hover: true, pixels: false }),
    pair('item, focus', item(4), fsItem(4), { focus: true, refFocus: true }),
    // fundamental-styles rounds the outer corners of the first and last submenu items and of the footer bar; ours are
    // clipped by the rounded popover body (its scroll wrapper, `overflow-hidden`): the same pixels
    pair('submenu item with icon', subItem(1), fsSubItem(1), {
        ignore: ['border-top-left-radius', 'border-top-right-radius']
    }),
    pair('submenu item', subItem(2), fsSubItem(2), {
        ignore: ['border-bottom-left-radius', 'border-bottom-right-radius']
    }),
    pair(
        'footer bar',
        `${MENU} [data-user-menu-surface] [data-bar-design="footer"]`,
        '.fd-popover__body > .fd-bar--footer',
        { ignore: ['border-bottom-left-radius', 'border-bottom-right-radius'] }
    ),
    {
        label: 'mobile body',
        pixels: false,
        // our dialog fills the viewport, fundamental-styles draws a phone-sized frame
        ignore: ['width', 'height'],
        ours: { story: OURS_MOBILE, selector: `${MOBILE} [data-dialog-body] > div` },
        ref: { story: MOBILE_REF, selector: '.fd-user-menu__body' }
    },
    {
        label: 'mobile item',
        pixels: false,
        ignore: ['width'],
        ours: { story: OURS_MOBILE, selector: `${MOBILE} [data-user-menu-list] > li:nth-child(1) > [role="menuitem"]` },
        ref: { story: MOBILE_REF, selector: `${FS_LIST} > .fd-menu__item:nth-child(1) > .fd-menu__link` }
    }
];
