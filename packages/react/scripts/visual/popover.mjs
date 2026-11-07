/** Visual cases for popover; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

const OURS = 'components-popover--body-variants';
const body = (variant) => `[data-variant="${variant}"]`;

// fundamental-styles fills its bodies with menus (not ported yet), ours hold a line of text: the surfaces are
// compared by computed style (background, radius, shadow, typography), not by size or pixels
const surface = (label, variant, story, selector) => ({
    label,
    pixels: false,
    ignore: ['width', 'height'],
    ours: { story: OURS, selector: body(variant) },
    ref: { story: `${FS}popover--${story}`, selector }
});

export default [
    surface('body without arrow', 'No arrow', 'no-arrow', '#popoverF1'),
    surface('body below, arrow on top', 'Arrow top', 'placement', '#popoverF1i'),
    surface('body above, arrow at the bottom', 'Arrow bottom', 'placement', '#popoverF1'),
    surface('body after, arrow at the start', 'Arrow left', 'placement', '#popoverF1d'),
    surface('body before, arrow at the end', 'Arrow right', 'placement', '#popoverF1c'),
    {
        label: 'scroll wrapper',
        pixels: false,
        ignore: ['width', 'height'],
        ours: { story: OURS, selector: `${body('No arrow')} > div` },
        ref: { story: `${FS}popover--no-arrow`, selector: '#popoverF1 .fd-popover__wrapper' }
    },
    {
        label: 'resize handle',
        ours: { story: OURS, selector: `${body('Resizable')} [role="presentation"]` },
        ref: { story: `${FS}popover--resizable`, selector: '#popoverF10r .fd-popover__resize-handle' }
    },
    {
        label: 'resize handle above',
        ours: { story: OURS, selector: `${body('Resizable above')} [role="presentation"]` },
        ref: { story: `${FS}popover--resizable`, selector: '#popoverF1r .fd-popover__resize-handle' }
    }
];
