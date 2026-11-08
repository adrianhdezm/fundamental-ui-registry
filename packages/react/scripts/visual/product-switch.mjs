/** Visual cases for product-switch; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

// our bodies rendered into the page (Products in the page), with fundamental-styles' product texts
const OURS = 'components-product-switch--bodies';
const body = (variant) => `[data-variant="${variant}"] div:has(> ul)`;
const item = (variant, n) => `[data-variant="${variant}"] li:nth-child(${n})`;
const LARGE = 'Large (4 columns)';
const LIST = 'List';

const REF = `${FS}product-switch--`;
const refItem = (n) => `.fd-product-switch__item >> nth=${n - 1}`;

const FOCUS = ['outline-style', 'outline-width', 'outline-color', 'outline-offset'];
const RADII = ['top-left', 'top-right', 'bottom-right', 'bottom-left'].map((c) => `border-${c}-radius`);

const pair = (label, ours, story, selector, extra = {}) => ({
    label,
    ours: { story: OURS, selector: ours },
    ref: { story: `${REF}${story}`, selector },
    ...extra
});

// fundamental-styles' first products show image avatars (ours icons): the bodies and lists are compared by
// computed style; the items with an icon (Catalog, Guided Buying, Strategic Procurement) by pixels
export default [
    pair('body, large', body(LARGE), 'large', '.fd-product-switch__body', { pixels: false }),
    pair('list, large', `${body(LARGE)} > ul`, 'large', '.fd-product-switch__list', { pixels: false }),
    pair('body, medium', body('Medium (3 columns)'), 'medium', '.fd-product-switch__body', { pixels: false }),
    pair('body, two columns', body('Two columns'), 'two-column', '.fd-product-switch__body', { pixels: false }),
    pair('body, list', body(LIST), 'small', '.fd-product-switch__body', {
        pixels: false,
        // fundamental-styles' second product has a long text over several lines
        ignore: ['height']
    }),
    pair('item', item(LARGE, 3), 'large', refItem(3)),
    pair('item without subtitle', item(LARGE, 4), 'large', refItem(4)),
    pair('item, hover', item(LARGE, 3), 'large', refItem(3), { hover: true }),
    pair('item, focus', item(LARGE, 3), 'large', refItem(3), { focus: true, refFocus: true, props: FOCUS }),
    // fundamental-styles' icon sits in a thumbnail avatar and inherits its radius (and, in HC, its background)
    pair('item icon', `${item(LARGE, 3)} > span`, 'large', `${refItem(3)} >> .fd-product-switch__icon`, {
        ignore: RADII
    }),
    pair('item title', `${item(LARGE, 3)} > div > div >> nth=0`, 'large', `${refItem(3)} >> .fd-product-switch__title`),
    pair(
        'item subtitle',
        `${item(LARGE, 3)} > div > div >> nth=1`,
        'large',
        `${refItem(3)} >> .fd-product-switch__subtitle`
    ),
    pair('list item', item(LIST, 5), 'small', refItem(5)),
    pair('list item, hover', item(LIST, 5), 'small', refItem(5), { hover: true }),
    pair('list item, focus', item(LIST, 5), 'small', refItem(5), { focus: true, refFocus: true, props: FOCUS }),
    pair('list item text', `${item(LIST, 5)} > div`, 'small', `${refItem(5)} >> .fd-product-switch__text`)
];
