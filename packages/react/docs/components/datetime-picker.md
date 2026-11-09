## datetime-picker

Sources: no fundamental-react source · Angular [`registry/ui/datetime-picker`](../../../angular/registry/ui/datetime-picker/)
· fundamental-styles has no datetime picker story: the
[Date Picker pattern](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-patterns-date-picker--docs) (the
field, the popover with a footer bar) and its Mobile Portrait story (a date/time switch over the calendar, which is the
datetime picker's mobile layout) are the references.
Registry: `registry/ui/datetime-picker/`, on the `datetime` lib (`useDatetimeAdapter`, `useDateTimeFormats`),
[calendar](calendar.md), [time](time.md), [input-group](input-group.md), [popover](popover.md) (Base UI Popover),
[dialog](dialog.md) (Base UI Dialog, mobile mode), [segmented-button](segmented-button.md) (the date/time switch),
[form](form.md) (`FormInputMessageGroup`, `FormMessage`), [bar](bar.md) and [button](button.md). Base UI has no date
or time picker: the field, parsing, validation, the picked values and the keyboard handling are ported from Angular,
as in [date-picker](date-picker.md), whose conventions it follows; the popup is our `Popover` with the button as its
`PopoverTrigger` and the input group as its anchor.

API: `DatetimePicker<D = FdDate>` (Angular's `fd-datetime-picker`):

- The inputs as props: `inputId`, `placeholder`, `disabled`, `required`, `customDateTimeFormat`, `meridian`,
  `displayHours`, `displayMinutes`, `displaySeconds` (by default from the format), `keepTwoDigitsTime`,
  `spinnerButtons`, `message`, `messageType`, `messageTriggers`, `placement`, `useValidation`, `state`, `allowNull`,
  `showFooter`, `processInputOnBlur`, `preventScrollOnFocus`, `buttonFocusable`, the calendar's options
  (`markWeekends`, `showWeekNumbers`, `startingDayOfWeek`, `yearGrid`, `aggregatedYearGrid`, `specialDaysRules`,
  `showCalendarLegend`, `legendCol`, `disableFunction`), `mobile`, `mobileConfig`, `mobileLandscape`,
  `mobilePortrait`, `labels` (`DATETIME_PICKER_LABELS`), `calendarLabels` and `timeLabels`. Angular's
  `ariaLabelledBy` is the native `aria-labelledby` (with `aria-label`, it goes to the input); the projected content is
  `children` (in the picker above the calendar).
- `date` is Angular's `date` input: the value follows it (a linked value), and also holds what the user typed or
  picked until a new `date` comes (one that differs from the last: an equal date in a new object is no new date); `defaultDate` for an uncontrolled picker. `onDateChange` is Angular's `dateChange`
  (user changes that are valid and differ from the value). `open`/`defaultOpen`/`onOpenChange` (`isOpen`) and
  `activeView`/`defaultActiveView`/`onActiveViewChange` are the two models. `onClosed` is the `closed` output.
- The forms part (`ControlValueAccessor`, `Validator`): `onValueChange(value)` is `registerOnChange` (every user
  change, an invalid date or a disallowed `null` included, as upstream); `onValidityChange(valid)` is the validator (on
  mount and on change); `onTouched` is `registerOnTouched` (the field left, the picker closed, the focus leaving the
  picker); `disabled` covers `setDisabledState`; a `date` set from outside is shown as `writeValue` shows it, without
  `onDateChange`.
- `actionsRef` gives Angular's public `setOpen()`, `submit()`, `cancel()`, `read()` and the `invalid` state
  (`isInvalid()`).
- Native props and the ref go to the root (`inline-block`, as Angular's host); `id` also prefixes the ids of the
  input (`-input`), calendar (`-calendar`), time (`-time`), dialog title and description.
- New, as the date picker and the time picker: `inputProps`, `buttonProps`, `calendarProps` and `timeProps` (spread
  to those parts) and `container` (the element the popover or dialog renders into).

Behaviour, ARIA and keyboard, as Angular: the input has `aria-label` "Date and time input" (unless labelled),
`aria-required`, `aria-invalid` in the error state and `aria-describedby` with the state ("Value state Error") and the
message; the button "Open picker" (glyph `date-time`) has `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`
(Base UI) and is out of the tab order unless `buttonFocusable`. F4 toggles, Alt+ArrowDown opens, Escape closes and
returns to the field. Opening starts the picked values from the value (or no day and now), shows its month and
focuses the active day; Tab moves from the calendar to the time columns and the footer (focus trapped in the popover).
OK applies the picked day and time and returns to the field (disabled until a day is picked); Cancel, Escape and a
press outside drop them. Without the footer a pick applies at once and the picker stays open. Typed text is read
while typing (or on Enter and blur with `processInputOnBlur`) with `customDateTimeFormat` (or the formats'
`dateTimeInput`); what was typed stays, a readable value is formatted on blur. An unreadable date, a disabled one, or
an empty field with `allowNull={false}` sets the error state once the field was left (or the picker closed), unless
`state` is set. The value state message shows under the field on focus, hides while the picker is open and shows in
it instead. On screens narrower than 60rem a segmented button switches between the calendar and the time; the mobile
dialog shows them side by side with `mobileLandscape`, and one at a time (with the switch) otherwise. In mobile mode a
press in the field opens a full-screen `Dialog` (title, close button, OK and Cancel, with `mobileConfig`'s texts);
picks apply only with OK, Escape, Cancel and the close button drop them.

**Differences, on purpose:**

- `aria-describedby` lists the state description and the message's id (the message group links the message, as for
  every field); Angular puts both texts in one description element. The texts read are the same (as date-picker).
- A press or focus outside the picker closes it and leaves the focus there; Angular returns it to the field on every
  close. Escape, Cancel, OK, the button and F4 return it to the field, as Angular (as date-picker).
- The validity is derived from the value on every render, so a `date` set from outside is validated too; Angular's
  `invalid` signal follows only typing, picks and `writeValue`, not a new `date` input.
- A `date` equal to the last one (a new object each render, e.g. `date={new FdDate(…)}`) is no new date and keeps
  what was typed; Angular's linked signal takes every new object as a new date.
- The mobile portrait dialog shows the calendar in its full-width portrait layout (`mobilePortrait`), as
  fundamental-styles' Mobile Portrait story and our date picker; Angular's datetime picker keeps the 18rem calendar.
- The mobile dialog title is a `DialogTitle` (`<h2>`, as fundamental-styles' dialogs); Angular uses `<h1>` (as
  date-picker).
- The popover footer has the popover's bottom corners and decisive (4rem) OK and Cancel buttons, as fundamental-styles'
  footer buttons and our date picker's today footer; Angular's footer has neither (see the visual comparison).
- In RTL the field text keeps the browser's bidi order, as fundamental-styles, UI5 and Angular (see date-picker and
  time-picker): `3/9/2024, 2:30 PM` shows as `PM 2:30 ,3/9/2024`.

**Angular's flaky spec.** "parses typed text with customDateTimeFormat" fails about one run in five on `main`
(reproduced: the field ends as `3/12/2024, 00:00:006:45:30`). The cause is a race in Angular, not in the test: typing
`3/12/2024, ` gives a valid date, which the picker emits (`dateChange`); the next keystroke (`3/12/2024, 1`) gives an
unreadable one, which is held in the `value` linked signal but not emitted. When change detection runs only after
that keystroke, the two-way binding then writes the earlier emitted date into the `date` input; `value` (linked to
`date`) takes it as a new date from outside and `text` (linked to `value`) formats it, replacing what was typed
(`3/12/2024, 00:00:00`), and the rest of the typing is appended to it. It depends on whether a change detection pass
lands between two keystrokes. In React the parent's state and the picker's own state are updated in the same batch of
the input event, so a date given back is always the one the picker already holds and keeps the text: the React test
is deterministic, and a new test types that exact sequence (`3/12/2024, ` then `1`) and checks the text is kept. (The
React port first had a bug of its own on the same path: an equal date read again replaced the value object and
reformatted the text; fixed, covered by the same test.)

### Visual differences from fundamental-styles, kept on purpose

| Difference                                                         | Cause                                                                                                                          | Resolution                                                                        |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| Mobile footer without rounded bottom corners (12px, 4px in HC)     | fundamental-styles' docs window keeps them; a full-screen mobile window has none                                               | Kept (the dialog component's, as the header in date-picker), ignored in the case. |
| Field on hover 3.5–5.1% off (12 combinations), field at rest in HC | The button glyph is the datetime picker's `date-time` (fundamental-ngx, UI5); the reference is a date picker (`appointment-2`) | Kept: the right glyph; the button compares by styles (equal).                     |
| Field and input 3.1–5.1% off in HC (16 combinations)               | fundamental-styles' story has its calendar open: the popover's shadow falls on the bottom rows of the field                    | Kept, as in date-picker: the computed styles are equal.                           |
