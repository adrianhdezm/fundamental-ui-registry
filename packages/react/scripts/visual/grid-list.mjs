/** Visual cases for grid-list; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-grid-list-';

// Our States, Selection, Highlight, "More" button and Filter info bar stories show fundamental-styles' contact cards
// (John Li, the same address and e-mail), so the parts of a card compare by pixels. Whole cards compare by computed
// styles only: fundamental-styles' avatars show a photo, ours an SVG. fundamental-styles hard-codes `is-compact` on
// the toolbar rows of its Selection examples and on its title bars; ours follow the density (Angular, and SAPUI5's
// grid list), so those cards and title bars compare without their height.
const ours = (story, selector) => ({ story: `components-grid-list--${story}`, selector });
const ref = (story, selector) => ({ story: `${FS}${story}`, selector });
const CARD = '[data-grid-list-item]';
const LOCKED = `${CARD} >> nth=3`;
// fundamental-styles' Highlight cards hold other content (toolbars, links) than ours: their height and cursor differ
const HIGHLIGHT = { pixels: false, ignore: ['height', 'cursor'] };
// the filter bar is activated by a click (Angular): it keeps its pointer cursor, fundamental-styles' has none
const FILTER_IGNORE = ['cursor'];

export default [
    {
        label: 'card, unread navigation item',
        pixels: false,
        ours: ours('states', `${CARD} >> nth=0`),
        ref: ref('grid-list--states', '.fd-grid-list__item >> nth=0')
    },
    {
        label: 'card, hover',
        hover: true,
        pixels: false,
        ours: ours('states', `${CARD} >> nth=0`),
        ref: ref('grid-list--states', '.fd-grid-list__item >> nth=0')
    },
    {
        label: 'card, focus',
        focus: true,
        refFocus: true,
        pixels: false,
        ours: ours('states', `${CARD} >> nth=0`),
        ref: ref('grid-list--states', '.fd-grid-list__item >> nth=0')
    },
    {
        label: 'card, inactive',
        pixels: false,
        ours: ours('states', LOCKED),
        ref: ref('grid-list--states', '.fd-grid-list__item--locked')
    },
    {
        label: 'card, selected navigation item (multi selection)',
        pixels: false,
        // fundamental-styles' toolbar row is compact whatever the density
        ignore: ['height'],
        ours: ours('selection-multi', `${CARD} >> nth=0`),
        ref: ref('selection--multi-select-mode', '.fd-grid-list__item >> nth=0')
    },
    {
        label: 'card, selected inactive item (multi selection)',
        pixels: false,
        ignore: ['height'],
        ours: ours('selection-multi', `${CARD} >> nth=2`),
        ref: ref('selection--multi-select-mode', '.fd-grid-list__item >> nth=2')
    },
    {
        label: 'item toolbar (counter, navigation arrow)',
        ours: ours('states', `${CARD} >> nth=0 >> [data-gl-item-toolbar]`),
        ref: ref('grid-list--states', '.fd-grid-list__item-toolbar >> nth=0')
    },
    {
        label: 'delete button',
        ours: ours('delete-mode', 'button[aria-label="Delete"] >> nth=0'),
        ref: ref('grid-list--delete-mode', 'button[aria-label="Delete"] >> nth=0')
    },
    {
        label: 'header (title and description)',
        ours: ours('states', `${LOCKED} >> [data-gl-header]`),
        ref: ref('grid-list--states', '.fd-grid-list__item--locked .fd-grid-list__item-header')
    },
    {
        label: 'content',
        ours: ours('states', `${LOCKED} >> [data-gl-header] + div`),
        ref: ref('grid-list--states', '.fd-grid-list__item--locked .fd-grid-list__item-content')
    },
    {
        label: 'state actions, locked',
        props: ['margin-top'],
        ours: ours('states', `${LOCKED} >> [data-gl-actions]`),
        ref: ref('grid-list--states', '.fd-grid-list__item--locked .fd-grid-list__item-body-actions')
    },
    {
        label: 'state actions, draft',
        ours: ours('states', `${CARD} >> nth=4 >> [data-gl-actions] >> button`),
        ref: ref('grid-list--states', '.fd-grid-list__item--draft .fd-grid-list__item-body-actions button')
    },
    {
        label: 'state actions, error status',
        pixels: false,
        // fundamental-styles' text is "(Contains errors)", ours "Contains errors" (Angular's label)
        ignore: ['width'],
        ours: ours('states', `${CARD} >> nth=1 >> [data-gl-actions] >> span >> nth=0`),
        ref: ref('grid-list--states', '.fd-grid-list__item-body-actions .fd-object-status >> nth=0')
    },
    {
        label: 'highlight, success',
        ...HIGHLIGHT,
        ours: ours('statuses', '[data-gl-highlight] >> nth=0'),
        ref: ref('grid-list--highlight', '.fd-grid-list__highlight--positive')
    },
    {
        label: 'highlight, warning',
        ...HIGHLIGHT,
        ours: ours('statuses', '[data-gl-highlight] >> nth=1'),
        ref: ref('grid-list--highlight', '.fd-grid-list__highlight--critical')
    },
    {
        label: 'highlight, error',
        ...HIGHLIGHT,
        ours: ours('statuses', '[data-gl-highlight] >> nth=2'),
        ref: ref('grid-list--highlight', '.fd-grid-list__highlight--negative')
    },
    {
        label: 'group header',
        props: ['margin-top', 'margin-bottom'],
        ignore: ['width'],
        ours: ours('states', '[data-gl-group-header] >> nth=1'),
        ref: ref('grid-list--states', '.fd-grid-list__group-header >> nth=1')
    },
    {
        label: 'title bar',
        pixels: false,
        // fundamental-styles' title bars are compact whatever the density
        ignore: ['height', 'min-height', 'padding-left', 'padding-right'],
        ours: ours('states', '[data-gl-title-bar] [role="toolbar"]'),
        ref: ref('grid-list--states', '.fd-toolbar--solid')
    },
    {
        label: 'title bar title',
        ours: ours('selection-multi', '[data-gl-title-bar] [data-toolbar-label]'),
        ref: ref('selection--multi-select-mode', '.fd-toolbar--solid > span >> nth=0')
    },
    {
        label: 'filter info bar',
        ignore: FILTER_IGNORE,
        ours: ours('filter-and-footer', '[data-gl-filter] [role="button"]'),
        ref: ref('grid-list--filter-infobar', '.fd-grid-list__filter')
    },
    {
        label: 'footer',
        ours: ours('filter-and-footer', '[data-gl-footer]'),
        ref: ref('grid-list--footer', '.fd-grid-list__footer')
    },
    {
        label: 'more button',
        ours: ours('more-button', '[data-gl-more] [role="button"]'),
        ref: ref('grid-list--more', '.fd-grid-list__more')
    },
    {
        label: 'more button, hover',
        hover: true,
        ours: ours('more-button', '[data-gl-more] [role="button"]'),
        ref: ref('grid-list--more', '.fd-grid-list__more')
    }
];
