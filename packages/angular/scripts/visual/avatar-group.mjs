/** Visual cases for avatar-group; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';
const REF_OVERFLOW = `${FS}avatar-group--overflow`;

// Our Individual story shows groups of xs to xl avatars (the s one first with an overflow button); fundamental-styles'
// Overflow story a group of small avatars with a circle "+4". Counts and initials differ: styles only.
const OURS = 'components-avatar-group--individual';
const OVERFLOW = '[data-avatar-group-overflow] [role=button] > span >> nth=0';

export default [
    {
        // button colours, the avatar's font size at a normal weight, the avatar height (avatar-group-1); ours is
        // square by default, theirs a circle, and as wide as another count
        label: 'overflow button',
        pixels: false,
        ignore: [
            'width',
            'border-top-left-radius',
            'border-top-right-radius',
            'border-bottom-right-radius',
            'border-bottom-left-radius'
        ],
        ours: { story: OURS, selector: OVERFLOW },
        ref: { story: REF_OVERFLOW, selector: '.fd-avatar--overflow >> nth=0' }
    },
    {
        label: 'overflow button hover',
        hover: true,
        pixels: false,
        ignore: [
            'width',
            'border-top-left-radius',
            'border-top-right-radius',
            'border-bottom-right-radius',
            'border-bottom-left-radius'
        ],
        ours: { story: OURS, selector: OVERFLOW },
        ref: { story: REF_OVERFLOW, selector: '.fd-avatar--overflow >> nth=0' }
    }
];
