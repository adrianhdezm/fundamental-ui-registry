/** Visual cases for slider; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

/** Our slider whose handle input is named `label`, or a part of it. */
const ours = (label, part = '') => `[data-slot=slider]:has(input[aria-label="${label}"])${part}`;
const OUTLINE = ['outline-style', 'outline-width', 'outline-color', 'outline-offset'];
/**
 * The track, the progress and the ticks take presses (Base UI's control): pointer cursor, as Angular;
 * fundamental-styles' static markup has none. The range between the handles is dragged: grab cursor.
 */
const PRESSABLE = ['cursor'];

export default [
    {
        label: 'slider',
        ours: { story: 'components-slider--standard', selector: ours('slider') },
        ref: { story: `${FS}slider--standard`, selector: '.fd-slider' }
    },
    {
        label: 'handle',
        ours: { story: 'components-slider--standard', selector: ours('slider', ' [data-slot=slider-handle]') },
        ref: { story: `${FS}slider--standard`, selector: '.fd-slider__handle' }
    },
    {
        label: 'handle hover',
        hover: true,
        ours: { story: 'components-slider--standard', selector: ours('slider', ' [data-slot=slider-handle]') },
        ref: { story: `${FS}slider--standard`, selector: '.fd-slider__handle.is-hover' }
    },
    // the first handle of the story takes the Tab focus
    {
        label: 'handle focus',
        focus: true,
        ours: { story: 'components-slider--standard', selector: ours('slider', ' [data-slot=slider-handle]') },
        ref: { story: `${FS}slider--standard`, selector: '.fd-slider__handle.is-focus' }
    },
    {
        label: 'track',
        ignore: PRESSABLE,
        ours: { story: 'components-slider--standard', selector: ours('slider', ' [data-slot=slider-track]') },
        ref: { story: `${FS}slider--standard`, selector: '.fd-slider__track' }
    },
    {
        label: 'progress',
        ignore: PRESSABLE,
        ours: { story: 'components-slider--standard', selector: ours('slider', ' [data-slot=slider-range]') },
        ref: { story: `${FS}slider--standard`, selector: '.fd-slider__track-range' }
    },
    {
        label: 'range slider',
        ours: { story: 'components-slider--standard', selector: ours('range slider') },
        ref: { story: `${FS}slider--range`, selector: '.fd-slider--range' }
    },
    {
        label: 'range handle',
        // fundamental-styles' range story puts the handles 0.75px off the pixel grid (its headings), so they
        // anti-alias differently: computed styles only
        pixels: false,
        ours: {
            story: 'components-slider--standard',
            selector: ours('range slider', ' [data-slot=slider-handle]')
        },
        ref: { story: `${FS}slider--range`, selector: '.fd-slider--range .fd-slider__handle' }
    },
    {
        label: 'range handle hover',
        // fundamental-styles' range story puts the handles 0.75px off the pixel grid (its headings), so they
        // anti-alias differently: computed styles only
        pixels: false,
        hover: true,
        ours: {
            story: 'components-slider--standard',
            selector: ours('range slider', ' [data-slot=slider-handle]')
        },
        ref: { story: `${FS}slider--range`, selector: '.fd-slider__handle.is-hover' }
    },
    {
        label: 'range progress',
        ignore: PRESSABLE,
        ours: { story: 'components-slider--standard', selector: ours('range slider', ' [data-slot=slider-range]') },
        ref: { story: `${FS}slider--range`, selector: '.fd-slider--range .fd-slider__track-range' }
    },
    // the outline is outside the element's box: computed styles only
    {
        label: 'range focus',
        ignore: PRESSABLE,
        focus: true,
        pixels: false,
        props: OUTLINE,
        ours: {
            story: 'components-slider--standard',
            selector: ours('range slider', ' [data-slot=slider-focus-range]')
        },
        ref: { story: `${FS}slider--range`, selector: '.fd-slider__track-focus-range.is-focus' }
    },
    {
        label: 'cozy slider',
        ours: { story: 'components-slider--standard', selector: ours('mobile slider') },
        ref: { story: `${FS}slider--mobile-mode`, selector: '.fd-slider--lg' }
    },
    {
        label: 'cozy handle',
        ours: {
            story: 'components-slider--standard',
            selector: ours('mobile slider', ' [data-slot=slider-handle]')
        },
        ref: { story: `${FS}slider--mobile-mode`, selector: '.fd-slider--lg .fd-slider__handle' }
    },
    {
        label: 'ticks',
        ignore: PRESSABLE,
        ours: { story: 'components-slider--ticks', selector: ours('slider with ticks', ' [data-slot=slider-ticks]') },
        ref: { story: `${FS}slider--ticks`, selector: '.fd-slider__ticks' }
    },
    {
        label: 'ticks slider',
        ours: { story: 'components-slider--ticks', selector: ours('slider with ticks') },
        ref: { story: `${FS}slider--ticks`, selector: '.fd-slider' }
    },
    // the inner box: our slider is 16px taller (bottom padding 2rem, as Angular) so that the labels stay inside it;
    // fundamental-styles' labels overflow the slider onto the content below
    {
        label: 'ticks and labels',
        ours: {
            story: 'components-slider--ticks',
            selector: ours('slider with ticks and labels', ' [data-slot=slider-control]')
        },
        ref: { story: `${FS}slider--ticks-and-labels`, selector: '.fd-slider__inner' }
    },
    {
        label: 'labels',
        ours: {
            story: 'components-slider--ticks',
            selector: ours('slider with ticks and labels', ' [data-slot=slider-labels]')
        },
        ref: { story: `${FS}slider--ticks-and-labels`, selector: '.fd-slider__labels' }
    },
    {
        label: 'vertical handle',
        ours: { story: 'components-slider--vertical', selector: ours('Volume', ' [data-slot=slider-handle]') },
        ref: { story: `${FS}slider--vertical-mode`, selector: '.fd-slider--vertical .fd-slider__handle' }
    },
    {
        label: 'vertical track',
        pixels: false,
        // the height follows the container (320px here, 500px there)
        ignore: ['height', ...PRESSABLE],
        ours: { story: 'components-slider--vertical', selector: ours('Volume', ' [data-slot=slider-track]') },
        ref: { story: `${FS}slider--vertical-mode`, selector: '.fd-slider--vertical .fd-slider__track' }
    }
];
