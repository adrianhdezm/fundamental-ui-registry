## switch

Sources: fundamental-react [Switch](https://github.com/SAP/fundamental-react/tree/main/src/Switch) (`Switch.js`,
`_SwitchItem.js`) · Angular [`registry/ui/switch`](../../../../angular/registry/ui/switch/) · fundamental-styles
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

### Stories vs. sources

| Source             | Example        | React story      | Status     | Notes                                                              |
| ------------------ | -------------- | ---------------- | ---------- | ------------------------------------------------------------------ |
| fundamental-react  | primary        | `Default`        | ✅ covered | Label after the switch (children), as in Angular.                  |
| fundamental-react  | checked        | `Checked`        | ✅ covered | `defaultChecked`.                                                  |
| fundamental-react  | compact        | `Compact`        | ✅ covered | `data-density="compact"`.                                          |
| fundamental-react  | disabled       | `Disabled`       | ✅ covered | Plus Angular's off and on disabled switches.                       |
| fundamental-react  | withNoLabel    | `WithNoLabel`    | ✅ covered | Named with `aria-label="Switch"` (fundamental-react's default).    |
| fundamental-react  | semantic       | `Semantic`       | ✅ covered | Accept/decline icons are built in.                                 |
| fundamental-react  | internalLabels | `InternalLabels` | ✅ covered | Texts in the track; the state text next to the switch by the page. |
| fundamental-react  | dev            | `Playground`     | ✅ covered | Knobs are the Playground controls.                                 |
| fundamental-react  | noStyles       | —                | ➖ n/a     | No `cssNamespace`.                                                 |
| Angular            | Playground     | `Playground`     | ✅ covered |                                                                    |
| Angular            | Sizes          | `Sizes`          | ✅ covered | External labels through `aria-labelledby` (and `htmlFor`).         |
| Angular            | Disabled       | `Disabled`       | ✅ covered |                                                                    |
| Angular            | Semantic       | `Semantic`       | ✅ covered | Plus a semantic switch with label content.                         |
| Angular            | Binding        | `Binding`        | ✅ covered | React state and buttons instead of `ngModel`/`[(checked)]`.        |
| Angular            | Reactive forms | `Forms`          | ✅ covered | A native form with `FormData`, a required and disabled switches.   |
| fundamental-styles | Text Switch    | `Text`           | ✅ covered | Off and on with "on"/"off" texts, for the visual comparison.       |

### Tests vs. sources

| Source             | Behaviour                                                  | React test                                                                                   | Status     |
| ------------------ | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ---------- |
| Angular            | Native checkbox, role switch, aria-checked, id, labelledby | renders a control with role switch and aria-checked, next to a native checkbox               | ✅ covered |
| Angular            | ngModel: click and Space toggle, model updates, focus      | controlled: click and Space toggle the model, the model updates the switch                   | ✅ covered |
| Angular            | Reactive forms, touched, disable()                         | uncontrolled in a form: submits its name, reports blur, and the disabled state stops changes | ✅ covered |
| Angular            | `[(checked)]` and checkedChange                            | checked and onCheckedChange: reports the change and follows the parent                       | ✅ covered |
| Angular            | Handle slides when switched on                             | the handle slides to the other side when switched on                                         | ✅ covered |
| Angular            | Handle mirrors in RTL                                      | the handle position mirrors in RTL                                                           | ✅ covered |
| Angular            | Semantic glyphs and announced state                        | semantic shows accept/decline glyphs and announces the state after the name                  | ✅ covered |
| fundamental-styles | Hover colours (none in Angular, see below)                 | hovering the label changes the track colour, off and on                                      | ✅ covered |
| Angular            | Semantic track colours                                     | the semantic switch uses different track colours than the standard one                       | ✅ covered |
| Angular            | activeText / inactiveText                                  | activeText and inactiveText replace the icons                                                | ✅ covered |
| Angular            | Disabled                                                   | disabled stops changes and dims the switch                                                   | ✅ covered |
| Angular            | Compact density                                            | compact density makes the track smaller                                                      | ✅ covered |
| Angular            | name on the native input                                   | name lands on the native input                                                               | ✅ covered |
| Angular            | Unique generated ids                                       | each switch gets a unique generated id                                                       | ✅ covered |
| Angular            | focus()                                                    | the control ref focuses the switch; focus shows the frame around the track                   | ✅ covered |
| Angular            | (required input, acceptLabel/declineLabel)                 | required sets aria-required and the native required; a semantic switch keeps its label …     | ✅ covered |
| fundamental-react  | Default off, checked prop                                  | defaults to off and takes checked (fundamental-react)                                        | ✅ covered |
| fundamental-react  | onChange with the event                                    | calls onCheckedChange with the event of the change (fundamental-react onChange)              | ✅ covered |
| fundamental-react  | Enter toggles                                              | Enter toggles the focused switch too (fundamental-react)                                     | ✅ covered |
| fundamental-react  | Prop spreading to the root and the input                   | passes className, native props and the ref to the root; labelProps and inputProps            | ✅ covered |
| fundamental-react  | checked prop updates                                       | checked and onCheckedChange: reports the change and follows the parent                       | ✅ covered |
| fundamental-react  | aria-label (localizedText.switchLabel)                     | is named by its label, or by aria-label                                                      | ✅ covered |
| fundamental-react  | id on the input                                            | uses the given id for the input, so an external label works                                  | ✅ covered |

### Visual comparison

`pnpm visual switch`: 17 cases × 16 combinations, 272/272 matching after the fixes below. Cases: the off switch at
rest, on hover and with keyboard focus (the whole switch label, by pixels), its track, handle and off icon; the
disabled switch; the semantic off switch at rest and on hover, and its decline icon; the text switch off and on, each
at rest, on hover and its handle, and the "OFF" text. fundamental-styles has no story with a checked standard or
semantic switch, so those were compared with an ad-hoc script that clicks the first switch of both Storybooks: on and
on hover, standard and semantic, by pixels and by the track, handle and icon styles, 64/64 (4 cases × 16 combinations). Reviewed by eye in
Horizon cozy and compact, LTR and RTL (`Sizes`, `Semantic`, `InternalLabels`, `Forms`, `Default`).

| Difference                                                                                                         | Cause                                                                                                                       | Resolution                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| No hover colours: on hover the track, its border and the handle keep their rest colours (all four themes)          | `group-hover/sw:` on the label that is itself `group/sw`: the variant only matches descendants of the group (as in Angular) | Fixed: `hover:` on the label. Angular issue.                                                                |
| Track box shadow with four transparent layers before the inset border                                              | `shadow-[…]` adds Tailwind's ring layers                                                                                    | Fixed: `[box-shadow:…]`. Not visible.                                                                       |
| Track and handle colour `--sapContent_LabelColor`; fundamental-styles: `--sapTextColor`                            | Inherited from the label                                                                                                    | Fixed: `text-sap-text-color` on the track. Not visible (no text drawn).                                     |
| On/off texts and icons without their line height (`leading-none`, `leading-[1.375rem]`), seen in Angular's classes | `tailwind-merge` drops a `leading-*` before a `text-*` size                                                                 | Ported with `leading-*` after the size, so the texts and icons match. Angular issue (computed styles only). |
