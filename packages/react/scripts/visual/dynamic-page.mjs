/** Visual cases for dynamic-page; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';
// the dynamic page is a layout in fundamental-styles, not a component
const REF = `${FS.replace('components-', 'layouts-')}dynamic-page--`;

const OURS = 'components-dynamic-page--';
// fundamental-styles' Desktop example: header text, pinnable header, extra large size
const DESKTOP = `${OURS}other-navigation`;
const COLLAPSED = `${OURS}collapsed-header`;
const TITLE_AREA = 'article > header > div > div';
const VISIBILITY = 'div:has(> [role="toolbar"][aria-label="Header actions"])';

// the title area, the header content and the page content are as wide as the page, whose container differs
// between the two Storybooks: their computed styles are compared, not pixels
export default [
    {
        label: 'title area',
        pixels: false,
        // the layout actions sit next to the breadcrumb below 1280px (Angular), next to the title in
        // fundamental-styles' Desktop example
        ignore: ['width', 'height'],
        ours: { story: DESKTOP, selector: TITLE_AREA },
        ref: { story: `${REF}desktop`, selector: '.fd-dynamic-page__title-area' }
    },
    {
        label: 'title area, hover',
        pixels: false,
        hover: true,
        ignore: ['width', 'height'],
        ours: { story: DESKTOP, selector: TITLE_AREA },
        ref: { story: `${REF}desktop`, selector: '.fd-dynamic-page__title-area' }
    },
    {
        label: 'title',
        ours: { story: DESKTOP, selector: `${TITLE_AREA} [role="heading"]` },
        ref: { story: `${REF}desktop`, selector: '.fd-dynamic-page__title' }
    },
    {
        label: 'title content',
        ours: { story: DESKTOP, selector: 'div:text-is("Some RANDOM things")' },
        ref: { story: `${REF}desktop`, selector: '.fd-dynamic-page__title-content' }
    },
    {
        label: 'subtitle',
        ours: { story: DESKTOP, selector: `span:text-is("Oversized multimaterial sneakers with quilted effect")` },
        ref: { story: `${REF}desktop`, selector: '.fd-dynamic-page__subtitle' }
    },
    {
        label: 'layout action',
        ours: { story: DESKTOP, selector: 'button[aria-label="Close"]' },
        ref: { story: `${REF}desktop`, selector: 'button[aria-label="Close"]' }
    },
    {
        label: 'collapsible header',
        pixels: false,
        ignore: ['width', 'height'],
        ours: { story: DESKTOP, selector: 'section[aria-label="Expanded Header"]' },
        ref: { story: `${REF}desktop`, selector: '.fd-dynamic-page__collapsible-header' }
    },
    {
        label: 'header visibility bar',
        pixels: false,
        ignore: ['width'],
        ours: { story: DESKTOP, selector: VISIBILITY },
        ref: { story: `${REF}desktop`, selector: '.fd-dynamic-page__collapsible-header-visibility-container' }
    },
    {
        label: 'header buttons',
        ours: { story: DESKTOP, selector: '[role="toolbar"][aria-label="Header actions"]' },
        ref: {
            story: `${REF}desktop`,
            selector: '.fd-dynamic-page__collapsible-header-visibility-container--button-group'
        }
    },
    {
        label: 'start gradient',
        ours: { story: DESKTOP, selector: `${VISIBILITY} > div >> nth=0` },
        ref: {
            story: `${REF}desktop`,
            selector: '.fd-dynamic-page__collapsible-header-visibility-container--left-gradient'
        }
    },
    {
        label: 'end gradient',
        ours: { story: DESKTOP, selector: `${VISIBILITY} > div >> nth=2` },
        ref: {
            story: `${REF}desktop`,
            selector: '.fd-dynamic-page__collapsible-header-visibility-container--right-gradient'
        }
    },
    {
        label: 'collapse button',
        ours: { story: DESKTOP, selector: 'button[aria-label="Collapse Header"]' },
        ref: { story: `${REF}desktop`, selector: '.fd-dynamic-page__collapse-button' }
    },
    {
        label: 'collapse button, hover',
        hover: true,
        ours: { story: DESKTOP, selector: 'button[aria-label="Collapse Header"]' },
        ref: { story: `${REF}desktop`, selector: '.fd-dynamic-page__collapse-button' }
    },
    {
        label: 'collapse button, focus',
        focus: true,
        refFocus: true,
        ours: { story: DESKTOP, selector: 'button[aria-label="Collapse Header"]' },
        ref: { story: `${REF}desktop`, selector: '.fd-dynamic-page__collapse-button' }
    },
    {
        label: 'pin button',
        ours: { story: DESKTOP, selector: 'button[aria-label="Pin Header"]' },
        ref: { story: `${REF}desktop`, selector: '.fd-dynamic-page__pin-button' }
    },
    {
        label: 'pin button, hover',
        hover: true,
        ours: { story: DESKTOP, selector: 'button[aria-label="Pin Header"]' },
        ref: { story: `${REF}desktop`, selector: '.fd-dynamic-page__pin-button' }
    },
    {
        label: 'content',
        pixels: false,
        ignore: ['width', 'height'],
        ours: { story: DESKTOP, selector: 'article > div[tabindex]' },
        ref: { story: `${REF}desktop`, selector: '.fd-dynamic-page__content' }
    },
    {
        label: 'collapsed title area',
        pixels: false,
        ignore: ['width', 'height'],
        ours: { story: COLLAPSED, selector: TITLE_AREA },
        ref: { story: `${REF}collapsed-header`, selector: '.fd-dynamic-page__title-area' }
    },
    {
        label: 'collapsed title',
        ours: { story: COLLAPSED, selector: `${TITLE_AREA} [role="heading"]` },
        ref: { story: `${REF}collapsed-header`, selector: '.fd-dynamic-page__title' }
    },
    {
        label: 'expand button',
        ours: { story: COLLAPSED, selector: 'button[aria-label="Expand Header"]' },
        ref: { story: `${REF}collapsed-header`, selector: '.fd-dynamic-page__collapse-button' }
    },
    {
        label: 'collapsed visibility bar',
        pixels: false,
        ignore: ['width'],
        ours: { story: COLLAPSED, selector: VISIBILITY },
        ref: { story: `${REF}collapsed-header`, selector: '.fd-dynamic-page__collapsible-header-visibility-container' }
    }
];
