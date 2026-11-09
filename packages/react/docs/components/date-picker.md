## date-picker

Sources: fundamental-react [DatePicker](https://github.com/SAP/fundamental-react/tree/main/src/DatePicker) · Angular
[`registry/ui/date-picker`](../../../angular/registry/ui/date-picker/) · fundamental-styles
[Date Picker](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-patterns-date-picker--docs)
Registry: `registry/ui/date-picker/`, on the `datetime` lib (`useDatetimeAdapter`, `useDateTimeFormats`), `calendar`,
`input-group`, `popover` (Base UI Popover), `dialog` (Base UI Dialog, mobile mode), `form`
(`FormInputMessageGroup`, `FormMessage`), `bar` and `button`. Base UI has no date picker: the field, parsing,
validation and the keyboard handling are ported from Angular; the popup is our `Popover` with the calendar button as
its `PopoverTrigger` and the input group as its anchor.

API: `DatePicker<D = FdDate>` (Angular's `fd-date-picker`):

- The inputs as props: `inputId`, `type`, `allowMultipleSelection`, `placeholder`, `disabled`, `required`,
  `customDateTimeFormat`, `message`, `messageType`, `messageTriggers`, `placement`, `useValidation`, `state`,
  `allowNull`, `closeOnDateChoose`, `processInputOnBlur`, `preventScrollOnFocus`, `buttonFocusable`,
  `showTodayButton`, `todayButtonLabel`, the calendar's options (`markWeekends`, `showWeekNumbers` (default true, as
  Angular), `specialDaysRules`, `startingDayOfWeek`, `yearGrid`, `aggregatedYearGrid`, `rangeHoverEffect`,
  `dateRangeFormat`, `showCalendarLegend`, `legendCol`, the five disable functions), `mobile`, `mobileConfig`,
  `mobileLandscape`, `mobilePortrait`, `labels` (`DATE_PICKER_LABELS`) and `calendarLabels`. Angular's
  `ariaLabelledBy` is the native `aria-labelledby` (with `aria-label`, it goes to the input); the projected content
  is `children` (shown in the popover above the calendar).
- Angular's six models are controlled/uncontrolled pairs with a change callback: `selectedDate`/
  `defaultSelectedDate`/`onSelectedDateChange`, `selectedMultipleDates`, `selectedRangeDate` and
  `selectedMultipleDateRanges` likewise, `open`/`defaultOpen`/`onOpenChange` (`isOpen`) and
  `activeView`/`defaultActiveView`/`onActiveViewChange`.
- The forms part (`ControlValueAccessor`, `Validator`): `onValueChange(value)` is `registerOnChange` (the date,
  dates, range or ranges of the mode, on user changes only); `onValidityChange(valid)` is the validator (on mount and
  on change); native `onBlur` on the root covers `registerOnTouched`; `disabled` covers `setDisabledState`. A value
  written from outside is shown as Angular's `writeValue` shows it.
- Native props and the ref go to the root (`inline-block`, as Angular's host); `id` also prefixes the ids of the
  input (`-input`), calendar (`-calendar`), dialog title and description.
- New, from fundamental-react: `readOnly` (a read-only field without the calendar button), `openToDate` (the month
  shown without a value), `inputProps`, `inputGroupProps`, `buttonProps` and `calendarProps` (spread to those parts),
  and `container` (the element the popover or dialog renders into, as `PopoverBody`'s and `DialogPopup`'s).

Behaviour, ARIA and keyboard, as Angular: the input has `aria-label` "Date input" / "Date range input" (unless
labelled), `aria-required`, `aria-invalid` in the error state and `aria-describedby` with the state ("Value state
Error") and the message; the button "Open picker" has `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls` (Base
UI) and is out of the tab order unless `buttonFocusable`. F4 toggles, Alt+ArrowDown opens, Escape closes and returns
to the field; opening moves the focus to the active day (the calendar shows the month of the value), picking a date
or the end of a range closes and returns to the field (`closeOnDateChoose`); multiple selections keep it open. Typed
text is read while typing (or on Enter and blur with `processInputOnBlur`), ranges with the formats' delimiter (and
reversed ends ordered), multiple values separated by commas; what was typed stays, and a readable value is formatted
on blur. An unreadable date, a disabled one, or an empty field with `allowNull={false}` sets the error state unless
`state` is set. The value state message shows under the field on focus (`FormInputMessageGroup`) and in the popover.
Mobile mode opens the calendar in a full-screen `Dialog` (title, close button, approve and cancel buttons); cancel,
the close button and Escape restore the value from before it opened.

