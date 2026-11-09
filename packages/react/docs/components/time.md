## time

Sources: fundamental-react [Time](https://github.com/SAP/fundamental-react/tree/main/src/Time) · Angular
[`registry/ui/time`](../../../angular/registry/ui/time/) · fundamental-styles
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

### Visual differences from fundamental-styles, kept on purpose

| Difference                                          | Cause                                                                                                                                              | Resolution                                                                                                                                            |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Selected value border 1px off (5.8% of pixels)      | fundamental-styles draws it with an absolute indicator over the item that sits 1px towards the end                                                 | Kept: the border is the item's own, aligned with it; compared by styles (`selection border`).                                                         |
| Tablet in compact: values 46px high instead of 32px | Angular keeps touch-sized values on tablets in compact (`compact:[--time-item-h:2.875rem]`); fundamental-styles' compact rule wins over `--tablet` | Kept, on purpose (Angular's spec tests it): tablets are touch devices, and Fiori keeps touch-sized targets there (compact is for mouse and keyboard). |
