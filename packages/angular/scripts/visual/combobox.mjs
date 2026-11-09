/** Visual cases for combobox; see ../visual.config.mjs for the fields. Adapted from the React package. */
const COMBOBOX = 'sap-design-patterns-combobox-input--';
const OURS = 'components-combobox--';

export default [
    // groups: their header is a <label> before each list, ours a presentational list item labelling its group
    {
        label: 'group header',
        pixels: false,
        ignore: ['width'],
        ours: { story: `${OURS}open-groups`, selector: 'li[role=presentation][id*="-group-"] >> nth=0', overlay: true },
        ref: { story: `${COMBOBOX}two-items-and-items-grouping`, selector: '#fruitListHeader' }
    }
];
