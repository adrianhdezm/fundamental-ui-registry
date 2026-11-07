## calendar

Sources: fundamental-react [Calendar](https://github.com/SAP/fundamental-react/tree/main/src/Calendar) · Angular
[`registry/ui/calendar`](../../../../angular/registry/ui/calendar/) · fundamental-styles
[Calendar](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-calendar--docs)
Registry: `registry/ui/calendar/`, on the `datetime` lib (`useDatetimeAdapter`, `useDateTimeFormats`). Base UI has no
calendar primitive: the grid pattern (one tab stop, arrow keys across months and pages, views) is ported from Angular;
the header buttons are our `Button`, the picker cells use `buttonVariants`, and `CalendarCloseButton` takes Base UI's
`render`.

API: four components, as Angular's components and directive:

- `Calendar<D = FdDate>` (Angular's `fd-calendar`): the inputs as props (`calType`, `allowMultipleSelection`,
  `markWeekends`, `showWeekNumbers`, `mobileLandscape`, `mobilePortrait`, `startingDayOfWeek`, `specialDaysRules`,
  `yearGrid`, `aggregatedYearGrid`, `rangeHoverEffect`, `dateRangeFormat`, `showCalendarLegend`, `legendCol`,
  `disableFunction`, `disableRangeStartFunction`, `disableRangeEndFunction`, `previousButtonDisableFunction`,
  `nextButtonDisableFunction`, `escapeFocusFunction`, `labels`). Angular's five models are controlled/uncontrolled
  pairs with a change callback: `activeView`/`defaultActiveView`/`onActiveViewChange`, `selectedDate`/
  `defaultSelectedDate` (today by default, as Angular)/`onSelectedDateChange`, `selectedMultipleDates`,
  `selectedRangeDate` and `selectedMultipleDateRanges` likewise. The outputs are `onCloseCalendar` and
  `onIsValidDateChange`. Native props (`id`, `className`, `aria-*`, handlers) and the ref go to the `role="group"`
  root. `CALENDAR_LABELS`, `DateRange`, `SpecialDayRule`, `CalendarYearGrid` and the other types as Angular's.
- The forms part (`ControlValueAccessor`, `Validator`): `onValueChange(value)` is Angular's `registerOnChange` (the
  date, dates, range or ranges of the mode, on user selection only); a selection written from outside (and the first
  one) reports `onIsValidDateChange(valid)` and drops the Shift anchor, as Angular's `writeValue`; native `onBlur`
  covers `registerOnTouched`. `actionsRef` gives Angular's public methods: `setCurrentlyDisplayed`, `initialFocus`,
  `handlePreviousArrowClick`, `handleNextArrowClick` and `isModelValid` (the validator).
