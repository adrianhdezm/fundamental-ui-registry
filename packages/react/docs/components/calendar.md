## calendar

Sources: fundamental-react [Calendar](https://github.com/SAP/fundamental-react/tree/main/src/Calendar) · Angular
[`registry/ui/calendar`](../../../angular/registry/ui/calendar/) · fundamental-styles
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

### Visual differences from fundamental-styles, kept on purpose

| Difference                                                          | Cause                                                                                              | Resolution                                                                                     |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Weekday and week number cells: font size, colour, radius and cursor | fundamental-styles puts the small label text on a span in the cell                                 | Kept: the cells look the same (0% pixels); the props are ignored in the case, with the reason. |
| The day view 46px higher than fundamental-styles' February          | The day view keeps the height of six weeks (Angular), so the calendar does not jump between months | Kept, on purpose; ignored in the whole-calendar case.                                          |
