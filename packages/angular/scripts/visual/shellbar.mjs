/** Visual cases for shellbar; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

const OURS = 'components-shellbar--';
const REF = `${FS}shellbar--`;

// The search field of an extra large bar (our Search field story) against fundamental-styles' responsiveness story, first
// bar: its bottom border line (shellbar-3) and, in high contrast, its transparent hovered input (shellbar-4).
// Kept differences: in compact, fundamental-styles' Storybook compacts the shellbar with the page, ours stays cozy (as
// Angular and fundamental-ngx); in HC, fundamental-styles' input draws its own 1px border inside the field (3-4% of
// the pixels).
const XL = '.fd-shellbar >> nth=0';
const STORY = 'search-field';
const BACK = '.fd-shellbar__button:has(.sap-icon--nav-back) >> nth=0';

const pair = (label, story, selector, ref, refSelector, extra = {}) => ({
    label,
    ours: { story: `${OURS}${story}`, selector },
    ref: { story: `${REF}${ref}`, selector: refSelector },
    ...extra
});

export default [
    pair('search field', STORY, '[role="search"]', 'responsiveness', `${XL} >> .fd-shellbar__search-field`),
    pair('search field, hover', STORY, '[role="search"]', 'responsiveness', `${XL} >> .fd-shellbar__search-field`, {
        hover: true
    }),
    pair(
        'search input, hover',
        STORY,
        '[role="search"] input',
        'responsiveness',
        `${XL} >> .fd-shellbar__search-field-input`,
        {
            hover: true,
            // fundamental-styles' input group draws the field around the input; ours draws it on the search element.
            // Its input sets no font (the browser's Arial, 13.5px) and is 32-34px high; ours has the SAP field font
            pixels: false,
            ignore: ['width', 'height', 'padding-top', 'padding-bottom', 'font-family', 'font-size']
        }
    ),
    // the back button: its arrow points left in LTR and right in RTL, mirrored once by the icon (shellbar-2), against
    // the back button of fundamental-styles' optional items bar. Kept differences: the button is cozy in compact (see
    // above), and fundamental-styles' static bar does not mirror its arrow in RTL (it still points left)
    pair('back button', 'basic', 'button[aria-label="Back"]', 'optional-items', BACK),
    pair('back button icon', 'basic', 'button[aria-label="Back"] fd-icon', 'optional-items', `${BACK} >> i`, {
        // the glyph is drawn by ::before in the icon font; the element's own font is the button's (inherited)
        ignore: ['font-family']
    })
];
