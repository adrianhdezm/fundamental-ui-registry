/** Visual cases for upload-collection; see ../visual.config.mjs for the fields. Adapted from the React package. */
const FS = 'sap-design-components-';
const STANDARD = `${FS}upload-collection--standard`;
const OURS = 'components-upload-collection--default';
/** The first list of fundamental-styles' story (the second one is small). */
const LIST = '.fd-upload-collection:not(.fd-upload-collection--sm)';
const SMALL = '.fd-upload-collection--sm';

/** Our element against fundamental-styles' one; the file names, descriptions and statuses differ: styles only. */
const part = (label, ours, ref, extra = {}) => ({
    label,
    pixels: false,
    ours: { story: OURS, selector: ours },
    ref: { story: STANDARD, selector: ref },
    ...extra
});

export default [
    // the link title: link colour on a 1rem line
    part(
        'title',
        '[fd-upload-collection-title] >> nth=0',
        `${LIST} .fd-upload-collection__title-container .fd-upload-collection__title >> nth=0`,
        { ignore: ['width'], props: ['margin-inline-end', 'flex-grow', 'flex-shrink'] }
    ),
    part(
        'description',
        '[fd-upload-collection-description] >> nth=0',
        `${LIST} .fd-upload-collection__description >> nth=0`,
        { ignore: ['width'] }
    ),
    {
        label: 'separator',
        pixels: false,
        // fundamental-styles' separator holds the space after the bullet, ours sits between two spaces
        ignore: ['width'],
        ours: {
            story: OURS,
            selector: '[fd-upload-collection-description] >> nth=0 >> [fd-upload-collection-text-separator]'
        },
        ref: {
            story: STANDARD,
            selector: `${LIST} .fd-upload-collection__description >> nth=0 >> .fd-upload-collection__text-separator`
        }
    },
    part(
        'status group',
        '[fd-upload-collection-status-group] >> nth=0',
        `${LIST} .fd-upload-collection__status-group >> nth=0`,
        { ignore: ['width'], props: ['margin-top', 'display'] }
    ),
    // the edit and delete buttons, by pixels: 80px wide (inline buttons with a start margin and a space)
    {
        label: 'button group',
        props: ['margin-inline-start'],
        ours: { story: OURS, selector: 'fd-upload-collection-button-group >> nth=0' },
        ref: { story: STANDARD, selector: `${LIST} .fd-upload-collection__button-group >> nth=0` }
    },
    {
        label: 'edit button hover',
        hover: true,
        ours: { story: OURS, selector: 'fd-upload-collection-button-group >> nth=0 >> button >> nth=0' },
        ref: { story: STANDARD, selector: `${LIST} .fd-upload-collection__button-group >> nth=0 >> button >> nth=0` }
    },
    {
        label: 'small button group',
        // a full-width row in both, in lists of different widths: styles only
        pixels: false,
        ignore: ['width'],
        props: ['margin-top'],
        ours: { story: 'components-upload-collection--small', selector: 'fd-upload-collection-button-group >> nth=0' },
        ref: { story: STANDARD, selector: `${SMALL} .fd-upload-collection__button-group >> nth=0` }
    }
];
