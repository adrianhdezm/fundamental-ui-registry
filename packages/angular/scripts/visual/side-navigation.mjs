/** Visual cases for side-navigation; see ../visual.config.mjs for the fields. */

/*
 * The side navigation is a column (`fd-side-nav`) around the main and utility nested lists. fundamental-styles'
 * Side Navigation stories still have the `fd-side-nav` column, compared with ours by computed style (their content is
 * the newer `fd-navigation-list`), but no story uses the `fd-nested-list` classes of the lists any more. As in
 * nested-list.mjs, the reference lists are fundamental-styles markup written here, in the classes of its nested
 * list, with the texts of our Default and Text only stories; the `fd-side-nav-ref` selector engine (registered below,
 * before scripts/visual.mjs launches the browser) puts that markup into a fundamental-styles story page, inside the
 * story's density and direction wrappers, where fundamental-styles' own bundle and theme render it.
 */
import { selectors } from 'playwright';

const FS = 'sap-design-components-';
const EXPANDED = `${FS}side-navigation--expanded`;
const COLLAPSED = `${FS}side-navigation--collapsed`;

const link = (title, { icon, selected = false } = {}) =>
    `<li class="fd-nested-list__item"><a class="fd-nested-list__link${selected ? ' is-selected' : ''}" tabindex="0">` +
    (icon ? `<i class="fd-nested-list__icon sap-icon--${icon}" role="presentation"></i>` : '') +
    `<span class="fd-nested-list__title">${title}</span></a></li>`;
const header = (title) => `<li class="fd-nested-list__group-header">${title}</li>`;
const parent = (title, { icon, children }) =>
    '<li class="fd-nested-list__item"><div class="fd-nested-list__content has-child" tabindex="0">' +
    '<a class="fd-nested-list__link" tabindex="-1">' +
    (icon ? `<i class="fd-nested-list__icon sap-icon--${icon}" role="presentation"></i>` : '') +
    `<span class="fd-nested-list__title">${title}</span></a>` +
    '<button class="fd-button fd-nested-list__button" tabindex="-1" aria-hidden="true"><i class="sap-icon--navigation-down-arrow" role="presentation"></i></button>' +
    `</div><ul class="fd-nested-list level-2 fd-nested-list--text-only">${children.map((c) => link(c)).join('')}</ul></li>`;
const list = (items, textOnly = false) =>
    `<ul class="fd-nested-list${textOnly ? ' fd-nested-list--text-only' : ''}">${items.join('')}</ul>`;

/** The main list of our Default story; Home is selected in its Not selectable story. */
const main = (homeSelected) =>
    list([
        header('Overview'),
        link('Home', { icon: 'home', selected: homeSelected }),
        link('Analytics', { icon: 'crossed-line-chart' }),
        header('Administration'),
        parent('Settings', { icon: 'settings', children: ['Profile', 'Security', 'Language', 'Notifications'] }),
        link('Equipment', { icon: 'add-equipment' })
    ]);

const MARKUP = {
    main: main(false),
    selected: main(true),
    utility: list([link('Notifications', { icon: 'bell' }), link('Help', { icon: 'sys-help' })]),
    // our Text only story
    'text-main': list(
        [
            header('Group Header 1'),
            link('Link 1', { selected: true }),
            link('Link 2'),
            header('Group Header 2'),
            link('Link 3'),
            link('Link 4')
        ],
        true
    ),
    'text-utility': list([link('Settings'), link('Sign Out')], true)
};

const ENGINE = `({
    markup: ${JSON.stringify(MARKUP)},
    host(root, key) {
        let host = root.querySelector('[data-fd-side-nav-ref="' + key + '"]');
        if (!host) {
            const wrapper = root.querySelector('[dir]') ?? root;
            wrapper.innerHTML = '<div data-fd-side-nav-ref="' + key + '" style="width:18rem">' + this.markup[key] + '</div>';
            host = wrapper.firstElementChild;
        }
        return host;
    },
    split(selector) {
        const i = selector.indexOf(' ');
        return [selector.slice(0, i), selector.slice(i + 1)];
    },
    query(root, selector) {
        const [key, css] = this.split(selector);
        return this.host(root, key).querySelector(css);
    },
    queryAll(root, selector) {
        const [key, css] = this.split(selector);
        return [...this.host(root, key).querySelectorAll(css)];
    }
})`;
await selectors.register('fd-side-nav-ref', { content: ENGINE });

/** A reference element: `key` names the markup, `css` selects in it. */
const ref = (key, css) => ({ story: EXPANDED, selector: `fd-side-nav-ref=${key} ${css}` });

const DEFAULT = 'components-side-navigation--default';
const CONDENSED = 'components-side-navigation--condensed';
const NAV = 'fd-side-nav nav';
const MAIN_LIST = '[fd-side-nav-main] > ul';
const UTILITY_LIST = '[fd-side-nav-utility] > ul';

/**
 * The column: our story frame is 32rem high, fundamental-styles' 86rem, and the content differs (its stories show
 * the newer navigation list), so the height is not compared and only the computed styles are: the nav sets
 * fd-side-nav's text style, with line-height normal (side-navigation-1).
 */
const COLUMN = { pixels: false, ignore: ['height'] };

export default [
    {
        label: 'navigation',
        ...COLUMN,
        // ours is as wide as the story frame (18rem), fundamental-styles' column has its own width
        ignore: ['height', 'width'],
        ours: { story: DEFAULT, selector: NAV },
        ref: { story: EXPANDED, selector: 'nav.fd-side-nav' }
    },
    {
        label: 'navigation, condensed',
        ...COLUMN,
        ours: { story: CONDENSED, selector: NAV },
        ref: { story: COLLAPSED, selector: 'nav.fd-side-nav' }
    },
    {
        label: 'main list',
        ours: { story: DEFAULT, selector: MAIN_LIST },
        ref: ref('main', '.fd-nested-list')
    },
    {
        label: 'utility list',
        ours: { story: DEFAULT, selector: UTILITY_LIST },
        ref: ref('utility', '.fd-nested-list')
    }
];
