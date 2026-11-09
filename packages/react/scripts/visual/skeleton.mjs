/** Visual cases for skeleton; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

// the visual script stops CSS animations, so the shimmer's middle stop keeps the base colour on both sides
const STORY = 'components-skeleton--types';

export default [
    {
        label: 'rectangle',
        ours: { story: STORY, selector: '.inline-block >> nth=0' },
        ref: { story: `${FS}skeleton--skeleton`, selector: '.fd-skeleton' }
    },
    {
        label: 'rectangle, not animated',
        ours: { story: STORY, selector: '.inline-block >> nth=1' },
        ref: { story: `${FS}skeleton--skeleton`, selector: '.fd-skeleton' }
    },
    {
        label: 'circle (width only)',
        ours: { story: STORY, selector: '.inline-block >> nth=2' },
        ref: { story: `${FS}skeleton--circle`, selector: '.fd-skeleton' }
    },
    {
        label: 'circle (height only), not animated',
        ours: { story: STORY, selector: '.inline-block >> nth=3' },
        ref: { story: `${FS}skeleton--circle`, selector: '.fd-skeleton' }
    },
    {
        label: 'text, 3 lines',
        ours: { story: STORY, selector: '.inline-block >> nth=4' },
        ref: { story: `${FS}skeleton--lines`, selector: '.fd-skeleton >> nth=0' }
    },
    {
        label: 'text, 3 lines, not animated',
        ours: { story: STORY, selector: '.inline-block >> nth=5' },
        ref: { story: `${FS}skeleton--lines`, selector: '.fd-skeleton >> nth=0' }
    },
    {
        label: 'text, 2 lines',
        // fundamental-styles' story gives its 2 lines a fixed 60px height; ours is as high as the lines (40px),
        // as Angular's and fundamental-ngx's, so only the lines' box is compared
        pixels: false,
        ignore: ['height'],
        ours: { story: STORY, selector: '.inline-block >> nth=6' },
        ref: { story: `${FS}skeleton--lines`, selector: '.fd-skeleton >> nth=1' }
    },
    {
        label: 'custom shapes',
        ours: { story: 'components-skeleton--custom', selector: '.inline-block' },
        ref: { story: `${FS}skeleton--complex-examples`, selector: '.fd-skeleton' }
    }
];