fundamental-react mapping: `enableRangeSelection` is `type="range"`; `defaultValue` (a string) is the
`default…` value of the mode (a date or `DateRange`); `dateFormat` (Moment patterns) is `customDateTimeFormat` or the
formats of `DateTimeFormatsProvider` (`Intl` options with the default adapter); `locale` is
`DatetimeAdapterProvider`'s; `weekdayStart` (0–6) is `startingDayOfWeek` (1–7); `specialDays` is `specialDaysRules`;
the `disable…` props are `disableFunction` (and the range start/end functions); `validationState` is `state` with
`message`/`messageType`; `todayActionType="select"` is `showTodayButton`, `"navigate"` (select without closing) adds
`closeOnDateChoose={false}`, `localizedText.todayLabel` is `todayButtonLabel`; `buttonLabel` is
`labels.toggleLabel`; `onChange` is `onValueChange`; `onDatePickerClose` is `onOpenChange(false)`;
`onInputBlur`/`onInputFocus` are `inputProps.onBlur`/`onFocus`; `compact` is `data-density="compact"`;
`popoverProps.flipContainer` is not ported (the popover flips within the scroll containers and the viewport);
`addonProps`, `footerButtonProps`, `footerClasses`, `validationOverlayProps` and `modalManager` are gone;
`cssNamespace` is gone.

**Differences on purpose:**

- `aria-describedby` lists the state description and the message's id (the message group links the message, as for
  every field); Angular puts both texts in one description element. The texts read are the same.
- A press or focus outside the picker closes the calendar and leaves the focus there; Angular returns it to the field
  on every close. Closing with Escape, the button, F4 or a pick returns it to the field, as Angular.
- `dateRangeFormat` on a single date picker picks the first day of the month or year: the calendar picks ranges of
  months and years, and the picker takes their start. Angular ignores the first pick and writes a `DateRange` into
  `selectedDate` on the second (see the Angular issues).
- The validity is derived from the value on every render (also for a value set from outside), where Angular sets it
  in `writeValue` and on user changes only; with `allowNull={false}` and no value, a model-bound Angular picker starts
  without the error state, ours starts with it (as Angular's with a form control).
- A value with only `selected…` (no `on…Change`) is controlled: typing does not change it. Use the `default…` prop for
  an uncontrolled picker.
- The mobile dialog title is a `DialogTitle` (`<h2>`, as fundamental-styles' dialogs); Angular uses `<h1>`.
- The today button shows with ranges too (Angular's `showTodayButton` selects a range of today); fundamental-react
  hides it with range selection.
- In RTL the field text keeps the browser's bidi order, as fundamental-styles, UI5 and Angular: a numeric range
  such as `4.3.2024 - 8.3.2024` shows its start at the right, where a right-to-left reader starts. Forcing the
  value left to right (`unicode-bidi: plaintext`) was tried and dropped: it puts the start where an RTL reader ends.
- The today footer has the popover's bottom corners and a decisive (4rem) button, as fundamental-styles' date picker
  (see the visual comparison).

### Visual differences from fundamental-styles, kept on purpose

| Difference                                                                            | Cause                                                                                                                                      | Resolution                                                                                           |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Calendar button blue (`--sapButton_Selected_TextColor`) instead of the text colour    | The calendar is open: Angular marks the button of an open picker; fundamental-styles' static story does not                                | Kept (Angular and the input group's `isExpanded`); the field cases use the closed `Reference` story. |
| Field, input and calendar button: 3.1–4.6% pixels in HC and compact (24 combinations) | fundamental-styles' story has its calendar open: the popover's shadow falls on the bottom rows of the field; the computed styles are equal | Kept: not a difference of the field (solid `--sapField_Background` in both).                         |
| Mobile window `min-height` 100% instead of 120px                                      | fundamental-styles' docs window keeps the dialog's 7.5rem minimum; ours is the dialog's full-screen mobile window                          | Kept (the dialog component's), ignored in the case.                                                  |
| Mobile header without rounded top corners (12px, 4px in HC)                           | fundamental-styles' docs window keeps them; a full-screen mobile window has none                                                           | Kept (the dialog component's), ignored in the case.                                                  |
| Compact mobile calendar 0 instead of 8px padding                                      | fundamental-styles' compact calendar padding wins over the mobile layout's none (specificity); mobile layouts are cozy in Fiori            | Kept (the calendar component's), ignored in the case.                                                |
