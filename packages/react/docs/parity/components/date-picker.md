## date-picker

Sources: fundamental-react [DatePicker](https://github.com/SAP/fundamental-react/tree/main/src/DatePicker) · Angular
[`registry/ui/date-picker`](../../../../angular/registry/ui/date-picker/) · fundamental-styles
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
- The today footer has the popover's bottom corners and a decisive (4rem) button, as fundamental-styles' date picker
  (see the visual comparison).

### Stories vs. sources

| Source            | Example                                       | React story                                     | Status     | Notes                                                                                          |
| ----------------- | --------------------------------------------- | ----------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------- |
| fundamental-react | primary                                       | `Primary`                                       | ✅ covered |                                                                                                |
| fundamental-react | compact                                       | `Compact`                                       | ✅ covered | `data-density="compact"`.                                                                      |
| fundamental-react | disabled                                      | `Disabled`                                      | ✅ covered |                                                                                                |
| fundamental-react | readOnly                                      | `ReadOnly`                                      | ✅ covered | `readOnly`: no button, no calendar.                                                            |
| fundamental-react | openToDate                                    | `OpenToDate`                                    | ✅ covered | `openToDate`.                                                                                  |
| fundamental-react | localized                                     | `Locale`                                        | ✅ covered | `DatetimeAdapterProvider locale`, switched live.                                               |
| fundamental-react | rangeSelection                                | `RangeSelection`                                | ✅ covered | `type="range"`, with and without a default range.                                              |
| fundamental-react | dateFormat                                    | `CustomFormats`                                 | ✅ covered | `Intl` options of the adapter (`customDateTimeFormat`, `DateTimeFormatsProvider`), not Moment. |
| fundamental-react | validationStates                              | `ValidationStates`                              | ✅ covered | `state` with `message` and `messageType`.                                                      |
| fundamental-react | specialDaysEx                                 | `SpecialDays`                                   | ✅ covered | `specialDaysRules` with a legend.                                                              |
| fundamental-react | weekdayStartEx                                | `WeekdayStart`                                  | ✅ covered | `startingDayOfWeek={2}`.                                                                       |
| fundamental-react | localizedTodayFooterButton                    | `TodayButton`                                   | ✅ covered | `showTodayButton`, compact, and a Hindi label and locale.                                      |
| fundamental-react | localizedTodayHeaderButton                    | `TodayButton`                                   | ✅ covered | "navigate": `showTodayButton` with `closeOnDateChoose={false}` (selects today and stays open). |
| fundamental-react | withCustomFlipContainer                       | `FlipContainer`                                 | ✅ covered | The calendar opens above a field with no room below (no flip container prop).                  |
| fundamental-react | dev                                           | `Playground`                                    | ✅ covered | Controls for the modes, states, message, today button, mobile, locale, disabled days, compact. |
| fundamental-react | primaryVisualStoryShotOnly                    | `OpenCalendar`                                  | ✅ covered | An open calendar.                                                                              |
| fundamental-react | localizedTodayFooterButtonVisualStoryShotOnly | `ReferenceOpen`                                 | ✅ covered | Open with the today button.                                                                    |
| fundamental-react | localizedTodayHeaderButtonVisualStoryShotOnly | `OpenRange`                                     | ✅ covered | Open with the today button.                                                                    |
| fundamental-react | noStyles                                      | —                                               | ➖ n/a     | No `cssNamespace`.                                                                             |
| Angular           | Single                                        | `Single`                                        | ✅ covered |                                                                                                |
| Angular           | Range and multiple                            | `RangeAndMultiple`                              | ✅ covered |                                                                                                |
| Angular           | Disable functions                             | `DisableFunctions`                              | ✅ covered | Touched (native `onBlur`), dirty (`onValueChange`) and valid (`onValidityChange`).             |
| Angular           | Special days                                  | `SpecialDays`                                   | ✅ covered |                                                                                                |
| Angular           | Forms                                         | `Forms`                                         | ✅ covered | The form state from the callbacks, as in `DisableFunctions`.                                   |
| Angular           | Locale                                        | `Locale`                                        | ✅ covered | A `Select` picks the locale.                                                                   |
| Angular           | Mobile                                        | `Mobile`                                        | ✅ covered |                                                                                                |
| Angular           | Custom formats                                | `CustomFormats`                                 | ✅ covered | `DateTimeFormatsProvider` instead of the `DATE_TIME_FORMATS` provider.                         |
| Angular           | Prevent scroll on focus                       | `PreventScrollOnFocus`                          | ✅ covered |                                                                                                |
| Angular           | Open: calendar                                | `OpenCalendar`                                  | ✅ covered |                                                                                                |
| Angular           | Open: range                                   | `OpenRange`                                     | ✅ covered |                                                                                                |
| Angular           | Open: mobile                                  | `OpenMobile`                                    | ✅ covered |                                                                                                |
| —                 | Legend in the popover                         | `OpenLegend`                                    | ✅ new     | So axe checks the legend inside the popover.                                                   |
| —                 | fundamental-styles references                 | `Reference`, `ReferenceOpen`, `ReferenceMobile` | ✅ new     | The Today Selection Button and Mobile Portrait stories, open and rendered into the page.       |

### Tests vs. sources

| Source            | Behaviour                                                                 | React test                                                                                  | Status     |
| ----------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------- |
| Angular           | The date in the field, labels, aria-expanded                              | shows the date in the field                                                                 | ✅ covered |
| Angular           | Opens on the date, picks a day, closes, focus back                        | opens the calendar on the date, picks a day and closes                                      | ✅ covered |
| Angular           | F4, Alt+Down, Escape                                                      | opens with F4 and Alt+Down and closes with Escape                                           | ✅ covered |
| Angular           | Reads while typing; unreadable dates set the error state                  | reads typed dates while typing, and an unreadable date sets the error state                 | ✅ covered |
| Angular           | processInputOnBlur                                                        | reads on Enter and blur only with processInputOnBlur                                        | ✅ covered |
| Angular           | Disabled date is an error                                                 | sets the error state for a disabled date                                                    | ✅ covered |
| Angular           | Range with two clicks, typed range ordered                                | picks a range with two clicks and reads a typed range                                       | ✅ covered |
| Angular           | Multiple dates keep it open                                               | picks multiple dates and keeps the calendar open                                            | ✅ covered |
| Angular           | Today button                                                              | selects today with the today button                                                         | ✅ covered |
| Angular           | State and message in aria-describedby                                     | describes the field with the state and the message                                          | ✅ covered |
| Angular           | aria-haspopup "dialog"                                                    | keeps aria-haspopup "dialog" on the button, as the calendar opens in a dialog               | ✅ covered |
| Angular           | Message in the popover                                                    | shows the message in the popover                                                            | ✅ covered |
| Angular           | Mobile: cancel restores, save keeps                                       | opens a dialog; cancel restores the date, save keeps it                                     | ✅ covered |
| Angular           | Forms: write, read, validate, disable                                     | writes, reads, validates and disables                                                       | ✅ covered |
| Angular           | Disabled does not open                                                    | does not open when disabled                                                                 | ✅ covered |
| Angular           | aria-required                                                             | sets aria-required                                                                          | ✅ covered |
| Angular           | Displayed month kept when adding a date                                   | keeps the displayed month when adding a multiple date                                       | ✅ covered |
| Angular           | Today in multiple mode navigates                                          | today button navigates to today in multiple mode                                            | ✅ covered |
| Angular           | Multiple ranges: pick, type, reject                                       | picks, types and rejects multiple date ranges                                               | ✅ covered |
| Angular           | Reversed typed range, disabled start/end                                  | accepts a reversed typed range and marks it invalid when its start or end is disabled       | ✅ covered |
| Angular           | Legend inside the calendar with legendCol                                 | renders the legend inside the calendar with legendCol                                       | ✅ covered |
| Angular           | Multiple dates and ranges through the form                                | writes and clears multiple dates and multiple ranges                                        | ✅ covered |
| fundamental-react | Create, className on the root, prop spreading to the root                 | passes native props, className and ref to the root                                          | ✅ covered |
| fundamental-react | Prop spreading to input, input group, button (with onClick), calendar     | passes props to the input, the input group, the button and the calendar                     | ✅ covered |
| fundamental-react | Range start/end, start > end, disabled range ends, Enter on ranges        | picks a range …; accepts a reversed typed range …                                           | ✅ covered |
| fundamental-react | Valid, disabled and text strings; modify on change; pre-populated value   | reads typed dates while typing …; sets the error state for a disabled date; shows the date… | ✅ covered |
| fundamental-react | Auto format to dateFormat, defaultValue with format and locale, ISO       | formats a typed date on blur; follows the format of customDateTimeFormat                    | ✅ covered |
| fundamental-react | Update when defaultValue changes                                          | shows the value it is given when controlled                                                 | ✅ covered |
| fundamental-react | Today button: shown, sets today, onChange (shown with ranges, as Angular) | selects today with the today button; keeps the calendar open after today with …             | ✅ covered |
| fundamental-react | onInputBlur, onInputFocus, onChange on typing and picking                 | passes props to the input …; writes, reads, validates and disables                          | ✅ covered |
| fundamental-react | onDatePickerClose after picking                                           | reports opening and closing with onOpenChange                                               | ✅ covered |
| fundamental-react | First displayed day by locale                                             | — (calendar: starts the weeks on every day of the week)                                     | ➖ n/a     |
| fundamental-react | validationOverlayProps, single overlay                                    | describes the field with the state and the message                                          | ✅ covered |
| fundamental-react | readOnly: no button, no popover                                           | has no button and does not open when readOnly                                               | ✅ covered |
| fundamental-react | Spreading to the calendar's month and year lists, table, thead, tbody     | —                                                                                           | ➖ n/a     |
| —                 | Field press keeps the calendar open, outside press closes                 | keeps the calendar open when the field is pressed, and closes on a press outside            | ✅ new     |
| —                 | buttonFocusable                                                           | keeps the button out of the tab order unless buttonFocusable                                | ✅ new     |
| —                 | Mobile Escape and close button discard                                    | discards the change on Escape and on the close button                                       | ✅ new     |
| —                 | Months of a single date (dateRangeFormat)                                 | picks months of a single date with dateRangeFormat                                          | ✅ new     |
| —                 | aria-labelledby / aria-label go to the input                              | labels the input from aria-labelledby or aria-label                                         | ✅ new     |
| —                 | openToDate, projected content                                             | opens on openToDate without a value; shows projected content in the popover                 | ✅ new     |

The first displayed day by locale is the calendar's (tested there). The calendar's inner tables take no props
(`calendarProps` go to its root).

### Visual comparison

`pnpm visual date-picker`: 12 cases × 16 combinations, 168/192 matching, the other 24 kept (below); the same since the
input padding, placeholder and today button fixes moved from the picker into the input group and button. Our
`Reference` stories are fundamental-styles' Today Selection Button story (Design Patterns): the same label,
placeholder and button name, the label and field in a box as wide as the label. The field closed (`Reference`)
compares by pixels: the field at rest and on hover, the input and the calendar button at rest and on hover. The
calendar open and rendered into the page (`Reference: open`): the popover surface by computed style
(fundamental-styles shows a selected range and legend colours), the today footer bar and the today button at rest and
on hover by pixels. `Reference: mobile` against the Mobile Portrait story: the window, header bar and calendar by
computed style (fundamental-styles' static docs window holds a date/time switch and no footer). The field focus ring
is the input group's (compared there).

| Difference                                                                            | Cause                                                                                                                                                | Resolution                                                                                           |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Field 34px narrower                                                                   | fundamental-styles' field fills a box as wide as its label                                                                                           | Fixed in the story (the same box); the picker is `inline-block` as Angular's.                        |
| Calendar button blue (`--sapButton_Selected_TextColor`) instead of the text colour    | The calendar is open: Angular marks the button of an open picker; fundamental-styles' static story does not                                          | Kept (Angular and the input group's `isExpanded`); the field cases use the closed `Reference` story. |
| Compact input start padding 10px instead of 8px                                       | The group's `compact:px-2` lost to its `first:ps-2.5`; fundamental-styles' date picker input has the compact field padding                           | Fixed in the input group (`fix(input-group)`). Also Angular (no compact padding there).              |
| HC placeholder upright instead of italic                                              | The input group set `hc:placeholder:not-italic`; fundamental-styles' date picker keeps italic                                                        | Fixed in the input group (`fix(input-group)`). Also Angular.                                         |
| Today footer without the popover's bottom corners (8px, 4px in HC)                    | Angular's footer bar has no radius                                                                                                                   | Fixed: `rounded-b-sap-popover-border-corner-radius` (not in the mobile dialog). Angular issue.       |
| Today button 53–57px wide instead of 64px                                             | fundamental-styles' footer buttons have a 4rem minimum; Angular's button has none; `decisive` lost to the compact button minimum (`compact:min-w-8`) | Fixed: `decisive` (in compact since `fix(button)`). Angular issue.                                   |
| Field, input and calendar button: 3.1–4.6% pixels in HC and compact (24 combinations) | fundamental-styles' story has its calendar open: the popover's shadow falls on the bottom rows of the field; the computed styles are equal           | Kept: not a difference of the field (solid `--sapField_Background` in both).                         |
| Mobile window `min-height` 100% instead of 120px                                      | fundamental-styles' docs window keeps the dialog's 7.5rem minimum; ours is the dialog's full-screen mobile window                                    | Kept (the dialog component's), ignored in the case.                                                  |
| Mobile header without rounded top corners (12px, 4px in HC)                           | fundamental-styles' docs window keeps them; a full-screen mobile window has none                                                                     | Kept (the dialog component's), ignored in the case.                                                  |
| Compact mobile calendar 0 instead of 8px padding                                      | fundamental-styles' compact calendar padding wins over the mobile layout's none (specificity); mobile layouts are cozy in Fiori                      | Kept (the calendar component's), ignored in the case.                                                |

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: `Reference`, `Reference: open`, `Open: calendar`,
`Open: range`, `Reference: mobile` and `Single`.
