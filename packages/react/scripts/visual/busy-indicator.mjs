/** Visual cases for busy-indicator; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

// single dots: the wrappers differ (ours is a block, fundamental-styles' an inline block); animations are
// stopped at their start on both sides
export default [
    ...[
        ['s', 0, '.fd-busy-indicator:not([class*="--"])'],
        ['m', 1, '.fd-busy-indicator--m'],
        ['l', 2, '.fd-busy-indicator--l']
    ].flatMap(([size, nth, ref]) => [
        {
            label: `dot ${size}`,
            props: ['margin-left', 'margin-right'],
            // the dots' line box is irrelevant: they hold no text
            ignore: ['line-height'],
            ours: {
                story: 'components-busy-indicator--sizes',
                selector: `[data-busy-dots] >> nth=${nth} >> div >> nth=0`
            },
            ref: {
                story: `${FS}busy-indicator--standard`,
                selector: `${ref} >> .fd-busy-indicator__circle >> nth=0`
            }
        },
        {
            label: `last dot ${size}`,
            props: ['margin-left', 'margin-right'],
            ignore: ['line-height'],
            ours: {
                story: 'components-busy-indicator--sizes',
                selector: `[data-busy-dots] >> nth=${nth} >> div >> nth=2`
            },
            ref: {
                story: `${FS}busy-indicator--standard`,
                selector: `${ref} >> .fd-busy-indicator__circle >> nth=2`
            }
        }
    ]),
    {
        label: 'contrast dot',
        // different backgrounds behind the dots
        pixels: false,
        ignore: ['line-height'],
        ours: { story: 'components-busy-indicator--contrast', selector: '[data-busy-dots] >> div >> nth=0' },
        ref: { story: `${FS}busy-indicator--contrast-mode`, selector: '.fd-busy-indicator__circle >> nth=0' }
    },
    {
        label: 'extended label',
        // "Loading data..." here, "loading data..." there
        pixels: false,
        ignore: ['width'],
        ours: { story: 'components-busy-indicator--extended', selector: 'span:has-text("Loading data")' },
        ref: {
            story: `${FS}busy-indicator--extended-busy-indicator`,
            selector: '.fd-busy-indicator-extended__label'
        }
    }
];
