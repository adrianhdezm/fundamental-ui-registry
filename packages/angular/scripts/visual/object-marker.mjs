/** Visual cases for object-marker; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';
const OM = 'components-object-marker--default';
const REF = `${FS}object-marker--`;
const MARKER = '[fd-object-marker]';

export default [
    // the gap of a mirrored glyph stays between the icon and the label in RTL (object-marker-1); in RTL the request
    // glyph is mirrored by our icon (UI5 marks it so) and drawn unmirrored by fundamental-styles: 6% of pixels there
    {
        label: 'icon and text request',
        ours: { story: OM, selector: `${MARKER} >> nth=11` },
        ref: { story: `${REF}icon-and-text`, selector: '.fd-object-marker >> nth=0' }
    },
    // clickable markers have a normal line height (object-marker-2); "Unsaved changes" against "Unsaved Changes"
    {
        label: 'clickable',
        pixels: false,
        ignore: ['width'],
        ours: { story: OM, selector: `${MARKER} >> nth=12` },
        ref: { story: `${REF}clickable-object-marker`, selector: '.fd-object-marker >> nth=1' }
    }
];
