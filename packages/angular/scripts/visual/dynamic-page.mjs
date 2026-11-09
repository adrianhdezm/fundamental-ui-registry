/** Visual cases for dynamic-page; see ../visual.config.mjs for the fields. */
// the dynamic page is a layout in fundamental-styles, not a component
const REF = 'sap-design-layouts-dynamic-page--';
const OURS = 'components-dynamic-page--default';
const VISIBILITY = 'div:has(> div[role="toolbar"].h-px)';
const BUTTONS = `${VISIBILITY} > [role="toolbar"] button`;

export default [
    {
        label: 'start gradient',
        // computed styles: in the HC themes a white 1px line is painted over ours in the screenshot (the background
        // image itself matches); see the pull request
        pixels: false,
        ours: { story: OURS, selector: `${VISIBILITY} > div >> nth=0` },
        ref: {
            story: `${REF}desktop`,
            selector: '.fd-dynamic-page__collapsible-header-visibility-container--left-gradient'
        }
    },
    {
        label: 'end gradient',
        pixels: false,
        ours: { story: OURS, selector: `${VISIBILITY} > div >> nth=2` },
        ref: {
            story: `${REF}desktop`,
            selector: '.fd-dynamic-page__collapsible-header-visibility-container--right-gradient'
        }
    },
    {
        label: 'collapse button',
        // --sapButton_Background where fundamental-styles has --sapObjectHeader_Background: dynamic-page-2
        ignore: ['background-color'],
        ours: { story: OURS, selector: `${BUTTONS} >> nth=0` },
        ref: { story: `${REF}desktop`, selector: '.fd-dynamic-page__collapse-button' }
    },
    {
        label: 'pin button',
        ignore: ['background-color'],
        ours: { story: OURS, selector: `${BUTTONS} >> nth=1` },
        ref: { story: `${REF}desktop`, selector: '.fd-dynamic-page__pin-button' }
    },
    {
        // the pointer cursor on hover only (dynamic-page-4): the title area at rest
        label: 'title area',
        pixels: false,
        // the size and the inline padding follow the page width, whose container differs between the Storybooks
        ignore: ['width', 'height', 'padding-left', 'padding-right'],
        ours: { story: OURS, selector: '[class*="hover:bg-sap-object-header-hover-background"] >> nth=0' },
        ref: { story: `${REF}desktop`, selector: '.fd-dynamic-page__title-area' }
    }
];
