/** Visual cases for menu; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

// open menus rendered into the page, as fundamental-styles' static menus
const OURS = 'components-menu--variants';
const menu = (variant) => `[data-variant="${variant}"]`;
const item = (variant, n) => `${menu(variant)} > ul > li:nth-child(${n}) > [data-menu-link]`;

// fundamental-styles' stories
const DEFAULT = `${FS}menu--default`;
const STATES = `${FS}menu--different-states`;
const STATES_LIST = 'nav[aria-label="navbar"]';
const ICONS_LIST = '.fd-menu--icons';

const pair = (label, ours, story, selector, extra = {}) => ({
    label,
    ours: { story: OURS, selector: ours },
    ref: { story, selector },
    ...extra
});

export default [
    // the surface: our popover body holds the list, fundamental-styles' list is the surface itself; the body has the
    // popover background, which the items cover (not visible)
    pair('menu surface', `div:has(> div > ${menu('Default')})`, DEFAULT, '.fd-menu__list', {
        ignore: ['background-color']
    }),
    pair('item', item('Default', 1), DEFAULT, '.fd-menu__item:nth-child(1) .fd-menu__link'),
    pair('item title', `${item('Default', 1)} > span`, DEFAULT, '.fd-menu__item:nth-child(1) .fd-menu__title'),
    pair('item, hover', item('States', 2), STATES, `${STATES_LIST} li:nth-child(2) .fd-menu__link`, { hover: true }),
    pair('item, active', item('States', 3), STATES, `${STATES_LIST} li:nth-child(3) .fd-menu__link`),
    pair('item, selected', item('States', 4), STATES, `${STATES_LIST} li:nth-child(4) .fd-menu__link`),
    pair('item, selected and hover', item('States', 5), STATES, `${STATES_LIST} li:nth-child(5) .fd-menu__link`, {
        hover: true
    }),
    pair('item, disabled', item('States', 6), STATES, `${STATES_LIST} li:nth-child(6) .fd-menu__link`),
    // fundamental-styles shows focus on an item with icons: styles only
    pair('item, focus', item('Default', 1), `${FS}menu--menu-icon`, '.fd-menu__link.is-focus', {
        focus: true,
        pixels: false,
        // the focused reference item has icons and a long wrapping title
        ignore: ['width', 'height', 'padding-left', 'padding-right']
    }),
    pair(
        'item with separator',
        `${menu('Separated')} > ul > li:nth-child(2)`,
        `${FS}menu--seperated-items`,
        '.fd-menu__item.has-separator'
    ),
    // fundamental-styles' list fills a third of the page, ours fits its items
    pair('item with icons', item('Icons', 1), STATES, `${ICONS_LIST} li:nth-child(1) .fd-menu__link`, {
        pixels: false,
        ignore: ['width']
    }),
    // our addons stretch over the item height (as Angular's), with the icon centred: the icons are compared
    // our icons are 1em wide whatever the glyph (icon component), centred in the icon column as fundamental-styles'
    pair(
        'icon before',
        `${item('Icons', 1)} > span:nth-child(1) > [data-glyph]`,
        STATES,
        `${ICONS_LIST} li:nth-child(1) .fd-menu__addon-before > i`,
        { pixels: false, ignore: ['width'] }
    ),
    pair(
        'icon column',
        `${item('Icons', 1)} > span:nth-child(1)`,
        STATES,
        `${ICONS_LIST} li:nth-child(1) .fd-menu__addon-before`,
        { pixels: false, ignore: ['height'] }
    ),
    pair(
        'shortcut',
        `${item('Icons', 1)} > span:nth-child(3)`,
        STATES,
        `${ICONS_LIST} li:nth-child(1) .fd-menu__shortcut`
    ),
    pair(
        'icon after',
        `${item('Icons', 1)} > span:nth-child(4) > [data-glyph]`,
        STATES,
        `${ICONS_LIST} li:nth-child(1) .fd-menu__addon-after > i`
    ),
    pair(
        'title in an icon list, no icon before',
        `${item('Icons', 3)} > span:nth-child(1)`,
        STATES,
        `${ICONS_LIST} li:nth-child(4) .fd-menu__title`,
        { pixels: false, ignore: ['width'], props: ['margin-left', 'margin-right'] }
    ),
    pair(
        'subtitle',
        `${item('Icons', 4)} [data-menu-title] + span`,
        `${FS}menu--menu-icon`,
        '.fd-menu__subtitle',
        // the texts differ
        { pixels: false, ignore: ['width', 'height'] }
    ),
    pair(
        'single-choice header',
        `${menu('Extended')} > ul > li:nth-child(1)`,
        `${FS}menu--segmented-button`,
        '.fd-menu__item:nth-child(1)',
        // our menu is wider (it also holds the input)
        { pixels: false, ignore: ['width'] }
    ),
    pair(
        'single-choice dot',
        `${menu('Extended')} li:first-child > [role="menuitemradio"] > [data-menu-mark] > span`,
        `${FS}menu--segmented-button`,
        '.fd-menu__active-dot',
        // the dot holds no text: its inherited font size and colour are not visible
        { ignore: ['font-size', 'color'] }
    ),
    pair(
        'toggle checkmark',
        `${menu('Extended')} [role="menuitemcheckbox"] > [data-menu-mark] > [data-glyph]`,
        `${FS}menu--toggle-button`,
        '.fd-menu__checkmark',
        // a 1em icon box (12px glyph), centred in the icon column
        { pixels: false, ignore: ['width'] }
    ),
    pair(
        'item input',
        `${menu('Extended')} input`,
        `${FS}menu--input`,
        'nav:nth-child(2) .fd-menu__input',
        // the field fills the rest of the item, whose width differs
        { pixels: false, ignore: ['width'] }
    ),
    pair(
        'submenu parent, expanded',
        item('Submenu', 2),
        `${FS}menu--with-submenu`,
        '.fd-menu__link.is-expanded',
        // fundamental-styles' list is wider than ours (its submenu holds long texts)
        { pixels: false, ignore: ['width'] }
    ),
    pair(
        'submenu indicator',
        `${item('Submenu', 2)} > span:last-child`,
        `${FS}menu--with-submenu`,
        '.fd-menu__addon-after--submenu',
        // fundamental-styles draws the arrow with ::after on a 17px box; ours is an icon in a stretched addon
        { pixels: false, ignore: ['height'] }
    ),
    pair(
        'submenu list',
        'nav[aria-labelledby] > ul',
        `${FS}menu--with-submenu`,
        '.fd-menu__sublist',
        // fundamental-styles' submenu holds more and longer items; our list has the list background, which the
        // items cover (not visible)
        { pixels: false, ignore: ['width', 'height', 'background-color'] }
    ),
    pair(
        'submenu item, hover',
        `nav[aria-labelledby] > ul > li:nth-child(2) > [data-menu-link]`,
        `${FS}menu--with-submenu`,
        '.fd-menu__sublist .fd-menu__link.is-hover',
        { hover: true, pixels: false, ignore: ['width'] }
    ),
    {
        label: 'mobile item',
        ours: {
            story: 'components-menu--mobile-variant',
            selector: '[role=menu] > ul > li:nth-child(3) > [data-menu-link]'
        },
        ref: { story: `${FS}menu--mobile-mode`, selector: '#parent-menu li:nth-child(3) .fd-menu__link' },
        // our dialog is narrower
        pixels: false,
        ignore: ['width']
    },
    {
        label: 'mobile shortcut',
        ours: {
            story: 'components-menu--mobile-variant',
            selector: '[role=menu] > ul > li:nth-child(4) > [data-menu-link] > span:nth-child(3)'
        },
        ref: { story: `${FS}menu--mobile-mode`, selector: '#parent-menu .fd-menu__shortcut' }
    }
];
