/** Visual cases for text; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';
const TX = 'components-text--';
const REF = `${FS}text--`;

/** Our paragraph `nth` of a story, or its text span (the clamped element). */
const p = (nth) => `p >> nth=${nth}`;
const span = (nth) => `${p(nth)} >> span >> nth=0`;

export default [
    {
        label: 'basic',
        ours: { story: `${TX}basic`, selector: p(0) },
        ref: { story: `${REF}default-example`, selector: '.fd-text' }
    },
    {
        label: 'whitespace preserved',
        ours: { story: `${TX}whitespaces`, selector: p(1) },
        ref: { story: `${REF}whitespace`, selector: '.fd-text--pre-wrap' }
    },
    {
        label: 'no line limit',
        ours: { story: `${TX}max-lines`, selector: p(0) },
        ref: { story: `${REF}max-lines`, selector: '.fd-text >> nth=0' }
    },
    {
        label: '2 lines',
        ours: { story: `${TX}max-lines`, selector: span(1) },
        ref: { story: `${REF}max-lines`, selector: '.fd-text--max-lines >> nth=0' }
    },
    {
        label: '3 lines',
        ours: { story: `${TX}max-lines`, selector: span(2) },
        ref: { story: `${REF}max-lines`, selector: '.fd-text--max-lines >> nth=1' }
    },
    {
        // fundamental-styles cuts its collapsed text by hand ("…ultricies..."); ours is clamped to 3 lines
        label: 'collapsed text',
        pixels: false,
        ours: { story: `${TX}expandable`, selector: span(0) },
        ref: { story: `${REF}expand`, selector: '.fd-text >> nth=0' }
    },
    {
        label: 'expanded text',
        ours: { story: `${TX}expandable`, selector: span(1) },
        ref: { story: `${REF}expand`, selector: '.fd-text >> nth=1' }
    },
    {
        label: 'more',
        ours: { story: `${TX}expandable`, selector: 'button >> nth=0' },
        ref: { story: `${REF}expand`, selector: '.fd-text__link--more >> nth=0' }
    },
    {
        label: 'less',
        ours: { story: `${TX}expandable`, selector: 'button >> nth=1' },
        ref: { story: `${REF}expand`, selector: '.fd-text__link--more >> nth=1' }
    },
    {
        label: 'more hover',
        hover: true,
        ours: { story: `${TX}expandable`, selector: 'button >> nth=0' },
        ref: { story: `${REF}expand`, selector: '.fd-text__link--more >> nth=0' }
    },
    {
        label: 'more focus',
        focus: true,
        refFocus: true,
        ours: { story: `${TX}expandable`, selector: 'button >> nth=0' },
        ref: { story: `${REF}expand`, selector: '.fd-text__link--more >> nth=0' }
    },
    {
        label: 'without hyphenation',
        ours: { story: `${TX}hyphenation`, selector: p(0) },
        ref: { story: `${REF}hyphenation`, selector: '.fd-text >> nth=0' }
    },
    {
        label: 'hyphenation',
        ours: { story: `${TX}hyphenation`, selector: p(1) },
        ref: { story: `${REF}hyphenation`, selector: '.fd-text--hyphenation' }
    }
];
