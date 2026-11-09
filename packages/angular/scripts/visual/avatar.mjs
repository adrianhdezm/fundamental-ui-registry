/** Visual cases for avatar; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

/** Our avatar `nth` of a story, against fundamental-styles' avatar `refNth` of its story. */
const pair = (label, story, nth, refStory, refNth = nth, extra = {}) => ({
    label,
    ours: { story: `components-avatar--${story}`, selector: `[id^="fd-avatar-"] >> nth=${nth}` },
    ref: { story: `${FS}avatar--${refStory}`, selector: `.fd-avatar >> nth=${refNth}` },
    ...extra
});
/** Our Value states story: positive, caution, negative, information; fundamental-styles': negative, caution, … */
const OURS_STATES = ['positive', 'caution', 'negative', 'information'];
const REF_STATES = ['negative', 'caution', 'positive', 'information'];

export default [
    // a border with transparent (avatar-1): the glyphs differ, styles only
    pair('border xs', 'border', 0, 'borders', 0, { pixels: false }),
    pair('border xl', 'border', 4, 'borders', 4, { pixels: false }),
    // a loaded image: the lite background and border (avatar-2); the images differ
    pair('image xl', 'background-image', 4, 'background-image', 5, {
        pixels: false,
        ignore: ['background-image']
    }),
    // value state badges in the state text colours (avatar-3); our story's avatars are l (20px badges), theirs xl
    // (28px), and fundamental-styles' are edit buttons (pointer): colours and borders only
    ...OURS_STATES.map((state, i) => ({
        label: `value state ${state} badge`,
        pixels: false,
        ignore: ['cursor', 'height', 'width', 'font-size', 'line-height'],
        ours: {
            story: 'components-avatar--value-states',
            selector: `[id^="fd-avatar-"] >> nth=${i} >> fd-icon.absolute`
        },
        ref: {
            story: `${FS}avatar--value-states`,
            selector: `.fd-avatar__zoom-icon >> nth=${REF_STATES.indexOf(state) + 1}`
        }
    }))
];
