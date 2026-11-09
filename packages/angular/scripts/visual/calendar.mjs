/** Visual cases for calendar; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

/** Our reference story: February 2018 as fundamental-styles' Days story, then the month and year views of 2018. */
const REFERENCE = 'components-calendar--reference';
const DAYS = `${FS}calendar--days`;
/** A day of February 2018 in our day view (the first calendar). */
const day = (label, status = 'current') =>
    `[aria-label=Days] td[data-fd-calendar-date-day="${label}"][data-fd-calendar-month-status="${status}"]`;
/** The same day in the first calendar of fundamental-styles' Days story. */
const refDay = (label, cls) =>
    `section.fd-calendar >> nth=0 >> td.fd-calendar__item${cls}:has(> div > span:text-is("${label}"))`;

export default [
    // days: the same numbers in both, so the pixels compare
    ...[
        ['work day', '8', ':not([class*="--"])'],
        ['weekend', '11', '.fd-calendar__item--weekend:not([class*="legend"])'],
        ['selected', '13', '.fd-calendar__item--selected'],
        ['range', '14', '.fd-calendar__item--range:not([class*="legend"])'],
        ['range with legend', '17', '.fd-calendar__item--range.fd-calendar__item--legend-7'],
        ['selected with legend', '18', '.fd-calendar__item--selected.fd-calendar__item--legend-1'],
        ['weekend with legend', '25', '.fd-calendar__item--weekend.fd-calendar__item--legend-9']
    ].map(([label, text, cls]) => ({
        label,
        ours: { story: REFERENCE, selector: day(text) },
        ref: { story: DAYS, selector: refDay(text, cls) }
    })),
    {
        label: 'other month',
        ours: { story: REFERENCE, selector: day('31', 'previous') },
        ref: { story: DAYS, selector: refDay('31', '.fd-calendar__item--other') }
    },
    {
        label: 'work day hover',
        hover: true,
        ours: { story: REFERENCE, selector: day('8') },
        ref: { story: DAYS, selector: refDay('8', ':not([class*="--"])') }
    },
    {
        label: 'weekend hover',
        hover: true,
        ours: { story: REFERENCE, selector: day('11') },
        ref: { story: DAYS, selector: refDay('11', '.fd-calendar__item--weekend:not([class*="legend"])') }
    },
    {
        label: 'selected hover',
        hover: true,
        ours: { story: REFERENCE, selector: day('13') },
        ref: { story: DAYS, selector: refDay('13', '.fd-calendar__item--selected') }
    },
    // focus, today and disabled: fundamental-styles shows them only in its Calendar Days story (single cells)
    {
        label: 'work day focus',
        focus: true,
        pixels: false,
        // a single cell in a grid of the docs, not a table cell
        ignore: ['width'],
        ours: { story: REFERENCE, selector: day('8') },
        ref: { story: `${FS}calendar--calendar-days`, selector: '.fd-calendar__item.is-focus >> nth=0' }
    },
    {
        label: 'today',
        pixels: false,
        ignore: ['width'],
        ours: { story: REFERENCE, selector: '[aria-label=Today] td[aria-label*="Today"]' },
        ref: {
            story: `${FS}calendar--calendar-days`,
            selector: '.fd-calendar__item--today:not(.is-hover, .is-focus, .is-disabled, [class*="legend"]) >> nth=0'
        }
    },
    {
        label: 'today selected',
        pixels: false,
        ignore: ['width'],
        ours: { story: REFERENCE, selector: '[aria-label="Today selected"] td[aria-label*="Today"]' },
        ref: {
            story: `${FS}calendar--calendar-days`,
            selector:
                '.fd-calendar__item--today.fd-calendar__item--selected:not(.is-hover, .is-focus, .is-disabled, [class*="legend"]) >> nth=0'
        }
    },
    // the side helpers
    // fundamental-styles sets the small label text on a span in the cell; its cell keeps the item's font, colour,
    // radius and cursor, which show nowhere (no background, no hover)
    {
        label: 'week number',
        ignore: [
            'font-size',
            'color',
            'border-top-left-radius',
            'border-top-right-radius',
            'border-bottom-right-radius',
            'border-bottom-left-radius',
            'cursor'
        ],
        ours: { story: REFERENCE, selector: '[aria-label=Days] th[data-fd-calendar-week="7"]' },
        ref: { story: DAYS, selector: 'section.fd-calendar >> nth=0 >> th[role=rowheader]:has-text("7")' }
    },
    {
        label: 'weekday',
        ignore: [
            'font-size',
            'color',
            'border-top-left-radius',
            'border-top-right-radius',
            'border-bottom-right-radius',
            'border-bottom-left-radius',
            'cursor'
        ],
        ours: { story: REFERENCE, selector: '[aria-label=Days] th[aria-label=Monday]' },
        ref: { story: DAYS, selector: 'section.fd-calendar >> nth=0 >> th[aria-label=Monday]' }
    },
    // the header
    {
        label: 'header month',
        ours: { story: REFERENCE, selector: '[aria-label=Days] button[data-fd-calendar-month]' },
        ref: { story: DAYS, selector: 'section.fd-calendar >> nth=0 >> button:text-is("February")' }
    },
    {
        label: 'header previous',
        ours: { story: REFERENCE, selector: '[aria-label=Days] button[aria-label="Previous month"]' },
        ref: { story: DAYS, selector: 'section.fd-calendar >> nth=0 >> button[aria-label=Previous]' }
    },
    {
        label: 'calendar',
        pixels: false,
        // other days and weekends in the two Februaries; the day view keeps the height of six weeks (Angular), 46px
        // more than fundamental-styles' five-week February
        ignore: ['height'],
        ours: { story: REFERENCE, selector: '[aria-label=Days]' },
        ref: { story: DAYS, selector: 'section.fd-calendar >> nth=0' }
    },
    // months and years
    {
        label: 'month',
        ours: { story: REFERENCE, selector: '[aria-label=Months] td[data-fd-calendar-month="1"]' },
        ref: { story: `${FS}calendar--months`, selector: 'td.fd-calendar__my-item >> nth=0' }
    },
    {
        label: 'month selected',
        ours: { story: REFERENCE, selector: '[aria-label=Months] td[data-fd-calendar-month="3"]' },
        ref: { story: `${FS}calendar--months`, selector: 'td.fd-calendar__my-item[aria-selected=true]' }
    },
    {
        label: 'year',
        ours: { story: REFERENCE, selector: '[aria-label=Years] td[data-fd-calendar-year="2019"]' },
        ref: { story: `${FS}calendar--years`, selector: 'td.fd-calendar__my-item >> nth=1' }
    },
    // the legend: the texts of fundamental-styles' first legend
    ...[
        ['legend today', 0, '.fd-calendar-legend__item--today'],
        ['legend selected', 1, '.fd-calendar-legend__item--selected'],
        ['legend work day', 2, '.fd-calendar-legend__item--work'],
        ['legend non-work day', 3, '.fd-calendar-legend__item--non-work'],
        ['legend special day', 4, '.fd-calendar-legend__item--placeholder-1']
    ].map(([label, n, selector]) => ({
        label,
        ours: { story: REFERENCE, selector: `[role=list] [role=listitem] >> nth=${n}` },
        ref: { story: `${FS}calendar--legend`, selector: `.fd-calendar-legend >> nth=0 >> ${selector} >> nth=0` }
    }))
];
