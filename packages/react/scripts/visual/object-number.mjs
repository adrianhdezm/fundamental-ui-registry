/** Visual cases for object-number; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';
const ON = 'components-object-number--';
const REF = `${FS}object-number--`;

/** Our number whose formatted value is `text`. */
const num = (text) => `:is(span, [role="button"]):has(> span > bdi:text-is("${text}"))`;
/** The number part (text) and unit part of our number. */
const text = (value) => `${num(value)} >> span:has(> bdi[dir="ltr"])`;
const unit = (value) => `${num(value)} >> span:has(> bdi:not([dir]))`;
/** fundamental-styles' number with the status `mod`; the neutral one is the fifth (`nth=4`). */
const ref = (mod) => `.fd-object-number--${mod}`;
const REST = ':not(.is-hover):not(.is-focus):not(.is-active)';

export default [
    // status
    {
        label: 'negative',
        ours: { story: `${ON}status`, selector: num('-2,000.00') },
        ref: { story: `${REF}semantic-status`, selector: ref('negative') }
    },
    {
        label: 'critical',
        ours: { story: `${ON}status`, selector: num('0.00') },
        ref: { story: `${REF}semantic-status`, selector: ref('critical') }
    },
    {
        label: 'positive',
        ours: { story: `${ON}status`, selector: num('1,000.00') },
        ref: { story: `${REF}semantic-status`, selector: ref('positive') }
    },
    {
        label: 'informative',
        ours: { story: `${ON}status`, selector: num('100.00') },
        ref: { story: `${REF}semantic-status`, selector: ref('informative') }
    },
    {
        label: 'neutral',
        ours: { story: `${ON}status`, selector: num('999.00') },
        ref: { story: `${REF}semantic-status`, selector: '.fd-object-number >> nth=4' }
    },
    {
        label: 'text',
        ours: { story: `${ON}status`, selector: text('-2,000.00') },
        ref: { story: `${REF}semantic-status`, selector: `${ref('negative')} .fd-object-number__text` }
    },
    {
        label: 'unit',
        ours: { story: `${ON}status`, selector: unit('-2,000.00') },
        ref: { story: `${REF}semantic-status`, selector: `${ref('negative')} .fd-object-number__unit` }
    },
    // emphasized
    {
        label: 'emphasized positive',
        ours: { story: `${ON}emphasized`, selector: num('1,000.00') },
        ref: { story: `${REF}bold`, selector: ref('positive') }
    },
    {
        label: 'emphasized text',
        ours: { story: `${ON}emphasized`, selector: text('1,000.00') },
        ref: { story: `${REF}bold`, selector: `${ref('positive')} .fd-object-number__text` }
    },
    // large
    {
        label: 'large negative',
        ours: { story: `${ON}large`, selector: num('-2,000.00') },
        ref: { story: `${REF}large`, selector: ref('negative') }
    },
    {
        label: 'large neutral',
        ours: { story: `${ON}large`, selector: num('999.00') },
        ref: { story: `${REF}large`, selector: '.fd-object-number >> nth=4' }
    },
    {
        label: 'large unit',
        ours: { story: `${ON}large`, selector: unit('100.00') },
        ref: { story: `${REF}large`, selector: `${ref('informative')} .fd-object-number__unit` }
    },
    // interactive
    {
        label: 'interactive negative',
        ours: { story: `${ON}interactive`, selector: num('-2,000.00') },
        ref: { story: `${REF}interactive`, selector: `${ref('negative')}${REST}` }
    },
    {
        label: 'interactive text',
        ours: { story: `${ON}interactive`, selector: text('-2,000.00') },
        ref: { story: `${REF}interactive`, selector: `${ref('negative')}${REST} .fd-object-number__text` }
    },
    {
        label: 'interactive hover text',
        hover: true,
        ours: { story: `${ON}interactive`, selector: text('1,000.00') },
        ref: { story: `${REF}interactive`, selector: `${ref('positive')} .fd-object-number__text` }
    },
    {
        label: 'interactive focus',
        focus: true,
        refFocus: true,
        ours: { story: `${ON}interactive`, selector: num('999.00') },
        ref: { story: `${REF}interactive`, selector: '.fd-object-number >> nth=4' }
    },
    // inverted
    {
        label: 'inverted negative',
        ours: { story: `${ON}inverted`, selector: num('-2,000.00') },
        ref: { story: `${REF}inverted`, selector: ref('negative') }
    },
    {
        label: 'inverted critical',
        ours: { story: `${ON}inverted`, selector: num('0.00') },
        ref: { story: `${REF}inverted`, selector: ref('critical') }
    },
    {
        label: 'inverted informative',
        ours: { story: `${ON}inverted`, selector: num('100.00') },
        ref: { story: `${REF}inverted`, selector: ref('informative') }
    },
    {
        label: 'inverted neutral',
        ours: { story: `${ON}inverted`, selector: num('999.00') },
        ref: { story: `${REF}inverted`, selector: '.fd-object-number >> nth=4' }
    },
    {
        label: 'inverted text',
        ours: { story: `${ON}inverted`, selector: text('1,000.00') },
        ref: { story: `${REF}inverted`, selector: `${ref('positive')} .fd-object-number__text` }
    },
    // inverted interactive
    {
        label: 'inverted interactive positive',
        ours: { story: `${ON}inverted-interactive`, selector: num('1,000.00') },
        ref: { story: `${REF}inverted-interactive`, selector: ref('positive') }
    },
    {
        label: 'inverted interactive positive hover',
        hover: true,
        ours: { story: `${ON}inverted-interactive`, selector: num('1,000.00') },
        ref: { story: `${REF}inverted-interactive`, selector: ref('positive') }
    },
    {
        label: 'inverted interactive neutral hover',
        hover: true,
        ours: { story: `${ON}inverted-interactive`, selector: num('999.00') },
        ref: { story: `${REF}inverted-interactive`, selector: '.fd-object-number >> nth=4' }
    },
    {
        label: 'inverted interactive negative focus',
        focus: true,
        refFocus: true,
        ours: { story: `${ON}inverted-interactive`, selector: num('-2,000.00') },
        ref: { story: `${REF}inverted-interactive`, selector: ref('negative') }
    }
];
