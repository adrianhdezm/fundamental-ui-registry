/** Visual cases for tabs; see ../visual.config.mjs for the fields. */

// The Angular tabs port fundamental-styles' (now deprecated) Tabs: its stories are the reference. Texts differ from
// ours ("Link", "Selected" against "Link 1", …): text tabs are compared by computed style, with their margins (only
// the first tab has the first tab's spacing, tabs-1).
const DEP = 'sap-design-deprecated-components-tabs--';
const BASIC = 'components-tabs--basic';
const MODES = 'components-tabs--modes';
const MARGINS = ['margin-left', 'margin-right'];
const item = (list, n) => `[aria-label="${list}"] [fd-tab-item] >> nth=${n}`;
const tab = (list, n) => `[aria-label="${list}"] [role=tab] >> nth=${n}`;

export default [
    {
        label: 'first tab item',
        pixels: false,
        ignore: ['width'],
        props: MARGINS,
        ours: { story: BASIC, selector: item('Basic tabs', 0) },
        ref: { story: `${DEP}primary`, selector: '.fd-tabs__item >> nth=0' }
    },
    {
        label: 'first tab',
        pixels: false,
        // ours is selected, fundamental-styles' first is not: the selection colours its tag only
        ignore: ['width'],
        props: MARGINS,
        ours: { story: BASIC, selector: tab('Basic tabs', 0) },
        ref: { story: `${DEP}primary`, selector: '.fd-tabs__item >> nth=0 >> .fd-tabs__link' }
    },
    {
        label: 'tab item',
        pixels: false,
        ignore: ['width'],
        props: MARGINS,
        ours: { story: BASIC, selector: item('Basic tabs', 1) },
        ref: { story: `${DEP}primary`, selector: '.fd-tabs__item >> nth=2' }
    },
    {
        label: 'tab',
        pixels: false,
        ignore: ['width'],
        props: MARGINS,
        ours: { story: BASIC, selector: tab('Basic tabs', 1) },
        ref: { story: `${DEP}primary`, selector: '.fd-tabs__item >> nth=2 >> .fd-tabs__link' }
    },
    {
        // the tag in the text colour (tabs-2)
        label: 'tab tag',
        pixels: false,
        ignore: ['width'],
        ours: { story: BASIC, selector: `${tab('Basic tabs', 1)} >> [fd-tab-tag]` },
        ref: { story: `${DEP}primary`, selector: '.fd-tabs__item >> nth=2 >> .fd-tabs__tag' }
    },
    {
        label: 'first icon tab',
        pixels: false,
        ignore: ['width'],
        props: MARGINS,
        ours: { story: MODES, selector: tab('Icon only tabs', 0) },
        ref: { story: `${DEP}icon-only`, selector: '.fd-tabs__link >> nth=0' }
    },
    {
        label: 'icon count',
        // our count is 3, fundamental-styles' 12: styles only, the width follows the text
        pixels: false,
        ignore: ['width'],
        ours: { story: MODES, selector: '[fd-tab-count] >> nth=0' },
        ref: { story: `${DEP}icon-only`, selector: '.fd-tabs__count >> nth=0' }
    }
];
