/** Visual cases for rating-indicator; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

export default [
    {
        label: 'halves md',
        ours: { story: 'components-rating-indicator--default', selector: 'fd-rating-indicator[arialabelledby="ri-2"]' },
        ref: { story: `${FS}rating-indicator--half-values`, selector: '.fd-rating-indicator' }
    }
];
