/** Visual cases for split-button; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

// Our Variants story is fundamental-styles' split menu button example (the variants with their names): in high
// contrast the buttons stay transparent on the pad (split-button-1) and the focus frames have square inner corners
// (split-button-2).
const VARIANTS_STORY = 'components-split-button--variants';
const REF = `${FS}buttons-button-split--split-menu-button`;

/** Our group, by its label. */
const ours = (label) => `[role=group][aria-label="${label} split button"]`;
/** fundamental-styles' groups: the default row is 0–8 (same order). */
const ref = (index) => `.fd-button-split >> nth=${index}`;

const VARIANTS = ['Emphasized', 'Standard', 'Transparent', 'Ghost', 'Positive', 'Negative', 'Attention'];

export default [
    ...VARIANTS.map((label, index) => ({
        label: label.toLowerCase(),
        ours: { story: VARIANTS_STORY, selector: ours(label) },
        ref: { story: REF, selector: ref(index) }
    })),
    ...['Emphasized', 'Standard', 'Transparent'].flatMap((label) => {
        const index = VARIANTS.indexOf(label);
        return [
            {
                label: `${label.toLowerCase()} main button`,
                ours: { story: VARIANTS_STORY, selector: `${ours(label)} > button >> nth=0` },
                ref: { story: REF, selector: `${ref(index)} >> button >> nth=0` }
            },
            {
                label: `${label.toLowerCase()} arrow button`,
                ours: { story: VARIANTS_STORY, selector: `${ours(label)} > button >> nth=1` },
                ref: { story: REF, selector: `${ref(index)} >> button >> nth=1` }
            }
        ];
    }),
    {
        label: 'main focus',
        focus: true,
        refFocus: true,
        ours: { story: VARIANTS_STORY, selector: `${ours('Standard')} > button >> nth=0` },
        ref: { story: REF, selector: `${ref(1)} >> button >> nth=0` }
    },
    {
        label: 'arrow focus',
        focus: true,
        refFocus: true,
        ours: { story: VARIANTS_STORY, selector: `${ours('Standard')} > button >> nth=1` },
        ref: { story: REF, selector: `${ref(1)} >> button >> nth=1` }
    }
];
