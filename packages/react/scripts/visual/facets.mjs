/** Visual cases for facets; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-dev-';

// The Facet group and Form facet stories use fundamental-styles' texts (Combined and Form Facet Link examples), so
// each facet compares by pixels with its spacing (margins) and layout as computed styles. The group is as wide as
// the story canvas, so it compares by computed style.
const ours = (story, selector) => ({ story: `components-facets--${story}`, selector });
const ref = (story, selector) => ({ story: `${FS}facets--${story}`, selector });
const SPACING = ['margin-bottom', 'margin-inline-end', 'margin-inline-start'];
const LAYOUT = ['display', 'flex-direction', 'align-items', 'order', ...SPACING];

export default [
    {
        label: 'facet group',
        pixels: false,
        // as wide as the canvas; the rating facet wraps to a second line in fundamental-styles, whose Delivery Time
        // facet is 8px wider (the story adds a margin to the object status icon, see the key-value cases)
        ignore: ['width', 'height'],
        props: ['display', 'flex-wrap', 'align-items', 'column-gap', 'row-gap'],
        ours: ours('group', '[role=group][aria-label="Product facets"]'),
        ref: ref('combined', '.fd-facet-group')
    },
    {
        label: 'image facet',
        // without `order`: ours is -1 (Angular's), so the image comes first whatever its place in the source
        props: LAYOUT.filter((p) => p !== 'order'),
        ours: ours('group', '[data-testid=image-facet]'),
        ref: ref('combined', '.fd-facet--image')
    },
    {
        label: 'form facet',
        props: LAYOUT,
        ours: ours('group', '[data-testid=form-facet]'),
        ref: ref('combined', '.fd-facet--form')
    },
    {
        label: 'form facet title',
        props: SPACING,
        ours: ours('group', '[data-testid=form-facet] > [role=heading]'),
        ref: ref('combined', '.fd-facet--form .fd-title')
    },
    {
        label: 'form facet row',
        props: ['display', 'flex-direction', ...SPACING],
        ours: ours('group', '[data-testid=form-facet] > div >> nth=1'),
        ref: ref('combined', '.fd-facet--form .fd-facet__container')
    },
    ...[
        ['status', 3],
        ['time', 4],
        ['option', 5],
        ['price', 6]
    ].map(([name, child]) => ({
        label: `key-value facet (${name})`,
        props: LAYOUT,
        // fundamental-styles' story adds a 0.5rem end margin to the icon of the Delivery Time status (on top of the
        // object status' own 0.25rem gap); our ObjectStatus keeps its gap, so that facet is 8px narrower
        ...(name === 'time' && { pixels: false, ignore: ['width', 'height'] }),
        ours: ours('group', `[data-testid=${name}-facet]`),
        ref: ref('combined', `.fd-facet--key-value:nth-child(${child})`)
    })),
    {
        label: 'rating facet',
        props: LAYOUT,
        ours: ours('group', '[data-testid=rating-facet]'),
        ref: ref('combined', '.fd-facet--rating-indicator')
    },
    {
        label: 'form facet with links',
        props: LAYOUT,
        // fundamental-styles' facet is not in a group, so it is as wide as the canvas
        ignore: ['width'],
        pixels: false,
        ours: ours('form-facets', '[data-testid=contact-facet]'),
        ref: ref('form-facet-link', '.fd-facet--form')
    },
    {
        label: 'form facet row with icon and link',
        props: ['display', 'flex-direction', 'align-items', ...SPACING],
        ignore: ['width'],
        pixels: false,
        ours: ours('form-facets', '[data-testid=contact-facet] > div >> nth=1'),
        ref: ref('form-facet-link', '.fd-facet__container')
    }
];
