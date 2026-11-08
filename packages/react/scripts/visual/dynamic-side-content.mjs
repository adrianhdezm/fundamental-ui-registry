/** Visual cases for dynamic-side-content; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-layouts-';

// fundamental-styles fills its layouts with 4rem docs boxes in colours of its own (docs-layout-grid-bg); ours are
// 4rem boxes in SAP indication colours, so the layout and its main and side content compare by computed styles,
// box sizes and the flex properties that make the layout, not by pixels. Both canvases are 1248px wide.
const ours = (story, n, part) => ({
    story: `components-dynamic-side-content--${story}`,
    // each layout of a story has one main and one side content
    selector: part ? `[data-dsc-${part}] >> nth=${n}` : `div:has(> [data-dsc-main]) >> nth=${n}`
});
const ref = (story, part, nth = 0) => ({
    story: `${FS}dynamic-side-content--${story}`,
    selector: part ? `.fd-dynamic-side__${part} >> nth=${nth}` : `.fd-dynamic-side >> nth=${nth}`
});
const LAYOUT = ['display', 'flex-direction', 'box-sizing', 'margin-top', 'margin-left'];
const PART = ['display', 'flex-grow', 'flex-shrink', 'flex-basis', 'box-sizing', 'margin-top', 'margin-left'];

export default [
    {
        label: 'layout, left',
        pixels: false,
        props: LAYOUT,
        ours: ours('positioning', 0),
        ref: ref('position-left')
    },
    {
        label: 'main, left (xl)',
        pixels: false,
        props: PART,
        ours: ours('positioning', 0, 'main'),
        ref: ref('position-left', 'main')
    },
    {
        label: 'side, left (xl)',
        pixels: false,
        props: PART,
        ours: ours('positioning', 0, 'side'),
        ref: ref('position-left', 'side')
    },
    {
        label: 'layout, below',
        pixels: false,
        props: LAYOUT,
        ours: ours('positioning', 2),
        ref: ref('position-bottom')
    },
    {
        label: 'main, below',
        pixels: false,
        props: PART,
        ours: ours('positioning', 2, 'main'),
        ref: ref('position-bottom', 'main')
    },
    {
        label: 'side, below',
        pixels: false,
        props: PART,
        ours: ours('positioning', 2, 'side'),
        ref: ref('position-bottom', 'side')
    },
    {
        label: 'main, equal split',
        pixels: false,
        props: PART,
        ours: ours('positioning', 3, 'main'),
        ref: ref('equal-split', 'main')
    },
    {
        label: 'side, equal split',
        pixels: false,
        props: PART,
        ours: ours('positioning', 3, 'side'),
        ref: ref('equal-split', 'side')
    },
    {
        label: 'main, md',
        pixels: false,
        props: PART,
        // fundamental-styles' md example is 920px wide (max-width), ours is the full canvas
        ignore: ['width'],
        ours: ours('sizes', 1, 'main'),
        ref: ref('responsiveness', 'main', 1)
    },
    {
        label: 'side, md',
        pixels: false,
        props: PART,
        ignore: ['width'],
        ours: ours('sizes', 1, 'side'),
        ref: ref('responsiveness', 'side', 1)
    },
    {
        label: 'main, sm (side hidden)',
        pixels: false,
        props: PART,
        // fundamental-styles' sm example is 420px wide (max-width), ours is the full canvas
        ignore: ['width'],
        ours: ours('sizes', 0, 'main'),
        ref: ref('responsiveness', 'main', 2)
    }
];
