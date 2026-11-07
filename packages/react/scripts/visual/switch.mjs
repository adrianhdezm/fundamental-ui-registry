/** Visual cases for switch; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

/** Our switch label (the clickable `<label>` without text) around the input with this id. */
const ours = (id) => `label:has(#${id})`;
/** The fundamental-styles switch of the n-th form item. */
const ref = (n, extra = '') => `.fd-form-item:nth-child(${n}) .fd-switch${extra}`;

export default [
    {
        label: 'off',
        ours: { story: 'components-switch--sizes', selector: ours('sw-1-input') },
        ref: { story: `${FS}switch--basic`, selector: ref(1) }
    },
    {
        label: 'off hover',
        hover: true,
        ours: { story: 'components-switch--sizes', selector: ours('sw-1-input') },
        ref: { story: `${FS}switch--basic`, selector: ref(1) }
    },
    // the first switch of both stories takes the Tab focus
    {
        label: 'off focus',
        focus: true,
        refFocus: true,
        ours: { story: 'components-switch--sizes', selector: ours('sw-1-input') },
        ref: { story: `${FS}switch--basic`, selector: ref(1) }
    },
    {
        label: 'track',
        ours: { story: 'components-switch--sizes', selector: `${ours('sw-1-input')} [data-slot=switch]` },
        ref: { story: `${FS}switch--basic`, selector: ref(1, ' .fd-switch__slider') }
    },
    {
        label: 'handle',
        ours: { story: 'components-switch--sizes', selector: `${ours('sw-1-input')} [data-slot=switch-handle]` },
        ref: { story: `${FS}switch--basic`, selector: ref(1, ' .fd-switch__handle') }
    },
    {
        label: 'off icon',
        ours: { story: 'components-switch--sizes', selector: `${ours('sw-1-input')} [data-glyph]:last-child` },
        ref: { story: `${FS}switch--basic`, selector: ref(1, ' .fd-switch__icon--off') }
    },
    {
        label: 'disabled',
        ours: { story: 'components-switch--disabled', selector: 'label:has([aria-labelledby=sw-d1])' },
        ref: { story: `${FS}switch--basic`, selector: ref(2) }
    },
    {
        label: 'semantic off',
        ours: { story: 'components-switch--semantic', selector: ours('semantic-switch-1-input') },
        ref: { story: `${FS}switch--semantic-switch`, selector: ref(1) }
    },
    {
        label: 'semantic off hover',
        hover: true,
        ours: { story: 'components-switch--semantic', selector: ours('semantic-switch-1-input') },
        ref: { story: `${FS}switch--semantic-switch`, selector: ref(1) }
    },
    {
        label: 'semantic off icon',
        ours: {
            story: 'components-switch--semantic',
            selector: `${ours('semantic-switch-1-input')} [data-glyph]:last-child`
        },
        ref: { story: `${FS}switch--semantic-switch`, selector: ref(1, ' .fd-switch__icon--off') }
    },
    ...[
        ['text off', 'text-1-input', 1],
        ['text on', 'text-2-input', 2]
    ].flatMap(([label, id, n]) => [
        {
            label,
            ours: { story: 'components-switch--text', selector: ours(id) },
            ref: { story: `${FS}switch--with-text`, selector: ref(n) }
        },
        {
            label: `${label} hover`,
            hover: true,
            ours: { story: 'components-switch--text', selector: ours(id) },
            ref: { story: `${FS}switch--with-text`, selector: ref(n) }
        },
        {
            label: `${label} handle`,
            ours: { story: 'components-switch--text', selector: `${ours(id)} [data-slot=switch-handle]` },
            ref: { story: `${FS}switch--with-text`, selector: ref(n, ' .fd-switch__handle') }
        }
    ]),
    {
        label: 'text',
        ours: {
            story: 'components-switch--text',
            selector: `${ours('text-1-input')} [data-slot=switch-handle] + span`
        },
        ref: { story: `${FS}switch--with-text`, selector: ref(1, ' .fd-switch__text--off') }
    }
];
