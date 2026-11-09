/** Visual cases for avatar-group; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

// Our "Overflow (fundamental-styles)" story mirrors fundamental-styles' Overflow story (an individual group of four
// small avatars and a circle "+4" button) and its Group Type story (six overlapping medium avatars and "+8").
const OURS = 'components-avatar-group--overflow';
const REF_OVERFLOW = `${FS}avatar-group--overflow`;
const REF_GROUP = `${FS}avatar-group--group-type`;

/** Our individual group, and the avatars of our group-type group (inside the group button). */
const ROW = '[role=list] >> nth=0';
const AVATAR = '[role=list] [data-avatar-group-item] [role=img] >> nth=0';
const OVERFLOW = '[role=list] [data-avatar-group-overflow] > span >> nth=0';
const GROUP_ITEM = (nth) => `[aria-hidden="true"][data-avatar-group-item] > span >> nth=${nth}`;
const GROUP_OVERFLOW = '[aria-hidden="true"][data-avatar-group-overflow] > span >> nth=0';
const REF_GROUP_AVATAR = (nth) => `.fd-avatar-group--group-type >> nth=0 >> .fd-avatar >> nth=${nth}`;

// In RTL fundamental-styles shows the count as "4+" (the "+" is reordered to the end); ours keeps "+4" in a
// <bdi dir="ltr">, as Angular: the overflow button pixels differ there, on purpose.

export default [
    {
        label: 'individual row gap',
        pixels: false,
        // the row hugs its avatars here; fundamental-styles' group is as wide as the page
        ignore: ['width'],
        props: ['column-gap', 'row-gap'],
        ours: { story: OURS, selector: ROW },
        ref: { story: REF_OVERFLOW, selector: '.fd-avatar-group--individual-type >> nth=0' }
    },
    {
        label: 'individual avatar',
        ours: { story: OURS, selector: AVATAR },
        ref: { story: REF_OVERFLOW, selector: '.fd-avatar-group >> nth=0 >> .fd-avatar >> nth=0' }
    },
    {
        label: 'individual avatar hover',
        hover: true,
        ours: { story: OURS, selector: AVATAR },
        ref: { story: REF_OVERFLOW, selector: '.fd-avatar-group >> nth=0 >> .fd-avatar >> nth=0' }
    },
    {
        label: 'overflow button',
        ours: { story: OURS, selector: OVERFLOW },
        ref: { story: REF_OVERFLOW, selector: '.fd-avatar--overflow >> nth=0' }
    },
    {
        label: 'overflow button hover',
        hover: true,
        ours: { story: OURS, selector: OVERFLOW },
        ref: { story: REF_OVERFLOW, selector: '.fd-avatar--overflow >> nth=0' }
    },
    {
        label: 'overflow button focus',
        focus: true,
        refFocus: true,
        ours: { story: OURS, selector: OVERFLOW },
        ref: { story: REF_OVERFLOW, selector: '.fd-avatar--overflow >> nth=0' }
    },
    {
        label: 'group avatar',
        // the second avatar (an icon avatar in both) overlaps the end of the first one
        ours: { story: OURS, selector: GROUP_ITEM(0) },
        ref: { story: REF_GROUP, selector: REF_GROUP_AVATAR(0) }
    },
    {
        label: 'group avatar overlap',
        // the third avatar is a photo, another one in each, over the end of this one
        pixels: false,
        props: ['margin-left', 'margin-right'],
        ours: { story: OURS, selector: GROUP_ITEM(1) },
        ref: { story: REF_GROUP, selector: REF_GROUP_AVATAR(1) }
    },
    {
        label: 'group overflow button',
        // the corners of its box show the photo of the avatar beneath it, another photo in each
        pixels: false,
        props: ['margin-left', 'margin-right'],
        ours: { story: OURS, selector: GROUP_OVERFLOW },
        ref: { story: REF_GROUP, selector: '.fd-avatar-group--group-type >> nth=0 >> .fd-avatar--overflow' }
    }
];
