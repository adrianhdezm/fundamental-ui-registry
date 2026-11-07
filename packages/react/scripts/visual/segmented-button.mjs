/** Visual cases for segmented-button; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

const TOGGLE = 'components-segmented-button--toggle';
const REF = `${FS}buttons-segmented-button--segmented-button`;
const REF_VERTICAL = `${FS}buttons-segmented-button--vertical`;

/** Our icon group of the toggle story, the same five icons and selection as fundamental-styles'. */
const group = '[aria-label="Views"]';
const vertical = '[aria-label="Views vertical"]';

export default [
    {
        label: 'group',
        ours: { story: TOGGLE, selector: group },
        ref: { story: REF, selector: '.fd-segmented-button' }
    },
    {
        label: 'vertical group',
        ours: { story: TOGGLE, selector: vertical },
        ref: { story: REF_VERTICAL, selector: '.fd-segmented-button--vertical' }
    },
    ...[
        ['first', 'Survey', 0],
        ['selected', 'Chart', 1],
        ['middle', 'Basket', 2],
        ['last', 'Pool', 4]
    ].map(([label, name, index]) => ({
        label,
        props: ['margin-inline-start', 'margin-inline-end', 'z-index'],
        ours: { story: TOGGLE, selector: `${group} > button[aria-label="${name}"]` },
        ref: { story: REF, selector: `.fd-segmented-button > button >> nth=${index}` }
    })),
    {
        label: 'hover',
        hover: true,
        ours: { story: TOGGLE, selector: `${group} > button[aria-label="Basket"]` },
        ref: { story: REF, selector: '.fd-segmented-button > button >> nth=2' }
    },
    {
        label: 'selected hover',
        hover: true,
        ours: { story: TOGGLE, selector: `${group} > button[aria-label="Chart"]` },
        ref: { story: REF, selector: '.fd-segmented-button > button >> nth=1' }
    },
    {
        label: 'vertical first',
        ours: { story: TOGGLE, selector: `${vertical} > button[aria-label="Survey"]` },
        ref: { story: REF_VERTICAL, selector: '.fd-segmented-button--vertical > button >> nth=0' }
    },
    {
        label: 'vertical last',
        ours: { story: TOGGLE, selector: `${vertical} > button[aria-label="Pool"]` },
        ref: { story: REF_VERTICAL, selector: '.fd-segmented-button--vertical > button >> nth=6' }
    },
    // keyboard focus: the first button of fundamental-styles' story (not in its tab order), ours focused by Tab
    {
        label: 'focus',
        focus: true,
        refFocus: true,
        ours: { story: TOGGLE, selector: `${group} > button[aria-label="Chart"]` },
        ref: { story: REF, selector: '.fd-segmented-button > button >> nth=1' }
    }
];
