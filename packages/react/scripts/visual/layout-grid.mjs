/** Visual cases for layout-grid; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-layouts-';

// The grid is layout only: the coloured content of the columns is story decoration (fundamental-styles' docs
// colours, SAP indication colours here), so every case compares computed styles, margins and box sizes, not pixels.
// The viewport is 1280px wide: the lg breakpoint (1024-1439px).
const MARGINS = ['margin-left', 'margin-right', 'min-width', 'max-width'];
const ours = (story, selector) => ({ story: `components-layout-grid--${story}`, selector });
const ref = (story, selector) => ({ story: `${FS}layout-grid--${story}`, selector });

export default [
    {
        label: 'grid',
        pixels: false,
        props: MARGINS,
        ours: ours('different-size-columns', 'div:has(> [data-fd-row]) >> nth=0'),
        ref: ref('different-size-columns', '.fd-container')
    },
    {
        label: 'row',
        pixels: false,
        props: MARGINS,
        ours: ours('different-size-columns', '[data-fd-row] >> nth=1'),
        ref: ref('different-size-columns', '.fd-row >> nth=1')
    },
    ...[
        ['column 12', 0],
        ['column 11', 1],
        ['column 1', 2],
        ['column 3', 6]
    ].map(([label, nth]) => ({
        label,
        pixels: false,
        props: MARGINS,
        ours: ours('different-size-columns', `[data-fd-col] >> nth=${nth}`),
        ref: ref('different-size-columns', `.fd-col >> nth=${nth}`)
    })),
    {
        label: 'responsive column (lg 4)',
        pixels: false,
        props: MARGINS,
        ours: ours('responsive', '[data-fd-col] >> nth=0'),
        ref: ref('responsiveness', '.fd-col >> nth=0')
    },
    ...[
        ['responsive offset (lg 4, offset 4)', 2, 2],
        ['offset 6', 3, 3],
        ['offset after (lg 2)', 8, 4],
        ['offset after 1', 9, 5]
    ].map(([label, nth, refNth]) => ({
        label,
        pixels: false,
        props: MARGINS,
        ours: ours('offsets', `[data-fd-col] >> nth=${nth}`),
        ref: ref('offset', `.fd-col >> nth=${refNth}`)
    })),
    {
        label: 'nested row',
        pixels: false,
        props: MARGINS,
        ours: ours('nesting', '[data-fd-row] [data-fd-row] >> nth=0'),
        ref: ref('nesting', '.fd-row .fd-row >> nth=0')
    },
    {
        label: 'nested column',
        pixels: false,
        props: MARGINS,
        ours: ours('nesting', '[data-fd-row] [data-fd-row] [data-fd-col] >> nth=0'),
        ref: ref('nesting', '.fd-row .fd-row .fd-col >> nth=0')
    },
    ...[
        ['no-gap', 'no-gap', '.fd-container--no-vertical-gap'],
        ['no-horizontal-gap', 'no-horizontal-gap', '.fd-container--no-horizontal-gap'],
        ['no-vertical-gap', 'no-vertical-gap', '.fd-container--no-vertical-gap']
    ].flatMap(([variant, story, container]) => [
        {
            label: `${variant} grid`,
            pixels: false,
            props: MARGINS,
            ours: ours('no-gap', `[data-variant="${variant}"]`),
            ref: ref(story, container)
        },
        {
            label: `${variant} row`,
            pixels: false,
            props: MARGINS,
            // without inline gutters fundamental-styles keeps the row 1rem wider than the grid (min-width
            // calc(100% + 1rem) with no negative margins), so it overflows at the end; ours fills the grid
            ignore: variant === 'no-vertical-gap' ? [] : ['min-width', 'width'],
            ours: ours('no-gap', `[data-variant="${variant}"] [data-fd-row] >> nth=0`),
            ref: ref(story, `${container} .fd-row >> nth=0`)
        },
        {
            label: `${variant} column`,
            pixels: false,
            props: MARGINS,
            // the columns span their share of that wider row there (a 4-column one is 1/3 rem wider)
            ignore: variant === 'no-vertical-gap' ? [] : ['width'],
            ours: ours('no-gap', `[data-variant="${variant}"] [data-fd-col] >> nth=1`),
            ref: ref(story, `${container} .fd-col >> nth=1`)
        }
    ]),
    ...[
        ['growing column before', 0],
        ['fixed column between', 1],
        ['growing column after', 2]
    ].map(([label, nth]) => ({
        label,
        pixels: false,
        props: MARGINS,
        ours: ours('auto-adjusting', `[data-fd-col] >> nth=${nth}`),
        ref: ref('auto-adjusting', `.fd-col >> nth=${nth}`)
    }))
];
