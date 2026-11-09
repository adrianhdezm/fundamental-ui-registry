/** Visual cases for avatar-group; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';
const REF_OVERFLOW = `${FS}avatar-group--overflow`;

// Our Individual story shows groups of xs to xl avatars (the s one first with an overflow button); fundamental-styles'
// Overflow story a group of small avatars with a circle "+4". Counts and initials differ: styles only.
const OURS = 'components-avatar-group--individual';
const OVERFLOW = '[data-avatar-group-overflow] [role=button] > span >> nth=0';
const GROUP_AVATAR = '[role=button] [data-avatar-group-item] fd-avatar';

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
    },
    // an avatar of an individual group with details hovers with its own hover colours (avatar-group-2): our s group
    // against fundamental-styles' first Individual Type group, both small bordered circles; other initials: styles
    // only. The focus frame is drawn outside the avatar, where a screenshot of it ends: the spec measures it
    ...[
        ['individual avatar', false],
        ['individual avatar hover', true]
    ].map(([label, hover]) => ({
        label,
        hover,
        pixels: false,
        ignore: ['width'],
        ours: { story: OURS, selector: 'fd-avatar-group >> nth=1 >> [data-avatar-group-item] >> nth=0 >> fd-avatar' },
        ref: {
            story: `${FS}avatar-group--individual-type`,
            selector: '.fd-avatar-group >> nth=0 >> .fd-avatar >> nth=0'
        }
    })),
    // a hovered group-type group hovers each avatar with its own accent's hover colours (avatar-group-3): our story
    // mirrors fundamental-styles' Group Type Interaction States (its hovered group has the is-hover class)
    ...[
        ['group avatar, accent 1 hover', 0, true],
        // next to the image avatar, which shows over or under their corners: fundamental-styles' image does not
        // load in its Storybook, so styles only
        ['group avatar, accent 2 hover', 1, false],
        ['group avatar, accent 3 hover', 3, false]
    ].map(([label, nth, pixels]) => ({
        label,
        hover: true,
        pixels,
        ours: { story: 'components-avatar-group--group-accents', selector: `${GROUP_AVATAR} >> nth=${nth}` },
        ref: {
            story: `${FS}avatar-group--group-type-interaction-states`,
            selector: `.fd-avatar-group.is-hover >> .fd-avatar >> nth=${nth}`
        }
    }))
];
