/** Visual cases for tile; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

const ours = (story, selector) => ({ story: `components-tile--${story}`, selector });
const ref = (story, selector) => ({ story: `${FS}generic-tiles--${story}`, selector });
/**
 * The parts of fundamental-styles' fd-button that ours do not set, around the action glyphs: their borders stay. The
 * lite button background is the page colour in HC (transparent in Horizon), ours transparent: the same look.
 */
const BUTTON_BOX = [
    'background-color',
    'padding-top',
    'padding-bottom',
    'min-height',
    'line-height',
    'font-family',
    'font-size',
    'color',
    'cursor'
];

export default [
    // the 1px lite button border of the action buttons (tile-2); fundamental-styles' tile sits at a fractional x,
    // so the borders anti-alias differently: styles only
    {
        label: 'action close',
        pixels: false,
        ignore: BUTTON_BOX,
        ours: ours('action-mode', 'button[aria-label="Remove Leave requests"]'),
        ref: ref('tile-in-action-mode', '.fd-tile__action-close >> nth=0')
    },
    {
        label: 'action indicator',
        pixels: false,
        ignore: BUTTON_BOX,
        ours: ours('action-mode', 'button[aria-label="More actions for Leave requests"]'),
        ref: ref('tile-in-action-mode', '.fd-tile__action-indicator >> nth=0')
    },
    // line tile hover: the border ring in HC (tile-1). fundamental-styles' line tile border declaration is invalid
    // (no border there, the 1px tile border here): borders and size are not compared
    {
        label: 'line tile hover',
        hover: true,
        pixels: false,
        ignore: [
            'width',
            'height',
            'border-top-width',
            'border-right-width',
            'border-bottom-width',
            'border-left-width',
            'border-top-style',
            'border-top-color',
            'border-right-color',
            'border-bottom-color',
            'border-left-color'
        ],
        ours: ours('line-tile', '[fd-tile] >> nth=0'),
        ref: ref('link-tile', '.fd-tile--line >> nth=0')
    },
    // KPI weight and page dots (tile-3)
    {
        label: 'kpi value',
        pixels: false,
        ignore: ['width'],
        ours: ours('kpi-tile', 'div[fd-numeric-content-kpi] >> nth=0'),
        ref: ref('launch-tile', '.fd-numeric-content__kpi >> nth=0')
    },
    {
        label: 'page dot',
        pixels: false,
        props: ['margin-right', 'margin-left', 'width', 'min-width'],
        ours: ours('slide-tile', '[fd-tile-dot] >> nth=0'),
        ref: ref('slide-tile', '.fd-tile__dot >> nth=0')
    },
    {
        label: 'page dot active',
        pixels: false,
        props: ['width', 'min-width'],
        ours: ours('slide-tile', '[fd-tile-dot][active] >> nth=0'),
        ref: ref('slide-tile', '.fd-tile__dot--active >> nth=0')
    }
];
