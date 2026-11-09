/** Visual cases for radio; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

/** Our label with exactly this text (the circle and the text, as fundamental-styles' label with its ::before). */
const label = (text) => `label:has(> span:text-is("${text}"))`;
/** The fundamental-styles label of the input with this id. */
const ref = (id) => `label[for="${id}"]`;

const STATES = [
    ['default', 'Default', 'iSpDidh761'],
    ['success', 'Success', 'iSpDidh7612'],
    ['error', 'Error', 'iSpDidh7613'],
    ['warning', 'Warning', 'iSpDidh7614'],
    ['information', 'Information', 'iSpDidh7615'],
    ['readonly', 'ReadOnly', 'iSpDidh76erfg15']
];

export default [
    ...[
        ['checked', 'Option 1', 'pDidh761'],
        ['unchecked', 'Option 2', 'pDidh7612'],
        ['disabled', 'Option 3 (disabled)', 'pDidh764']
    ].map(([name, text, id]) => ({
        label: name,
        ours: { story: 'components-radio--default', selector: label(text) },
        ref: { story: `${FS}forms-radio--primary`, selector: ref(id) }
    })),
    // keyboard focus on the checked radio, the first tab stop of both stories
    {
        label: 'focus',
        focus: true,
        refFocus: true,
        ours: { story: 'components-radio--default', selector: label('Option 1') },
        ref: { story: `${FS}forms-radio--primary`, selector: ref('pDidh761') }
    },
    {
        label: 'text',
        ours: { story: 'components-radio--default', selector: `${label('Option 2')} > span:not([data-slot])` },
        ref: { story: `${FS}forms-radio--primary`, selector: `${ref('pDidh7612')} .fd-radio__text` }
    },
    {
        label: 'inline group',
        ours: { story: 'components-radio--inline', selector: '[role=radiogroup]' },
        ref: { story: `${FS}forms-radio--inline`, selector: '.fd-form-group--inline' }
    },
    ...STATES.flatMap(([state, name, id]) => [
        {
            label: state,
            ours: { story: 'components-radio--validation-states', selector: label(`${name} Radio Button`) },
            ref: { story: `${FS}forms-radio--interaction-states`, selector: ref(id) }
        },
        {
            label: `${state} checked`,
            ours: { story: 'components-radio--validation-states', selector: label(`${name} Checked Radio Button`) },
            ref: { story: `${FS}forms-radio--interaction-states`, selector: ref(`${id}cc`) }
        },
        {
            label: `${state} hover`,
            hover: true,
            ours: { story: 'components-radio--validation-states', selector: label(`${name} Hover Radio Button`) },
            ref: { story: `${FS}forms-radio--interaction-states`, selector: ref(`${id}hov`) }
        }
    ]),
    ...[
        ['disabled default', 'Disabled Radio Button', 'iSpDidh7611'],
        ['disabled success', 'Success Radio Button (disabled)', 'iSpDidh76121'],
        ['disabled error', 'Error Radio Button (disabled)', 'iSpDidh76131'],
        ['disabled warning', 'Warning Radio Button (disabled)', 'iSpDidh76141'],
        ['disabled information', 'Information Radio Button (disabled)', 'iSpDidh76151']
    ].map(([name, text, id]) => ({
        label: name,
        ours: { story: 'components-radio--validation-states', selector: label(text) },
        ref: { story: `${FS}forms-radio--interaction-states`, selector: ref(id) }
    })),
    ...[
        ['truncated', 'pDidh761tt', 'Truncated'],
        ['wrapped', 'pDidh7612tt', 'Wrapped'],
        ['wrapped top', 'pDidh7612ttop', 'Wrapped, top aligned']
    ].map(([name, id, group]) => ({
        label: name,
        ours: { story: 'components-radio--label-wrapping', selector: `[aria-label="${group}"] label` },
        ref: { story: `${FS}forms-radio--text-truncation`, selector: ref(id) }
    }))
];
