/** Visual cases for tabs; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

// The Angular tabs port fundamental-styles' (now deprecated) Tabs: its stories are the reference. Texts differ from
// ours ("Link", "Selected" against Angular's "Link 1", …), so text tabs are compared by computed style; the icon tabs
// story matches fundamental-styles' icon-only one (size s, cart icons, counts 12, 15 and 1, the second selected) and is
// also compared by pixels, which checks the selection bar and the focus frame (pseudo-elements).
const DEP = 'sap-design-deprecated-components-tabs--';
const BASIC = 'components-tabs--basic';
const MODES = 'components-tabs--modes';
const ICONS = 'components-tabs--icons';
const tab = (list, n) => `[aria-label="${list}"] [role=tab] >> nth=${n}`;
const bar = (list) => `div[role=presentation]:has([aria-label="${list}"])`;

export default [
    {
        label: 'bar',
        pixels: false,
        // fundamental-styles' story has no size modifier (no padding); ours is the default size m, Angular's default
        // (the sizes are compared below)
        ignore: ['width', 'padding-left', 'padding-right'],
        ours: { story: BASIC, selector: bar('Basic tabs') },
        ref: { story: `${DEP}primary`, selector: 'ul.fd-tabs' }
    },
    ...[
        ['bar s', 'Size s', 'icon-only', 'ul.fd-tabs--s'],
        ['bar l', 'Size l', 'process-mode', 'ul.fd-tabs--l'],
        ['bar xl', 'Size xl', 'tab-with-counters', 'ul.fd-tabs--xl']
    ].map(([label, list, story, selector]) => ({
        label,
        pixels: false,
        // the bars hold other tabs: only the padding and the colours are compared
        ignore: ['width', 'height', 'min-height'],
        ours: { story: 'components-tabs--sizes', selector: bar(list) },
        ref: { story: `${DEP}${story}`, selector }
    })),
    {
        label: 'tab',
        pixels: false,
        ignore: ['width'],
        ours: { story: BASIC, selector: tab('Basic tabs', 1) },
        ref: { story: `${DEP}primary`, selector: '.fd-tabs__item >> nth=2 >> .fd-tabs__link' }
    },
    {
        label: 'tab tag',
        pixels: false,
        ignore: ['width'],
        ours: { story: BASIC, selector: `${tab('Basic tabs', 1)} >> span` },
        ref: { story: `${DEP}primary`, selector: '.fd-tabs__item >> nth=2 >> .fd-tabs__tag' }
    },
    {
        label: 'tab tag hover',
        hover: true,
        pixels: false,
        ignore: ['width'],
        ours: { story: BASIC, selector: `${tab('Basic tabs', 1)} >> span` },
        ref: { story: `${DEP}primary`, selector: '.fd-tabs__item >> nth=2 >> .fd-tabs__tag' }
    },
    {
        label: 'selected tab tag',
        pixels: false,
        ignore: ['width'],
        ours: { story: BASIC, selector: `${tab('Basic tabs', 0)} >> span` },
        ref: { story: `${DEP}primary`, selector: '[aria-selected=true] .fd-tabs__tag' }
    },
    {
        label: 'count',
        pixels: false,
        ignore: ['width'],
        ours: { story: BASIC, selector: `${tab('Templated tabs', 1)} >> span.block` },
        ref: { story: `${DEP}tab-with-counters`, selector: '.fd-tabs__count >> nth=0' }
    },
    ...[
        ['error', 1, []],
        // fundamental-styles colours the text with the element colours (--sapWarningColor, --sapNeutralColor), which
        // fail the text contrast (about 3:1); ours, as Angular, take the text colours (--sapCriticalTextColor, …)
        ['warning', 2, ['color']],
        ['neutral', 4, ['color']]
    ].map(([state, n, ignore]) => ({
        label: `semantic tag ${state}`,
        pixels: false,
        ignore: ['width', ...ignore],
        ours: { story: BASIC, selector: `${tab('Semantic tabs', n)} >> span` },
        ref: { story: `${DEP}semantic-inline`, selector: `.fd-tabs__item--${state} .fd-tabs__tag` }
    })),
    {
        label: 'icon tab',
        ours: { story: ICONS, selector: tab('Icon tabs', 0) },
        ref: { story: `${DEP}icon-only`, selector: '.fd-tabs__link >> nth=0' }
    },
    {
        label: 'icon tab selected',
        ours: { story: ICONS, selector: tab('Icon tabs', 1) },
        ref: { story: `${DEP}icon-only`, selector: '.fd-tabs__link >> nth=1' }
    },
    {
        label: 'icon tab focus',
        focus: true,
        refFocus: true,
        ours: { story: ICONS, selector: tab('Icon tabs', 0) },
        ref: { story: `${DEP}icon-only`, selector: '.fd-tabs__link >> nth=0' }
    },
    {
        label: 'icon',
        ours: { story: ICONS, selector: `${tab('Icon tabs', 0)} >> [data-tab-icon]` },
        ref: { story: `${DEP}icon-only`, selector: '.fd-tabs__icon >> nth=0' }
    },
    {
        label: 'icon selected',
        ours: { story: ICONS, selector: `${tab('Icon tabs', 1)} >> [data-tab-icon]` },
        ref: { story: `${DEP}icon-only`, selector: '.fd-tabs__icon >> nth=1' }
    },
    {
        label: 'icon count',
        ours: { story: ICONS, selector: `${tab('Icon tabs', 0)} >> span.absolute` },
        ref: { story: `${DEP}icon-only`, selector: '.fd-tabs__count >> nth=0' }
    },
    {
        label: 'semantic icon success',
        // other glyphs
        pixels: false,
        ours: { story: MODES, selector: `${tab('Icon only tabs', 1)} >> [data-tab-icon]` },
        ref: { story: `${DEP}semantic-mode`, selector: '.fd-tabs__item--success .fd-tabs__icon' }
    },
    {
        label: 'process tab',
        pixels: false,
        ignore: ['width'],
        ours: { story: MODES, selector: tab('Process tabs', 0) },
        ref: { story: `${DEP}process-mode`, selector: '.fd-tabs__link >> nth=0' }
    },
    {
        label: 'process label',
        pixels: false,
        ignore: ['width'],
        ours: { story: MODES, selector: `${tab('Process tabs', 0)} >> [data-tab-label] >> nth=1` },
        ref: { story: `${DEP}process-mode`, selector: '.fd-tabs__label >> nth=1' }
    },
    {
        label: 'process arrow',
        pixels: false,
        ours: { story: MODES, selector: `[aria-label="Process tabs"] [role=tab] + span >> nth=0` },
        ref: { story: `${DEP}process-mode`, selector: '.fd-tabs__process-icon >> nth=0' }
    },
    {
        label: 'filter header tab',
        pixels: false,
        ignore: ['width'],
        ours: { story: MODES, selector: tab('Filter tabs', 0) },
        ref: { story: `${DEP}filter-mode`, selector: '.fd-tabs__item--header .fd-tabs__link' }
    },
    {
        label: 'filter header count',
        pixels: false,
        ignore: ['width'],
        ours: { story: MODES, selector: `${tab('Filter tabs', 0)} >> span >> nth=1` },
        ref: { story: `${DEP}filter-mode`, selector: '.fd-tabs__counter-header' }
    },
    {
        label: 'filter separator',
        pixels: false,
        // a 1px line between margins: ours is the end border (left in RTL), fundamental-styles' always the right one;
        // the line is drawn at the same place
        ignore: ['border-left-width', 'border-right-width', 'border-left-color', 'border-right-color'],
        ours: { story: MODES, selector: `[aria-label="Filter tabs"] div[aria-hidden=true] >> nth=0` },
        ref: { story: `${DEP}filter-mode`, selector: '.fd-tabs__separator' }
    },
    {
        label: 'filter tab',
        pixels: false,
        ignore: ['width'],
        ours: { story: MODES, selector: tab('Filter tabs', 2) },
        ref: { story: `${DEP}filter-mode`, selector: '.fd-tabs__link >> nth=2' }
    },
    {
        label: 'filter label',
        pixels: false,
        ignore: ['width'],
        ours: { story: MODES, selector: `${tab('Filter tabs', 2)} >> [data-tab-label]` },
        ref: { story: `${DEP}filter-mode`, selector: '.fd-tabs__link >> nth=2 >> .fd-tabs__label' }
    },
    {
        label: 'nav link',
        pixels: false,
        ignore: ['width'],
        ours: { story: 'components-tabs--navigation', selector: 'nav [role=tab] >> nth=1' },
        ref: { story: `${DEP}nav-tab`, selector: '.fd-tabs__link >> nth=2' }
    }
];
