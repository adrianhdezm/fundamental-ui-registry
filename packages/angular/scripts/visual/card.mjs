/** Visual cases for card; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

export default [
    {
        label: 'title',
        // other texts than fundamental-styles': styles only
        pixels: false,
        ignore: ['width'],
        ours: { story: 'components-card--standard', selector: '[fd-card-title] >> nth=0' },
        ref: { story: `${FS}card-card--card-anatomy`, selector: '.fd-card__title >> nth=0' }
    },
    // the counter (card-2) and badges (card-3): the texts differ, so by computed style with the heights
    {
        label: 'counter',
        pixels: false,
        // our story's first counter is a positive one in an interactive header: its colour and cursor
        ignore: ['width', 'color', 'cursor'],
        ours: { story: 'components-card--standard', selector: '[fd-card-counter] >> nth=0' },
        ref: { story: `${FS}card-card--card-anatomy`, selector: '.fd-card__counter >> nth=0' }
    },
    {
        label: 'badge',
        pixels: false,
        ignore: [
            'width',
            'background-color',
            'color',
            'border-top-color',
            'border-right-color',
            'border-bottom-color',
            'border-left-color'
        ],
        ours: { story: 'components-card--standard', selector: '[data-card-badges] > * >> nth=0' },
        ref: { story: `${FS}card-card--card-anatomy`, selector: '.fd-card__badge >> nth=0' }
    },
    {
        // the banner keeps its 1px ring in HC (card-5)
        label: 'banner',
        pixels: false,
        ignore: ['width', 'height'],
        ours: { story: 'components-card--banner', selector: 'fd-card >> nth=0' },
        ref: { story: `${FS}card-media-card--card-media-banner`, selector: '.fd-card--banner >> nth=0' }
    }
];
