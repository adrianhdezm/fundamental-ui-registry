/** Visual cases for timeline; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

// fundamental-styles has no timeline: its look comes from fundamental-ngx's own timeline styles, so the line, nodes
// and post layout have no reference here (check them against the fundamental-ngx documentation in Storybook). These
// cases check the fundamental-styles parts of a post: the header avatar, the post text and its More toggle.
const VERTICAL = 'components-timeline--vertical';
const COLLAPSED = 'components-timeline--vertical-left';
const MORE = '[role=listitem] button:has-text("More") >> nth=0';

export default [
    // the initials differ (fundamental-styles' story shows other names): styles only
    {
        label: 'header avatar (circle xs)',
        pixels: false,
        ours: { story: VERTICAL, selector: '[role=listitem] [id^="fd-avatar-"] >> nth=0' },
        ref: { story: `${FS}avatar--circle`, selector: '.fd-avatar >> nth=5' }
    },
    // the texts differ: styles only
    {
        label: 'post text',
        pixels: false,
        ignore: ['width', 'height'],
        ours: { story: VERTICAL, selector: '[role=listitem] p >> nth=0' },
        ref: { story: `${FS}text--default-example`, selector: '.fd-text' }
    },
    {
        label: 'more',
        ours: { story: COLLAPSED, selector: MORE },
        ref: { story: `${FS}text--expand`, selector: '.fd-text__link--more >> nth=0' }
    },
    {
        label: 'more hover',
        hover: true,
        ours: { story: COLLAPSED, selector: MORE },
        ref: { story: `${FS}text--expand`, selector: '.fd-text__link--more >> nth=0' }
    },
    {
        label: 'more focus',
        focus: true,
        refFocus: true,
        ours: { story: COLLAPSED, selector: MORE },
        ref: { story: `${FS}text--expand`, selector: '.fd-text__link--more >> nth=0' }
    }
];
