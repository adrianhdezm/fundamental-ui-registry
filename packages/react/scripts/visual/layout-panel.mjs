/** Visual cases for layout-panel; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-layouts-';

// fundamental-styles' texts are the class names of the parts (".fd-layout-panel__title"), ours are readable texts,
// so the parts compare by computed styles; the actions of the transparent panel (an emphasized "Action" button in
// both) also by pixels. Widths follow the texts or the story canvas and are ignored where so.
const ours = (story, selector) => ({ story: `components-layout-panel--${story}`, selector });
const ref = (story, selector) => ({ story: `${FS}layout-panel--${story}`, selector });
const PANEL = 'div[id^="fd-layout-panel-"]';
const FLEX = ['display', 'justify-content', 'align-items'];

export default [
    {
        label: 'panel',
        pixels: false,
        props: ['overflow'],
        ours: ours('basic', PANEL),
        ref: ref('primary', '.fd-layout-panel')
    },
    {
        label: 'transparent panel',
        pixels: false,
        ours: ours('transparent', PANEL),
        ref: ref('transparent-background', '.fd-layout-panel')
    },
    {
        label: 'header',
        pixels: false,
        props: FLEX,
        ours: ours('transparent', `${PANEL} > div >> nth=0`),
        ref: ref('transparent-background', '.fd-layout-panel__header')
    },
    {
        label: 'head',
        pixels: false,
        // as wide as its texts
        ignore: ['width'],
        ours: ours('transparent', `${PANEL} > div > div >> nth=0`),
        ref: ref('transparent-background', '.fd-layout-panel__head')
    },
    {
        label: 'title',
        pixels: false,
        // as wide as its text; ours is the heading itself, fundamental-styles wraps an h5 in a div
        ignore: ['width'],
        ours: ours('transparent', 'h3'),
        ref: ref('transparent-background', '.fd-layout-panel__title h5')
    },
    {
        label: 'description',
        pixels: false,
        props: ['margin-top'],
        ignore: ['width'],
        ours: ours('transparent', `${PANEL} p`),
        ref: ref('transparent-background', '.fd-layout-panel__description')
    },
    {
        label: 'actions (emphasized button)',
        ours: ours('transparent', `${PANEL} > div > div >> nth=1`),
        ref: ref('transparent-background', '.fd-layout-panel__actions')
    },
    {
        label: 'filters',
        pixels: false,
        ours: ours('basic', `${PANEL} > div >> nth=1`),
        ref: ref('primary', '.fd-layout-panel__filters')
    },
    {
        label: 'body',
        pixels: false,
        ours: ours('basic', `${PANEL} > div >> nth=2`),
        ref: ref('primary', '.fd-layout-panel__body')
    },
    {
        label: 'footer',
        pixels: false,
        props: ['display', 'justify-content'],
        ours: ours('basic', `${PANEL} > div >> nth=3`),
        ref: ref('primary', '.fd-layout-panel__footer')
    },
    ...[
        ['footer end', 0, '.fd-layout-panel__footer--end'],
        ['footer start', 1, '.fd-layout-panel__footer--start']
    ].map(([label, nth, selector]) => ({
        label,
        pixels: false,
        props: ['display', 'justify-content'],
        // ours holds two buttons, fundamental-styles a line of text
        ignore: ['height'],
        ours: ours('footer-variations', `${PANEL} >> nth=${nth} >> :scope > div:last-child`),
        ref: ref('footer-variations', selector)
    }))
];
