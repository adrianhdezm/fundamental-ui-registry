/** Visual cases for pagination; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';
const REF = `${FS}pagination--`;
const OURS = 'components-pagination--';

const LONG = '.fd-pagination:not(.fd-pagination--short)';
const SHORT = '.fd-pagination--short';

/** Our `#pg-middle-<kind> <part>` in the Middle page story against fundamental-styles' Middle Page. */
const middle = (label, kind, part, ref, extra = {}) => ({
    label,
    ours: { story: `${OURS}middle-page`, selector: `#pg-middle-${kind}${part ? ` ${part}` : ''}` },
    ref: { story: `${REF}middle-page`, selector: `${kind === 'long' ? LONG : SHORT}${ref ? ` ${ref}` : ''}` },
    ...extra
});

export default [
    // the whole paginations: the nav centred without a root gap (pagination-3)
    middle('middle page', 'long', '', ''),
    middle('middle page short', 'short', '', ''),
    middle('nav', 'long', 'nav', '.fd-pagination__nav'),
    // page buttons with the button padding (pagination-1)
    middle('page button', 'long', 'button[aria-label="Page 298"]', '[aria-label="Goto page 298"]'),
    middle('page button hover', 'long', 'button[aria-label="Page 298"]', '[aria-label="Goto page 298"]', {
        hover: true
    }),
    middle('current page', 'short', '[aria-current=page]', '.is-active'),
    // the labels' text cursor (pagination-4)
    // fundamental-styles' label is an inline span in a div (height auto), ours a flex item 16px high: not visible
    middle('total', 'long', 'span[id$="-total"]', '.fd-pagination__total-label', { ignore: ['height'] }),
    // the mobile labels' end margin (pagination-2) and text cursor
    {
        label: 'mobile nav',
        ours: { story: `${OURS}mobile-reference`, selector: 'nav[aria-label="Mobile pagination"]' },
        ref: { story: `${REF}mobile`, selector: '.fd-pagination__nav' }
    },
    {
        label: 'mobile page label',
        props: ['margin-right', 'margin-left'],
        ours: { story: `${OURS}mobile-reference`, selector: 'nav span[id$="-page-label"]' },
        ref: { story: `${REF}mobile`, selector: '#mobilePageInputPage' }
    },
    {
        label: 'mobile input',
        ours: { story: `${OURS}mobile-reference`, selector: 'nav input' },
        ref: { story: `${REF}mobile`, selector: '.fd-pagination__input' }
    }
];
