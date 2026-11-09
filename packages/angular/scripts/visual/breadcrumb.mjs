/** Visual cases for breadcrumb; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

const OVERFLOW = 'components-breadcrumb--overflow';

export default [
    // the "more" link is 1.5rem high (breadcrumb-1); fundamental-styles puts the separator inside the link, so the
    // link is wider: styles only
    {
        label: 'more link',
        pixels: false,
        // our links have no underline offset (link-1)
        ignore: ['width', 'text-underline-offset'],
        ours: { story: OVERFLOW, selector: '[data-breadcrumb-more] >> nth=0' },
        ref: { story: `${FS}breadcrumb--overflow`, selector: '.fd-link[role=button] >> nth=0' }
    }
];
