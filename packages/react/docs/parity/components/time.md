## time

Sources: fundamental-react [Time](https://github.com/SAP/fundamental-react/tree/main/src/Time) · Angular
[`registry/ui/time`](../../../../angular/registry/ui/time/) · fundamental-styles
[Time](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-time--docs)
Registry: `registry/ui/time/`, on the `datetime` lib (`useDatetimeAdapter`). Base UI has no primitive for a column of
values (its `NumberField` is a text field with steppers): the spinbutton columns, keys, wheel and dragging are ported
from Angular; the spinner buttons are our `Button`.

API: two components, as Angular's:

- `Time<D = FdDate>` (Angular's `fd-time`): the inputs as props (`meridian`, `keepTwoDigits`, `disabled`,
  `displayHours`, `displayMinutes`, `displaySeconds`, `tablet`, `elementsAtOnce`, `spinnerButtons`, `minuteStep`,
  `labels`). Angular's two models are controlled/uncontrolled pairs with a change callback, as the calendar's:
  `time`/`defaultTime` (today at 00:00:00 by default, as Angular)/`onTimeChange`, and
  `activeView`/`defaultActiveView` (`hour`)/`onActiveViewChange`. The forms part: `onTimeChange` is Angular's
  `registerOnChange` (user changes only); `null` or an invalid `time` shows today at 00:00:00, as Angular's
  `writeValue`; `disabled` is `setDisabledState`; `onTouched` is `registerOnTouched` (the focus left the time; moving
  between the columns does not count). `actionsRef` gives Angular's public `focusActiveColumn()` (for the time and
  datetime pickers). Native props (`id`, `className`, `aria-*`, handlers) and the ref go to the `role="group"` root;
  the columns' spinbuttons get `<id>-hours`, `-minutes`, `-seconds` and `-period`. `TIME_LABELS`, `TimeLabels`,
  `TimeColumnConfig`, `SelectableViewItem`, `FdTimeActiveView` and `Meridian` as Angular's.
- `TimeColumn<T>` (`fd-time-column`): `rows`, `activeValue`/`onActiveValueChange`, `active`, `spinners`,
  `elementsAtOnce`, `loop`, `disabled`, `config` and `onActivate`; `id` names the spinbutton (as Angular), other native
  props go to the column; `actionsRef` gives `focus()` and `step(steps)`.

ARIA and keyboard, as Angular: the root is a `role="group"` named "Time picker"; each column is a `role="spinbutton"`
(one tab stop each) with the full label, `aria-valuenow` (the index), `aria-valuemin`/`aria-valuemax`,
`aria-valuetext` (the label), `aria-description` (the navigation instruction) and `aria-disabled`; the visible values
and the short column label are `aria-hidden`; the spinner buttons are out of the tab order (`tabindex="-1"`) with
`aria-label` and `title`. Left and Right move between the columns (wrapping, mirrored in RTL); Up and Down step the
value (wrapping, except the period column); Page Up and Page Down step by `elementsAtOnce`; Home and End go to the
first and last value; digits pick a value (at once when no longer number can follow, else after 500ms); letters pick
the first label starting with them (A and P for the period). The mouse wheel steps the active column (and keeps the
page from scrolling; inactive columns leave the wheel to the page), dragging steps one value per item height, a
click on a value picks it, a click or the focus on an inactive column activates it.

fundamental-react mapping: `format12Hours` is `meridian`; `showHour`, `showMinute` and `showSecond` are
`displayHours`, `displayMinutes` and `displaySeconds`; `time` (an object of `hour`, `minute`, `second` and `meridiem`)
is a date of the adapter (`time`/`defaultTime`); `onChange` is `onTimeChange`; `localizedText` is `labels` (and the
adapter's locale for the period names); `disabled` and `id` are the same; `name` is a native prop of the root; the
`hours…`/`minutes…`/`seconds…`/`meridiem…` `UpButtonProps`, `DownButtonProps` and `InputProps` are not ported (the
buttons and values are internal parts of the spinbutton column); `cssNamespace` is gone.

**Differences on purpose:**

- Stepping a value does not carry into the next column: fundamental-react's buttons turn 00 minutes down into 59 and
  one hour less, Angular wraps the column alone (59 minutes, same hour). The period follows the hour, as Angular.
- React's `onWheel` is passive, so the wheel listener is a native one (`passive: false`), as needed to keep the page
  from scrolling.
- A `time` with no `onTimeChange` is controlled: it does not change on keys or clicks, where Angular's one-way bound
  model changes locally. Use `defaultTime` for that (the stories do).
- The `labels` of fundamental-react ("am"/"pm", "AM/PM") are Angular's ("Period", the adapter's day period names).

