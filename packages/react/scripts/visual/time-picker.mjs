/** Visual cases for time-picker; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-patterns-';

/** fundamental-styles' time picker pattern: 4:25:10 PM in tablet mode, its body open under the field. */
const REF = `${FS}time-picker--tablet-mode`;
/** Our reference story: the same picker, open, the body rendered inside the story. */
const OURS = 'components-time-picker--reference';
/** fundamental-styles' current time picker (a clock face, not ported): only its expanded field button is compared. */
const CURRENT = 'sap-design-components-time-picker--hours-12-cozy';

// The field is compared with the body open, as fundamental-styles shows it: the body's shadow falls on the field's
// bottom edge (visible in the HC themes), so a closed field would not match.
const FIELD = { ours: 'div:has(> #tabletTimepicker)', ref: '.fd-input-group:has(> #tabletTimepicker)' };
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
// In compact, fundamental-styles' compact values (32px) win over its tablet ones; ours stay touch-sized (46px) on
// tablets, on purpose (Angular's tablet rule, kept in time's report too): the time and collapsed value cases differ
// in height in the 8 compact combinations.

export default [
    { label: 'field', ours: { story: OURS, selector: FIELD.ours }, ref: { story: REF, selector: FIELD.ref } },
    {
        label: 'field hover',
        hover: true,
        ours: { story: OURS, selector: FIELD.ours },
        ref: { story: REF, selector: FIELD.ref }
    },
    {
        // by styles: tabbing into fundamental-styles' page selects the text of its input, which ours does not show
        label: 'input focus',
        focus: true,
        refFocus: true,
        pixels: false,
        ignore: INPUT_IGNORE,
        ours: { story: OURS, selector: INPUT },
        ref: { story: REF, selector: INPUT }
    },
    {
        label: 'input',
        ignore: INPUT_IGNORE,
        ours: { story: OURS, selector: INPUT },
        ref: { story: REF, selector: INPUT }
    },
    {
        // the pattern story shows the open picker's button in the rest colour; ours takes the selected colour while
        // open (as Angular, and as fundamental-styles' current time picker, below), so by styles without the colour;
        // a closed picker would not match by pixels either: the open body's shadow falls on the button in HC
        label: 'button',
        pixels: false,
        ignore: ['color', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color'],
        ours: { story: OURS, selector: BUTTON.ours },
        ref: { story: REF, selector: BUTTON.ref }
    },
    {
        // the icon colour of the expanded button of fundamental-styles' current time picker (`is-active`). That one
        // is a pressed icon button (no padding, regular font, the pressed background in HC) in a focused group
        // (`is-focus`, the field focus shadow): only the colour is the point here
        label: 'button expanded',
        pixels: false,
        ignore: ['box-shadow', 'padding-left', 'padding-right', 'font-family', 'background-color'],
        ours: { story: OURS, selector: BUTTON.ours },
        ref: { story: CURRENT, selector: '.fd-input-group__button' }
    },
    {
        label: 'button hover',
        hover: true,
        ours: { story: OURS, selector: BUTTON.ours },
        ref: { story: REF, selector: BUTTON.ref }
    },
    {
        // fundamental-styles' body also holds an OK/Cancel footer bar, which neither Angular nor we have: by styles
        label: 'popover body',
        pixels: false,
        ignore: ['height'],
        ours: { story: OURS, selector: '[role="dialog"]:has(#reference-time)' },
        ref: { story: REF, selector: '.fd-popover__body' }
    },
    {
        // the hours column has the focus in ours (the focus outline on 04), so by styles; fundamental-styles rounds
        // the top corners of its time (above the footer), which has no background, so the radius does not show
        label: 'time',
        pixels: false,
        props: ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'],
        ignore: ['border-top-left-radius', 'border-top-right-radius'],
        ours: { story: OURS, selector: '#reference-time' },
        ref: { story: REF, selector: '.fd-time' }
    },
    {
        label: 'column label',
        ours: { story: OURS, selector: '#reference-time-seconds-label' },
        ref: { story: REF, selector: '.fd-time__slider-label:text-is("Sec")' }
    },
    {
        label: 'collapsed value',
        ours: { story: OURS, selector: '#reference-time [aria-label=Minutes] > span' },
        ref: { story: REF, selector: '.fd-time__item--collapsed >> nth=0' }
    }
];
