/** Visual cases for switch; see ../visual.config.mjs for the fields. Adapted from the React package. */
const FS = 'sap-design-components-';

/** Our switch label (the clickable `<label>`, its text span empty) around the input labelled by this id. */
const ours = (id) => `label:has(input[aria-labelledby~="${id}"])`;
/** Its track (the slider) and handle. */
const TRACK = '> span > span';
const HANDLE = 'span[role=presentation]';
/** The fundamental-styles switch of the n-th form item. */
const ref = (n, extra = '') => `.fd-form-item:nth-child(${n}) .fd-switch${extra}`;

export default [
    // the whole label by pixels: also checks that the empty text span takes no room (switch-3)
    {
        label: 'off',
        ours: { story: 'components-switch--sizes', selector: ours('sw-1') },
        ref: { story: `${FS}switch--basic`, selector: ref(1) }
    },
    {
        label: 'off hover',
        hover: true,
        ours: { story: 'components-switch--sizes', selector: ours('sw-1') },
        ref: { story: `${FS}switch--basic`, selector: ref(1) }
    },
    {
        label: 'off focus',
        focus: true,
        refFocus: true,
        ours: { story: 'components-switch--sizes', selector: ours('sw-1') },
        ref: { story: `${FS}switch--basic`, selector: ref(1) }
    },
    {
        label: 'track',
        ours: { story: 'components-switch--sizes', selector: `${ours('sw-1')} ${TRACK}` },
        ref: { story: `${FS}switch--basic`, selector: ref(1, ' .fd-switch__slider') }
    },
    {
        label: 'track hover',
        hover: true,
        ours: { story: 'components-switch--sizes', selector: `${ours('sw-1')} ${TRACK}` },
        ref: { story: `${FS}switch--basic`, selector: ref(1, ' .fd-switch__slider') }
    },
    {
        label: 'handle',
        ours: { story: 'components-switch--sizes', selector: `${ours('sw-1')} ${HANDLE}` },
        ref: { story: `${FS}switch--basic`, selector: ref(1, ' .fd-switch__handle') }
    },
    {
        label: 'disabled',
        ours: { story: 'components-switch--disabled', selector: ours('sw-d1') },
        ref: { story: `${FS}switch--basic`, selector: ref(2) }
    },
    {
        label: 'semantic off',
        ours: { story: 'components-switch--semantic', selector: ours('semantic-switch-1') },
        ref: { story: `${FS}switch--semantic-switch`, selector: ref(1) }
    },
    {
        label: 'semantic off hover',
        hover: true,
        ours: { story: 'components-switch--semantic', selector: ours('semantic-switch-1') },
        ref: { story: `${FS}switch--semantic-switch`, selector: ref(1) }
    },
    ...[
        ['text off', 'text-1', 1],
        ['text on', 'text-2', 2]
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
            ours: { story: 'components-switch--text', selector: `${ours(id)} ${HANDLE}` },
            ref: { story: `${FS}switch--with-text`, selector: ref(n, ' .fd-switch__handle') }
        }
    ])
];
