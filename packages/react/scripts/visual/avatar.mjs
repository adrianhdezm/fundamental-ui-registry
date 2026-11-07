/** Visual cases for avatar; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';
const SIZES = ['xs', 's', 'm', 'l', 'xl'];

/** Our avatar `nth` of a story, against fundamental-styles' avatar `refNth` of its story. */
const pair = (label, story, nth, refStory, refNth = nth, extra = {}) => ({
    label,
    ours: { story: `components-avatar--${story}`, selector: `[id^="fd-avatar-"] >> nth=${nth}` },
    ref: { story: `${FS}avatar--${refStory}`, selector: `.fd-avatar >> nth=${refNth}` },
    ...extra
});

/** Clickable avatars of our Interactive states story (regular row). */
const REGULAR = '[role=button]:not([aria-pressed]):not([aria-disabled])';
/** fundamental-styles' Interactive story: the same 26 avatars per state section. */
const INTERACTIVE = [
    ['circle icon xs', 0],
    ['circle icon xl', 4],
    ['initials xs', 5],
    ['initials xl', 9],
    ['placeholder', 10],
    ['tile', 11],
    ['transparent', 13],
    ['transparent border', 14],
    ['transparent border circle', 15],
    ['indication 1', 16],
    ['indication 10', 25]
];

export default [
    ...SIZES.map((size, nth) => pair(`initials ${size}`, 'initials', nth, 'initials')),
    ...SIZES.map((size, nth) => pair(`icon ${size}`, 'icon', nth, 'icon')),
    ...SIZES.map((size, nth) => pair(`icon circle ${size}`, 'icon', nth + 5, 'icon')),
    ...SIZES.map((size, nth) => pair(`initials circle ${size}`, 'circle', nth + 5, 'circle')),
    pair('transparent icon xs', 'transparent', 0, 'transparent'),
    pair('transparent icon xl', 'transparent', 4, 'transparent'),
    pair('transparent initials xs', 'transparent', 5, 'transparent'),
    pair('transparent initials xl', 'transparent', 9, 'transparent'),
    pair('placeholder xs', 'placeholder', 0, 'placeholder-background'),
    pair('placeholder xl', 'placeholder', 4, 'placeholder-background'),
    pair('tile xs', 'tile', 0, 'tile-icon-background'),
    pair('tile xl', 'tile', 4, 'tile-icon-background'),
    ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => pair(`accent ${c}`, 'accent-colors', c - 1, 'accent-colors')),
    ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => pair(`indication ${c}`, 'accent-colors', c + 9, 'accent-colors')),
    pair('border xs', 'border', 0, 'borders'),
    pair('border xl', 'border', 4, 'borders'),
    pair('border circle initials xs', 'border', 5, 'borders'),
    pair('border circle initials xl', 'border', 9, 'borders'),
    // the images differ (fundamental-styles' portraits and landscapes)
    ...[
        ['image circle xs', 0, 0],
        ['image circle xl', 4, 4],
        ['image xl', 9, 5],
        ['image contain', 10, 6]
    ].map(([label, nth, refNth]) =>
        pair(label, 'background-image', nth, 'background-image', refNth, {
            pixels: false,
            ignore: ['background-image']
        })
    ),
    ...SIZES.map((size, nth) => pair(`zoom circle ${size}`, 'zoom-icon', nth, 'badge')),
    ...SIZES.map((size, nth) => pair(`zoom initials ${size}`, 'zoom-icon', nth + 5, 'badge')),
    ...SIZES.map((size, nth) => ({
        label: `zoom badge ${size}`,
        ours: {
            story: 'components-avatar--zoom-icon',
            selector: `[id^="fd-avatar-"] >> nth=${nth} >> [data-glyph].absolute`
        },
        ref: { story: `${FS}avatar--badge`, selector: `.fd-avatar__zoom-icon >> nth=${nth}` }
    })),
    ...['negative', 'caution', 'positive', 'information'].flatMap((state, i) => [
        // fundamental-styles' value state avatars are edit buttons (pointer); ours are images
        pair(`value state ${state}`, 'value-states', i, 'value-states', i + 1, { ignore: ['cursor'] }),
        {
            ignore: ['cursor'],
            label: `value state ${state} badge`,
            ours: {
                story: 'components-avatar--value-states',
                selector: `[id^="fd-avatar-"] >> nth=${i} >> [data-glyph].absolute`
            },
            ref: { story: `${FS}avatar--value-states`, selector: `.fd-avatar__zoom-icon >> nth=${i + 1}` }
        }
    ]),
    ...INTERACTIVE.flatMap(([label, nth]) =>
        [
            {
                label: `interactive ${label}`,
                ours: { story: 'components-avatar--interactive-states', selector: `${REGULAR} >> nth=${nth}` },
                ref: { story: `${FS}avatar--interactive`, selector: `.fd-avatar >> nth=${nth}` }
            },
            {
                label: `interactive ${label} hover`,
                hover: true,
                ours: { story: 'components-avatar--interactive-states', selector: `${REGULAR} >> nth=${nth}` },
                ref: { story: `${FS}avatar--interactive`, selector: `.fd-avatar.is-hover >> nth=${nth}` }
            },
            {
                // fundamental-styles' "Active/Toggled" state: our aria-pressed avatars
                label: `interactive ${label} toggled`,
                ours: { story: 'components-avatar--interactive-states', selector: `[aria-pressed=true] >> nth=${nth}` },
                ref: {
                    story: `${FS}avatar--interactive`,
                    selector: `.fd-avatar.is-active:not(.is-hover) >> nth=${nth}`
                }
            },
            // fundamental-styles has no disabled indication colours
            nth < 16 && {
                label: `interactive ${label} disabled`,
                ours: {
                    story: 'components-avatar--interactive-states',
                    selector: `[aria-disabled=true] >> nth=${nth}`
                },
                ref: { story: `${FS}avatar--interactive`, selector: `.fd-avatar.is-disabled >> nth=${nth}` }
            },
            {
                label: `interactive ${label} focus`,
                focus: true,
                ours: { story: 'components-avatar--interactive-states', selector: `${REGULAR} >> nth=${nth}` },
                ref: { story: `${FS}avatar--interactive`, selector: `.fd-avatar.is-focus >> nth=${nth}` }
            }
        ].filter(Boolean)
    ),
    pair('interactive image', 'interactive-states', 12, 'interactive', 12, {
        pixels: false,
        ignore: ['background-image']
    })
];
