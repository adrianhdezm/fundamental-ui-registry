/** Visual cases for object-identifier; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';
const OI = 'components-object-identifier--';
const REF = `${FS}object-identifier--`;

/** Our nth identifier in the story. */
const identifier = (nth) => `div:has(> p[id$="-title"]) >> nth=${nth}`;
const title = (nth) => `p[id$="-title"] >> nth=${nth}`;
const text = (nth) => `p[id$="-text"] >> nth=${nth}`;

export default [
    // plain titles
    {
        label: 'title',
        ours: { story: `${OI}default`, selector: identifier(0) },
        ref: { story: `${REF}title-only`, selector: '.fd-object-identifier' }
    },
    {
        label: 'title text',
        ours: { story: `${OI}default`, selector: title(0) },
        ref: { story: `${REF}title-only`, selector: '.fd-object-identifier__title' }
    },
    {
        label: 'bold title text',
        ours: { story: `${OI}default`, selector: title(1) },
        ref: { story: `${REF}bold-title`, selector: '.fd-object-identifier__title--bold' }
    },
    // with a description
    {
        label: 'title and description',
        ours: { story: `${OI}default`, selector: identifier(2) },
        ref: { story: `${REF}title-and-text`, selector: '.fd-object-identifier >> nth=0' }
    },
    {
        label: 'description',
        ours: { story: `${OI}default`, selector: text(0) },
        ref: { story: `${REF}title-and-text`, selector: '.fd-object-identifier__text >> nth=0' }
    },
    {
        label: 'bold title and description',
        ours: { story: `${OI}default`, selector: identifier(3) },
        ref: { story: `${REF}title-and-text`, selector: '.fd-object-identifier >> nth=1' }
    },
    // links
    {
        label: 'link title',
        ours: { story: `${OI}with-link`, selector: title(0) },
        ref: { story: `${REF}title-as-link`, selector: '.fd-object-identifier__title >> nth=0' }
    },
    {
        label: 'link',
        ours: { story: `${OI}with-link`, selector: 'a >> nth=0' },
        ref: { story: `${REF}title-as-link`, selector: '.fd-object-identifier__link >> nth=0' }
    },
    {
        label: 'link hover',
        hover: true,
        ours: { story: `${OI}with-link`, selector: 'a >> nth=0' },
        ref: { story: `${REF}title-as-link`, selector: '.fd-object-identifier__link >> nth=0' }
    },
    {
        label: 'link focus',
        focus: true,
        refFocus: true,
        ours: { story: `${OI}with-link`, selector: 'a >> nth=0' },
        ref: { story: `${REF}title-as-link`, selector: '.fd-object-identifier__link >> nth=0' }
    },
    {
        label: 'bold link',
        ours: { story: `${OI}with-link`, selector: 'a >> nth=1' },
        ref: { story: `${REF}title-as-link`, selector: '.fd-object-identifier__link >> nth=1' }
    },
    {
        label: 'link with description',
        ours: { story: `${OI}with-link`, selector: identifier(2) },
        ref: { story: `${REF}title-and-text`, selector: '.fd-object-identifier >> nth=2' }
    },
    {
        label: 'bold link with description',
        ours: { story: `${OI}with-link`, selector: identifier(3) },
        ref: { story: `${REF}title-and-text`, selector: '.fd-object-identifier >> nth=3' }
    },
    // medium
    {
        label: 'medium',
        ours: { story: `${OI}medium`, selector: identifier(0) },
        ref: { story: `${REF}medium-size`, selector: '.fd-object-identifier' }
    },
    {
        label: 'medium title text',
        ours: { story: `${OI}medium`, selector: title(0) },
        ref: { story: `${REF}medium-size`, selector: '.fd-object-identifier__title' }
    },
    {
        label: 'medium description',
        ours: { story: `${OI}medium`, selector: text(0) },
        ref: { story: `${REF}medium-size`, selector: '.fd-object-identifier__text' }
    },
    {
        label: 'medium in a table',
        pixels: false, // the table's texts are not fundamental-styles'
        ours: { story: `${OI}medium`, selector: `table >> ${title(0)}` },
        ref: { story: `${REF}medium-size`, selector: '.fd-object-identifier__title' },
        ignore: ['width'] // a table cell, not the full width
    }
];
