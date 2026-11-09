/** Visual cases for rating-indicator; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

export default [
    {
        label: 'halves md',
        ours: { story: 'components-rating-indicator--default', selector: 'fd-rating-indicator[arialabelledby="ri-2"]' },
        ref: { story: `${FS}rating-indicator--half-values`, selector: '.fd-rating-indicator' }
    },
    {
        // the focus outline: square corners in HC (rating-indicator-1); the first rating of the story takes the focus
        label: 'lg focus',
        focus: true,
        refFocus: true,
        ours: { story: 'components-rating-indicator--sizes', selector: '[role=slider] >> nth=0' },
        ref: {
            story: `${FS}rating-indicator--sizes`,
            selector: '.fd-rating-indicator--lg .fd-rating-indicator__container'
        }
    }
];
