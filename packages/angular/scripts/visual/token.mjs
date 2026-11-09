/** Visual cases for token; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';
const TOKEN = `${FS}token--primary`;
const TOKENIZER = `${FS}tokenizer--cozy-tokenizer`;
const READONLY = `${FS}tokenizer--readonly-and-display-only-modes`;
const STATES = 'components-token--states';
const FIELDS = 'components-token--field-states';

/** Our token `#ours` of the States story against the n-th token of fundamental-styles' token story. */
const token = (label, ours, nth, extra = {}) => ({
    label,
    ours: { story: STATES, selector: `#${ours} > [role=option]` },
    ref: { story: TOKEN, selector: `.fd-token >> nth=${nth}` },
    ...extra
});

export default [
    token('token', 'token-normal', 0),
    token('token selected', 'token-selected', 1),
    token('token hover', 'token-normal', 2, { hover: true }),
    token('token selected hover', 'token-selected', 3, { hover: true }),
    token('token focus', 'token-normal', 4, { focus: true }),
    token('token selected focus', 'token-selected', 5, { focus: true }),
    token('token hover focus', 'token-normal', 6, { hover: true, focus: true }),
    token('token read-only', 'token-readonly', 8),
    {
        label: 'token close icon',
        ours: { story: STATES, selector: '#token-normal [role=option] > [aria-hidden=true]' },
        ref: { story: TOKEN, selector: '.fd-token__close >> nth=0' }
    },
    {
        label: 'tokenizer empty',
        ours: { story: FIELDS, selector: '#tokenizer-empty > div' },
        ref: { story: TOKENIZER, selector: '.fd-tokenizer >> nth=0' }
    },
    {
        label: 'tokenizer hover',
        ours: { story: FIELDS, selector: '#tokenizer-empty > div' },
        ref: { story: TOKENIZER, selector: '.fd-tokenizer >> nth=0' },
        hover: true
    },
    {
        label: 'tokenizer with tokens',
        ours: { story: FIELDS, selector: '#tokenizer-tokens > div' },
        ref: { story: TOKENIZER, selector: '.fd-tokenizer >> nth=1' }
    },
    {
        label: 'tokenizer token',
        ours: { story: FIELDS, selector: '#tokenizer-tokens [role=option] >> nth=1' },
        ref: { story: TOKENIZER, selector: '.fd-tokenizer >> nth=1 >> .fd-token >> nth=1' },
        props: ['margin-left', 'margin-right']
    },
    {
        label: 'tokenizer read-only token',
        ours: { story: FIELDS, selector: '#tokenizer-tokens [role=option] >> nth=4' },
        ref: { story: TOKENIZER, selector: '.fd-tokenizer >> nth=1 >> .fd-token--readonly' }
    },
    {
        label: 'tokenizer input',
        ours: { story: FIELDS, selector: '#tokenizer-empty input' },
        ref: { story: TOKENIZER, selector: '.fd-tokenizer >> nth=0 >> input' },
        // fundamental-styles' input keeps its own min-height (100%, 26px compact); the input stretches to the field
        ignore: ['min-height']
    },
    {
        label: 'tokenizer read-only',
        ours: { story: FIELDS, selector: '#tokenizer-readonly > div' },
        ref: { story: READONLY, selector: '.fd-tokenizer--readonly' }
    },
    {
        label: 'tokenizer read-only hover',
        ours: { story: FIELDS, selector: '#tokenizer-readonly > div' },
        ref: { story: READONLY, selector: '.fd-tokenizer--readonly' },
        hover: true
    }
];
