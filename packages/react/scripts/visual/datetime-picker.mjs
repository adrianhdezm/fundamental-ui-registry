/** Visual cases for datetime-picker; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-patterns-';

// fundamental-styles has no datetime picker story. Its date picker pattern is the field and the popover with a footer
// bar (Today Selection Button), and its Mobile Portrait story is the datetime picker's mobile layout (a date/time
// switch over the calendar, OK in the footer). Our Reference stories take the same label, placeholder, button name
// and title.
const OURS = 'components-datetime-picker--reference';
const OPEN = 'components-datetime-picker--reference-open';
const MOBILE = 'components-datetime-picker--reference-mobile';
const REF = `${FS}date-picker--today-selection-button`;
const REF_MOBILE = `${FS}date-picker--mobile-portrait`;
const INPUT = '#todaySelectionDateInput';
const BODY = '[role=dialog][aria-label="Choose date and time"]';
const WINDOW = '[role=dialog][aria-modal=true]';
// the input fills the group: its own radius and min-height do not show (as in input-group's cases)
const INPUT_IGNORE = [
    'min-height',
    'border-top-left-radius',
    'border-top-right-radius',
    'border-bottom-right-radius',
    'border-bottom-left-radius'
];

export default [
    // the field: an input group with the picker button. The glyph is the datetime picker's `date-time` (fundamental-
    // ngx and UI5), not the date picker's `appointment-2`, so the button compares by styles
    {
        label: 'field',
        ours: { story: OURS, selector: `div:has(> ${INPUT})` },
        ref: { story: REF, selector: `.fd-input-group:has(> ${INPUT})` }
    },
    {
        label: 'field hover',
        hover: true,
        ours: { story: OURS, selector: `div:has(> ${INPUT})` },
        ref: { story: REF, selector: `.fd-input-group:has(> ${INPUT})` }
    },
    {
        label: 'input',
        ignore: INPUT_IGNORE,
        ours: { story: OURS, selector: INPUT },
        ref: { story: REF, selector: INPUT }
    },
    {
        label: 'button',
        pixels: false,
        ours: { story: OURS, selector: `${INPUT} + span button` },
        ref: { story: REF, selector: `${INPUT} + .fd-input-group__addon button` }
    },
    {
        label: 'button hover',
        hover: true,
        pixels: false,
        ours: { story: OURS, selector: `${INPUT} + span button` },
        ref: { story: REF, selector: `${INPUT} + .fd-input-group__addon button` }
    },
    // the popover: a calendar and time columns against fundamental-styles' calendar, so by computed style
    {
        label: 'popover body',
        pixels: false,
        ignore: ['width', 'height'],
        ours: { story: OPEN, selector: BODY },
        ref: { story: REF, selector: '.fd-popover__body' }
    },
    {
        // OK and Cancel where fundamental-styles has Today: by computed style
        label: 'footer bar',
        pixels: false,
        ignore: ['width'],
        ours: { story: OPEN, selector: `${BODY} [data-bar-design=footer]` },
        ref: { story: REF, selector: '.fd-popover__body .fd-bar' }
    },
    {
        // fundamental-styles' OK (emphasized, decisive) is in the footer of its mobile pattern
        label: 'OK button',
        ours: { story: OPEN, selector: `${BODY} [data-bar-design=footer] button` },
        ref: { story: REF_MOBILE, selector: '.fd-dialog__footer button' }
    },
    {
        label: 'OK button hover',
        hover: true,
        ours: { story: OPEN, selector: `${BODY} [data-bar-design=footer] button` },
        ref: { story: REF_MOBILE, selector: '.fd-dialog__footer button' }
    },
    // the mobile dialog
    {
        label: 'mobile window',
        pixels: false,
        // our window is the dialog's full-screen mobile window (min-height 100%); fundamental-styles' docs window
        // keeps the dialog's 7.5rem minimum (the dialog component's, as in date-picker)
        ignore: ['width', 'height', 'min-height'],
        ours: { story: MOBILE, selector: WINDOW },
        ref: { story: REF_MOBILE, selector: '.fd-dialog__content--mobile' }
    },
    {
        label: 'mobile header',
        pixels: false,
        // fundamental-styles' docs window keeps rounded top corners on its header; a full-screen mobile window has
        // none (the dialog component's, as in date-picker)
        ignore: ['width', 'border-top-left-radius', 'border-top-right-radius'],
        ours: { story: MOBILE, selector: `${WINDOW} [data-dialog-header] > [data-dialog-bar]` },
        ref: { story: REF_MOBILE, selector: '.fd-dialog__header' }
    },
    {
        // the date/time switch: centred, 1rem below the header
        label: 'mobile switch row',
        pixels: false,
        props: ['margin-top', 'justify-content', 'display'],
        ignore: ['width', 'height'],
        ours: { story: MOBILE, selector: `${WINDOW} div:has(> [aria-label="Show date or time"])` },
        ref: { story: REF_MOBILE, selector: 'div:has(> .fd-segmented-button)' }
    },
    {
        label: 'mobile switch',
        ours: { story: MOBILE, selector: `${WINDOW} [aria-label="Show date or time"]` },
        ref: { story: REF_MOBILE, selector: '.fd-segmented-button' }
    },
    {
        label: 'mobile calendar',
        pixels: false,
        // compact only: fundamental-styles' compact calendar padding wins over the mobile layout's none (as in
        // date-picker: the calendar component's)
        ignore: ['width', 'height', 'padding-right', 'padding-bottom', 'padding-left'],
        ours: { story: MOBILE, selector: `${WINDOW} [role=group][aria-roledescription=Calendar]` },
        ref: { story: REF_MOBILE, selector: '.fd-calendar--mobile-portrait' }
    },
    {
        label: 'mobile footer',
        pixels: false,
        // fundamental-styles' docs window keeps rounded bottom corners on its footer; a full-screen mobile window has
        // none (the dialog component's, as the header)
        ignore: ['width', 'border-bottom-left-radius', 'border-bottom-right-radius'],
        ours: { story: MOBILE, selector: `${WINDOW} [data-dialog-footer] > [data-dialog-bar]` },
        ref: { story: REF_MOBILE, selector: '.fd-dialog__footer' }
    },
    {
        label: 'mobile OK button',
        ours: { story: MOBILE, selector: `${WINDOW} [data-dialog-footer] button` },
        ref: { story: REF_MOBILE, selector: '.fd-dialog__footer button' }
    }
];
