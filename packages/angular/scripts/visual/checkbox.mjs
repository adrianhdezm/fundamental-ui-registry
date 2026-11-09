/** Visual cases for checkbox; see ../visual.config.mjs for the fields. Adapted from the React package. */
const FS = 'sap-design-components-';
const STORY = 'components-checkbox--validation-states';

/** Our box in the label with exactly this text. */
const box = (text) => `label:has(:text-is("${text}")) > span[aria-hidden=true]`;
/** The fundamental-styles box of the input with this id. */
const ref = (id) => `label[for="${id}"] .fd-checkbox__checkmark`;

export default [
    {
        label: 'unchecked',
        ours: { story: STORY, selector: box('Default Checkbox') },
        ref: { story: `${FS}forms-checkbox--default`, selector: ref('Ai4ez611') }
    },
    {
        label: 'unchecked hover',
        hover: true,
        ours: { story: STORY, selector: box('Default Checkbox') },
        ref: { story: `${FS}forms-checkbox--default`, selector: ref('Ai4ez611hov') }
    },
    // "Default Checkbox" here, "Normal State" in fundamental-styles: styles only
    {
        label: 'label',
        pixels: false,
        ignore: ['width'],
        props: ['column-gap'],
        ours: { story: STORY, selector: 'label:has(:text-is("Default Checkbox"))' },
        ref: { story: `${FS}forms-checkbox--default`, selector: 'label[for="Ai4ez611"]' }
    },
    // the label text (colour and line height)
    {
        label: 'label text',
        pixels: false,
        ignore: ['width'],
        ours: { story: STORY, selector: 'label:has(:text-is("Default Checkbox")) span:text-is("Default Checkbox")' },
        ref: { story: `${FS}forms-checkbox--default`, selector: 'label[for="Ai4ez611"] .fd-checkbox__text' }
    },
    ...[
        ['error', 'Error', ['Ai4ez6119', 'Ai4ez6129', 'Ai4ez613i1']],
        ['success', 'Success', ['Ai4ez61192', 'Ai4ez61292', 'Ai4ez613i2']],
        ['warning', 'Warning', ['Ai4ez61193', 'Ai4ez61293', 'Ai4ez613i3']],
        ['information', 'Information', ['Ai4ez61194', 'Ai4ez61294', 'Ai4ez613i4']]
    ].flatMap(([state, name, [rest, checked, mixed]]) => [
        {
            label: state,
            ours: { story: STORY, selector: box(`${name} State`) },
            ref: { story: `${FS}forms-checkbox--states`, selector: ref(rest) }
        },
        {
            label: `${state} hover`,
            hover: true,
            ours: { story: STORY, selector: box(`${name} State`) },
            ref: { story: `${FS}forms-checkbox--states`, selector: ref(`${rest}hov`) }
        },
        {
            label: `${state} checked`,
            ours: { story: STORY, selector: box(`${name} Selected State`) },
            ref: { story: `${FS}forms-checkbox--states`, selector: ref(checked) }
        },
        {
            label: `${state} indeterminate`,
            ours: { story: STORY, selector: box(`${name} Tri-State`) },
            ref: { story: `${FS}forms-checkbox--states`, selector: ref(mixed) }
        }
    ])
];