### Stories vs. sources

| Source            | Example                      | React story     | Status     | Notes                                                                             |
| ----------------- | ---------------------------- | --------------- | ---------- | --------------------------------------------------------------------------------- |
| fundamental-react | primary                      | `Playground`    | ✅ covered |                                                                                   |
| fundamental-react | meridiemTime                 | `Playground`    | ✅ covered | Only a `name` attribute: a native prop of the root.                               |
| fundamental-react | disabledTime                 | `Disabled`      | ✅ covered |                                                                                   |
| fundamental-react | customTime                   | `Playground`    | ✅ covered | Only a `name` attribute.                                                          |
| fundamental-react | twelveHour                   | `TwelveHour`    | ✅ covered | `meridian keepTwoDigits`.                                                         |
| fundamental-react | hideSeconds                  | `HiddenColumns` | ✅ covered | `displaySeconds={false}`.                                                         |
| fundamental-react | hideMinutes                  | `HiddenColumns` | ✅ covered | `displayMinutes={false}`.                                                         |
| fundamental-react | hideHours                    | `HiddenColumns` | ✅ covered | `displayHours={false}` with `defaultActiveView="minute"`.                         |
| fundamental-react | timeMeridiemSet              | `TimeSet`       | ✅ covered | 22:34:12 on a 24-hour clock.                                                      |
| fundamental-react | time12Set                    | `TwelveHour`    | ✅ covered | "12-hour clock, time set": 12:55:06 PM.                                           |
| fundamental-react | dev                          | `Playground`    | ✅ covered | Controls for every prop, locale and compact; the value under it.                  |
| fundamental-react | noStyles                     | —               | ➖ n/a     | No `cssNamespace`.                                                                |
| Angular           | Basic                        | `Basic`         | ✅ covered | Its `play` steps the hours and moves to the minutes with the keyboard.            |
| Angular           | Options                      | `Options`       | ✅ covered | The disabled form control is a `disabled` time.                                   |
| Angular           | Programmatic                 | `Programmatic`  | ✅ covered |                                                                                   |
| Angular           | ReactiveForm                 | `ReactiveForm`  | ✅ covered | Touched (`onTouched`) and dirty (`onTimeChange`); no value shows today 00:00:00.  |
| —                 | fundamental-styles reference | `Reference`     | ✅ new     | 04:25:10 as fundamental-styles' Default and Tablet stories, for the visual cases. |

### Tests vs. sources

