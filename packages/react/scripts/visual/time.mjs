/** Visual cases for time; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

/** Our reference story: 04:25:10 as fundamental-styles' Default and Tablet stories. */
const REFERENCE = 'components-time--reference';
const DEFAULT = `${FS}time--default-cozy-mode`;
const TABLET = `${FS}time--tablet-mode`;
/** The n-th time (1 to 3) of a row of our reference story. */
const ours = (n, selector, row = 'Default') => `[aria-label="${row} ${n}"] ${selector}`;
/** The n-th time (0 to 2) of the fundamental-styles story. */
const ref = (n, selector) => `.fd-time >> nth=${n} >> ${selector}`;

export default [
    {
        label: 'value',
        ours: { story: REFERENCE, selector: ours(1, '[data-displayed-value="2"]') },
        ref: { story: DEFAULT, selector: ref(0, 'li.fd-time__item:has(> span:text-is("02"))') }
    },
    {
        label: 'value hover',
        hover: true,
        ours: { story: REFERENCE, selector: ours(1, '[data-displayed-value="2"]') },
        ref: { story: DEFAULT, selector: ref(0, 'li.fd-time__item:has(> span:text-is("02"))') }
    },
    {
        // fundamental-styles draws the selection border with an indicator over the item, 1px off towards the end:
        // the border colour and the pixels of its edge are compared in "selection border"
        label: 'selected value',
        pixels: false,
        ignore: ['border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color'],
        ours: { story: REFERENCE, selector: ours(1, '[data-displayed-value="4"]') },
        ref: { story: DEFAULT, selector: ref(0, 'li.fd-time__item:has(> .fd-time__current-indicator)') }
    },
    {
        label: 'selection border',
        pixels: false,
        props: ['width'],
        // the indicator is an empty layer over the item: it has no background or minimum height of its own
        ignore: ['min-height', 'background-color'],
        ours: { story: REFERENCE, selector: ours(1, '[data-displayed-value="4"]') },
        ref: { story: DEFAULT, selector: ref(0, '.fd-time__current-indicator') }
    },
    {
        label: 'collapsed value',
        ours: { story: REFERENCE, selector: ours(1, '[aria-label=Minutes] > span') },
        ref: { story: DEFAULT, selector: ref(0, '.fd-time__item--collapsed') }
    },
    {
        label: 'collapsed value hover',
        hover: true,
        ours: { story: REFERENCE, selector: ours(1, '[aria-label=Minutes] > span') },
        ref: { story: DEFAULT, selector: ref(0, '.fd-time__item--collapsed') }
    },
    {
        label: 'column label',
        ours: { story: REFERENCE, selector: ours(2, 'span[id$="-seconds-label"]') },
        ref: { story: DEFAULT, selector: ref(1, '.fd-time__slider-label:text-is("Sec")') }
    },
    {
        label: 'spinner button',
        ours: { story: REFERENCE, selector: ours(1, 'button >> nth=0') },
        ref: { story: DEFAULT, selector: ref(0, 'button >> nth=0') }
    },
    {
        label: 'period',
        ours: { story: REFERENCE, selector: ours(3, '[data-displayed-value="PM"]') },
        ref: { story: DEFAULT, selector: ref(2, '.fd-time__wrapper--meridian li >> nth=1') }
    },
    {
        label: 'active column',
        ours: { story: REFERENCE, selector: ours(1, '[role=spinbutton] >> nth=0') },
        ref: { story: DEFAULT, selector: ref(0, '.fd-time__wrapper--active') }
    },
    {
        label: 'period column',
        ours: { story: REFERENCE, selector: ours(3, '[role=spinbutton] >> nth=3') },
        ref: { story: DEFAULT, selector: ref(2, '.fd-time__wrapper--meridian') }
    },
    {
        // the whole time without its padding: fundamental-styles leaves it to the time picker's popover
        label: 'time',
        ignore: ['padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'height', 'width'],
        pixels: false,
        ours: { story: REFERENCE, selector: '[aria-label="Default 2"]' },
        ref: { story: DEFAULT, selector: '.fd-time >> nth=1' }
    },
    {
        label: 'tablet value',
        ours: { story: REFERENCE, selector: ours(1, '[data-displayed-value="2"]', 'Tablet') },
        ref: { story: TABLET, selector: ref(0, 'li.fd-time__item:has(> span:text-is("02"))') }
    },
    {
        label: 'tablet active column',
        ours: { story: REFERENCE, selector: ours(2, '[role=spinbutton] >> nth=0', 'Tablet') },
        ref: { story: TABLET, selector: ref(1, '.fd-time__wrapper--active') }
    }
];
