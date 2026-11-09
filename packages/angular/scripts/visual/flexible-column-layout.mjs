/** Visual cases for flexible-column-layout; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-layouts-';

const ours = (story, selector) => ({ story: `components-flexible-column-layout--${story}`, selector });
const ref = (story, selector) => ({ story: `${FS}flexible-column--${story}`, selector });
const SEPARATOR = 'fd-flexible-column-layout > div:has(> button)';
const BUTTON = `${SEPARATOR} > button`;

export default [
    {
        label: 'separator button',
        // the button is transparent: our Three columns story's separators are transparent, fundamental-styles' solid,
        // so the backdrop differs; styles only (size, colours, borders)
        pixels: false,
        ours: ours('three-columns', `${BUTTON} >> nth=0`),
        ref: ref('three-columns-layout', '.fd-flexible-column-layout__button >> nth=0')
    },
    {
        // no column borders in HC (flexible-column-layout-3)
        label: 'mid column',
        pixels: false,
        props: ['visibility'],
        ignore: ['width', 'height'],
        ours: ours('three-columns', 'fd-flexible-column-layout > div:not(:has(> button)) >> nth=1'),
        ref: ref('three-columns-layout', '.fd-flexible-column-layout__column >> nth=1')
    }
];
