/** Visual cases for carousel; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';
const BOTTOM = `${FS}carousel--carousel-bottom`;
const TOP = `${FS}carousel--carousel-top`;
const BACKGROUNDS = `${FS}carousel--carousel-backgrounds`;

const OURS = 'components-carousel--page-indicators';
/** Our page indicator bar of the carousel `#<id>`: the parent of the dots (or the numbers) and the buttons. */
const bar = (id, inner = '[role=img]') => `#${id} div:has(> div > ${inner})`;
/** The slides area of our carousel `#<id>`. */
const content = (id) => `#${id} div:has(> [data-carousel-list])`;
/** fundamental-styles' n-th page indicator bar. */
const fsBar = (n) => `.fd-carousel__page-indicator-container >> nth=${n}`;

export default [
    // the bars: the fifth of seven dots active, the buttons in the bar
    {
        label: 'bottom bar',
        ours: { story: OURS, selector: bar('ci-bottom') },
        ref: { story: BOTTOM, selector: fsBar(0) }
    },
    {
        label: 'bottom bar vertical',
        ours: { story: OURS, selector: bar('ci-vertical') },
        ref: { story: BOTTOM, selector: fsBar(1) },
        // fundamental-styles' vertical example has an `<ol>` of `<li>` dots (with the list's own margins) where its
        // other examples have `<span>`s: its bar is 8px higher. Styles only, without the height
        pixels: false,
        ignore: ['height']
    },
    {
        label: 'bottom bar, buttons in the content',
        ours: { story: OURS, selector: bar('ci-content') },
        ref: { story: BOTTOM, selector: fsBar(2) }
    },
    {
        label: 'numeric bar',
        ours: { story: OURS, selector: bar('ci-numeric', '[dir=ltr]') },
        ref: { story: BOTTOM, selector: fsBar(4) }
    },
    {
        label: 'top bar',
        ours: { story: OURS, selector: bar('ci-top') },
        ref: { story: TOP, selector: fsBar(0) }
    },
    {
        label: 'top numeric bar',
        ours: { story: OURS, selector: bar('ci-top-numeric', '[dir=ltr]') },
        ref: { story: TOP, selector: fsBar(2) }
    },
    // the parts
    {
        label: 'dots',
        ours: { story: OURS, selector: '#ci-bottom div:has(> [role=img])' },
        ref: { story: BOTTOM, selector: '.fd-carousel__page-indicators >> nth=0' }
    },
    {
        label: 'dot',
        ours: { story: OURS, selector: '#ci-bottom [role=img] >> nth=0' },
        ref: { story: BOTTOM, selector: '.fd-carousel__page-indicator >> nth=0' },
        props: ['margin-left', 'margin-right']
    },
    {
        label: 'active dot',
        ours: { story: OURS, selector: '#ci-bottom [role=img] >> nth=4' },
        ref: { story: BOTTOM, selector: '.fd-carousel__page-indicator--active >> nth=0' },
        props: ['margin-left', 'margin-right']
    },
    {
        label: 'numbers',
        ours: { story: OURS, selector: '#ci-numeric [dir=ltr]' },
        ref: {
            story: BOTTOM,
            selector: '.fd-carousel__page-indicator-container >> nth=4 >> .fd-carousel__page-indicators'
        },
        // ours is the text in the indicators box (Angular's markup), theirs the box with the text: styles only
        pixels: false,
        ignore: ['width', 'height', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'display']
    },
    ...[
        ['previous', 'Go to previous item', 0],
        ['next', 'Go to next item', 1]
    ].flatMap(([name, label, n]) => [
        {
            label: `${name} button`,
            ours: { story: OURS, selector: `#ci-bottom button[aria-label="${label}"]` },
            ref: { story: BOTTOM, selector: `${fsBar(0)} >> button >> nth=${n}` },
            props: ['margin-left', 'margin-right']
        },
        {
            label: `${name} button hover`,
            hover: true,
            ours: { story: OURS, selector: `#ci-bottom button[aria-label="${label}"]` },
            ref: { story: BOTTOM, selector: `${fsBar(0)} >> button >> nth=${n}` }
        },
        {
            label: `${name} button focus`,
            focus: true,
            refFocus: true,
            ours: { story: OURS, selector: `#ci-bottom button[aria-label="${label}"]` },
            ref: { story: BOTTOM, selector: `${fsBar(0)} >> button >> nth=${n}` }
        }
    ]),
    {
        label: 'content',
        ours: { story: OURS, selector: content('ci-content') },
        ref: { story: BOTTOM, selector: '.fd-carousel__content >> nth=2' },
        // their image does not load (placehold.co): styles only, without the height
        pixels: false,
        ignore: ['height']
    },
    // backgrounds: Angular's story has three slides of 25rem, fundamental-styles' seven of 20rem: styles only
    ...[
        ['transparent content', 0, '.fd-carousel__content--transparent'],
        ['solid content', 1, '.fd-carousel__content--solid >> nth=0']
    ].map(([label, n, ref]) => ({
        label,
        ours: { story: 'components-carousel--backgrounds', selector: content(`ci-background-${n}`) },
        ref: { story: BACKGROUNDS, selector: ref },
        pixels: false,
        ignore: ['width', 'height']
    })),
    ...[
        ['transparent bar', 2, '.fd-carousel__page-indicator-container--transparent'],
        ['translucent bar', 3, '.fd-carousel__page-indicator-container--translucent'],
        ['bar without a border', 4, '.fd-carousel__page-indicator-container--no-border']
    ].map(([label, n, ref]) => ({
        label,
        ours: { story: 'components-carousel--backgrounds', selector: bar(`ci-background-${n}`) },
        ref: { story: BACKGROUNDS, selector: ref },
        pixels: false,
        // our bars have the buttons and three dots, theirs seven dots and buttons or none
        ignore: ['width', 'height']
    }))
];
