/** Visual cases for infinite-scroll; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

// The infinite scroll has no visuals of its own: these cases check the list of our Scroll percent story (the
// List rendered as the scroll container) against fundamental-styles' infinite scroll list. Its list is as wide as
// the page and 11rem high, ours `max-w-md` and h-72: styles only, without the sizes.
const OURS = 'components-infinite-scroll--scroll-percent';
const REF = `${FS}list-standard--scroll`;
const item = (n) => `[aria-label="Infinite list"] > li:nth-child(${n})`;

export default [
    {
        label: 'scroll container (list)',
        pixels: false,
        props: ['overflow-y'],
        ignore: ['width', 'height'],
        ours: { story: OURS, selector: '[aria-label="Infinite list"]' },
        ref: { story: REF, selector: '.fd-list' }
    },
    {
        label: 'item',
        pixels: false,
        ignore: ['width'],
        ours: { story: OURS, selector: item(1) },
        ref: { story: REF, selector: '.fd-list > li:nth-child(1)' }
    },
    {
        label: 'item title',
        pixels: false,
        ignore: ['width'],
        ours: { story: OURS, selector: `${item(1)} [data-slot=list-title]` },
        ref: { story: REF, selector: '.fd-list > li:nth-child(1) .fd-list__title' }
    },
    {
        label: 'item hover',
        hover: true,
        pixels: false,
        ignore: ['width'],
        ours: { story: OURS, selector: item(2) },
        ref: { story: REF, selector: '.fd-list > li:nth-child(2)' }
    }
];
