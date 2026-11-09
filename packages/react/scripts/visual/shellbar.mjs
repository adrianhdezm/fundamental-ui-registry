/** Visual cases for shellbar; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

const OURS = 'components-shellbar--';
const REF = `${FS}shellbar--`;
const BAR = '[data-size]';

// The bars are as wide as their container, which differs between the two Storybooks: their computed styles are
// compared, not pixels. fundamental-styles' logo is an image that does not load in its Storybook (here a data SVG)
// and its avatars are images (here initials), so the branding, logo and user menu are compared by style only.
const pair = (label, story, selector, ref, refSelector, extra = {}) => ({
    label,
    ours: { story: `${OURS}${story}`, selector },
    ref: { story: `${REF}${ref}`, selector: refSelector },
    ...extra
});

const XL = '.fd-shellbar >> nth=0';

export default [
    // mandatory elements: branding and user menu (fundamental-styles' primary story)
    // fundamental-styles' paddings follow the viewport (2rem at the 1280px of the comparison), ours the bar's width:
    // a large bar (1000px) of Collapsible links against them
    pair('shellbar, large', 'collapsible-links', `${BAR} >> nth=1`, 'responsive-paddings', '.fd-shellbar >> nth=0', {
        pixels: false,
        ignore: ['width']
    }),
    pair('product group', 'mandatory-elements', `${BAR} > div >> nth=0`, 'primary', '.fd-shellbar__group--product', {
        pixels: false
    }),
    pair('branding', 'mandatory-elements', '[data-shellbar-branding]', 'primary', '.fd-shellbar__branding', {
        pixels: false,
        ignore: ['width']
    }),
    pair('branding, hover', 'mandatory-elements', '[data-shellbar-branding]', 'primary', '.fd-shellbar__branding', {
        pixels: false,
        ignore: ['width'],
        hover: true
    }),
    pair('branding, focus', 'mandatory-elements', '[data-shellbar-branding]', 'primary', '.fd-shellbar__branding', {
        pixels: false,
        ignore: ['width'],
        focus: true,
        refFocus: true
    }),
    pair('logo', 'mandatory-elements', '[data-shellbar-branding] > span', 'primary', '.fd-shellbar__logo', {
        pixels: false,
        ignore: ['width']
    }),
    pair('title', 'mandatory-elements', '[data-shellbar-title]', 'primary', '.fd-shellbar__title'),
    pair(
        'user menu button',
        'mandatory-elements',
        `${BAR} button:has([role="img"])`,
        'primary',
        '.fd-user-menu__control',
        {
            pixels: false
        }
    ),
    pair(
        'user menu avatar',
        'mandatory-elements',
        `${BAR} button [role="img"]`,
        'primary',
        '.fd-shellbar__avatar--circle',
        {
            pixels: false,
            // fundamental-styles' avatar is an image, ours shows the initials on the accent colour
            ignore: [
                'color',
                'background-color',
                'background-image',
                'border-top-color',
                'border-right-color',
                'border-bottom-color',
                'border-left-color'
            ]
        }
    ),
    // all the elements, extra large (fundamental-styles' responsiveness story, first bar)
    pair('shellbar with navigation button', 'basic', BAR, 'responsiveness', XL, { pixels: false, ignore: ['width'] }),
    pair(
        'navigation button',
        'basic',
        'button[aria-label="Navigation"]',
        'responsiveness',
        `${XL} >> button[aria-label="Main Navigation"]`
    ),
    pair('search field', 'basic', '[role="search"]', 'responsiveness', `${XL} >> .fd-shellbar__search-field`),
    pair('search field, hover', 'basic', '[role="search"]', 'responsiveness', `${XL} >> .fd-shellbar__search-field`, {
        hover: true
    }),
    pair(
        'search input',
        'basic',
        '[role="search"] input',
        'responsiveness',
        `${XL} >> .fd-shellbar__search-field-input`,
        {
            // fundamental-styles' input group draws the field around the input; ours draws it on the search element
            pixels: false,
            ignore: ['width']
        }
    ),
    pair(
        'search button',
        'basic',
        '[role="search"] button',
        'responsiveness',
        `${XL} >> .fd-shellbar__search-submit button`
    ),
    pair(
        'action with a badge',
        'basic',
        'button[aria-label^="Notifications"]',
        'responsiveness',
        `${XL} >> button[aria-label="Notifications"]`
    ),
    pair(
        'action, hover',
        'basic',
        'button[aria-label="Help"]',
        'responsiveness',
        `${XL} >> button[aria-label="Help"]`,
        {
            hover: true
        }
    ),
    pair(
        'action, focus',
        'basic',
        'button[aria-label="Help"]',
        'responsiveness',
        `${XL} >> button[aria-label="Help"]`,
        {
            focus: true,
            refFocus: true
        }
    ),
    pair(
        'product switch button',
        'basic',
        'button[aria-label="Product switch"]',
        'responsiveness',
        `${XL} >> button[aria-label="App Launcher"]`
    ),
    // the overflow button of a medium bar (Responsive sizes, 560px) against fundamental-styles' 650px one
    pair(
        'overflow button',
        'responsive',
        `${BAR} >> nth=2 >> button[aria-label^="Collapsed Item Menu"]`,
        'responsiveness',
        '.fd-shellbar >> nth=2 >> [aria-label="Overflow"]',
        {
            // fundamental-styles shows it open (is-toggled): its colours are the toggled ones
            pixels: false,
            ignore: [
                'color',
                'background-color',
                'border-top-color',
                'border-right-color',
                'border-bottom-color',
                'border-left-color'
            ]
        }
    ),
    // context area (fundamental-styles' optional elements)
    pair(
        'context area',
        'context-area',
        '[role="group"]',
        'optional-items',
        '.fd-shellbar__group--context-area >> nth=0',
        {
            pixels: false,
            ignore: ['width']
        }
    ),
    pair(
        'separator',
        'context-area',
        '[role="separator"] >> nth=0',
        'optional-items',
        '.fd-shellbar__separator >> nth=0'
    ),
    pair(
        'menu button in the context area',
        'context-area',
        'button:has-text("EMEA")',
        'optional-items',
        '.fd-shellbar__button--menu >> nth=0'
    )
];
