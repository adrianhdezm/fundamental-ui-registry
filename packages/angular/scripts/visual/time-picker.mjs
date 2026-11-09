/** Visual cases for time-picker; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-patterns-';

/** fundamental-styles' time picker pattern: 4:25:10 PM in tablet mode, its body open under the field. */
const REF = `${FS}time-picker--tablet-mode`;
/** Our reference story: the same picker, closed (Angular's popover body opens in an overlay outside the story). */
const OURS = 'components-time-picker--reference';

// fundamental-styles' story has its body open: in the HC themes its shadow falls on the bottom edge of the field,
// the input and the button (2.6–3.6% of the pixels); the computed styles are the same.
const FIELD = { ours: 'fd-input-group:has(#tabletTimepicker)', ref: '.fd-input-group:has(> #tabletTimepicker)' };
const INPUT = '#tabletTimepicker';
const BUTTON = { ours: '#tabletTimepicker + span button', ref: '#tabletTimepicker + .fd-input-group__addon button' };
// the input fills the group: its own radius and min-height do not show (as in input-group's cases)
const INPUT_IGNORE = [
    'min-height',
    'border-top-left-radius',
    'border-top-right-radius',
    'border-bottom-right-radius',
    'border-bottom-left-radius'
];

export default [
    { label: 'field', ours: { story: OURS, selector: FIELD.ours }, ref: { story: REF, selector: FIELD.ref } },
    {
        label: 'field hover',
        hover: true,
        ours: { story: OURS, selector: FIELD.ours },
        ref: { story: REF, selector: FIELD.ref }
    },
    {
        label: 'input',
        ignore: INPUT_IGNORE,
        ours: { story: OURS, selector: INPUT },
        ref: { story: REF, selector: INPUT }
    },
    {
        // the button and its glyph (time-entry-request, time-picker-1)
        label: 'button',
        ours: { story: OURS, selector: BUTTON.ours },
        ref: { story: REF, selector: BUTTON.ref }
    },
    {
        label: 'button hover',
        hover: true,
        ours: { story: OURS, selector: BUTTON.ours },
        ref: { story: REF, selector: BUTTON.ref }
    },
    {
        label: 'button icon',
        ours: { story: OURS, selector: `${BUTTON.ours} [data-glyph]` },
        ref: { story: REF, selector: `${BUTTON.ref} i[class*="sap-icon"]` }
    }
];
