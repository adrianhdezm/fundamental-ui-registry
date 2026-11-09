/** Visual cases for tabs; see ../visual.config.mjs for the fields. */

// The Angular tabs port fundamental-styles' (now deprecated) Tabs: its stories are the reference.
const DEP = 'sap-design-deprecated-components-tabs--';

export default [
    {
        label: 'icon count',
        // our count is 3, fundamental-styles' 12: styles only, the width follows the text
        pixels: false,
        ignore: ['width'],
        ours: { story: 'components-tabs--modes', selector: '[fd-tab-count] >> nth=0' },
        ref: { story: `${DEP}icon-only`, selector: '.fd-tabs__count >> nth=0' }
    }
];
