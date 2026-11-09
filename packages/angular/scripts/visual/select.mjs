/** Visual cases for select; see ../visual.config.mjs for the fields. Adapted from the React package. */
const FS = 'sap-design-components-';
const SEL = `${FS}select--`;
const OURS = 'components-select--';

/** A part of a control: ours in `story` against fundamental-styles' in `refStory`. */
const control = (label, story, ours, refStory, ref, extra = {}) => ({
    label,
    ours: { story: `${OURS}${story}`, selector: ours },
    ref: { story: `${SEL}${refStory}`, selector: ref },
    ...extra
});

/** The first select of the Modes story, with its placeholder ("Default select"). */
const PLACEHOLDER = '[role="combobox"] >> nth=0';
const PLACEHOLDER_REF = '[aria-labelledby="cozySelectLabel"]';
/** The third option ("Notebook Basic 3") of the two-column list. */
const ITEM = '[role="option"]:nth-child(3)';

export default [
    control(
        'arrow button',
        'modes',
        `${PLACEHOLDER} >> span[aria-hidden]`,
        'default',
        `${PLACEHOLDER_REF} .fd-select__button`
    ),
    control(
        'arrow button hover',
        'modes',
        `${PLACEHOLDER} >> span[aria-hidden]`,
        'default',
        `${PLACEHOLDER_REF} .fd-select__button`,
        { hover: true }
    ),
    // icons, titles and secondary texts against "2-column with icons"
    control('item with icon', 'open-two-columns', ITEM, 'two-columns-and-icons', '#twoColListItem3'),
    control(
        'item icon',
        'open-two-columns',
        `${ITEM} [fd-list-icon]`,
        'two-columns-and-icons',
        '#twoColListItem3 .fd-list__icon'
    ),
    control(
        'item title',
        'open-two-columns',
        `${ITEM} [fd-list-title]`,
        'two-columns-and-icons',
        '#twoColListItem3 .fd-list__title'
    ),
    control(
        'item secondary',
        'open-two-columns',
        `${ITEM} [fd-list-secondary]`,
        'two-columns-and-icons',
        '#twoColListItem3 .fd-list__secondary'
    )
];
