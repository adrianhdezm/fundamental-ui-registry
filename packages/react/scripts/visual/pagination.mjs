/** Visual cases for pagination; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';
const REF = `${FS}pagination--`;

const LONG = '.fd-pagination:not(.fd-pagination--short)';
const SHORT = '.fd-pagination--short';

/** Our `#pg-<name>-<kind> <part>` in the story `<name>-page` against fundamental-styles' `<scope> <ref>`. */
const pg = (label, name, kind, part, ref, extra = {}) => ({
    label,
    ours: { story: `components-pagination--${name}-page`, selector: `#pg-${name}-${kind}${part ? ` ${part}` : ''}` },
    ref: { story: `${REF}${name}-page`, selector: `${kind === 'long' ? LONG : SHORT}${ref ? ` ${ref}` : ''}` },
    ...extra
});

export default [
    // whole paginations: more than nine pages (with the input) and less (the current page button)
    pg('first page', 'first', 'long', '', ''),
    pg('first page short', 'first', 'short', '', ''),
    pg('middle page', 'middle', 'long', '', ''),
    pg('middle page short', 'middle', 'short', '', ''),
    pg('last page', 'last', 'long', '', ''),
    pg('last page short', 'last', 'short', '', ''),
    pg('nav', 'middle', 'long', 'nav', '.fd-pagination__nav'),
    // page buttons
    pg('page button', 'middle', 'long', 'button[aria-label="Page 298"]', '[aria-label="Goto page 298"]'),
    pg('page button hover', 'middle', 'long', 'button[aria-label="Page 298"]', '[aria-label="Goto page 298"]', {
        hover: true
    }),
    pg('page button focus', 'middle', 'long', 'button[aria-label="Page 298"]', '[aria-label="Goto page 298"]', {
        focus: true,
        refFocus: true
    }),
    pg('current page', 'middle', 'short', '[aria-current=page]', '.is-active'),
    pg('ellipsis', 'middle', 'long', 'nav > span[aria-hidden]', '.fd-pagination__more'),
    // previous and next
    pg('previous', 'middle', 'long', 'button[aria-label="Previous page"]', '[aria-label="Previous page"]'),
    pg('previous hover', 'middle', 'long', 'button[aria-label="Previous page"]', '[aria-label="Previous page"]', {
        hover: true
    }),
    pg('previous focus', 'middle', 'long', 'button[aria-label="Previous page"]', '[aria-label="Previous page"]', {
        focus: true,
        refFocus: true
    }),
    pg('previous disabled', 'first', 'long', 'button[aria-label="Previous page"]', '[aria-label="Previous page"]'),
    pg('next', 'middle', 'long', 'button[aria-label="Next page"]', '[aria-label="Next page"]'),
    pg('next disabled', 'last', 'long', 'button[aria-label="Next page"]', '[aria-label="Next page"]'),
    // the page input
    pg('input', 'middle', 'long', 'input', '.fd-pagination__input'),
    pg('input hover', 'middle', 'long', 'input', '.fd-pagination__input', { hover: true }),
    // focused with the keyboard, the browser selects our value; fundamental-styles' input is focused from script and
    // keeps its value unselected: styles only
    pg('input focus', 'middle', 'long', 'input', '.fd-pagination__input', {
        focus: true,
        refFocus: true,
        pixels: false
    }),
    // results
    // fundamental-styles' label is an inline span in a div (height auto), ours a flex item 16px high: not visible
    pg('total', 'middle', 'long', 'span[id$="-total"]', '.fd-pagination__total-label', { ignore: ['height'] }),
    // items per page
    {
        label: 'per page label',
        ours: { story: 'components-pagination--per-page', selector: '#pg-per-page span[id$="-per-page"]' },
        ref: { story: `${REF}per-page`, selector: '.fd-pagination__per-page-label' }
    },
    {
        label: 'per page select',
        ours: { story: 'components-pagination--per-page', selector: '#pg-per-page [role=combobox]' },
        ref: { story: `${REF}per-page`, selector: '.fd-pagination__per-page .fd-select__control' },
        // fundamental-styles shows this select open (aria-expanded), which in HC drops its bottom line; ours is
        // closed (select's own cases compare the open control): styles only
        pixels: false
    },
    {
        label: 'per page nav',
        ours: { story: 'components-pagination--per-page', selector: '#pg-per-page nav' },
        ref: { story: `${REF}per-page`, selector: '.fd-pagination__nav' }
    },
    // mobile
    {
        label: 'mobile nav',
        ours: { story: 'components-pagination--mobile', selector: 'nav[aria-label="Mobile pagination"]' },
        ref: { story: `${REF}mobile`, selector: '.fd-pagination__nav' }
    },
    {
        label: 'mobile first',
        ours: { story: 'components-pagination--mobile', selector: 'button[aria-label="First page"]' },
        ref: { story: `${REF}mobile`, selector: '[aria-label="First page"]' }
    },
    {
        label: 'mobile page label',
        ours: { story: 'components-pagination--mobile', selector: 'nav span[id$="-page-label"]' },
        ref: { story: `${REF}mobile`, selector: '#mobilePageInputPage' }
    },
    {
        label: 'mobile input',
        ours: { story: 'components-pagination--mobile', selector: 'nav input' },
        ref: { story: `${REF}mobile`, selector: '.fd-pagination__input' }
    }
];
