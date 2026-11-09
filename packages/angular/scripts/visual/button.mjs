/** Visual cases for button; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

export default [
    // a decisive button keeps its 4rem minimum width in compact density (button-1): fundamental-styles' dialog
    // footer buttons
    {
        label: 'decisive',
        props: ['min-width'],
        ours: { story: 'components-button--decisive', selector: 'button:has-text("End button")' },
        ref: { story: `${FS}dialog--default-dialog`, selector: '.fd-dialog__decisive-button >> nth=1' }
    }
];
