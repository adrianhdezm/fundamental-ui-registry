/** Visual cases for flexible-column-layout; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-layouts-';

// fundamental-styles' examples are 25rem high with empty columns: solid separators in Three Columns Layout,
// transparent in Two Columns Layout, translucent in One Columns Layout. Our stories (Angular's) are 25rem high too, so
// the separators (with their gradient lines and button) compare by pixels; the columns hold our content and are as
// wide as their layout, so they compare by computed styles. The button and the solid separator come from our
// Three Columns example, whose separators sit on whole pixels as fundamental-styles' (a 24px button at a fractional
// offset anti-aliases its rounded border differently).
const ours = (story, selector) => ({ story: `components-flexible-column-layout--${story}`, selector });
const ref = (story, selector) => ({ story: `${FS}flexible-column--${story}`, selector });
// the separator buttons have a title, the buttons of the bars in the columns do not
const FCL = 'div:has(> div > button[title])';
const SEPARATOR = `${FCL} > div:has(> button)`;
const COLUMN = `${FCL} > div:not(:has(> button))`;
const BUTTON = `${SEPARATOR} > button`;
const FLEX = ['display', 'flex-direction', 'justify-content', 'align-items', 'position'];
// the separator is a click target of its own (Angular), with a pointer cursor; fundamental-styles' is not
const SEPARATOR_IGNORE = ['cursor'];

export default [
    {
        label: 'layout',
        pixels: false,
        props: FLEX,
        // as wide as the story canvas; the height is the story's
        ignore: ['width', 'height'],
        ours: ours('default', FCL),
        ref: ref('three-columns-layout', '.fd-flexible-column-layout')
    },
    {
        label: 'start column',
        pixels: false,
        props: ['margin-top', 'margin-left', 'visibility'],
        // percent of the layout width (fundamental-styles' minimum of 20rem is not Angular's)
        ignore: ['width'],
        ours: ours('default', `${COLUMN} >> nth=0`),
        ref: ref('three-columns-layout', '.fd-flexible-column-layout__column >> nth=0')
    },
    {
        label: 'mid column',
        pixels: false,
        props: ['margin-top', 'margin-left', 'visibility'],
        ignore: ['width'],
        ours: ours('default', `${COLUMN} >> nth=1`),
        ref: ref('three-columns-layout', '.fd-flexible-column-layout__column >> nth=1')
    },
    {
        label: 'separator, solid',
        props: FLEX,
        ignore: SEPARATOR_IGNORE,
        ours: ours('three-columns-example', SEPARATOR),
        ref: ref('three-columns-layout', '.fd-flexible-column-layout__separator')
    },
    {
        label: 'separator, solid, hover',
        hover: true,
        props: FLEX,
        ignore: SEPARATOR_IGNORE,
        ours: ours('three-columns-example', SEPARATOR),
        ref: ref('three-columns-layout', '.fd-flexible-column-layout__separator')
    },
    {
        label: 'separator, translucent',
        props: FLEX,
        ignore: SEPARATOR_IGNORE,
        ours: ours('custom-config', SEPARATOR),
        ref: ref('one-columns-layout', '.fd-flexible-column-layout__separator')
    },
    {
        label: 'separator, transparent (arrow to the end)',
        props: FLEX,
        ignore: SEPARATOR_IGNORE,
        ours: ours('three-columns', `${SEPARATOR} >> nth=0`),
        ref: ref('two-columns-layout', '.fd-flexible-column-layout__separator >> nth=0')
    },
    {
        label: 'separator, transparent (arrow to the start)',
        props: FLEX,
        ignore: SEPARATOR_IGNORE,
        ours: ours('three-columns', `${SEPARATOR} >> nth=1`),
        ref: ref('two-columns-layout', '.fd-flexible-column-layout__separator >> nth=1')
    },
    {
        label: 'separator button',
        ours: ours('three-columns-example', BUTTON),
        ref: ref('three-columns-layout', '.fd-flexible-column-layout__button')
    },
    {
        label: 'separator button, hover',
        hover: true,
        ours: ours('three-columns-example', BUTTON),
        ref: ref('three-columns-layout', '.fd-flexible-column-layout__button')
    },
    {
        label: 'separator button, focus',
        focus: true,
        refFocus: true,
        ours: ours('three-columns-example', BUTTON),
        ref: ref('three-columns-layout', '.fd-flexible-column-layout__button')
    }
];
