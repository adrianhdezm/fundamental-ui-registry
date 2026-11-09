/** Visual cases for busy-indicator; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

// single dots: animations are stopped at their start on both sides
export default [
    ['s', 0, '.fd-busy-indicator:not([class*="--"])'],
    ['m', 1, '.fd-busy-indicator--m'],
    ['l', 2, '.fd-busy-indicator--l']
].map(([size, nth, ref]) => ({
    label: `dot ${size}`,
    props: ['margin-left', 'margin-right'],
    // the dots' line box is irrelevant: they hold no text
    ignore: ['line-height'],
    ours: { story: 'components-busy-indicator--sizes', selector: `[data-busy-dots] >> nth=${nth} >> div >> nth=0` },
    ref: { story: `${FS}busy-indicator--standard`, selector: `${ref} >> .fd-busy-indicator__circle >> nth=0` }
}));
