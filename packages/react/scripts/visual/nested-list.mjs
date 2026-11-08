/**
 * Visual cases for nested-list; see ../visual.config.mjs for the fields.
 *
 * fundamental-styles still ships the `fd-nested-list` styles (the nested list of the side navigation of
 * fundamental-ngx) in its bundle, but its Storybook no longer has a story with them: its Side Navigation stories use
 * the newer `fd-navigation-list`. So the reference elements come from fundamental-styles markup written here, in the
 * classes of its nested list, with the texts of our stories. The `fd-nested-ref` selector engine (registered below,
 * before scripts/visual.mjs launches the browser) puts that markup into a fundamental-styles story page, inside the
 * story's density and direction wrappers, and then selects in it: the page has the bundle and the theme of the
 * combination, so the reference is rendered by fundamental-styles' own CSS.
 */
import { selectors } from 'playwright';

const FS = 'sap-design-components-';
/** Any fundamental-styles story: only its CSS bundle, theme and wrappers are used. */
const HOST = `${FS}side-navigation--expanded`;

const link = (title, { icon, selected = false } = {}) =>
    `<li class="fd-nested-list__item"><a class="fd-nested-list__link${selected ? ' is-selected' : ''}" tabindex="0">` +
    (icon ? `<i class="fd-nested-list__icon sap-icon--${icon}" role="presentation"></i>` : '') +
    `<span class="fd-nested-list__title">${title}</span></a></li>`;
const header = (title) => `<li class="fd-nested-list__group-header">${title}</li>`;
const parent = (title, { icon, expanded, children }) =>
    '<li class="fd-nested-list__item"><div class="fd-nested-list__content has-child" tabindex="0">' +
    '<a class="fd-nested-list__link" tabindex="-1">' +
    (icon ? `<i class="fd-nested-list__icon sap-icon--${icon}" role="presentation"></i>` : '') +
    `<span class="fd-nested-list__title">${title}</span></a>` +
    `<button class="fd-button fd-nested-list__button" tabindex="-1" aria-hidden="true"><i class="sap-icon--navigation-${expanded ? 'down' : 'right'}-arrow" role="presentation"></i></button>` +
    `</div><ul class="fd-nested-list level-2 fd-nested-list--text-only"${expanded ? '' : ' aria-hidden="true"'}>${children.map((c) => link(c)).join('')}</ul></li>`;

const SETTINGS = ['Profile', 'Security', 'Language'];
/** Our Default and Text only stories. */
const story = (textOnly) =>
    `<ul class="fd-nested-list${textOnly ? ' fd-nested-list--text-only' : ''}">` +
    header('Overview') +
    link('Home', { icon: !textOnly && 'home', selected: true }) +
    link('Analytics', { icon: !textOnly && 'crossed-line-chart' }) +
    link('Equipment', { icon: !textOnly && 'add-equipment' }) +
    header('Administration') +
    parent('Settings', { icon: !textOnly && 'settings', expanded: true, children: SETTINGS }) +
    '</ul>';

const MARKUP = {
    default: story(false),
    'text-only': story(true),
    // our Not selectable story: Settings collapsed
    collapsed:
        '<ul class="fd-nested-list">' +
        link('Home', { icon: 'home', selected: true }) +
        parent('Settings', { icon: 'settings', expanded: false, children: SETTINGS }) +
        '</ul>'
};

