## switch

Sources: fundamental-react [Switch](https://github.com/SAP/fundamental-react/tree/main/src/Switch) (`Switch.js`,
`_SwitchItem.js`) · Angular [`registry/ui/switch`](../../../angular/registry/ui/switch/) · fundamental-styles
[Switch](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-switch--docs)
Registry: `registry/ui/switch/`, on Base UI's `Switch` (`Switch.Root`; the thumb is drawn by the track, so
`Switch.Thumb` is not used).

API: the Angular inputs as props (`semantic`, `activeText`, `inactiveText`, `disabled`, `required`, `name`,
`acceptLabel`, `declineLabel`, `aria-label`/`aria-labelledby` for `ariaLabel`/`ariaLabelledBy`, `className` for
`class`), with the model in React form: `checked`/`defaultChecked`/`onCheckedChange` for Angular's `checked`,
`[(checked)]`, `checkedChange` and `ngModel`. `id` is the id of the hidden native input (Angular: the host id, with
the input at `<id>-input`), so an external `<label htmlFor>` works; `formValue` is the value submitted when on (Base
UI's `value`). Angular's `focus()` is the control ref, `inputProps.ref`. The label content is `children`, after the
switch, as Angular's `<ng-content>`.

From fundamental-react: `checked`, `children`, `disabled`, `id`, `semantic`, `inputProps` (props of the focusable
control), `labelProps` and the root `ref`/native props; `inputRef` is the hidden native input. `compact` is
`data-density="compact"` on the switch or an ancestor; `onChange` is `onCheckedChange` (the event is
`eventDetails.event`); `localizedText.switchLabel` (a default name "Switch") is `aria-label`, with no default.
`internalLabels` maps to `activeText`/`inactiveText` (texts) or the built-in icons (accept/less, semantic
accept/decline); custom glyphs per state are not ported, as in Angular. `showInternalLabels` (the state text next to
the switch) is left to the page: the `InternalLabels` story shows it beside the switch.

**Differences on purpose:**

- Base UI renders the control as a focusable `<span role="switch">` with `aria-checked`, `aria-required` and
  `aria-disabled`, next to a visually hidden native checkbox (which takes `id`, `name`, `required` and is what forms
  and an external `<label htmlFor>` see). Angular focuses and announces the native `<input role="switch">` itself.
  The control draws the track (Angular's slider) and the focus frame; the handle, icons and texts are in an
  `aria-hidden` child, so they are not part of the name.
- Space toggles the focused switch, as in Angular; Enter toggles it too (Base UI's button behaviour, and
  fundamental-react's Enter handler).
- A semantic switch is named by its `aria-labelledby`, else its `aria-label` (through a hidden copy), else its label
  content, followed by the announced state (`acceptLabel`/`declineLabel`). Angular names a semantic switch without
  `ariaLabelledBy` by the state alone ("Decline"), dropping the label content, and puts `ariaLabel` on the `<label>`
  instead of the control.
- The hover colours are set with `hover:` on the label. Angular uses `group-hover/sw:` on the group element itself,
  which never matches (the variant targets descendants), so its switches show no hover colours (Angular issue).
- The root is a block `<span>` (Angular's host is `display: block`), without Angular's host `id`.
