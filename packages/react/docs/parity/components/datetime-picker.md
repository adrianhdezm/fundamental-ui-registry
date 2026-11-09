## datetime-picker

Sources: no fundamental-react source · Angular [`registry/ui/datetime-picker`](../../../../angular/registry/ui/datetime-picker/)
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

### Stories vs. sources

| Source             | Example                                       | React story                                     | Status     | Notes                                                                                                  |
| ------------------ | --------------------------------------------- | ----------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------ |
| Angular            | Basic                                         | `Basic`                                         | ✅ covered | OK, no footer, 24-hour with seconds and a long date, on-blur with weekends disabled, states, disabled. |
| Angular            | SpecialDays                                   | `SpecialDays`                                   | ✅ covered | Legend in rows and in a column.                                                                        |
| Angular            | Forms                                         | `Forms`                                         | ✅ covered | `onValueChange`, `onValidityChange`, `onTouched` and `disabled` instead of the form control.           |
| Angular            | Locale                                        | `Locale`                                        | ✅ covered | `DatetimeAdapterProvider locale` with a `Select`.                                                      |
| Angular            | Mobile                                        | `Mobile`                                        | ✅ covered | Portrait and landscape.                                                                                |
| Angular            | Formatting                                    | `Formatting`                                    | ✅ covered | `DateTimeFormatsProvider` instead of the `DATE_TIME_FORMATS` provider; long month; day period.         |
| Angular            | Open: popover                                 | `OpenPopover`                                   | ✅ covered | With the message in the popover.                                                                       |
| Angular            | Open: mobile                                  | `OpenMobile`                                    | ✅ covered |                                                                                                        |
| Angular            | Open: mobile landscape                        | `OpenMobileLandscape`                           | ✅ covered |                                                                                                        |
| —                  | Playground                                    | `Playground`                                    | ✅ new     | Controls for the props, locale, compact and disabled weekends.                                         |
| fundamental-styles | Date Picker pattern, Mobile Portrait (switch) | `Reference`, `ReferenceOpen`, `ReferenceMobile` | ✅ new     | The field, the open popover and the mobile dialog, rendered into the page, for the visual cases.       |

### Tests vs. sources

| Source  | Behaviour                                                             | React test                                                                                 | Status     |
| ------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------- |
| Angular | The date and time in the field, label, aria-expanded                  | shows the date and time in the field                                                       | ✅ covered |
| Angular | Opens on the date, columns of the format                              | opens on the date with the time columns of the format                                      | ✅ covered |
| Angular | OK applies day and time, focus back                                   | applies the picked date and time with OK                                                   | ✅ covered |
| Angular | Cancel and Escape drop the picks                                      | drops the picked values with Cancel and Escape                                             | ✅ covered |
| Angular | No footer: applies at once                                            | applies at once without the footer                                                         | ✅ covered |
| Angular | Reads typed values; error once left                                   | reads typed values; the error shows once the field was left                                | ✅ covered |
| Angular | processInputOnBlur, disable function                                  | reads on Enter only with processInputOnBlur, and checks the disable function               | ✅ covered |
| Angular | State and message in aria-describedby                                 | references the state and the message from aria-describedby                                 | ✅ covered |
| Angular | aria-haspopup "dialog"                                                | keeps aria-haspopup "dialog" on the button, as the picker opens in a dialog                | ✅ covered |
| Angular | F4                                                                    | opens with F4 and Alt+Down and toggles with F4                                             | ✅ covered |
| Angular | Mobile: calendar or time, OK                                          | shows the calendar or the time in a dialog and applies with OK                             | ✅ covered |
| Angular | Forms: write, read, validate, disable                                 | writes, reads, validates and disables                                                      | ✅ covered |
| Angular | dateChange: once per accepted change, not written values/Cancel/no-op | emits once per accepted change and not for a written value, Cancel or a no-op submit       | ✅ covered |
| Angular | dateChange: null once                                                 | emits null once when an allowed value is cleared                                           | ✅ covered |
| Angular | dateChange: invalid input to the form only                            | does not emit for unreadable, disabled or disallowed null input, but passes it to the form | ✅ covered |
| Angular | dateChange without footer, stays open                                 | emits once without the footer and keeps the popover open after a day pick                  | ✅ covered |
| Angular | Disabled does not open                                                | does not open when disabled                                                                | ✅ covered |
| Angular | 24-hour columns with seconds                                          | shows 24-hour columns with seconds for a matching format                                   | ✅ covered |
| Angular | Parses with customDateTimeFormat (flaky on `main`)                    | parses typed text with customDateTimeFormat                                                | ✅ covered |
| Angular | Legend inside the calendar                                            | renders the legend inside the calendar                                                     | ✅ covered |
| Angular | Message hidden while open, shown on close                             | hides the message while open and shows it again on close                                   | ✅ covered |
| Angular | Reopens on the submitted month                                        | reopens on the month of the submitted date                                                 | ✅ covered |
| —       | The race behind Angular's flaky spec                                  | keeps what was typed when the date it emitted comes back after a later keystroke           | ✅ new     |
| —       | An equal `date` in a new object keeps the typing                      | takes an equal date given again (a new object each render) as no new date                  | ✅ new     |
| —       | Mobile: Escape, Cancel, close button discard; `onClosed`              | discards the picked values on Escape, Cancel and the close button                          | ✅ new     |
| —       | Mobile landscape                                                      | shows the calendar and the time side by side in landscape                                  | ✅ new     |
| —       | No value: today and now, OK disabled                                  | opens on today without a value, with OK disabled until a day is picked                     | ✅ new     |
| —       | Root props, ref                                                       | passes native props, className and ref to the root                                         | ✅ new     |
| —       | Part props                                                            | passes props to the input, the button, the calendar and the time                           | ✅ new     |
| —       | Labels, aria-required                                                 | labels the input from aria-labelledby or aria-label, and sets aria-required                | ✅ new     |
| —       | buttonFocusable                                                       | keeps the button out of the tab order unless buttonFocusable                               | ✅ new     |
| —       | Field press keeps open, outside press closes                          | keeps the picker open on a press in the field, and closes it on a press outside            | ✅ new     |
| —       | `actionsRef`, controlled `open`, `onOpenChange`                       | opens and closes from code and controlled, and reports it                                  | ✅ new     |
| —       | Disabled while open                                                   | closes when disabled while open                                                            | ✅ new     |
| —       | `onTouched`, `state`, `useValidation`                                 | reports touched when the field is left, and takes a state over the validation              | ✅ new     |
| —       | Projected content, column options                                     | shows projected content in the picker and takes the column options                         | ✅ new     |

