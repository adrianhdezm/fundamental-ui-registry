/** Visual cases for tree; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

// targeted cases of the tree issues; the texts differ from fundamental-styles', so by computed style
export default [
    {
        // the button corner radius (tree-4)
        label: 'expander',
        pixels: false,
        ignore: ['width', 'height'],
        ours: {
            story: 'components-tree--basic',
            selector: '[role=treeitem] span[aria-hidden="true"].cursor-pointer >> nth=0'
        },
        ref: { story: `${FS}tree--primary`, selector: '#TREE1L1 .fd-tree__expander >> nth=0' }
    },
    {
        // no start margin (tree-2)
        label: 'item button',
        pixels: false,
        props: ['margin-left', 'margin-right'],
        ignore: ['width', 'height'],
        ours: { story: 'components-tree--states', selector: '[fdTreeItemButton] >> nth=0' },
        ref: { story: `${FS}tree--borderless`, selector: '#TREE2L2 > li:nth-child(1) .fd-tree__button >> nth=0' }
    },
    {
        // a wrapping item has no extra block padding (tree-1): fundamental-styles' Primary item with the same text
        label: 'wrapping item',
        ours: { story: 'components-tree--wrapping-item', selector: '[role=treeitem] >> nth=1' },
        ref: { story: `${FS}tree--primary`, selector: '#TREE1L1 > li:nth-child(4) > .fd-tree__item-container' }
    },
    {
        label: 'wrapping item text',
        ours: { story: 'components-tree--wrapping-item', selector: '[role=treeitem] >> nth=1 >> [fdTreeItemText]' },
        ref: { story: `${FS}tree--primary`, selector: '#TREE1L1 > li:nth-child(4) .fd-tree__text' }
    },
    {
        // the No data row is as high as an item plus its border (tree-3)
        label: 'no data',
        ours: { story: 'components-tree--empty', selector: '[role=treeitem]' },
        ref: { story: `${FS}tree--tree-with-no-data`, selector: '#TREE1RTLND1 .fd-tree__item-container' }
    },
    {
        label: 'no data text',
        // fundamental-styles' text fills the row, ours is as wide as the words (the row above matches pixel by pixel)
        pixels: false,
        ignore: ['width'],
        ours: { story: 'components-tree--empty', selector: '[role=treeitem] > span' },
        ref: { story: `${FS}tree--tree-with-no-data`, selector: '#TREE1RTLND1 .fd-tree__text' }
    }
];
