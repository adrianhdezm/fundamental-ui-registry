/** Visual cases for date-picker; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-patterns-';

// our Reference stories are fundamental-styles' Today Selection Button story: the same label, placeholder and button
// name; the field closed (fundamental-styles' static story does not mark its button as expanded, see the report),
// and the calendar open and rendered into the page
const OURS = 'components-date-picker--reference';
const OPEN = 'components-date-picker--reference-open';
const REF = `${FS}date-picker--today-selection-button`;
const MOBILE = 'components-date-picker--reference-mobile';
const REF_MOBILE = `${FS}date-picker--mobile-portrait`;
const INPUT = '#todaySelectionDateInput';

export default [
    // the field: an input group with the calendar button
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
    // the popover: fundamental-styles shows February 2018 with a selected range and legend colours, ours the same
    // month without a selection, so the surface is compared by computed style
    {
        label: 'popover body',
        pixels: false,
        ignore: ['width', 'height'],
        ours: { story: OPEN, selector: '[role=dialog][aria-label="Choose date"]' },
        ref: { story: REF, selector: '.fd-popover__body' }
    },
    {
        label: 'today footer',
        ours: { story: OPEN, selector: '[role=dialog][aria-label="Choose date"] [data-bar-design=footer]' },
        ref: { story: REF, selector: '.fd-popover__body .fd-bar' }
    },
    {
        label: 'today button',
        ours: { story: OPEN, selector: '[role=dialog][aria-label="Choose date"] [data-bar-design=footer] button' },
        ref: { story: REF, selector: '.fd-popover__body .fd-bar button' }
    },
    {
        label: 'today button hover',
        hover: true,
        ours: { story: OPEN, selector: '[role=dialog][aria-label="Choose date"] [data-bar-design=footer] button' },
        ref: { story: REF, selector: '.fd-popover__body .fd-bar button' }
    },
    // the mobile dialog: fundamental-styles' window is a static docs window with a date/time switch and no footer,
    // so the parts are compared by computed style
    {
        label: 'mobile window',
        pixels: false,
        // our window is the dialog's full-screen mobile window (min-height 100%); fundamental-styles' docs window
        // keeps the dialog's 7.5rem minimum (the dialog component's)
        ignore: ['width', 'height', 'min-height'],
        ours: { story: MOBILE, selector: '[role=dialog][aria-modal=true]' },
        ref: { story: REF_MOBILE, selector: '.fd-dialog__content--mobile' }
    },
    {
        label: 'mobile header',
        pixels: false,
        // fundamental-styles' docs window keeps rounded top corners on its header; a full-screen mobile window has
        // none (the dialog component's)
        ignore: ['width', 'border-top-left-radius', 'border-top-right-radius'],
        ours: { story: MOBILE, selector: '[role=dialog][aria-modal=true] [data-dialog-header] > [data-dialog-bar]' },
        ref: { story: REF_MOBILE, selector: '.fd-dialog__header' }
    },
    {
        label: 'mobile calendar',
        pixels: false,
        // compact only: fundamental-styles' compact calendar padding wins over the mobile layout's none (a
        // specificity side effect; mobile layouts are cozy in Fiori); the calendar component's layout
        ignore: ['width', 'height', 'padding-right', 'padding-bottom', 'padding-left'],
        ours: { story: MOBILE, selector: '[role=dialog][aria-modal=true] [role=group][aria-roledescription=Calendar]' },
        ref: { story: REF_MOBILE, selector: '.fd-calendar--mobile-portrait' }
    }
];
