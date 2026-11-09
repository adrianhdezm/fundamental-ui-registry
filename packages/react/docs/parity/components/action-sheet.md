## action-sheet

Sources: fundamental-react: none · Angular [`registry/ui/action-sheet`](../../../../angular/registry/ui/action-sheet/) ·
fundamental-styles
[Action Sheet](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-action-sheet--docs)
Registry: `registry/ui/action-sheet/`, on the `popover` component (Base UI's Popover) on desktop and the `dialog`
component (Base UI's Dialog) in mobile mode, with the `button` and `bar` components.

API: composed parts, as Angular's `fd-action-sheet` with its control, body and items:

```tsx
<ActionSheet mobile={isPhone} controlTitle="Choose an action">
  <ActionSheetControl render={<Button glyph="settings" aria-label="Actions" />} />
  <ActionSheetBody aria-label="Actions">
    <ActionSheetItem label="Download" glyph="download" onClick={download} />
    <ActionSheetItem label="Reject" glyph="cancel" disabled />
    <ActionSheetItem label="Cancel" negative isCloseButton />
  </ActionSheetBody>
</ActionSheet>
```

- `ActionSheet` (no element) holds the state and Angular's inputs: `mobile`, `placement` (`bottom` by default),
  `noArrow` (an arrow by default, as fundamental-styles), `open`/`defaultOpen`/`onOpenChange` (Angular's `isOpen`
  model and `open()`/`close()`/`toggle()`; `details.reason` is Base UI's `trigger-press`, `outside-press`,
  `escape-key`, …, or `item-press` for a close button and `tab-key` for Tab), `controlTitle` and
  `controlTitleHeading` (2 by default). It renders a `Popover`, or with `mobile` a modal `Dialog`.
- `ActionSheetControl` is Angular's `fd-action-sheet-control`, but it is the control itself (a Base UI trigger, as
  `PopoverTrigger`), not a wrapper: `render={<Button … />}` for an SAP button, `nativeButton={false}` for another
  element. It gets `aria-haspopup="menu"` and `aria-expanded` (and `aria-controls` on desktop); click, Enter and
  Space toggle the sheet; native props and `ref` pass through.
- `ActionSheetBody` is Angular's `fd-action-sheet-body`: the `<ul role="menu">` (Angular's `actionSheetBodyId`,
  `ariaLabel` and `ariaLabelledby` are its own `id`, `aria-label` and `aria-labelledby`; native props, `className` and
  `ref` go to it). On desktop it sits in a `PopoverBody` without a role of its own (Angular's `bodyRole` null); in
  mobile mode in a `DialogPopup` at the bottom of the screen, as wide as it, after the title bar. `container` renders
  it into another element; `initialFocus` (Base UI's) changes what gets the focus on opening (the first enabled
  action by default).
- `ActionSheetItem` is Angular's `li[fd-action-sheet-item]`: an `<li role="none">` with a full-width `Button`
  (`role="menuitem"`), with `label`, `glyph`, `glyphFont`, `negative` (centred, negative button), `isCloseButton`,
  `disabled`, `variant` (Angular's `fdType`; `standard` shows as `transparent`) and `toggled`. Native props,
  `className`, `ref` and `onClick` go to the button, `listItemProps` to the `<li>` (as the menu's items).

Behaviour, as Angular: opening focuses the first enabled action; the list is one tab stop (the active action, roving
`tabIndex`); ArrowDown/ArrowUp move to the next/previous enabled action and wrap, Home and End go to the first and
last, disabled actions are skipped; Tab closes the sheet (default prevented) and Escape closes it, and the focus
returns to the control; a close button closes it after its `onClick`; in mobile mode a click on the block layer closes
it and the title is a `role="heading"` with `aria-level`.

**Differences, on purpose:**

- The mobile sheet is a modal Base UI Dialog (`role="dialog"`, `aria-modal`, labelled by the title, or by the list's
  label without a title) instead of Angular's plain fixed overlay: the page behind it is inert and the focus is kept
  in it, which the overlay did not do. The block layer is the dialog's (same classes as Angular's overlay).
- The mobile title bar has no `toolbar` role (Angular: `role="toolbar"` with `aria-label="Actions"`): it holds only
  the heading, no controls.
- Each opening focuses the first enabled action, in the popover too (Angular's popover focused the first tabbable
  element, which after a reopening was the last active action).
- `focusEscapeList` is not ported: Angular declared it but never emitted it. `class` on `fd-action-sheet` (`userClass`)
  was unused in Angular; `ActionSheet` renders no element.
- The popover is not `focusTrapped`: Tab never moves inside the sheet, it closes it.

### Stories vs. sources

| Source            | Example            | React story   | Status     | Notes                                                                     |
| ----------------- | ------------------ | ------------- | ---------- | ------------------------------------------------------------------------- |
| fundamental-react | —                  | —             | ➖ n/a     | No fundamental-react component.                                           |
| Angular           | Action sheet       | `Default`     | ✅ covered | Same actions, live region for the chosen action.                          |
| Angular           | Mobile             | `Mobile`      | ✅ covered | With the Cancel action and the title bar.                                 |
| Angular           | Open: action sheet | `OpenDefault` | ✅ covered |                                                                           |
| Angular           | Open: mobile       | `OpenMobile`  | ✅ covered |                                                                           |
| —                 | Playground         | `Playground`  | ➕ extra   | Controls for `mobile`, `placement`, `noArrow`, the title and level.       |
| —                 | Open in the page   | `InPage`      | ➕ extra   | A popover kept open in a container, the visual reference case.            |
| —                 | Mobile in a frame  | `PhoneFrame`  | ➕ extra   | A mobile sheet kept open in a 350 × 600 frame, the visual reference case. |

### Tests vs. sources

| Source  | Behaviour                                                               | React test                                                                                                           | Status     |
| ------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------- |
| Angular | Opens a labelled menu, focuses the first action (both modes)            | opens a menu of actions and focuses the first one (popover, mobile)                                                  | ✅ covered |
| Angular | Arrow keys skip disabled actions and wrap, End (both modes)             | moves with the arrow keys over disabled actions and wraps (also Home, ArrowUp)                                       | ✅ covered |
| Angular | Escape closes, focus back to the control (both modes)                   | closes on Escape and returns the focus to the control                                                                | ✅ covered |
| Angular | Tab closes, focus back to the control (both modes)                      | closes on Tab and returns the focus to the control (reason `tab-key`)                                                | ✅ covered |
| Angular | A close button closes (both modes)                                      | closes with a close button (reason `item-press`)                                                                     | ✅ covered |
| Angular | Mobile title as a heading of the given level, level changes             | mobile mode shows the control title as a heading of the given level (`rerender`)                                     | ✅ covered |
| Angular | No title bar in the popover                                             | shows no title bar in the popover (and no dialog role on the body)                                                   | ✅ covered |
| —       | One tab stop, actions without close, control ARIA and toggling          | keeps one tab stop…; runs an action without closing…; opens and closes with…                                         | ➕ extra   |
| —       | Block layer click, modal sheet at the bottom, arrow, placement          | mobile mode closes on a click on the block layer; …a modal sheet at the bottom…                                      | ➕ extra   |
| —       | Variants, prop spreading and refs, uncontrolled, disabled, initialFocus | styles actions…; passes native props, className and ref…; works uncontrolled…; does not run disabled…; initialFocus… | ➕ extra   |

### Visual comparison

`pnpm visual action-sheet`: 14 cases × 16 combinations, 224/224 matching. Cases, with the texts and glyphs of
fundamental-styles' stories: from `InPage` (a popover kept open in the page, no initial focus) against the Default
story, the popover body, the list, an item, an action at rest, hovered and focused, and an action without icon; from
`PhoneFrame` (a mobile sheet kept open in a 350 × 600 frame: a transformed box is the containing block of the fixed
sheet, as fundamental-styles' 350 × 600 wrapper) against the Mobile story, the title bar, the title, the list, an
action at rest and focused, and the negative action at rest and hovered. All by computed style and by pixels.

| Difference                                                   | Cause                                                                                                        | Resolution                                                                                   |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| List corners square in the popover (fundamental-styles: 8px) | Angular's list has the popover radius only in mobile mode                                                    | Fixed: `rounded-sap-popover-border-corner-radius` on the list in both modes.                 |
| Mobile list with rounded top corners under the title bar     | Angular's `[[data-sheet-bar]+&]` never matches: the list is inside `fd-action-sheet-body`, not after the bar | Fixed: the list follows the bar directly, so its top corners are square.                     |
| Title bar shadow drawn over the list                         | Angular raises the bar (`z-[2]`); in fundamental-styles the list (`z-index: 1`, positioned) is above it      | Fixed: bar and list both `z-[1]`, the list later, as fundamental-styles.                     |
| Bar and list `box-shadow` with extra transparent layers      | `shadow-sap-content-shadow1/2` compose Tailwind's ring and inset shadow variables                            | Fixed: `[--bar-shadow:var(--sapContent_Shadow2)]`, `[box-shadow:var(--sapContent_Shadow1)]`. |

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: Open: action sheet, Open: mobile, InPage and PhoneFrame.
In RTL the glyphs sit at the start (right) and the texts align to the start, the popover keeps to the viewport and the
arrow points at the control.

Angular issues: the mobile list keeps rounded top corners under the title bar (its `[[data-sheet-bar]+&]` selector
cannot match, the list being inside `fd-action-sheet-body`); the title bar is raised over the list, so its shadow
falls on the first action; the shadows use the `shadow-sap-content-shadow1/2` utilities (transparent ring layers);
`focusEscapeList` is declared but never emitted.
