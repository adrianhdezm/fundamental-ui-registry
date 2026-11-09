## segmented-button

Sources: fundamental-react [ButtonSegmented](https://github.com/SAP/fundamental-react/tree/main/src/Button)
(`Button/ButtonSegmented.js`) · Angular [`registry/ui/segmented-button`](../../../../angular/registry/ui/segmented-button/)
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

### Stories vs. sources

| Source            | Example                     | React story                     | Status     | Notes                                                                              |
| ----------------- | --------------------------- | ------------------------------- | ---------- | ---------------------------------------------------------------------------------- |
| fundamental-react | primary                     | `Playground`                    | ✅ covered | Survey, pie chart and pool icons; controls for `toggle`, `vertical`, `disabled`.   |
| fundamental-react | compact                     | `Compact`                       | ✅ covered | `data-density="compact"` on the group.                                             |
| fundamental-react | noStyles                    | —                               | ➖ n/a     | No `cssNamespace`.                                                                 |
| Angular           | Single selection            | `Single` (Single selection)     | ✅ covered | Labels, icons and vertical, sharing one value.                                     |
| Angular           | Multiple selection (toggle) | `Toggle`                        | ✅ covered | Plus fundamental-styles' icon and vertical examples (the visual reference).        |
| Angular           | Disabled                    | `Disabled`                      | ✅ covered |                                                                                    |
| Angular           | Reactive form               | `Form` (Form state)             | ✅ covered | Value, dirty (changed) and touched (`onBlur`) kept in state; disabled at run time. |
| Angular           | Generated buttons           | `Generated` (Generated buttons) | ✅ covered | Items mapped from an array, separate `value` and `onValueChange`.                  |

### Tests vs. sources

| Source            | Behaviour                                                       | React test                                                                                         | Status     |
| ----------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------- |
| Angular           | Labelled listbox of options, posinset/setsize, roledescriptions | is a labelled listbox of options; custom role descriptions                                         | ✅ covered |
| Angular           | ngModel: selection follows the model, a click selects           | controlled: the selected button follows the value and a click selects; uncontrolled: defaultValue  | ✅ covered |
| Angular           | Toggle: several selected, second click deselects                | toggle mode allows several selected buttons…; toggle mode with an empty initial state              | ✅ covered |
| Angular           | Reactive forms: value, touched, disable()                       | form state: value, dirty, touched and disabled                                                     | ✅ covered |
| Angular           | The selected button is the only tab stop                        | the selected button is the only tab stop                                                           | ✅ covered |
| Angular           | Without a selection the first button is the tab stop            | without a selection the first button is the tab stop                                               | ✅ covered |
| Angular           | Arrows, Home, End move focus; Space and Enter select            | arrow keys, Home and End move focus (roving tabindex); Space and Enter select                      | ✅ covered |
| Angular           | Arrow keys mirrored in RTL                                      | arrow keys are mirrored in RTL                                                                     | ✅ covered |
| Angular           | Arrow keys skip disabled buttons, which cannot be selected      | arrow keys skip disabled buttons, which cannot be selected                                         | ✅ covered |
| Angular           | Vertical: stacked, ArrowUp/ArrowDown                            | vertical orientation stacks the buttons and uses ArrowUp/ArrowDown                                 | ✅ covered |
| Angular           | Horizontal: in a row                                            | horizontal orientation lays the buttons out in a row                                               | ✅ covered |
| Angular           | A disabled button stays disabled after the group is re-enabled  | an individually disabled button stays disabled after the group is re-enabled                       | ✅ covered |
| Angular           | Added buttons get role, posinset, setsize                       | a button added after render gets option role, posinset and setsize…                                | ✅ covered |
| —                 | Selected colours, outer corners, Button props on items          | selected buttons show the selected colours…; only the outer corners…; items take the button props  | ✅ added   |
| fundamental-react | Prop spreading, ref                                             | passes className, native props and the ref to the group (fundamental-react prop spreading and ref) | ✅ covered |

### Visual comparison

`pnpm visual segmented-button`: 11 cases × 16 combinations, 176/176 matching. The `Toggle` story's icon groups have
fundamental-styles' icons and selection, so every case is compared by pixels: the horizontal and the vertical group;
the first, a selected, a middle and the last button (with their margins); hover on an unselected and a selected
button; the first and last vertical buttons; keyboard focus on a selected button. Disabled buttons have no
fundamental-styles reference (they are the button's disabled state). Reviewed by eye in Horizon cozy and compact, LTR
and RTL (`Single`, `Toggle`, `Disabled`, with keyboard focus).

| Difference                                                                                                 | Cause                                              | Resolution                                                                                                                                        |
| ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Group: background, radius and inset border on the element; fundamental-styles draws them in its `::before` | Angular's classes paint the pad on the group       | Fixed: the pad is the group's `::before` (with `[box-shadow:…]`, no ring layers). Not visible (0.0% pixels); Angular issue, computed styles only. |
| High contrast: buttons with `--sapButton_Background`; fundamental-styles keeps them transparent on the pad | Angular's `hc:[&>button]:bg-sap-button-background` | Fixed: transparent in HC too (the pad shows through). Not visible (≤0.5% pixels); Angular issue, computed styles only.                            |
