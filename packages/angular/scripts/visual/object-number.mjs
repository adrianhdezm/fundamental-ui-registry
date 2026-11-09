/** Visual cases for object-number; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';
const ON = 'components-object-number--';
const REF = `${FS}object-number--`;

/** fundamental-styles' number with the status `mod`. */
const ref = (mod) => `.fd-object-number--${mod}`;

export default [
    {
        // a positive number: in RTL fundamental-styles lays a minus out after the digits (no bidi isolation), ours
        // keeps it in front (kept on purpose)
        label: 'positive',
        // other digits than fundamental-styles': styles only
        pixels: false,
        ours: { story: `${ON}default`, selector: 'fd-object-number >> nth=2' },
        ref: { story: `${REF}semantic-status`, selector: ref('positive') }
    },
    {
        label: 'large positive',
        pixels: false,
        ours: { story: `${ON}large`, selector: 'fd-object-number >> nth=2' },
        ref: { story: `${REF}large`, selector: ref('positive') }
    }
];
