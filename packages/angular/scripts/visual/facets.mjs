/** Visual cases for facets; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-dev-';

// a case per fixed facet issue (the id in parentheses, as in the fix commit); the texts differ, so by computed style
export default [
    {
        // the 1rem margin under the title (facets-1)
        label: 'form facet title',
        pixels: false,
        props: ['margin-bottom'],
        ignore: ['width', 'height'],
        ours: { story: 'components-facets--form-facet', selector: 'fd-facet >> nth=0 >> > div >> nth=0' },
        ref: { story: `${FS}facets--combined`, selector: '.fd-facet--form .fd-title' }
    },
    {
        // no gap (facets-2) and stretched items (facets-3)
        label: 'form facet row',
        pixels: false,
        props: ['margin-bottom', 'align-items', 'column-gap'],
        ignore: ['width', 'height'],
        ours: { story: 'components-facets--form-facet', selector: 'fd-facet >> nth=0 >> fd-facet-content >> nth=0' },
        ref: { story: `${FS}facets--combined`, selector: '.fd-facet--form .fd-facet__container >> nth=0' }
    }
];
