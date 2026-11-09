/** Visual cases for scrollbar; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

// The overflow and scrollbar colours are not in the default style list. The Default story is fundamental-styles'
// example: a 300 x 100 box with 9000 x 9000 content, so the screenshot shows both scrollbars and their corner.
const props = ['scrollbar-color', 'scrollbar-width', 'overflow-x', 'overflow-y', 'box-sizing'];

export default [
    {
        label: 'scrollbar',
        props,
        ours: { story: 'components-scrollbar--default', selector: '[role="region"]' },
        ref: { story: `${FS}scrollbar--default-example`, selector: '.fd-scrollbar' }
    }
];
