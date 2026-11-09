/** Visual cases for link; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

export default [
    {
        label: 'emphasized',
        // other texts than fundamental-styles' ("Emphasized link"): styles only
        pixels: false,
        ignore: ['width'],
        ours: { story: 'components-link--visual-modifiers', selector: 'a[emphasized]' },
        ref: { story: `${FS}link--primary`, selector: '.fd-link--emphasized >> nth=0' }
    },
    {
        // underlined at rest: the underline offset is visible
        label: 'subtle',
        pixels: false,
        ignore: ['width'],
        ours: { story: 'components-link--visual-modifiers', selector: 'a[subtle]:not([undecorated])' },
        ref: { story: `${FS}link--primary`, selector: '.fd-link--subtle >> nth=0' }
    }
];
