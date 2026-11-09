/** Visual cases for action-bar; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

const OURS = 'components-action-bar--default';
const REF = `${FS}action-bar--back-btn`;
const BAR = 'div.bg-sap-page-header-background';

// the bar, header, title and description are as wide as their container, which differs between the two
// Storybooks: their computed styles and heights are compared, not pixels
export default [
    {
        label: 'bar',
        pixels: false,
        ignore: ['width'],
        ours: { story: OURS, selector: `${BAR} >> nth=0` },
        ref: { story: REF, selector: '.fd-action-bar' }
    },
    {
        label: 'header',
        pixels: false,
        ignore: ['width'],
        ours: { story: OURS, selector: `${BAR} >> nth=0 >> div >> nth=0` },
        ref: { story: REF, selector: '.fd-action-bar__header' }
    },
    {
        label: 'back button',
        props: ['margin-left', 'margin-right'],
        ours: { story: OURS, selector: 'div:has(> button[aria-label="Go back"]) >> nth=0' },
        ref: { story: REF, selector: '.fd-action-bar__back' }
    },
    {
        label: 'title',
        pixels: false,
        ignore: ['width'],
        ours: { story: OURS, selector: 'h2 >> nth=0' },
        ref: { story: REF, selector: '.fd-action-bar__title .fd-title' }
    },
    {
        label: 'long title',
        pixels: false,
        ignore: ['width'],
        ours: { story: OURS, selector: 'h2 >> nth=4' },
        ref: { story: `${FS}action-bar--long-title-description`, selector: '.fd-action-bar__title .fd-title' }
    },
    {
        label: 'actions',
        ours: { story: OURS, selector: `${BAR} >> nth=0 >> div:has(> button:has-text("Submit"))` },
        ref: { story: REF, selector: '.fd-action-bar__actions' }
    },
    {
        label: 'description with back button',
        pixels: false,
        ignore: ['width'],
        ours: { story: OURS, selector: 'p:text-is("Action bar Description") >> nth=0' },
        ref: { story: REF, selector: '.fd-action-bar__description' }
    },
    {
        label: 'description without back button',
        pixels: false,
        ignore: ['width'],
        ours: { story: OURS, selector: 'p:text-is("Action bar Description") >> nth=1' },
        ref: { story: `${FS}action-bar--no-back-btn`, selector: '.fd-action-bar__description' }
    },
    {
        label: 'bar without description',
        pixels: false,
        ignore: ['width'],
        ours: { story: OURS, selector: `${BAR} >> nth=2` },
        ref: { story: `${FS}action-bar--back-btn-no-description`, selector: '.fd-action-bar' }
    },
    {
        label: 'size s',
        pixels: false,
        // fundamental-styles' small screen story has no description, so its bar is lower
        ignore: ['width', 'height'],
        ours: { story: 'components-action-bar--sizes', selector: `${BAR} >> nth=0` },
        ref: { story: `${FS}action-bar--mobile`, selector: '.fd-action-bar' }
    },
    {
        label: 'size m_l',
        pixels: false,
        ignore: ['width'],
        ours: { story: 'components-action-bar--sizes', selector: `${BAR} >> nth=1` },
        ref: { story: `${FS}action-bar--responsive-l`, selector: '.fd-action-bar' }
    },
    {
        label: 'size xl',
        pixels: false,
        ignore: ['width'],
        ours: { story: 'components-action-bar--sizes', selector: `${BAR} >> nth=2` },
        ref: { story: `${FS}action-bar--responsive-xl`, selector: '.fd-action-bar' }
    },
    {
        label: 'overflow button',
        ours: { story: 'components-action-bar--contextual-menu', selector: 'button[aria-label="More actions"]' },
        ref: { story: `${FS}action-bar--actions`, selector: '.fd-action-bar__actions button' }
    }
];
