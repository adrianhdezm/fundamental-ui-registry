/** Visual cases for file-uploader; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';
const PRIMARY = `${FS}file-uploader--primary`;
const STATUS = `${FS}file-uploader--status`;
const FIELD = 'input[type=text]';

export default [
    {
        label: 'uploader',
        ours: { story: 'components-file-uploader--default', selector: '[data-slot=file-uploader-dragndrop]' },
        ref: { story: PRIMARY, selector: '.fd-file-uploader__container' }
    },
    {
        label: 'field',
        ours: { story: 'components-file-uploader--default', selector: FIELD },
        ref: { story: PRIMARY, selector: '#browse_input1' }
    },
    {
        label: 'field hover',
        hover: true,
        ours: { story: 'components-file-uploader--default', selector: FIELD },
        ref: { story: PRIMARY, selector: '#browse_input1' }
    },
    {
        label: 'field focus',
        focus: true,
        refFocus: true,
        ours: { story: 'components-file-uploader--default', selector: FIELD },
        ref: { story: PRIMARY, selector: '#browse_input1' }
    },
    {
        label: 'button',
        ours: { story: 'components-file-uploader--default', selector: 'button:has-text("Browse...")' },
        ref: { story: PRIMARY, selector: '#file-uploader-button-1' }
    },
    {
        label: 'button hover',
        hover: true,
        ours: { story: 'components-file-uploader--default', selector: 'button:has-text("Browse...")' },
        ref: { story: PRIMARY, selector: '#file-uploader-button-1' }
    },
    {
        label: 'field with a file',
        ours: { story: 'components-file-uploader--selected', selector: FIELD },
        ref: { story: `${FS}file-uploader--selected`, selector: '#browse_input2' }
    },
    ...[
        ['success', 0, '#browse_input7'],
        ['error', 1, '#browse_input4'],
        ['warning', 2, '#browse_input5'],
        ['information', 3, '#browse_input3']
    ].flatMap(([state, index, ref]) => [
        {
            label: `field ${state}`,
            ours: { story: 'components-file-uploader--states', selector: `${FIELD} >> nth=${index}` },
            ref: { story: STATUS, selector: ref }
        },
        {
            label: `field ${state} hover`,
            hover: true,
            ours: { story: 'components-file-uploader--states', selector: `${FIELD} >> nth=${index}` },
            ref: { story: STATUS, selector: ref }
        }
    ])
];
