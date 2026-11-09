/** Visual cases for feed-input; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

const DEFAULT = 'components-feed-input--default';
const WITH_TEXT = 'components-feed-input--with-text';
const TEXTAREA = 'textarea';
const BUTTON = 'button[aria-label="Send"]';
const REF_TEXTAREA = '.fd-feed-input__textarea';
const REF_BUTTON = '.fd-feed-input__submit-button';

export default [
    // the avatar image differs: styles only
    {
        label: 'container',
        pixels: false,
        ignore: ['width'],
        props: ['margin-top', 'margin-bottom'],
        ours: { story: DEFAULT, selector: '[role=group] > div' },
        ref: { story: `${FS}feed-input--standard`, selector: '.fd-feed-input__container' }
    },
    // another photo: styles only, without the image
    {
        label: 'avatar',
        pixels: false,
        ignore: ['background-image'],
        ours: { story: DEFAULT, selector: '[role=img]' },
        ref: { story: `${FS}feed-input--standard`, selector: '.fd-feed-input__thumb' }
    },
    {
        label: 'placeholder avatar',
        ours: { story: 'components-feed-input--placeholder-avatar', selector: '[role=img]' },
        ref: { story: `${FS}feed-input--placeholder-image`, selector: '.fd-feed-input__thumb' }
    },
    {
        label: 'textarea empty',
        ours: { story: DEFAULT, selector: TEXTAREA },
        ref: { story: `${FS}feed-input--standard`, selector: REF_TEXTAREA }
    },
    {
        label: 'textarea hover',
        hover: true,
        ours: { story: DEFAULT, selector: TEXTAREA },
        ref: { story: `${FS}feed-input--standard`, selector: REF_TEXTAREA }
    },
    {
        label: 'textarea focus',
        focus: true,
        refFocus: true,
        ours: { story: DEFAULT, selector: TEXTAREA },
        ref: { story: `${FS}feed-input--standard`, selector: REF_TEXTAREA }
    },
    {
        label: 'textarea with text',
        ours: { story: WITH_TEXT, selector: TEXTAREA },
        ref: { story: `${FS}feed-input--not-empty`, selector: REF_TEXTAREA }
    },
    // fundamental-styles shows "Disabled" as the text, ours as the placeholder (readable, upright, text colour).
    // Its textarea has `pointer-events: none` under a `cursor: not-allowed` group; ours keeps pointer events (for the
    // placeholder) with `cursor: not-allowed` itself: the same cursor shows
    {
        label: 'textarea disabled',
        ignore: ['cursor'],
        ours: { story: 'components-feed-input--disabled', selector: TEXTAREA },
        ref: { story: `${FS}feed-input--disabled`, selector: REF_TEXTAREA }
    },
    // four lines of text; fundamental-styles' textarea has rows="4" and a trailing line break
    {
        label: 'textarea grown',
        pixels: false,
        ignore: ['height'],
        ours: { story: 'components-feed-input--grow', selector: TEXTAREA },
        ref: { story: `${FS}feed-input--input-growth`, selector: REF_TEXTAREA }
    },
    // in RTL our paper plane is mirrored to point in the reading direction, as Angular and UI5 (fundamental-styles
    // does not mirror it): the RTL pixels differ by about 4%, logged in the report
    {
        label: 'button disabled',
        ours: { story: DEFAULT, selector: BUTTON },
        ref: { story: `${FS}feed-input--standard`, selector: REF_BUTTON }
    },
    // the enabled stories of fundamental-styles show the feeder-arrow glyph, the empty one the paper plane: styles only
    {
        label: 'button',
        pixels: false,
        props: ['margin-top', 'margin-bottom'],
        ours: { story: WITH_TEXT, selector: BUTTON },
        ref: { story: `${FS}feed-input--not-empty`, selector: REF_BUTTON }
    },
    {
        label: 'button hover',
        hover: true,
        pixels: false,
        ours: { story: WITH_TEXT, selector: BUTTON },
        ref: { story: `${FS}feed-input--not-empty`, selector: REF_BUTTON }
    },
    {
        label: 'button focus',
        focus: true,
        refFocus: true,
        pixels: false,
        ours: { story: WITH_TEXT, selector: BUTTON },
        ref: { story: `${FS}feed-input--not-empty`, selector: REF_BUTTON }
    }
];
