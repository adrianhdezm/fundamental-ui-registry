/** Visual cases for checkbox; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

const BOX = '[data-slot=checkbox]';
/** Our box in the label with exactly this text. */
const box = (text) => `label:has(:text-is("${text}")) ${BOX}`;
/** The fundamental-styles box of the input with this id. */
const ref = (id) => `label[for="${id}"] .fd-checkbox__checkmark`;

export default [
    {
        label: 'unchecked',
        ours: { story: 'components-checkbox--default', selector: box('Default Checkbox') },
        ref: { story: `${FS}forms-checkbox--default`, selector: ref('Ai4ez611') }
    },
    {
        label: 'unchecked hover',
        hover: true,
        ours: { story: 'components-checkbox--default', selector: box('Default Checkbox') },
        ref: { story: `${FS}forms-checkbox--default`, selector: ref('Ai4ez611hov') }
    },
    {
        label: 'checked',
        ours: { story: 'components-checkbox--default-checked', selector: BOX },
        ref: { story: `${FS}forms-checkbox--default`, selector: ref('Ai4ez612') }
    },
    {
        label: 'indeterminate',
        ours: { story: 'components-checkbox--indeterminate', selector: BOX },
        ref: { story: `${FS}forms-checkbox--default`, selector: ref('Ai4ez613') }
    },
    ...[
        ['disabled', 'Text Option', 'Ai4ez61196'],
        ['disabled checked', 'Selected State', 'Ai4ez61296'],
        ['disabled indeterminate', 'TriState Text', 'Ai4ez613i6']
    ].map(([label, text, id]) => ({
        label,
        ours: { story: 'components-checkbox--disabled', selector: box(text) },
        ref: { story: `${FS}forms-checkbox--states`, selector: ref(id) }
    })),
    // same text in both stories: the whole label, by pixels
    {
        label: 'disabled label',
        props: ['column-gap'],
        ours: { story: 'components-checkbox--disabled', selector: 'label:has(:text-is("Text Option"))' },
        ref: { story: `${FS}forms-checkbox--states`, selector: 'label[for="Ai4ez61196"]' }
    },
    // "Default Checkbox" here, "Normal State" in fundamental-styles: styles only
    {
        label: 'label',
        pixels: false,
        ignore: ['width'],
        props: ['column-gap'],
        ours: { story: 'components-checkbox--default', selector: 'label:has(:text-is("Default Checkbox"))' },
        ref: { story: `${FS}forms-checkbox--default`, selector: 'label[for="Ai4ez611"]' }
    },
    ...[
        ['error', 'Error', ['Ai4ez6119', 'Ai4ez6129', 'Ai4ez613i1']],
        ['success', 'Success', ['Ai4ez61192', 'Ai4ez61292', 'Ai4ez613i2']],
        ['warning', 'Warning', ['Ai4ez61193', 'Ai4ez61293', 'Ai4ez613i3']],
        ['information', 'Information', ['Ai4ez61194', 'Ai4ez61294', 'Ai4ez613i4']]
    ].flatMap(([state, name, [rest, checked, mixed]]) => [
        {
            label: state,
            ours: { story: 'components-checkbox--validation-states', selector: box(`${name} State`) },
            ref: { story: `${FS}forms-checkbox--states`, selector: ref(rest) }
        },
        {
            label: `${state} hover`,
            hover: true,
            ours: { story: 'components-checkbox--validation-states', selector: box(`${name} State`) },
            ref: { story: `${FS}forms-checkbox--states`, selector: ref(`${rest}hov`) }
        },
        {
            label: `${state} checked`,
            ours: { story: 'components-checkbox--validation-states', selector: box(`${name} Selected State`) },
            ref: { story: `${FS}forms-checkbox--states`, selector: ref(checked) }
        },
        {
            label: `${state} indeterminate`,
            ours: { story: 'components-checkbox--validation-states', selector: box(`${name} Tri-State`) },
            ref: { story: `${FS}forms-checkbox--states`, selector: ref(mixed) }
        }
    ]),
    ...[
        ['readonly', 'Readonly label when false', 'Ai4ez611967'],
        ['readonly checked', 'Readonly label when true', 'Ai4ez61296cc'],
        ['readonly indeterminate', 'Readonly label when null (in tristate)', 'Ai4ez613i6cc']
    ].map(([label, text, id]) => ({
        label,
        ours: { story: 'components-checkbox--states', selector: box(text) },
        ref: { story: `${FS}forms-checkbox--states`, selector: ref(id) }
    })),
    {
        label: 'display-only checked',
        ours: { story: 'components-checkbox--states', selector: box('Display-only label') },
        ref: { story: `${FS}forms-checkbox--display-only`, selector: ref('Ai4ez612lwdo') }
    },
    {
        label: 'display-only indeterminate',
        ours: { story: 'components-checkbox--states', selector: box('Display-only tristate label') },
        ref: { story: `${FS}forms-checkbox--display-only`, selector: ref('Ai4ez614ldo') }
    },
    {
        label: 'display-only label',
        pixels: false,
        ignore: ['width'],
        props: ['column-gap'],
        ours: { story: 'components-checkbox--states', selector: 'label:has(:text-is("Display-only label"))' },
        ref: { story: `${FS}forms-checkbox--display-only`, selector: 'label[for="Ai4ez612lwdo"]' }
    },
    // the required asterisk: styles of the text ("Option 1" here, "Required Checkbox" there)
    {
        label: 'required text',
        pixels: false,
        ignore: ['width'],
        ours: {
            story: 'components-checkbox--default',
            selector: 'label:has(:text-is("Option 1")) span:text-is("Option 1")'
        },
        ref: { story: `${FS}forms-checkbox--required`, selector: '.fd-checkbox__text' }
    }
];
