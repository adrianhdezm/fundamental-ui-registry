/** Visual cases for select; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';
const SEL = `${FS}select--`;
const OURS = 'components-select--';

/** Our popup (the surface around the scrolling list) in an "Open: …" story. */
const POPUP = 'div:has(> div > ul[role="listbox"])';

/** A part of a control: ours in `story` (`#root [role=combobox]…`) against fundamental-styles' in `refStory`. */
const control = (label, story, ours, refStory, ref, extra = {}) => ({
    label,
    ours: { story: `${OURS}${story}`, selector: ours },
    ref: { story: `${SEL}${refStory}`, selector: ref },
    ...extra
});

const PLACEHOLDER = '#select-default [role="combobox"]';
const PLACEHOLDER_REF = '[aria-labelledby="cozySelectLabel"]';

export default [
    // the control with its placeholder: fundamental-styles' "Regular, Placeholder text"
    control('control', 'default', PLACEHOLDER, 'default', PLACEHOLDER_REF),
    control('control hover', 'default', PLACEHOLDER, 'default', PLACEHOLDER_REF, { hover: true }),
    control(
        'text',
        'default',
        `${PLACEHOLDER} > span:first-child`,
        'default',
        `${PLACEHOLDER_REF} .fd-select__text-content`
    ),
    control(
        'arrow button',
        'default',
        `${PLACEHOLDER} > span[aria-hidden]`,
        'default',
        `${PLACEHOLDER_REF} .fd-select__button`
    ),
    control(
        'arrow button hover',
        'default',
        `${PLACEHOLDER} > span[aria-hidden]`,
        'default',
        `${PLACEHOLDER_REF} .fd-select__button`,
        {
            hover: true
        }
    ),
    // focus: our "Focus: default" story against fundamental-styles' `is-focus` control
    control(
        'focus',
        'focus',
        '#select-focus [role="combobox"]',
        'default',
        '[aria-labelledby="cozySelectLabelFocus"]',
        {
            focus: true
        }
    ),
    // an open control with a value ("Active, Selected Item", the list open in both)
    control(
        'control with value',
        'open-default',
        '#select-open [role="combobox"]',
        'default',
        '#cozySelectActiveSelected'
    ),
    control('disabled', 'disabled', '#select-disabled [role="combobox"]', 'disabled', '#disabledSelectCombobox'),
    control('read-only', 'read-only', '#select-readonly [role="combobox"]', 'readonly', '#readonlySelectCombobox'),
    control(
        'read-only text',
        'read-only',
        '#select-readonly [role="combobox"] > span',
        'readonly',
        '#readonlySelectCombobox .fd-select__text-content'
    ),
    // value states: fundamental-react's placeholders ("Error", ...) against "Select an option": styles only
    ...['error', 'warning', 'success', 'information'].flatMap((state) => {
        const ref = `[aria-labelledby="${state === 'information' ? 'info' : state}Label"]`;
        const ours = `#select-${state} [role="combobox"]`;
        return [
            control(state, 'validation-states', ours, 'semantic-states', ref, { pixels: false, ignore: ['width'] }),
            control(`${state} hover`, 'validation-states', ours, 'semantic-states', ref, {
                pixels: false,
                hover: true,
                ignore: ['width']
            })
        ];
    }),
    // the open list against "Active, Selected Item"; fundamental-styles' list is as wide as its items, ours at least
    // as wide as the control by default (fundamental-ngx's fillControlMode "at-least"), so "fit-content" here
    control('popup', 'open-fit-content', POPUP, 'default', '#h0C6A325', { pixels: false }),
    control('list', 'open-fit-content', 'ul[role="listbox"]', 'default', '#cozyList', { pixels: false }),
    control('item', 'open-fit-content', '[role="option"]:nth-child(3)', 'default', '#cozyListItem3'),
    control('item hover', 'open-fit-content', '[role="option"]:nth-child(3)', 'default', '#cozyListItem3', {
        hover: true
    }),
    // ours is also highlighted (the focus frame of the focused option): styles only
    control('item selected', 'open-fit-content', '[role="option"][aria-selected="true"]', 'default', '#cozyListItem2', {
        pixels: false
    }),
    control(
        'item selected hover',
        'open-fit-content',
        '[role="option"][aria-selected="true"]',
        'default',
        '#cozyListItem2',
        {
            pixels: false,
            hover: true
        }
    ),
    // icons, titles and secondary texts against "2-column with icons"
    control(
        'item with icon',
        'open-two-columns',
        '[role="option"]:nth-child(3)',
        'two-columns-and-icons',
        '#twoColListItem3'
    ),
    control(
        'item icon',
        'open-two-columns',
        '[role="option"]:nth-child(3) [data-slot="list-icon"]',
        'two-columns-and-icons',
        '#twoColListItem3 .fd-list__icon'
    ),
    control(
        'item title',
        'open-two-columns',
        '[role="option"]:nth-child(3) [data-slot="list-title"]',
        'two-columns-and-icons',
        '#twoColListItem3 .fd-list__title'
    ),
    control(
        'item secondary',
        'open-two-columns',
        '[role="option"]:nth-child(3) [data-slot="list-secondary"]',
        'two-columns-and-icons',
        '#twoColListItem3 .fd-list__secondary'
    ),
    // the value state message above the list against "States"
    control('state message', 'open-error', '[data-slot="list-message"]', 'semantic-states', '#errorNote', {
        pixels: false,
        ignore: ['width']
    }),
    // group headers against "Grouping"
    control('group header', 'open-rich', '[data-slot="list-group-header"]', 'item-grouping', '#fruitsHeader', {
        pixels: false,
        ignore: ['width']
    }),
    // the plain option text against fundamental-styles' title
    control(
        'option text',
        'open-fit-content',
        '[role="option"]:nth-child(3) > span',
        'default',
        '#cozyListItem3 .fd-list__title',
        {
            pixels: false,
            ignore: ['width']
        }
    )
];
