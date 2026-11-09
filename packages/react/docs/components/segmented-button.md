## segmented-button

Sources: fundamental-react [ButtonSegmented](https://github.com/SAP/fundamental-react/tree/main/src/Button)
(`Button/ButtonSegmented.js`) · Angular [`registry/ui/segmented-button`](../../../angular/registry/ui/segmented-button/)
· fundamental-styles
[Segmented Button](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-buttons-segmented-button--docs)
Registry: `registry/ui/segmented-button/`, on Base UI's `ToggleGroup` and `Toggle`, rendering our `Button`.

API: two components. `SegmentedButton` takes Angular's inputs: `toggle`, `vertical`, `value`/`defaultValue`/
`onValueChange` (Angular's `[(value)]`/`ngModel`: a string, or `null` for none; with `toggle` an array in the order of
selection), `disabled` (Angular's form `setDisabledState`), `groupRoleDescription`, `buttonRoleDescription`,
`aria-label`/`aria-labelledby`; native props, `className` and `ref` go to the root `<div>`. The value types follow
`toggle` (`SegmentedButtonSingleProps` | `SegmentedButtonToggleProps`). `SegmentedButtonItem` is a `Button` (all its
props: `label`, `glyph`, `variant`, …, children) with a required `value`; Angular puts `fdButton`s with a `value`
attribute inside the group. `toggled`, `selected`, `focusableWhenDisabled` and the disabled/enabled messages are not
item props: the group sets the selected state, and Base UI's toggle cannot hold focus while disabled.

fundamental-react's `ButtonSegmented` is a `<div role="group" aria-label="Group label">` around `Button`s with
`selected`; here the group owns the selection (`value`), and the fixed "Group label" is the required `aria-label`.
Its `compact` buttons are `data-density="compact"` on the group or an ancestor.

**Differences on purpose:**

- Base UI's `ToggleGroup` gives the value state (controlled or not), the roving tab stop, arrow keys (mirrored in
  RTL, from Base UI's `DirectionProvider` as the other Base UI composites, not from the document's `dir`), Home/End,
  skipping disabled buttons, no wrapping (`loopFocus={false}`, as Angular), and the disabled group. The ARIA is
  Angular's and fundamental-styles': the group is a `listbox` (with `aria-multiselectable`, `aria-orientation`,
  `aria-roledescription`, `aria-disabled`) and each button an `option` with `aria-selected`, `aria-posinset`,
  `aria-setsize` and `aria-roledescription`, instead of Base UI's `group` of `aria-pressed` toggle buttons. Positions
  come from the children (fragments flattened, as the tree), not from the DOM.
- In single selection a second click on the selected button keeps it selected (Base UI would deselect; the change is
  cancelled), as Angular.
- The tab stop starts on the selected button (else the first enabled one) and then follows focus. When the value is
  changed by the app (not by the user), the tab stop stays on the last focused button; Angular moves it to the newly
  selected one. Base UI's ToggleGroup does not expose its highlighted index.
- Angular's `(focusout)` marks the form control touched; in React use `onBlur` on the group (see the "Form state"
  story).
- The pad (background and inset border) is the group's `::before`, as in fundamental-styles, and the buttons stay
  transparent in high contrast too; Angular paints the pad on the group itself and gives the HC buttons the button
  background. Not visible (same colours), computed styles only.
