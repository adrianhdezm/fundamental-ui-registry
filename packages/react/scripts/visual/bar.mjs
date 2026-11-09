/** Visual cases for bar; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

const OURS = 'components-bar--';
const REF = `${FS}bar--`;
const BAR = '[role="toolbar"]';

// bars and full width elements are as wide as their container, which differs between the two Storybooks: their
// computed styles and heights are compared, not pixels. The avatars (an image there, initials here) are not
// compared.
export default [
    {
        label: 'bar',
        pixels: false,
        ignore: ['width'],
        ours: { story: `${OURS}default`, selector: `${BAR} >> nth=0` },
        ref: { story: `${REF}default`, selector: '.fd-bar >> nth=0' }
    },
    {
        label: 'left area with a title',
        ours: { story: `${OURS}default`, selector: `${BAR} >> nth=0 >> div >> nth=0` },
        ref: { story: `${REF}default`, selector: '.fd-bar__left >> nth=0' }
    },
    {
        label: 'title element',
        props: ['margin-left', 'margin-right'],
        ours: { story: `${OURS}default`, selector: `${BAR} >> nth=0 >> div:has(> h5)` },
        ref: { story: `${REF}default`, selector: '.fd-bar__element:has(> h5) >> nth=0' }
    },
    {
        label: 'left area with buttons',
        ours: { story: `${OURS}default`, selector: `${BAR} >> nth=1 >> div >> nth=0` },
        ref: { story: `${REF}default`, selector: '.fd-bar >> nth=1 >> .fd-bar__left' }
    },
    {
        label: 'button element',
        ours: { story: `${OURS}default`, selector: `${BAR} >> nth=0 >> div:has(> button[aria-label="Products"])` },
        ref: { story: `${REF}default`, selector: '.fd-bar >> nth=0 >> .fd-bar__right .fd-bar__element >> nth=1' }
    },
    {
        label: 'button element, hover',
        hover: true,
        ours: { story: `${OURS}default`, selector: `${BAR} >> nth=0 >> button[aria-label="Products"]` },
        ref: { story: `${REF}default`, selector: '.fd-bar >> nth=0 >> .fd-bar__right button' }
    },
    {
        label: 'button element, focus',
        focus: true,
        refFocus: true,
        ours: { story: `${OURS}default`, selector: `${BAR} >> nth=0 >> button[aria-label="Products"]` },
        ref: { story: `${REF}default`, selector: '.fd-bar >> nth=0 >> .fd-bar__right button' }
    },
    {
        label: 'middle segmented button',
        ours: { story: `${OURS}default`, selector: `${BAR} >> nth=0 >> [role="listbox"]` },
        ref: { story: `${REF}default`, selector: '.fd-bar >> nth=0 >> .fd-segmented-button' }
    },
    {
        label: 'right area',
        pixels: false,
        ours: { story: `${OURS}default`, selector: `${BAR} >> nth=0 >> :scope > div >> nth=-1` },
        ref: { story: `${REF}default`, selector: '.fd-bar >> nth=0 >> .fd-bar__right' }
    },
    {
        label: 'header',
        pixels: false,
        ignore: ['width'],
        ours: { story: `${OURS}header`, selector: BAR },
        ref: { story: `${REF}header`, selector: '.fd-bar' }
    },
    {
        label: 'header left area with text',
        ours: { story: `${OURS}header`, selector: `${BAR} >> div >> nth=0` },
        ref: { story: `${REF}header`, selector: '.fd-bar__left' }
    },
    {
        label: 'header text',
        ours: { story: `${OURS}header`, selector: 'div:text-is("Header Text")' },
        ref: { story: `${REF}header`, selector: '.fd-bar__element:text-is("Header Text")' }
    },
    {
        label: 'subheader',
        pixels: false,
        ignore: ['width'],
        ours: { story: `${OURS}subheader`, selector: `${BAR} >> nth=0` },
        ref: { story: `${REF}subheader`, selector: '.fd-bar >> nth=0' }
    },
    {
        label: 'subheader left area, compact buttons',
        ours: { story: `${OURS}subheader`, selector: `${BAR} >> nth=0 >> div >> nth=0` },
        ref: { story: `${REF}subheader`, selector: '.fd-bar >> nth=0 >> .fd-bar__left' }
    },
    {
        label: 'subheader with a full width element',
        pixels: false,
        ignore: ['width'],
        ours: { story: `${OURS}subheader`, selector: `${BAR} >> nth=1` },
        ref: { story: `${REF}subheader`, selector: '.fd-bar >> nth=1' }
    },
    {
        label: 'full width element',
        pixels: false,
        ignore: ['width'],
        ours: { story: `${OURS}subheader`, selector: `${BAR} >> nth=1 >> div:has(> input)` },
        ref: { story: `${REF}subheader`, selector: '.fd-bar__element--full-width' }
    },
    {
        label: 'header with subheader',
        pixels: false,
        ignore: ['width'],
        ours: { story: `${OURS}header-with-subheader`, selector: `${BAR} >> nth=0` },
        ref: { story: `${REF}header-with-subheader`, selector: '.fd-bar >> nth=0' }
    },
    {
        label: 'subheader after a header',
        pixels: false,
        ignore: ['width'],
        ours: { story: `${OURS}header-with-subheader`, selector: `${BAR} >> nth=1` },
        ref: { story: `${REF}header-with-subheader`, selector: '.fd-bar >> nth=1' }
    },
    {
        label: 'footer',
        pixels: false,
        ignore: ['width'],
        ours: { story: `${OURS}footer`, selector: BAR },
        ref: { story: `${REF}footer`, selector: '.fd-bar' }
    },
    {
        label: 'footer text',
        ours: { story: `${OURS}footer`, selector: 'div:text-is("Footer Text")' },
        ref: { story: `${REF}footer`, selector: '.fd-bar__element:text-is("Footer Text")' }
    },
    {
        label: 'footer actions',
        ours: { story: `${OURS}footer`, selector: `${BAR} >> :scope > div >> nth=-1` },
        ref: { story: `${REF}footer`, selector: '.fd-bar__right' }
    },
    {
        label: 'floating footer in a home page, xl',
        pixels: false,
        ignore: ['width'],
        ours: { story: `${OURS}floating-footer`, selector: `${BAR} >> nth=1` },
        ref: { story: `${REF}floating-footer`, selector: '.fd-bar' }
    },
    {
        label: 'floating footer actions',
        // the only area of the bar: as wide as the bar, whose container differs
        pixels: false,
        ignore: ['width'],
        ours: { story: `${OURS}floating-footer`, selector: `${BAR} >> nth=1 >> :scope > div >> nth=-1` },
        ref: { story: `${REF}floating-footer`, selector: '.fd-bar__right' }
    },
    {
        // fundamental-styles' responsive paddings follow the viewport (2rem at the 1280px of the comparison)
        label: 'page bar m_l',
        pixels: false,
        ignore: ['width'],
        ours: { story: `${OURS}page-sizes`, selector: `${BAR} >> nth=1` },
        ref: { story: `${REF}responsive`, selector: '.fd-bar' }
    }
];
