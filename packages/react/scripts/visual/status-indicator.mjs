/** Visual cases for status-indicator; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';
const SI = 'components-status-indicator--';

/** Our indicator `nth` of a story. */
const ours = (story, nth, inner = '') => ({
    story: `${SI}${story}`,
    selector: `[role=progressbar] >> nth=${nth}${inner}`
});
/** fundamental-styles' indicator `nth` of a story. */
const ref = (story, nth, inner = '') => ({
    story: `${FS}status-indicator--${story}`,
    selector: `.fd-status-indicator >> nth=${nth}${inner}`
});

const SIZES = ['sm negative 35%', 'md critical 50%', 'lg positive 80%', 'xl neutral 0%'];
const FILLS = ['negative 35%', 'critical 60%', 'positive 100%'];
const LABELS = ['top critical', 'bottom positive', 'left critical', 'right positive'];

export default [
    ...SIZES.map((label, nth) => ({
        label: `size ${label}`,
        ours: ours('sizes', nth),
        ref: ref('sizes', nth),
        // the root colour only shows in the label: ours is the status text colour (text contrast), theirs the
        // element colour; these have no label
        ignore: ['color']
    })),
    ...FILLS.map((label, nth) => ({
        label: `fill ${label}`,
        ours: ours('fill-values', nth),
        ref: ref('fill-values', nth),
        ignore: ['color']
    })),
    ...LABELS.map((label, nth) => ({
        label: `label ${label}`,
        ours: ours('labels', nth),
        ref: ref('status-indicator-labels', nth),
        // the label is in the status text colour, theirs in the element colour, which fails text contrast
        ignore: ['color'],
        pixels: false
    })),
    ...LABELS.map((label, nth) => ({
        label: `label ${label} shape`,
        ours: ours('labels', nth, ' >> svg >> nth=0'),
        ref: ref('status-indicator-labels', nth, ' >> .fd-status-indicator__svg'),
        // the shape is coloured by `fill`; `color` is the label's
        ignore: ['color'],
        // fundamental-styles' left and right examples draw the shape in other view boxes (0 0 36 25, 0 0 16 25),
        // which move it inside the SVG box: their pixels are not comparable
        pixels: nth < 2
    })),
    ...LABELS.map((label, nth) => ({
        label: `label ${label} text`,
        ours: ours('labels', nth, ' >> span'),
        ref: ref('status-indicator-labels', nth, ' >> .fd-status-indicator__label'),
        props: ['margin-top', 'margin-bottom', 'margin-inline-start', 'margin-inline-end'],
        // the status text colour instead of the element colour (text contrast), so the pixels differ too
        ignore: ['color'],
        pixels: false
    })),
    {
        label: 'focus sm',
        focus: true,
        refFocus: true,
        ours: ours('sizes', 0),
        ref: ref('sizes', 0),
        ignore: ['color']
    }
];
