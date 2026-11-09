/** Visual cases for scrollbar; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

// the scroll container's typography (scrollbar-1) and scrollbar styles; the content differs, so by computed style
const props = ['scrollbar-color', 'scrollbar-width', 'box-sizing'];

export default [
    {
        label: 'scrollbar',
        pixels: false,
        props,
        // our story frames the box (background, border, radius); fundamental-styles' example has no frame
        ignore: [
            'width',
            'height',
            'padding-top',
            'padding-right',
            'padding-bottom',
            'padding-left',
            'background-color',
            'border-top-width',
            'border-right-width',
            'border-bottom-width',
            'border-left-width',
            'border-top-style',
            'border-top-color',
            'border-right-color',
            'border-bottom-color',
            'border-left-color',
            'border-top-left-radius',
            'border-top-right-radius',
            'border-bottom-right-radius',
            'border-bottom-left-radius'
        ],
        ours: { story: 'components-scrollbar--playground', selector: '[fdScrollbar]' },
        ref: { story: `${FS}scrollbar--default-example`, selector: '.fd-scrollbar' }
    }
];
