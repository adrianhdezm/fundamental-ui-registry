/** Visual cases for split-button; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

const TYPES = 'components-split-button--types';
const OPEN = 'components-split-button--open-menu';
const REF = `${FS}buttons-button-split--split-menu-button`;

/** Our group of the Types story, by its label (the texts are fundamental-styles'). */
const ours = (label) => `[role=group][aria-label="${label} split button"]`;
/** fundamental-styles' groups: the default row is 0–8, the "arrow toggled" row 9–17 (same order). */
const ref = (index) => `.fd-button-split >> nth=${index}`;

const VARIANTS = ['Emphasized', 'Standard', 'Transparent', 'Ghost', 'Positive', 'Negative', 'Attention'];

export default [
    ...VARIANTS.map((label, index) => ({
        label: label.toLowerCase(),
        ours: { story: TYPES, selector: ours(label) },
        ref: { story: REF, selector: ref(index) }
    })),
    ...['Emphasized', 'Standard', 'Transparent'].flatMap((label) => {
        const index = VARIANTS.indexOf(label);
        return [
            {
                label: `${label.toLowerCase()} main button`,
                ours: { story: TYPES, selector: `${ours(label)} > button >> nth=0` },
                ref: { story: REF, selector: `${ref(index)} >> button >> nth=0` }
            },
            {
                label: `${label.toLowerCase()} arrow button`,
                ours: { story: TYPES, selector: `${ours(label)} > button >> nth=1` },
                ref: { story: REF, selector: `${ref(index)} >> button >> nth=1` }
            }
        ];
    }),
    // hover on the group hides the separator, hover on a button shows its hover colours
    ...['Emphasized', 'Standard'].flatMap((label) => {
        const index = VARIANTS.indexOf(label);
        return [
            {
                label: `${label.toLowerCase()} main hover`,
                hover: true,
                ours: { story: TYPES, selector: `${ours(label)} > button >> nth=0` },
                ref: { story: REF, selector: `${ref(index)} >> button >> nth=0` }
            },
            {
                label: `${label.toLowerCase()} arrow hover`,
                hover: true,
                ours: { story: TYPES, selector: `${ours(label)} > button >> nth=1` },
                ref: { story: REF, selector: `${ref(index)} >> button >> nth=1` }
            }
        ];
    }),
    {
        label: 'main focus',
        focus: true,
        refFocus: true,
        ours: { story: TYPES, selector: `${ours('Standard')} > button >> nth=0` },
        ref: { story: REF, selector: `${ref(1)} >> button >> nth=0` }
    },
    {
        label: 'arrow focus',
        focus: true,
        refFocus: true,
        ours: { story: TYPES, selector: `${ours('Standard')} > button >> nth=1` },
        ref: { story: REF, selector: `${ref(1)} >> button >> nth=1` }
    },
    // the open menu: the arrow pressed and no separator, as fundamental-styles' "arrow toggled" row
    {
        label: 'open emphasized',
        ours: { story: OPEN, selector: ours('Emphasized') },
        ref: { story: REF, selector: ref(9) }
    },
    {
        label: 'open emphasized arrow',
        ours: { story: OPEN, selector: `${ours('Emphasized')} > button >> nth=1` },
        ref: { story: REF, selector: `${ref(9)} >> button >> nth=1` }
    }
];
