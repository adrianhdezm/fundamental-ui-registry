/** Visual cases for date-picker; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-patterns-';

/** Our reference stories: fundamental-styles' Today Selection Button pattern, closed and open. */
const OURS = 'components-date-picker--reference';
const OPEN = 'components-date-picker--reference-open';
const REF = `${FS}date-picker--today-selection-button`;
const INPUT = '#todaySelectionDateInput';
/** The popover body, in the CDK overlay outside the story root. */
const BODY = '[role=dialog][aria-label="Choose date"]';

// fundamental-styles' story has its calendar open: in the HC themes and compact, the popover's shadow falls on the
// bottom rows of the field, the input and the button (React's report: 3.1–4.6% of the pixels); the computed
// styles are the same.
export default [
    // the field: an input group with the calendar button
    {
        label: 'field',
        ours: { story: OURS, selector: `fd-input-group:has(${INPUT})` },
        ref: { story: REF, selector: `.fd-input-group:has(> ${INPUT})` }
    },
    {
        label: 'field hover',
        hover: true,
        ours: { story: OURS, selector: `fd-input-group:has(${INPUT})` },
        ref: { story: REF, selector: `.fd-input-group:has(> ${INPUT})` }
    },
    {
        // the input's padding: date-picker-3 (compact) and its placeholder (italic in HC)
        label: 'input',
        ours: { story: OURS, selector: INPUT },
        ref: { story: REF, selector: INPUT },
        // fundamental-styles' input keeps the field's min-height and corner radius; the input fills the group and
        // has no background or border, so neither shows (as in input-group)
        ignore: [
            'min-height',
            'border-top-left-radius',
            'border-top-right-radius',
            'border-bottom-right-radius',
            'border-bottom-left-radius'
        ]
    },
    {
        label: 'calendar button',
        ours: { story: OURS, selector: `${INPUT} + span button` },
        ref: { story: REF, selector: `${INPUT} + .fd-input-group__addon button` }
    },
    {
        label: 'calendar button hover',
        hover: true,
        ours: { story: OURS, selector: `${INPUT} + span button` },
        ref: { story: REF, selector: `${INPUT} + .fd-input-group__addon button` }
    },
    // the popover: fundamental-styles shows February 2018 with a selected range and legend colours, ours today's
    // month without a selection, so the surface is compared by computed style
    {
        label: 'popover body',
        pixels: false,
        ignore: ['width', 'height'],
        ours: { story: OPEN, selector: BODY, overlay: true },
        ref: { story: REF, selector: '.fd-popover__body' }
    },
    // the today footer: date-picker-2
    {
        label: 'today footer',
        ours: { story: OPEN, selector: `${BODY} [data-bar-design=footer]`, overlay: true },
        ref: { story: REF, selector: '.fd-popover__body .fd-bar' }
    },
    {
        label: 'today button',
        ours: { story: OPEN, selector: `${BODY} [data-bar-design=footer] button`, overlay: true },
        ref: { story: REF, selector: '.fd-popover__body .fd-bar button' }
    },
    {
        label: 'today button hover',
        hover: true,
        ours: { story: OPEN, selector: `${BODY} [data-bar-design=footer] button`, overlay: true },
        ref: { story: REF, selector: '.fd-popover__body .fd-bar button' }
    }
];
