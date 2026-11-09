/** Visual cases for micro-process-flow; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';
const BASIC = 'components-micro-process-flow--basic';
const OVERFLOW = 'components-micro-process-flow--overflow';
const REF = `${FS}micro-process-flow--default-micro-process-flow`;

/** Our flow `nth` of a story (its root), and its step `i`. */
const flow = (nth) => `div:has(> div > div > [data-mpf-item]) >> nth=${nth}`;
const step = (nth, i) => `${flow(nth)} >> [data-mpf-item] >> nth=${i}`;
/** The connector of step `i` of our flow `nth`. */
const connector = (nth, i) => `${step(nth, i)} >> div >> nth=0 >> div:nth-child(2)`;

// our first Basic flow is fundamental-styles' default story: the same five states and glyphs, the second connector
// intermediate
const STATES = ['none', 'positive', 'information', 'negative', 'critical'];

export default [
    {
        label: 'flow (dependent steps)',
        ours: { story: BASIC, selector: flow(0) },
        ref: { story: REF, selector: '.fd-micro-process-flow' }
    },
    ...STATES.map((state, i) => ({
        label: `step ${state}`,
        ours: { story: BASIC, selector: step(0, i) },
        ref: { story: REF, selector: `.fd-micro-process-flow__item >> nth=${i}` }
    })),
    ...STATES.map((state, i) => ({
        label: `icon ${state}`,
        ours: { story: BASIC, selector: `${step(0, i)} >> [data-mpf-focusable]` },
        ref: { story: REF, selector: `.fd-micro-process-flow__icon-container >> nth=${i}` }
    })),
    ...STATES.slice(1).map((state, i) => ({
        label: `icon ${state} hover`,
        hover: true,
        ours: { story: BASIC, selector: `${step(0, i + 1)} >> [data-mpf-focusable]` },
        ref: { story: REF, selector: `.fd-micro-process-flow__icon-container >> nth=${i + 1}` }
    })),
    {
        label: 'icon focus',
        focus: true,
        refFocus: true,
        ours: { story: BASIC, selector: `${step(0, 1)} >> [data-mpf-focusable]` },
        ref: { story: REF, selector: '.fd-micro-process-flow__icon-container >> nth=1' }
    },
    {
        label: 'connector',
        ours: { story: BASIC, selector: connector(0, 0) },
        ref: { story: REF, selector: '.fd-micro-process-flow__connector >> nth=0' }
    },
    {
        label: 'connector intermediate',
        ours: { story: BASIC, selector: connector(0, 1) },
        ref: { story: REF, selector: '.fd-micro-process-flow__connector--intermediate' }
    },
    {
        label: 'flow (independent steps)',
        ours: { story: BASIC, selector: flow(1) },
        ref: {
            story: `${FS}micro-process-flow--micro-process-flow-independent-steps`,
            selector: '.fd-micro-process-flow'
        }
    },
    // the counts differ (fundamental-styles shows 20 and 10 hidden steps of a longer flow): styles only
    {
        label: 'next link',
        pixels: false,
        ignore: ['width'],
        ours: { story: OVERFLOW, selector: '[aria-label$="next steps"] >> nth=0' },
        ref: {
            story: `${FS}micro-process-flow--overflow-micro-process-flow`,
            selector: '.fd-micro-process-flow__link-next >> nth=0'
        }
    }
];
