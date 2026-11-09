/** Visual cases for radio; see ../visual.config.mjs for the fields. Adapted from the React package. */
const FS = 'sap-design-components-';
const STORY = 'components-radio-button--validation-states';

/** Our label with exactly this text (the circle is its ::before, as fundamental-styles' label). */
const label = (text) => `label:has(> span:text-is("${text}"))`;
/** The fundamental-styles label of the input with this id. */
const ref = (id) => `label[for="${id}"]`;

const STATES = [
    ['default', 'Default', 'iSpDidh761'],
    ['success', 'Success', 'iSpDidh7612'],
    ['error', 'Error', 'iSpDidh7613'],
    ['warning', 'Warning', 'iSpDidh7614'],
    ['information', 'Information', 'iSpDidh7615']
];

export default [
    // the label text (colour and line height); the texts differ: styles only
    {
        label: 'text',
        pixels: false,
        ignore: ['width'],
        ours: { story: STORY, selector: `${label('Default Radio Button')} > span` },
        ref: { story: `${FS}forms-radio--primary`, selector: `${ref('pDidh7612')} .fd-radio__text` }
    },
    ...STATES.flatMap(([state, name, id]) => [
        {
            label: state,
            ours: { story: STORY, selector: label(`${name} Radio Button`) },
            ref: { story: `${FS}forms-radio--interaction-states`, selector: ref(id) }
        },
        {
            label: `${state} checked`,
            ours: { story: STORY, selector: label(`${name} Checked Radio Button`) },
            ref: { story: `${FS}forms-radio--interaction-states`, selector: ref(`${id}cc`) }
        },
        {
            label: `${state} hover`,
            hover: true,
            ours: { story: STORY, selector: label(`${name} Hover Radio Button`) },
            ref: { story: `${FS}forms-radio--interaction-states`, selector: ref(`${id}hov`) }
        }
    ])
];
