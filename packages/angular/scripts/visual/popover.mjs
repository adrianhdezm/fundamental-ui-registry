/** Visual cases for popover; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

/** Our open resizable popover (bottom-start): the body is in the CDK overlay, outside the story root. */
const OPEN_RESIZABLE = 'components-popover--open-resizable';

export default [
    {
        // the glyph (popover-1) and the corner away from the trigger (popover-2): the body below a start-aligned
        // trigger grows to the inline end, as fundamental-styles' first resizable body
        label: 'resize handle',
        ours: {
            story: OPEN_RESIZABLE,
            selector: '.cdk-overlay-pane [role="presentation"][data-corner]',
            overlay: true
        },
        ref: { story: `${FS}popover--resizable`, selector: '#popoverF10r .fd-popover__resize-handle' }
    }
];