| Source            | Behaviour                                                 | React test                                                                            | Status     |
| ----------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------- |
| Angular           | Spinbutton columns, window around the value               | shows spinbutton columns; the active one shows a window around the value              | ✅ covered |
| Angular           | Up and Down, wrapping, date kept                          | changes the active column with Up and Down, wrapping around                           | ✅ covered |
| Angular           | Left and Right between columns                            | moves between the columns with Left and Right                                         | ✅ covered |
| Angular           | Click on a value, spinner buttons, click activates        | picks a clicked value and steps with the spinner buttons                              | ✅ covered |
| Angular           | Typed digits                                              | takes typed digits                                                                    | ✅ covered |
| Angular           | 12-hour clock and period letters                          | splits the day into periods with a 12-hour clock                                      | ✅ covered |
| Angular           | Minute steps                                              | steps minutes                                                                         | ✅ covered |
| Angular           | Period across 11 and 12                                   | switches the period when the hours step across 11 and 12                              | ✅ covered |
| Angular           | Page Up, Page Down, Home, End                             | moves within a column with Page Up, Page Down, Home and End                           | ✅ covered |
| Angular           | Mouse wheel                                               | steps the active column with the mouse wheel                                          | ✅ covered |
| Angular           | Dragging                                                  | changes the value when a column is dragged                                            | ✅ covered |
| Angular           | spinnerButtons false                                      | hides the spinner buttons with spinnerButtons false                                   | ✅ covered |
| Angular           | Tablet paddings and compact values                        | uses smaller paddings and larger compact values for tablets                           | ✅ covered |
| Angular           | Forms: write, read, disable                               | writes, reads and disables                                                            | ✅ covered |
| Angular           | Forms: touched when the focus leaves                      | reports touched when the focus leaves the time                                        | ✅ covered |
| fundamental-react | Up/down clicks on hours and minutes (12- and 24-hour)     | steps from midnight with the spinner buttons of the active column (fundamental-react) | ✅ covered |
| fundamental-react | Up/down clicks on the meridiem, click on a value          | steps from midnight … (a click on a value of the period)                              | ✅ covered |
| fundamental-react | Carrying seconds into minutes and minutes into hours      | —                                                                                     | ➖ n/a     |
| fundamental-react | Props spread to the up/down buttons and values per column | —                                                                                     | ➖ n/a     |
| fundamental-react | Prop spreading to the root (`id`, native props)           | passes className, native props and the ref to the root                                | ✅ covered |
| —                 | RTL arrow keys                                            | mirrors Left and Right in RTL                                                         | ✅ new     |
| —                 | Hidden columns, labels                                    | hides columns and shows the given labels                                              | ✅ new     |
| —                 | No value or an invalid one                                | shows today at midnight without a time, and for an invalid one                        | ✅ new     |
| —                 | Controlled and uncontrolled time                          | keeps a controlled time without a change handler and an uncontrolled one by itself    | ✅ new     |
| —                 | Controlled view, `focusActiveColumn`                      | can control the active column and focus it from code                                  | ✅ new     |
| —                 | `TimeColumn` alone                                        | is a spinbutton of its rows that steps from code                                      | ✅ new     |

Carrying is n/a on purpose (see above). The per-column button and value props of fundamental-react are not ported:
the buttons and values are internal parts of the spinbutton.

### Visual comparison

`pnpm visual time`: 14 cases × 16 combinations, 208/224 matching; the 16 others are the tablet cases in compact,
kept on purpose (below). Our `Reference` story shows 04:25:10 as fundamental-styles' Default and Tablet stories (two
digits, the period column labelled "AM/PM" as theirs), so most cases compare by pixels: a value at rest and on hover,
the collapsed value of an inactive column at rest and on hover, a column label, the spinner button, a period value,
the active hours column and the active period column (the whole window), a tablet value and a tablet column. The
selected value compares by styles only, and its border with fundamental-styles' current indicator (size, width,
radius, border); the whole time by styles only (fundamental-styles' time has no padding: the time picker's popover
adds it, Angular's time has its own).

| Difference                                                                                         | Cause                                                                                                                                                         | Resolution                                                                                                                                            |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Selected value black instead of #2e2e2e in Horizon HC Black (white in HC White instead of #d9d9d9) | The selected value used `--sapList_Background` (fundamental-styles' unused `--current` modifier); its stories show the working background under the indicator | Fixed: `bg-sap-legend-working-background`. Angular issue.                                                                                             |
| Selected value border 1px off (5.8% of pixels)                                                     | fundamental-styles draws it with an absolute indicator over the item that sits 1px towards the end                                                            | Kept: the border is the item's own, aligned with it; compared by styles (`selection border`).                                                         |
| Collapsed value: `cursor: pointer` instead of `default`                                            | Angular's `cursor-pointer`                                                                                                                                    | Fixed: `cursor-default`. Angular issue (cursor only).                                                                                                 |
| Column label: `cursor: auto` instead of `text`                                                     | Angular's label has no cursor                                                                                                                                 | Fixed: `cursor-text`. Angular issue (cursor only).                                                                                                    |
| Tablet in compact: values 46px high instead of 32px                                                | Angular keeps touch-sized values on tablets in compact (`compact:[--time-item-h:2.875rem]`); fundamental-styles' compact rule wins over `--tablet`            | Kept, on purpose (Angular's spec tests it): tablets are touch devices, and Fiori keeps touch-sized targets there (compact is for mouse and keyboard). |

fundamental-styles has no focus or disabled time: the focused column shows the SAP focus outline on the selected (or
collapsed) value, inset by 3px, and a disabled time dims the values with `--sapContent_DisabledOpacity`, as Angular.

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: `Reference`, `Basic` and `Options`.
