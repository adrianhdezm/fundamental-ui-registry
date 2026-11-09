/** Visual cases for dialog; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

// a draggable dialog (the component-based story), open in the CDK overlay; its title differs from
// fundamental-styles', so the header bar compares by computed style (the cursor among them, dialog-1)
const HEADER = {
    story: 'components-dialog--open-component',
    selector: '[role=dialog] [data-dialog-header] > [data-dialog-bar]',
    overlay: true
};
const REF = { story: `${FS}dialog--draggable`, selector: '.fd-dialog__header' };

export default [
    { label: 'draggable header', pixels: false, ignore: ['width'], ours: HEADER, ref: REF },
    { label: 'draggable header, hovered', hover: true, pixels: false, ignore: ['width'], ours: HEADER, ref: REF }
];
