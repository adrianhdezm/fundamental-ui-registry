/** Visual cases for upload-collection; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';
const STANDARD = `${FS}upload-collection--standard`;
const EDIT = `${FS}upload-collection--edit`;
const OURS = 'components-upload-collection--default';
const OURS_EDIT = 'components-upload-collection--edit';
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
    part('collection', '[data-upload-collection]', LIST, { ignore: ['width', 'height'] }),
    // files with a title, two descriptions and two statuses: ours without a marker (Team_Photo) against
    // fundamental-styles' first file; a title container with markers is 1px higher, so the files with markers
    // are compared too (fundamental-styles' is interactive: pointer cursor)
    part('item', '[data-upload-collection-item] >> nth=1', `${LIST} .fd-upload-collection__item >> nth=0`, {
        ignore: ['width'],
        props: ['flex-wrap', 'align-items']
    }),
    part('item hover', '[data-upload-collection-item] >> nth=1', `${LIST} .fd-upload-collection__item >> nth=0`, {
        hover: true,
        ignore: ['width']
    }),
    part(
        'item with markers',
        '[data-upload-collection-item] >> nth=0',
        `${LIST} .fd-upload-collection__item >> nth=1`,
        {
            ignore: ['width', 'cursor']
        }
    ),
    part('thumbnail', '[data-slot=list-thumbnail] >> nth=0', `${LIST} .fd-upload-collection__thumbnail >> nth=0`, {
        props: ['align-self']
    }),
    part(
        'title container',
        '[data-slot=upload-collection-title-container] >> nth=0',
        `${LIST} .fd-upload-collection__title-container >> nth=0`,
        // fundamental-styles' item with a title container is interactive (pointer cursor), ours is not
        { ignore: ['width', 'cursor'], props: ['display', 'align-items'] }
    ),
    part(
        'title',
        '[data-upload-collection-title] >> nth=0',
        `${LIST} .fd-upload-collection__title-container .fd-upload-collection__title >> nth=0`,
        { ignore: ['width'], props: ['margin-inline-end', 'flex-grow', 'flex-shrink'] }
    ),
    part(
        'description',
        '[data-slot=upload-collection-description] >> nth=0',
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
            selector:
                '[data-slot=upload-collection-description] >> nth=0 >> [data-slot=upload-collection-text-separator]'
        },
        ref: {
            story: STANDARD,
            selector: `${LIST} .fd-upload-collection__description >> nth=0 >> .fd-upload-collection__text-separator`
        }
    },
    part(
        'status group',
        '[data-slot=upload-collection-status-group] >> nth=0',
        `${LIST} .fd-upload-collection__status-group >> nth=0`,
        { ignore: ['width'], props: ['margin-top', 'display'] }
    ),
    // the first and second statuses; their colours differ (positive and informative, negative and positive)
    part(
        'status item',
        '[data-slot=upload-collection-status-item] >> nth=0',
        `${LIST} .fd-upload-collection__status-group-item >> nth=0`,
        { ignore: ['width', 'color'], props: ['margin-inline-start', 'margin-inline-end', 'flex-shrink', 'min-width'] }
    ),
    part(
        'second status item',
        '[data-slot=upload-collection-status-item] >> nth=1',
        `${LIST} .fd-upload-collection__status-group-item >> nth=1`,
        { ignore: ['width', 'color'], props: ['margin-inline-start', 'margin-inline-end'] }
    ),
    {
        label: 'button group',
        props: ['margin-inline-start'],
        ours: { story: OURS, selector: '[data-slot=upload-collection-button-group] >> nth=0' },
        ref: { story: STANDARD, selector: `${LIST} .fd-upload-collection__button-group >> nth=0` }
    },
    {
        label: 'edit button hover',
        hover: true,
        ours: { story: OURS, selector: '[data-slot=upload-collection-button-group] >> nth=0 >> button >> nth=0' },
        ref: { story: STANDARD, selector: `${LIST} .fd-upload-collection__button-group >> nth=0 >> button >> nth=0` }
    },
    {
        label: 'small button group',
        props: ['margin-top', 'margin-inline-start'],
        ours: {
            story: 'components-upload-collection--small',
            selector: '[data-slot=upload-collection-button-group] >> nth=0'
        },
        ref: { story: STANDARD, selector: `${SMALL} .fd-upload-collection__button-group >> nth=0` }
    },
    {
        label: 'edit form item',
        pixels: false,
        ignore: ['width'],
        ours: { story: OURS_EDIT, selector: '[data-slot=upload-collection-form-item] >> nth=0' },
        ref: { story: EDIT, selector: '.fd-upload-collection__form-item >> nth=0' }
    },
    {
        label: 'edit field',
        pixels: false,
        // ours shows the name to edit, fundamental-styles' the placeholder
        ignore: ['font-style', 'color', 'width'],
        ours: { story: OURS_EDIT, selector: '[data-slot=upload-collection-form-item] >> nth=0 >> input' },
        ref: { story: EDIT, selector: '.fd-upload-collection__form-item >> nth=0 >> input' }
    },
    {
        label: 'edit extension',
        pixels: false,
        ignore: ['width'],
        // a flex item of Angular's form item (block), fundamental-styles' is inline-block: the same place
        props: ['margin-inline-start'],
        ours: { story: OURS_EDIT, selector: '[data-slot=upload-collection-form-item] >> nth=0 >> span' },
        ref: { story: EDIT, selector: '.fd-upload-collection__extension >> nth=0' }
    },
    {
        label: 'edit buttons',
        ours: { story: OURS_EDIT, selector: '[data-slot=upload-collection-button-group] >> nth=0' },
        ref: { story: EDIT, selector: '.fd-upload-collection__button-group >> nth=0' }
    }
];
