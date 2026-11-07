/** Visual cases for tree; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

const ROW = '[data-tree-row]';
/** Our nth row (from 0) of the story. */
const row = (n) => `${ROW} >> nth=${n}`;
const LEVELS = 'components-tree--wrapping-and-non-wrapping-contents';
const HIGHLIGHTS = 'components-tree--highlight-indicators';
const ACTIONS = 'components-tree--node-actions-and-no-border';

export default [
    // fundamental-styles' Primary story: the same levels and texts
    ...[
        ['level 1 expanded', 0, '#TREE1L1 > li:nth-child(1) > .fd-tree__item-container'],
        ['level 2 expandable', 1, '#TREE1L2 > li:nth-child(1) > .fd-tree__item-container'],
        ['level 2 leaf', 2, '#TREE1L2 > li:nth-child(2) > .fd-tree__item-container'],
        ['level 1 leaf', 4, '#TREE1L1 > li:nth-child(2) > .fd-tree__item-container'],
        ['long text', 5, '#TREE1L1 > li:nth-child(3) > .fd-tree__item-container'],
        ['wrapping text', 6, '#TREE1L1 > li:nth-child(4) > .fd-tree__item-container']
    ].map(([label, n, selector]) => ({
        label,
        ours: { story: LEVELS, selector: row(n) },
        ref: { story: `${FS}tree--primary`, selector }
    })),
    {
        label: 'focus',
        focus: true,
        refFocus: true,
        ours: { story: LEVELS, selector: row(4) },
        ref: { story: `${FS}tree--primary`, selector: '#TREE1L1 > li:nth-child(2) > .fd-tree__item-container' }
    },
    {
        label: 'expander',
        ours: { story: LEVELS, selector: '[data-slot=tree-expander] >> nth=0' },
        ref: { story: `${FS}tree--primary`, selector: '#TREE1L1 .fd-tree__expander >> nth=0' }
    },
    {
        label: 'text',
        ours: { story: LEVELS, selector: '[data-slot=tree-item-text] >> nth=0' },
        ref: { story: `${FS}tree--primary`, selector: '#TREE1L1 .fd-tree__text >> nth=0' }
    },
    // Highlight indicators: the same levels and states
    ...[
        ['highlight default', 0, '#TREE3L1 > li:nth-child(1) > .fd-tree__item-container'],
        ['highlight warning', 1, '#TREE3L2 > li:nth-child(1) > .fd-tree__item-container'],
        ['highlight error', 2, '#TREE3L3 > li:nth-child(1) > .fd-tree__item-container'],
        ['highlight success', 3, '#TREE3L4 > li:nth-child(1) > .fd-tree__item-container']
    ].map(([label, n, selector]) => ({
        label,
        ours: { story: HIGHLIGHTS, selector: row(n) },
        ref: { story: `${FS}tree--highlight-indicators`, selector }
    })),
    // Borderless: Level 2 with the account icon and the edit and delete buttons in both
    {
        label: 'no border level 1',
        // two icons here (fundamental-react's story), one there: styles only
        pixels: false,
        ours: { story: ACTIONS, selector: row(0) },
        ref: { story: `${FS}tree--borderless`, selector: '#TREE2L1 > li:nth-child(1) > .fd-tree__item-container' }
    },
    {
        label: 'icon and buttons',
        ours: { story: ACTIONS, selector: row(1) },
        ref: { story: `${FS}tree--borderless`, selector: '#TREE2L2 > li:nth-child(1) > .fd-tree__item-container' }
    },
    {
        label: 'icon',
        ours: { story: ACTIONS, selector: '[data-slot=tree-item-content] > [data-glyph] >> nth=2' },
        ref: {
            story: `${FS}tree--borderless`,
            selector: '#TREE2L2 > li:nth-child(1) .fd-tree__content .fd-tree__icon >> nth=0'
        }
    },
    {
        label: 'button',
        props: ['margin-left', 'margin-right'],
        ours: { story: ACTIONS, selector: `${row(1)} >> button >> nth=0` },
        ref: { story: `${FS}tree--borderless`, selector: '#TREE2L2 > li:nth-child(1) .fd-tree__button >> nth=0' }
    },
    // Navigable: a navigatable child item without highlight, hovered; other texts and levels, styles only
    {
        label: 'navigatable hover',
        hover: true,
        pixels: false,
        ignore: ['width'],
        ours: { story: 'components-tree--navigation-links', selector: row(2) },
        ref: {
            story: `${FS}tree--navigable`,
            selector: 'li[aria-level="4"] > .fd-tree__item-container--active:not(.has-highlight-indicator) >> nth=0'
        }
    },
    {
        label: 'navigation indicator',
        ours: {
            story: 'components-tree--navigation-links',
            selector: '[data-slot=tree-navigation-indicator] >> nth=0'
        },
        ref: { story: `${FS}tree--navigable`, selector: '.fd-tree__icon--navigation >> nth=0' }
    },
    // Selection: the selected first item ("Level 1 - onValueChange" here, "Level 1" there), styles only
    {
        label: 'selected',
        pixels: false,
        ours: { story: 'components-tree--multi-selection-left', selector: `${ROW}[aria-selected=true] >> nth=0` },
        ref: { story: `${FS}tree--selection`, selector: '#TREESELL1 > li:nth-child(1) > .fd-tree__item-container' }
    },
    {
        label: 'no data',
        ours: { story: 'components-tree--empty-tree', selector: '[role=treeitem]' },
        ref: { story: `${FS}tree--tree-with-no-data`, selector: '#TREE1RTLND1 .fd-tree__item-container' }
    }
];
