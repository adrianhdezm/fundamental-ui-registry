/** Visual cases for panel; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

// Our `Variants` story repeats fundamental-styles' Panel examples with their texts, one wrapper per reference story
// (`[data-example=…]`), so the parts compare by computed styles and by pixels.
const ours = (example, selector) => ({
    story: 'components-panel--variants',
    selector: `[data-example="${example}"] ${selector}`
});
const ref = (story, selector) => ({ story: `${FS}panel--${story}`, selector });
const HEADER = '> div:first-child';

export default [
    {
        label: 'collapsed panel',
        props: ['margin-bottom', 'display', 'flex-direction'],
        ours: ours('expandable', '> div:nth-child(1)'),
        ref: ref('expandable', '.fd-panel >> nth=0')
    },
    {
        label: 'collapsed header (toolbar)',
        props: ['display', 'align-items', 'overflow'],
        ours: ours('expandable', `> div:nth-child(1) ${HEADER}`),
        ref: ref('expandable', '.fd-panel__header >> nth=0')
    },
    {
        label: 'expand button area',
        props: ['display', 'justify-content', 'align-items'],
        ours: ours('expandable', `> div:nth-child(1) ${HEADER} ${HEADER}`),
        ref: ref('expandable', '.fd-panel__expand >> nth=0')
    },
    {
        label: 'expand button (collapsed)',
        ours: ours('expandable', 'button >> nth=0'),
        ref: ref('expandable', '.fd-panel__button >> nth=0')
    },
    {
        label: 'expand button hover',
        hover: true,
        ours: ours('expandable', 'button >> nth=0'),
        ref: ref('expandable', '.fd-panel__button >> nth=0')
    },
    {
        label: 'expand button focus',
        focus: true,
        refFocus: true,
        ours: ours('expandable', 'button >> nth=0'),
        ref: ref('expandable', '.fd-panel__button >> nth=0')
    },
    {
        label: 'title',
        props: ['white-space', 'flex-grow'],
        ours: ours('expandable', 'h4 >> nth=0'),
        ref: ref('expandable', '.fd-panel__title >> nth=0')
    },
    {
        label: 'header toolbar',
        ours: ours('expandable', '[role=toolbar]'),
        ref: ref('expandable', '.fd-panel__header .fd-toolbar')
    },
    {
        label: 'expanded panel',
        ours: ours('expandable', '> div:nth-child(2)'),
        ref: ref('expandable', '.fd-panel >> nth=1')
    },
    {
        label: 'expanded header',
        ours: ours('expandable', `> div:nth-child(2) ${HEADER}`),
        ref: ref('expandable', '.fd-panel__header >> nth=1')
    },
    {
        label: 'expand button (expanded)',
        ours: ours('expandable', '> div:nth-child(2) button'),
        ref: ref('expandable', '.fd-panel__button >> nth=1')
    },
    {
        label: 'content',
        props: ['overflow'],
        ours: ours('expandable', '[role=region]'),
        ref: ref('expandable', '.fd-panel__content >> nth=1')
    },
    {
        label: 'fixed header (toolbar)',
        ours: ours('fixed', `> div ${HEADER}`),
        ref: ref('fixed', '.fd-panel__header')
    },
    {
        label: 'fixed title (wraps)',
        ours: ours('fixed', 'h4'),
        ref: ref('fixed', '.fd-panel__title')
    },
    {
        label: 'fixed content',
        ours: ours('fixed', '[role=region]'),
        ref: ref('fixed', '.fd-panel__content')
    },
    {
        label: 'fixed height content',
        props: ['overflow'],
        ours: ours('fixed-height', '[role=region]'),
        ref: ref('fixed-height-content', '.fd-panel__content')
    },
    {
        label: 'transparent header',
        ours: ours('transparent', `> div:nth-child(1) ${HEADER}`),
        ref: ref('transparent', '.fd-panel__header >> nth=0')
    },
    {
        label: 'transparent content',
        ours: ours('transparent', '[role=region] >> nth=0'),
        ref: ref('transparent', '.fd-panel__content >> nth=0')
    },
    {
        label: 'transparent header without expand button',
        ours: ours('transparent', `> div:nth-child(2) ${HEADER}`),
        ref: ref('transparent', '.fd-panel__header >> nth=1')
    },
    {
        label: 'content without padding',
        ours: ours('transparent', '[role=region] >> nth=1'),
        ref: ref('transparent', '.fd-panel__content--no-padding')
    }
];