const ENGINE = `({
    markup: ${JSON.stringify(MARKUP)},
    host(root, key) {
        let host = root.querySelector('[data-fd-nested-ref="' + key + '"]');
        if (!host) {
            const wrapper = root.querySelector('[dir]') ?? root;
            wrapper.innerHTML = '<div data-fd-nested-ref="' + key + '" style="width:18rem">' + this.markup[key] + '</div>';
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
await selectors.register('fd-nested-ref', { content: ENGINE });

/** A reference element: `key` names the markup, `css` selects in it. */
const ref = (key, css) => ({ story: HOST, selector: `fd-nested-ref=${key} ${css}` });

const DEFAULT = 'components-nested-list--default';
const TEXT_ONLY = 'components-nested-list--text-only';
const COLLAPSED = 'components-nested-list--not-selectable';
const ROW = '[data-nested-focusable]';
const row = (n) => `${ROW} >> nth=${n}`;
const refLink = (n) => `.fd-nested-list > .fd-nested-list__item:nth-child(${n}) > .fd-nested-list__link`;

export default [
    {
        label: 'list',
        ours: { story: DEFAULT, selector: 'ul[role=tree]' },
        ref: ref('default', '.fd-nested-list')
    },
    {
        label: 'group header',
        ours: { story: DEFAULT, selector: '[data-nested-header] >> nth=0' },
        ref: ref('default', '.fd-nested-list__group-header')
    },
    {
        label: 'link, selected',
        ours: { story: DEFAULT, selector: row(0) },
        ref: ref('default', refLink(2))
    },
    {
        label: 'link',
        ours: { story: DEFAULT, selector: row(1) },
        ref: ref('default', refLink(3))
    },
    {
        label: 'link, hover',
        hover: true,
        ours: { story: DEFAULT, selector: row(2) },
        ref: ref('default', refLink(4))
    },
    {
        label: 'link, focus',
        focus: true,
        refFocus: true,
        props: ['outline-style', 'outline-width', 'outline-color', 'outline-offset'],
        ours: { story: DEFAULT, selector: row(1) },
        ref: ref('default', refLink(3))
    },
    {
        label: 'icon',
        ours: { story: DEFAULT, selector: `${row(1)} >> [data-slot=nested-list-icon]` },
        ref: ref('default', `${refLink(3)} > .fd-nested-list__icon`)
    },
    {
        label: 'title',
        ours: { story: DEFAULT, selector: `${row(1)} >> [data-slot=nested-list-title]` },
        ref: ref('default', `${refLink(3)} > .fd-nested-list__title`)
    },
    {
        label: 'content with child',
        ours: { story: DEFAULT, selector: row(3) },
        ref: ref('default', '.fd-nested-list__content')
    },
    {
        label: 'content with child, hover',
        hover: true,
        ours: { story: DEFAULT, selector: row(3) },
        ref: ref('default', '.fd-nested-list__content')
    },
    {
        label: 'expand button, expanded',
        // fundamental-styles' button is an fd-button: its own font, paddings, minimum height and radius are not
        // visible (no background or border, the paddings fit in the 2.5rem minimum width); the glyph is compared by
        // pixels and the size by the box
        ignore: [
            'min-height',
            'padding-left',
            'padding-right',
            'font-family',
            'font-size',
            'border-top-left-radius',
            'border-top-right-radius',
            'border-bottom-right-radius',
            'border-bottom-left-radius'
        ],
        ours: { story: DEFAULT, selector: '[data-slot=nested-list-expand-icon]' },
        ref: ref('default', '.fd-nested-list__button')
    },
    {
        label: 'expand button, collapsed',
        // fundamental-styles' button is an fd-button: its own font, paddings, minimum height and radius are not
        // visible (no background or border, the paddings fit in the 2.5rem minimum width); the glyph is compared by
        // pixels and the size by the box
        ignore: [
            'min-height',
            'padding-left',
            'padding-right',
            'font-family',
            'font-size',
            'border-top-left-radius',
            'border-top-right-radius',
            'border-bottom-right-radius',
            'border-bottom-left-radius'
        ],
        ours: { story: COLLAPSED, selector: '[data-slot=nested-list-expand-icon]' },
        ref: ref('collapsed', '.fd-nested-list__button')
    },
    {
        label: 'level 2 link',
        ours: { story: DEFAULT, selector: row(4) },
        ref: ref('default', '.level-2 .fd-nested-list__link >> nth=0')
    },
    {
        label: 'level 2 title',
        ours: { story: DEFAULT, selector: `${row(4)} >> [data-slot=nested-list-title]` },
        ref: ref('default', '.level-2 .fd-nested-list__title >> nth=0')
    },
    {
        label: 'text only link, selected',
        ours: { story: TEXT_ONLY, selector: row(0) },
        ref: ref('text-only', refLink(2))
    },
    {
        label: 'text only title',
        ours: { story: TEXT_ONLY, selector: `${row(1)} >> [data-slot=nested-list-title]` },
        ref: ref('text-only', `${refLink(3)} > .fd-nested-list__title`)
    },
    {
        label: 'text only content with child',
        ours: { story: TEXT_ONLY, selector: row(3) },
        ref: ref('text-only', '.fd-nested-list__content')
    }
];