### Visual comparison

`pnpm visual datetime-picker`: 16 cases × 16 combinations, 228/256 matching (192/256 at first); the 28 others are kept
(below). fundamental-styles has no datetime picker story, so the references are its date picker pattern (Today
Selection Button: the field, the popover and its footer bar) and its Mobile Portrait story, which is the datetime
picker's mobile layout (a Date/Time segmented button over the calendar, an OK button in the footer). Our `Reference`
stories take the same label, placeholder, button name and dialog title, rendered into the page. Cases: the field at
rest and on hover, the input, the button at rest and on hover (by styles), the popover body and its footer bar (by
styles: a calendar and time columns, OK and Cancel against a calendar and Today), the OK button at rest and on hover
(by pixels, against the mobile pattern's OK), and in the mobile dialog the window, header, date/time switch row
(centred, 1rem below the header), the switch (by pixels), the calendar, the footer and the OK button.

| Difference                                                                    | Cause                                                                                                                          | Resolution                                                                                                        |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Field and input 5–7% off in every combination (first run)                     | Our `Reference` field showed a value, fundamental-styles' the placeholder                                                      | Fixed in the story: the closed reference field has no value.                                                      |
| Mobile footer without rounded bottom corners (12px, 4px in HC)                | fundamental-styles' docs window keeps them; a full-screen mobile window has none                                               | Kept (the dialog component's, as the header in date-picker), ignored in the case.                                 |
| OK and Cancel 4rem decisive buttons; footer with the popover's bottom corners | fundamental-styles' footer buttons are decisive and its popover footer rounded; Angular's footer has neither                   | Fixed in the component (`decisive`, `rounded-b-sap-popover-border-corner-radius`), as date-picker. Angular issue. |
| Portrait calendar 18rem in the mobile dialog                                  | Angular passes no mobile layout to the calendar; fundamental-styles' Mobile Portrait calendar spans the dialog                 | Fixed: `mobilePortrait` in the portrait dialog, as date-picker. Angular issue.                                    |
| Field on hover 3.5–5.1% off (12 combinations), field at rest in HC            | The button glyph is the datetime picker's `date-time` (fundamental-ngx, UI5); the reference is a date picker (`appointment-2`) | Kept: the right glyph; the button compares by styles (equal).                                                     |
| Field and input 3.1–5.1% off in HC (16 combinations)                          | fundamental-styles' story has its calendar open: the popover's shadow falls on the bottom rows of the field                    | Kept, as in date-picker: the computed styles are equal.                                                           |

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: `Basic`, `Open: popover`, `Reference: open`,
`Reference: mobile`, `Open: mobile` and `Open: mobile landscape`. In RTL the calendar and the time columns swap sides
and the footer buttons move to the start, as the bar mirrors; the field shows `PM 2:30 ,3/9/2024` (bidi order, above).
