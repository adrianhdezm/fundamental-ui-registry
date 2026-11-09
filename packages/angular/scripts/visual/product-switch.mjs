/** Visual cases for product-switch; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

// Our Open: reference story opens the product switch with the texts of fundamental-styles' first products (its
// second title on two lines sets the height of the first row); its products render in the CDK overlay.
// fundamental-styles' first products show image avatars (ours icons): the item with an icon (Catalog, the third) is
// compared by pixels. Our items show the pointer cursor also at rest, fundamental-styles' on hover only: not compared.
const OPEN = 'components-product-switch--open-reference';
const REF = `${FS}product-switch--large`;
const item = (n) => `[role=menu] [role=menuitem] >> nth=${n - 1}`;
const refItem = (n) => `.fd-product-switch__item >> nth=${n - 1}`;

const FOCUS = ['outline-style', 'outline-width', 'outline-color', 'outline-offset'];

const pair = (label, ours, ref, extra = {}) => ({
    label,
    ours: { story: OPEN, selector: ours, overlay: true },
    ref: { story: REF, selector: ref },
    ...extra,
    ignore: ['cursor', ...(extra.ignore ?? [])]
});

export default [
    pair('item', item(3), refItem(3)),
    pair('item, hover', item(3), refItem(3), { hover: true }),
    // the focus frame inset by 3px (product-switch-1)
    pair('item, focus', item(3), refItem(3), { focus: true, refFocus: true, props: FOCUS }),
    // the icon's line height of 1 (product-switch-2); fundamental-styles' icon sits in a thumbnail avatar and
    // inherits its radius and, in HC, its background (not visible: the item has the same colour at rest)
    pair('item icon', `${item(3)} >> fd-icon`, `${refItem(3)} >> .fd-product-switch__icon`, {
        ignore: [
            'background-color',
            'border-top-left-radius',
            'border-top-right-radius',
            'border-bottom-right-radius',
            'border-bottom-left-radius'
        ]
    })
];
