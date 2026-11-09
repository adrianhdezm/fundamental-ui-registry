## time-picker

Sources: fundamental-react [TimePicker](https://github.com/SAP/fundamental-react/tree/main/src/TimePicker)
(`TimePicker.js`, `_TimePickerItem.js`) · Angular [`registry/ui/time-picker`](../../../angular/registry/ui/time-picker/)
· fundamental-styles
[Time Picker pattern](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-patterns-time-picker--docs)
Registry: `registry/ui/time-picker/`, on [time](time.md) (the columns, focused with its `actionsRef`'s
`focusActiveColumn()`), the `datetime` lib (`useDatetimeAdapter`, `useDateTimeFormats`), [popover](popover.md) (Base
UI's Popover: the body, outside press, Escape, the focus trap), [input-group](input-group.md) (`InputGroupInput` and a
button `InputGroupAddon` with our `Button`) and [form](form.md) (`FormInputMessageGroup` and `FormMessage` for the
value state message). Angular uses no dialog or bar here, and neither do we.

API: `TimePicker<D = FdDate>`, Angular's `fd-time-picker`. Its inputs are props: `inputId` (default `<id>-input`),
`placeholder` (by default from the shown columns, e.g. `hh:mm am/pm`), `disabled`, `required` (`aria-required`),
`spinnerButtons`, `meridian`, `displayHours`, `displayMinutes`, `displaySeconds` (by default from the display format,
as Angular), `timePickerInputLabel`, `timePickerButtonLabel`, `allowNull`, `tablet`, `message`, `messageType`,
`messageTriggers`, `placement`, `useValidation`, `state`, `buttonFocusable`, `keepTwoDigitsTime`, `displayFormat`,
`parseFormat` (default the `timeInput` formats of `useDateTimeFormats()`), `minuteStep` and `timeLabels`; Angular's
`ariaLabelledBy` is `aria-labelledby`, which goes to the input with `aria-label` and `aria-describedby`. Angular's two
models are controlled/uncontrolled pairs: `time`/`defaultTime` (default none)/`onTimeChange(time | null)` and
`open`/`defaultOpen`/`onOpenChange`. The forms part: `onTimeChange` is `registerOnChange` (user changes only),
`onTouched` is `registerOnTouched`, `disabled` is `setDisabledState`, `onInvalidChange` is the validator (Angular's
`validate()` and `invalid` signal), and a `time` changed from outside is validated as `writeValue` (`null` is invalid
without `allowNull`, an invalid date is invalid). `actionsRef` gives Angular's public `setOpen()`, `parse()` and the
`invalid` state (`isInvalid()`). `children` go into the popover above the columns (Angular's `<ng-content>`). Native
props, `className` and `ref` go to the root `<div>` (`inline-block`, as Angular's host).

Behaviour, ARIA and keyboard, as Angular: typed times are read on Enter and when the input loses the focus (a text
equal to the shown time is no change); an unreadable text stays in the field and sets the error state
(`aria-invalid`) unless `state` is set or `useValidation` is off; an empty field commits `null`. Day period texts
("in the morning") of `dayPeriod` formats are dropped before parsing. The field text follows the time, the locale and
the display format. The button (`aria-haspopup="dialog"`, `aria-expanded`, `aria-label` and `title` from
`timePickerButtonLabel`, out of the tab order with `buttonFocusable={false}`) toggles the columns; Alt+Down in the
input opens them; opening focuses the active column; Tab stays inside the open columns (focus trapped); Escape closes
them and returns to the input; a press outside closes them. The popover body is a dialog named by
`timeLabels.componentAriaName` ("Time picker"). The value state message shows under the field while it has the focus,
hides while the columns are open and shows inside the popover above them instead. Without a time the columns show
now.

fundamental-react mapping: `format12Hours` is `meridian`; `showHour`, `showMinute`, `showSecond` are
`displayHours`, `displayMinutes`, `displaySeconds` (or a display format without that part); `value` (a string such
as `'10:30:34 am'`) is `defaultTime` (a date of the adapter, e.g. `adapter.parse('10:30:34 am', format)`); `onChange`
(`{ time, formattedTime }`) is `onTimeChange` (the time; the text is the input's); `time` (the starting
hour/minute/second object of the columns) is the shown time (now) or `defaultTime`; `localizedText` (`meridiemAM`,
`meridiemPM`) comes from the adapter's locale (`getDayPeriodNames`) and `timeLabels`; `inputProps`, `buttonProps`,
`popoverProps` (to the popover body) and `timeProps` are kept; `disabled` and `id` are the same; `cssNamespace` is gone.

**Differences, on purpose:**

- The button's icon is fundamental-styles' (and UI5's) `time-entry-request`; Angular and fundamental-ngx use
  `fob-watch`.
- A press outside on another focusable element leaves the focus there; Angular moves it back to the input on every
  close (`afterNextRender`). Escape, the button and `setOpen(false)` still return to the input.
- `onTouched` fires when the focus leaves the picker: the field, the button and the open columns. Angular's host
  `focusout` also fired when the focus moved from the field into the columns (an overlay outside the host).
- A press in the field keeps the columns open (Angular's popover control is the whole field), with Base UI's outside
  press and focus-out closes cancelled for the field.
- The message in the popover is `embedded` without `static`: it spans the popover, as Angular's renders (its
  `static` is `w-auto`, which fills the body; our `static` is `w-fit`).
- fundamental-react's text field accepted any text and cleared invalid times on blur; ours keeps the typed text and
  shows the error state (Angular).
- In RTL the field text keeps the browser's bidi order, as fundamental-styles, UI5 and Angular: `4:25:10 PM` shows as
  `PM 4:25:10`, the order a right-to-left reader reads it in. Forcing the
  value left to right (`unicode-bidi: plaintext`) was tried and dropped: it reverses that order.
- fundamental-styles' pattern has an OK/Cancel footer bar; neither Angular nor we have it (changes apply at once).

### Visual differences from fundamental-styles, kept on purpose

| Difference                                                                     | Cause                                                                                                                                  | Resolution                                                                                                                                |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Expanded button in the selected colour (#0064d9) where the pattern has #131e29 | Angular colours the button of an open picker; the pattern story shows none, fundamental-styles' current time picker does (`is-active`) | Kept (Angular, and fundamental-styles' current picker): the pattern's button compared without colour, the colour with the current picker. |
| Popover body height (442px vs 486px)                                           | fundamental-styles' OK/Cancel footer                                                                                                   | Kept: no footer in Angular; height not compared.                                                                                          |
| Compact field and input 2px narrower (input start padding 8px vs 10px; 32)     | fundamental-styles' time picker loads the input-group rule (0.625rem) last; its date picker loads the compact field rule (0.5rem) last | Kept, as [input-group](input-group.md): 8px, as fundamental-styles' date picker and UI5's compact input.                                  |
| Tablet in compact: values 46px high instead of 32px (time 422px vs 324px)      | Angular keeps touch-sized values on tablets in compact; fundamental-styles' compact rule wins over `--tablet`                          | Kept, on purpose, as in [time](time.md): tablets are touch devices.                                                                       |