- `CalendarLegend` (`fd-calendar-legend`) and `CalendarLegendItem` (`fd-calendar-legend-item`): the same inputs;
  children of the legend come first, children of an item replace its `text`. Inside a calendar the special-day
  entries tell it which one has the focus (a context instead of Angular's injected parent).
- `CalendarCloseButton` (`fd-calendar-close-button`): names a button "Close calendar" (`aria-label` and `title`); a
  transparent decline button by default, or the element of `render`, e.g. `render={<DialogCloseButton mobile />}`.

ARIA and keyboard, as Angular: `role="group"` with `aria-roledescription` on the root; each view is a
`role="grid"` table with `aria-roledescription`, `aria-readonly="false"` and `aria-multiselectable`; days are
`role="gridcell"` with `aria-selected`, `aria-disabled` and a label of the date, range start/end, today, selected and
past; weekday headers carry the long name, week numbers are `role="rowheader"`. One tab stop per view (the selected
cell, today or the first); the arrow keys move between cells (mirrored in RTL) and change the month, year or page at
the edges; Enter and Space select; Tab from a cell goes to the previous button unless `escapeFocusFunction` is `null`
(Tab leaves) or a function.

fundamental-react mapping: `enableRangeSelection` is `calType="range"`; `weekdayStart` (0–6) is
`startingDayOfWeek` (1–7); `disableWeekends`, `disableWeekday`, `disableBeforeDate`, `disableAfterDate`,
`disablePastDates`, `disableFutureDates`, `disabledDates` and `disabledDateRanges` are one `disableFunction`;
`openToDate` is `actionsRef.current.setCurrentlyDisplayed(date)`; `locale` is `DatetimeAdapterProvider`'s `locale`;
`specialDays` (a date-to-number map) is `specialDaysRules`; `onChange` is `onValueChange` (or the model callbacks);
`compact` is `data-density="compact"`; `showToday` is a button next to the calendar (story `Today button`);
`dateFormat` belongs to the adapter's formats; `monthListProps`, `yearListProps`, `tableProps`, `tableHeaderProps`
and `tableBodyProps` are not ported (native props go to the root); `cssNamespace` is gone.

**Differences on purpose:**

- The month view shows long month names (fundamental-styles' Months story), where Angular shows short ones outside
  of month ranges: axe's `label-content-name-mismatch` fails "Jan" in a cell named "January 2018".
- Angular's `closeClicked` output is declared but never emitted; not ported.
- A model with only a value (no `on…Change`) is controlled: it does not change on clicks, where Angular's one-way
  bound model changes locally. Use the `default…` prop for that (the stories do).
- The displayed month follows a selection set from outside in the same render, not after an effect.
- A calendar that starts in the year or years range view starts at the shown year, as switching to those views does;
  Angular starts at today's year there. The next arrow has a 0.25rem start margin (Angular: `ms-auto`), and today's
  inset ring is a plain `box-shadow` (see the visual comparison).

### Stories vs. sources

| Source            | Example                        | React story           | Status     | Notes                                                                                          |
| ----------------- | ------------------------------ | --------------------- | ---------- | ---------------------------------------------------------------------------------------------- |
| fundamental-react | primary                        | `Playground`          | ✅ covered |                                                                                                |
| fundamental-react | compact                        | `Compact`             | ✅ covered | `data-density="compact"`.                                                                      |
| fundamental-react | disableWeekends                | `Single`              | ✅ covered | "Weekends and past days disabled", with `disableFunction`.                                     |
| fundamental-react | openToDate                     | `OpenToDate`          | ✅ covered | January 2000 through `actionsRef`.                                                             |
| fundamental-react | specialDays                    | `SpecialDays`         | ✅ covered | `specialDaysRules` with a legend.                                                              |
| fundamental-react | rangeSelection                 | `Ranges`              | ✅ covered | `calType="range"`.                                                                             |
| fundamental-react | weekdayStart                   | `Single`              | ✅ covered | "Week numbers, Monday first".                                                                  |
| fundamental-react | todayButton                    | `TodayButton`         | ✅ covered | A `Button` next to the calendar (no `showToday` in Angular).                                   |
| fundamental-react | dev                            | `Playground`          | ✅ covered | Controls for the modes, week start, locale, disabled weekends and past days, compact.          |
| fundamental-react | noStyles                       | —                     | ➖ n/a     | No `cssNamespace`.                                                                             |
| Angular           | Single date                    | `Single`              | ✅ covered |                                                                                                |
| Angular           | Ranges and several dates       | `Ranges`              | ✅ covered |                                                                                                |
| Angular           | Special days, months and years | `SpecialDays`         | ✅ covered |                                                                                                |
| Angular           | Forms and navigation           | `Forms`               | ✅ covered | `onIsValidDateChange` for the form validity.                                                   |
| Angular           | Locale                         | `Locale`              | ✅ covered | `DatetimeAdapterProvider locale="de-DE"`.                                                      |
| Angular           | Locale switcher                | `LocaleSwitcher`      | ✅ covered | The provider's `locale` prop.                                                                  |
| Angular           | Reactive forms                 | `ReactiveForms`       | ✅ covered | Touched (native `onBlur`), dirty (`onValueChange`) and valid (`onIsValidDateChange`).          |
| Angular           | Programmatic date change       | `Programmatic`        | ✅ covered |                                                                                                |
| Angular           | Mobile                         | `Mobile`              | ✅ covered | Our `Dialog` with `mobile`; `CalendarCloseButton render={<DialogCloseButton mobile />}`.       |
| Angular           | Open: mobile landscape         | `OpenMobileLandscape` | ✅ covered |                                                                                                |
| Angular           | Open: mobile portrait          | `OpenMobilePortrait`  | ✅ covered |                                                                                                |
| —                 | fundamental-styles reference   | `Reference`           | ✅ new     | February 2018 as fundamental-styles' Days story, the 2018 month and year views, today, legend. |

### Tests vs. sources

| Source            | Behaviour                                                              | React test                                                                                           | Status     |
| ----------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------- |
| Angular           | Month of the selected date as a grid                                   | shows the month of the selected date as a grid                                                       | ✅ covered |
| Angular           | Week start and week numbers                                            | starts the week on the given day and shows week numbers                                              | ✅ covered |
| Angular           | Click selects                                                          | selects a date with a click                                                                          | ✅ covered |
| Angular           | Disabled dates                                                         | does not select disabled dates                                                                       | ✅ covered |
| Angular           | Arrow keys across months, Enter, Tab                                   | moves with the arrow keys across months and selects with Enter                                       | ✅ covered |
| Angular           | Month and year views                                                   | navigates months, and picks a month and a year in their views                                        | ✅ covered |
| Angular           | Range in either order                                                  | picks a range in either order                                                                        | ✅ covered |
| Angular           | Several dates, Shift spans                                             | selects several dates and spans with Shift                                                           | ✅ covered |
| Angular           | Several ranges merge                                                   | merges several overlapping ranges                                                                    | ✅ covered |
| Angular           | Special days and the legend focus                                      | marks special days and lists them in the legend                                                      | ✅ covered |
| Angular           | Forms: write, read, validate                                           | writes and reads the value and validates it                                                          | ✅ covered |
| Angular           | Grid ARIA per mode                                                     | grids expose aria-readonly and aria-multiselectable per selection mode                               | ✅ covered |
| Angular           | Four to six rows, filler rows                                          | months with six weeks render six rows, others five or four                                           | ✅ covered |
| Angular           | Today is the tab stop                                                  | today is the tab stop when nothing is selected                                                       | ✅ covered |
| Angular           | Range hover                                                            | range hover marks the days up to the hovered day                                                     | ✅ covered |
| Angular           | Years-range view                                                       | the years-range view lists year ranges and Enter selects one                                         | ✅ covered |
| Angular           | Keys in the month and year views                                       | arrow keys and Enter/Space pick a month and a year                                                   | ✅ covered |
| Angular           | Arrow keys to the previous month                                       | ArrowUp on the first row and ArrowLeft on the first cell go to the previous month                    | ✅ covered |
| Angular           | Space selects                                                          | Space selects the focused day                                                                        | ✅ covered |
| Angular           | Legend ARIA, column, appointment circle, follows the rules             | legend items are list items; the legend is labelled and can be a column; …                           | ✅ covered |
| Angular           | Shift-click without anchor                                             | shift-click without an anchor selects only the clicked date                                          | ✅ covered |
| Angular           | Shift-click across months, in reverse                                  | shift-click fills across months and in reverse                                                       | ✅ covered |
| Angular           | Validation of every mode                                               | validates written multiple dates, ranges and multiple ranges                                         | ✅ covered |
| Angular           | Writing a value resets the Shift anchor                                | writing a value resets the shift anchor                                                              | ✅ covered |
| fundamental-react | Create with every prop                                                 | the tests of this table                                                                              | ✅ covered |
| fundamental-react | Show/hide and click months and years, previous and next buttons        | pages back and forth by month and by 20 years, and keeps the month from the 31st; navigates months … | ✅ covered |
| fundamental-react | Next button on the 31st                                                | pages back and forth … keeps the month from the 31st                                                 | ✅ covered |
| fundamental-react | Disabled weekends, weekdays, before/after, dates, ranges, past, future | does not select the days a disable function rules out                                                | ✅ covered |
| fundamental-react | Click on a day, range clicks, a new range after a complete one         | selects a date with a click; starts a new range after a complete one                                 | ✅ covered |
| fundamental-react | Today button                                                           | —                                                                                                    | ➖ n/a     |
| fundamental-react | openToDate                                                             | opens on the month of today without a selection, and on a date from code (openToDate)                | ✅ covered |
| fundamental-react | weekdayStart 0–6                                                       | starts the weeks on every day of the week                                                            | ✅ covered |
| fundamental-react | Prop spreading to the root                                             | passes className, native props and the ref to the root                                               | ✅ covered |
| fundamental-react | Prop spreading to the tables, thead, tbody, month and year lists       | —                                                                                                    | ➖ n/a     |
| —                 | RTL arrow keys                                                         | mirrors the left and right arrow keys in RTL                                                         | ✅ new     |
| —                 | Locale of the adapter                                                  | names days and months in the locale of the adapter                                                   | ✅ new     |
| —                 | Controlled view                                                        | views can be controlled                                                                              | ✅ new     |
| —                 | Year view from the start                                               | a calendar that starts in the year view starts at the shown year                                     | ✅ new     |
| —                 | Own legend, close button                                               | a legend of its own and a close button that names itself                                             | ✅ new     |
| —                 | Mobile layouts                                                         | fills the dialog in mobile layouts                                                                   | ✅ new     |

The Today button test is n/a: the calendar has no Today button (story `Today button` composes one). The table
props of fundamental-react are not ported: native props go to the root.

### Visual comparison

`pnpm visual calendar`: 27 cases × 16 combinations, 432/432 matching. Our `Reference` story shows February 2018 as
fundamental-styles' Days story (a range from the 13th to the 18th, the same special days, week numbers), so the days
compare by pixels: work day, weekend, selected, range, range and selected with legend, weekend with legend and other
month at rest; work day, weekend and selected on hover; the week number, the weekday header, the month button and the
previous arrow of the header; a month and the selected month (Months story), a year (Years story); five legend
entries with the texts of the Legend story. Focus, today and today selected compare by styles only with the single
cells of the Calendar Days story (other numbers); the whole calendar by styles only (other weekdays).

| Difference                                                               | Cause                                                                                                  | Resolution                                                                                     |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Today: four extra transparent box shadows (computed only)                | The `shadow-[…]` utility adds Tailwind's ring layers                                                   | Fixed: `[box-shadow:…]`. Angular issue.                                                        |
| Week number cell 44px high instead of 30px                               | `cn()` let the added `h-(--cal-item-h)` replace `h-[1.875rem]`; Angular concatenates and 1.875rem wins | Fixed: the side helper height only, as Angular renders.                                        |
| Month and year buttons 2px wider                                         | The next arrow's wrapper has `ms-auto` (0 here) where fundamental-styles has a 0.25rem start margin    | Fixed: `ms-1`. Angular issue.                                                                  |
| Year view of a calendar that starts in it shows 2026–2045, not 2018–2037 | The first year starts at today's, and only switching to the view sets it to the shown year             | Fixed: it starts at the shown year (and the years range view one page before). Angular issue.  |
| Month names "Jan" instead of "January"                                   | Angular uses short names outside of month ranges                                                       | Fixed: long names (also an axe failure, see above). Angular issue.                             |
| Weekday and week number cells: font size, colour, radius and cursor      | fundamental-styles puts the small label text on a span in the cell                                     | Kept: the cells look the same (0% pixels); the props are ignored in the case, with the reason. |
| The day view 46px higher than fundamental-styles' February               | The day view keeps the height of six weeks (Angular), so the calendar does not jump between months     | Kept, on purpose; ignored in the whole-calendar case.                                          |

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: `Reference`, `Ranges` and `SpecialDays`.
