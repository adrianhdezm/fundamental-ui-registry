/** Visual cases for datetime-picker; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-patterns-';

/** Our open stories: the popover and the mobile (portrait) dialog, both in the CDK overlay outside the story root. */
const OPEN = 'components-datetime-picker--open-popover';
const MOBILE = 'components-datetime-picker--open-mobile';
/** fundamental-styles' date picker pattern (the field and the popover with a footer bar) and its mobile portrait. */
const REF = `${FS}date-picker--today-selection-button`;
const REF_MOBILE = `${FS}date-picker--mobile-portrait`;
const BODY = '[role=dialog][aria-label="Choose date and time"]';
const WINDOW = '[role=dialog][aria-modal=true]';

export default [
    // the popover: a calendar and time columns against fundamental-styles' calendar, so by computed style
    {
        label: 'popover body',
        pixels: false,
        ignore: ['width', 'height'],
        ours: { story: OPEN, selector: BODY, overlay: true },
        ref: { story: REF, selector: '.fd-popover__body' }
    },
    {
        // the popover's bottom corners (datetime-picker-1); OK and Cancel where fundamental-styles has Today: by
        // computed style
        label: 'footer bar',
        pixels: false,
        ignore: ['width'],
        ours: { story: OPEN, selector: `${BODY} [data-bar-design=footer]`, overlay: true },
        ref: { story: REF, selector: '.fd-popover__body .fd-bar' }
    },
    {
        // a decisive OK (datetime-picker-1): fundamental-styles' OK (emphasized, decisive) is in the footer of its
        // mobile pattern
        label: 'OK button',
        props: ['min-width'],
        ours: { story: OPEN, selector: `${BODY} [data-bar-design=footer] button`, overlay: true },
        ref: { story: REF_MOBILE, selector: '.fd-dialog__footer button' }
    },
    {
        label: 'OK button hover',
        hover: true,
        props: ['min-width'],
        ours: { story: OPEN, selector: `${BODY} [data-bar-design=footer] button`, overlay: true },
        ref: { story: REF_MOBILE, selector: '.fd-dialog__footer button' }
    },
    // the mobile dialog
    {
        label: 'mobile window',
        pixels: false,
        // our window is the dialog's full-screen mobile window (min-height 100%); fundamental-styles' docs window
        // keeps the dialog's 7.5rem minimum (the dialog component's)
        ignore: ['width', 'height', 'min-height'],
        ours: { story: MOBILE, selector: WINDOW, overlay: true },
        ref: { story: REF_MOBILE, selector: '.fd-dialog__content--mobile' }
    },
    {
        // the portrait layout (datetime-picker-2): no padding but 1rem on top; the width is the window's, which
        // differs (a full-screen window against fundamental-styles' docs window)
        label: 'mobile calendar',
        pixels: false,
        ignore: ['width', 'height'],
        ours: { story: MOBILE, selector: `${WINDOW} [role=group][aria-roledescription=Calendar]`, overlay: true },
        ref: { story: REF_MOBILE, selector: '.fd-calendar--mobile-portrait' }
    }
];
