/** Visual cases for generic-tag; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';
const GT = 'components-generic-tag--types';
const REF = `${FS}generic-tag--primary`;

/** Our tag `nth` of the Types story: neutral, error, success, information, warning (fundamental-styles' order). */
const tag = (nth) => `[aria-roledescription] >> nth=${nth}`;
/** fundamental-styles' tag `nth` of a column: 0 regular, 1 hover, 2 active, 3 focus. */
const ref = (nth, column = 0) => `.fd-generic-tag >> nth=${column * 5 + nth}`;
const TYPES = ['neutral', 'error', 'success', 'information', 'warning'];

export default [
    ...TYPES.map((type, nth) => ({
        label: type,
        ours: { story: GT, selector: tag(nth) },
        ref: { story: REF, selector: ref(nth) }
    })),
    {
        label: 'error icon',
        ours: { story: GT, selector: `${tag(1)} >> [data-glyph]` },
        ref: { story: REF, selector: '.fd-generic-tag__icon >> nth=0' }
    },
    {
        label: 'error name',
        ours: { story: GT, selector: `${tag(1)} >> span[title="Product Cost"]` },
        ref: { story: REF, selector: '.fd-generic-tag__name >> nth=1' }
    },
    {
        label: 'error value',
        ours: { story: GT, selector: `${tag(1)} >> span[title="3.5M EUR"]` },
        ref: { story: REF, selector: '.fd-generic-tag__value >> nth=1' }
    },
    {
        label: 'neutral hover',
        hover: true,
        ours: { story: GT, selector: tag(0) },
        ref: { story: REF, selector: ref(0, 1) }
    },
    {
        label: 'error hover',
        hover: true,
        ours: { story: GT, selector: tag(1) },
        ref: { story: REF, selector: ref(1, 1) }
    },
    {
        label: 'error hover value',
        hover: true,
        ours: { story: GT, selector: `${tag(1)} >> span[title="3.5M EUR"]` },
        ref: { story: REF, selector: '.fd-generic-tag__value >> nth=6' }
    },
    {
        label: 'neutral focus',
        focus: true,
        ours: { story: GT, selector: tag(0) },
        ref: { story: REF, selector: ref(0, 3) }
    },
    {
        label: 'warning focus',
        focus: true,
        ours: { story: GT, selector: tag(4) },
        ref: { story: REF, selector: ref(4, 3) }
    }
];
