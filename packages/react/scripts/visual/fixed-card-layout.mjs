/** Visual cases for fixed-card-layout; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

// Our Responsive columns story (Angular's cards) against fundamental-styles' Fixed Card Layout story (its list,
// object and table cards), both in three columns at 1280px. The layout draws nothing of its own: its container and
// card places compare by computed style, without the sizes (the cards and so the column heights differ); the cards
// themselves are compared in the card's cases.
const OURS = 'components-fixed-card-layout--default';
const REF = `${FS.replace('components-', 'layouts-')}fixed-card-layout--fixed-card-layout`;
const FLEX = ['display', 'flex-direction', 'flex-wrap', 'align-items', 'justify-content'];
const PLACE = ['order', 'min-width', 'margin-top', 'margin-left', 'margin-right', 'flex-basis'];
const SLOT = '[data-fixed-card-layout-slot]';

export default [
    {
        label: 'card layout (wrapping flex column)',
        pixels: false,
        props: [...FLEX, 'margin-top', 'margin-left', 'margin-right'],
        ignore: ['width', 'height'],
        ours: { story: OURS, selector: `div:has(> ${SLOT})` },
        ref: { story: REF, selector: '.fd-fixed-card-layout__card-layout' }
    },
    {
        label: 'card place, first column',
        pixels: false,
        props: PLACE,
        ignore: ['width', 'height'],
        ours: { story: OURS, selector: `${SLOT} >> nth=0` },
        ref: { story: REF, selector: '.fd-fixed-card-layout__card >> nth=0' }
    },
    {
        label: 'card place, second column',
        pixels: false,
        props: PLACE,
        ignore: ['width', 'height'],
        ours: { story: OURS, selector: `${SLOT} >> nth=1` },
        ref: { story: REF, selector: '.fd-fixed-card-layout__card >> nth=1' }
    },
    {
        label: 'card place, third column',
        pixels: false,
        props: PLACE,
        ignore: ['width', 'height'],
        ours: { story: OURS, selector: `${SLOT} >> nth=2` },
        ref: { story: REF, selector: '.fd-fixed-card-layout__card >> nth=2' }
    },
    {
        label: 'card in its place',
        pixels: false,
        props: ['display', 'flex-direction'],
        ignore: ['width', 'height'],
        ours: { story: OURS, selector: `${SLOT} >> nth=0 >> [role=region]` },
        ref: { story: REF, selector: '.fd-fixed-card-layout__card >> nth=0 >> .fd-card' }
    }
];
