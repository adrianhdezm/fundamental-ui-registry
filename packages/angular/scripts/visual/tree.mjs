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
    }
];
