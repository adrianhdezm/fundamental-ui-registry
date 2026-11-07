## form

Sources: fundamental-react [FormFieldset, FormGroup, FormItem, FormLabel, FormLegend and the validation overlay](https://github.com/SAP/fundamental-react/tree/main/src/Forms)
(`Forms/FormFieldset.js`, `FormGroup.js`, `FormItem.js`, `FormLabel.js`, `FormLegend.js`, `_FormMessage.js`,
`_FormValidationOverlay.js`) · Angular [`registry/ui/form`](../../../../angular/registry/ui/form/) (`form.ts`,
`form-message.ts`, `form-input-message-group.ts`) · fundamental-styles
[Form Label](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-forms-form-label--docs),
[Form Item](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-forms-form-item--docs),
[Form Group](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-forms-form-group--docs),
[Form Header](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-forms-form-header--docs),
[Field Set](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-forms-field-set--docs) and
[Form Message](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-forms-form-message--docs)
Registry: `registry/ui/form/` (`form.tsx`, `form-message.tsx`, `form-input-message-group.tsx`), on Base UI's
`Fieldset` (Root, Legend) and `Tooltip` (Root, Portal, Positioner, Popup, Arrow) with the popover's surface.

API: one component per Angular directive or component, its inputs as props; native props, `className` and the `ref`
go to the root element.

- `FormLabel` (`fdFormLabel`): a `<label>` with `required`, `colon`, `allowWrap`, `alignLabelEnd`, `disabled`,
  `unitDescription`, `independent` and a generated `id` (`fd-form-label-…`); `htmlFor` is Angular's `for`. As in
  Angular, the label is a flex row and its text a `<span>` with the label styles (`aria-disabled` when disabled); the
  asterisk (`content: '*' / ''`) and the colon are pseudo-elements at the end, so they stay visible when a long text
  is truncated.
- `FormItem` (`fdFormItem`): `horizontal`, `isInline`. `FormGroup` (`fd-form-group`): `isInline`, `withSpacing`.
  `FormGroupHeader` (`fdFormGroupHeader`): `noPadding`, `noBorder`, and `render` for the element (e.g.
  `render={<h4 />}`, fundamental-styles' heading). `FormHeader` (`<h4 fdFormHeader>`): an `<h4>` by default,
  `render` for another level, with the truncating text span.
- `FormFieldset` (`fdFieldset`) is Base UI's `Fieldset.Root`, a `<fieldset>` without browser chrome: `disabled`
  disables its controls (native and Base UI fields) and dims its legend (`data-disabled`); a `RadioGroup` inside it is
  named by the legend. `FormLegend` (`fdFormLegend`) is Base UI's `Fieldset.Legend` rendered as a real `<legend>`
  inside a `FormFieldset`, a plain `<legend>` elsewhere; `disabled` dims it on its own.
- `FormMessage` (`fd-form-message`): `type` (`error`, `warning`, `success`, `information`, `default`), `static`,
  `embedded`, `valueStateMessage` (the hidden prefix, by default the type: "Invalid Entry", "Warning", …) and a
  generated `id` (`fd-form-message-…`); `aria-live="assertive"`, `aria-atomic`, the type glyph as
  `data-glyph`/`::before` (`error`, `alert`, `sys-enter-2`, `information`).
- `FormInputMessageGroup` (`fd-form-input-message-group`): wraps a field and its `FormMessage` (found among the
  children by type, Angular's `select="fd-form-message"`). Props: `triggers` (default `['focusin', 'focusout']`, the
  popover's trigger format), `closeOnOutsideClick` and `closeOnEscapeKey` (default false), `noArrow` (default true),
  `fillControlMode`, `placement` (default `bottom-start`), `popoverAriaLabel` (default "Field validation messages")
  and `open`/`defaultOpen`/`onOpenChange` for Angular's `[(isOpen)]`. It describes every field inside it (inputs,
  textareas, selects, and Base UI's `role="checkbox"`, `radio`, `switch`, … controls, not their hidden inputs) with
  the message (`aria-describedby`) and sets `aria-invalid` for an error message; it removes what it added when the
  message goes, and moves an `aria-errormessage` to `aria-describedby`, as Angular. A `MutationObserver` keeps the
  link when a field re-renders its own `aria-describedby`.

fundamental-react's props map as follows: `FormLabel`'s `includeColon` is `colon`, `disabled` the same,
`isInlineHelp` belongs to the inline help (below); `FormItem`'s `isHorizontal` is `horizontal`, `isInline` the
same; `FormGroup`, `FormFieldset` and `FormLegend` spread their props as before. The validation overlay
(`validationState`, `validationOverlayProps` of FormInput, FormTextarea and Checkbox) is the
`FormInputMessageGroup` with a `FormMessage`: `validationState.state`/`text` are the message's `type` and children,
`show` is `defaultOpen`, `wrapperProps` and `className` are the group's own props, `formMessageProps` the message's;
`popperProps`, `popperClassName`, `referenceClassName` and `innerRefClassName` have no Popper to go to.

**Differences, on purpose:**

- The message popup is Base UI's **Tooltip** positioned against the field, with the popover's surface and arrow
  classes (`popoverSurfaceVariants`, `popoverArrowClassName`), not the `Popover` component: Base UI's popover puts
  focus guards after its anchor while open, so Tab from the field landed in the popup and, once the message closed on
  focus-out, on the page. The tooltip has no focus management, so focus stays in the field and Tab moves on to the
  next field (Angular: `focusTrapped`, `focusAutoCapture` and `restoreFocusOnClose` off). The popup keeps Angular's
  body role (`dialog`) and `aria-label`. `preventSpaceKeyScroll` has nothing to prevent.
- Base UI's `Field` is not used for the group: a `Field.Root` holds one labelable control, so the radios of a
  `RadioGroup` inside it all took the same hidden-input id and label. The group links the message itself, as Angular.
- The message stays in the DOM (hidden) while the popup is closed, so `aria-describedby` always points at it; Angular
  renders it only while open.
- The message id is added after the field's own `aria-describedby`; Angular leaves a field with its own description
  without the message.
- With hover triggers, the popup closes 100ms after the pointer leaves the field, and stays open while the pointer is
  on the message, so a link in it can be reached; Angular closes on `mouseleave` of the field.
- `static` messages are `w-fit`: Angular's `w-auto` on a flex box still fills a block container (an Angular issue,
  not visible in a popover, which shrinks to its content).
- Header and group header lines use `--sapGroup_TitleBorderWidth` (1px, 2px in the HC themes), as fundamental-styles;
  Angular draws 1px group header borders and a 3px form header line in HC. The form header shadow is
  `[box-shadow:…]` instead of a `shadow-[…]` utility, which adds Tailwind's transparent ring layers.
- Inline help on the label (`inlineHelpContent`, `inlineHelpPlacement`, `inlineHelpBodyPlacement`,
  `inlineHelpTriggers`, `inlineHelpLabel`, fundamental-react's `isInlineHelp`) waits for the inline-help component.
- fundamental-react's `aria-required` on the label is not ported (not allowed on `<label>`; `required` belongs on the
  field). Angular's `selector` alternatives (`fd-form-item`, …) and `fdCompact` are attributes, not components.

### Stories vs. sources

| Source                         | Example               | React story              | Status     | Notes                                                                                 |
| ------------------------------ | --------------------- | ------------------------ | ---------- | ------------------------------------------------------------------------------------- |
| fundamental-react FormFieldset | primary               | `Fieldsets`              | ✅ covered | Shipping and billing address.                                                         |
| fundamental-react FormFieldset | radioButtonGroups     | `RadioButtonGroups`      | ✅ covered | Default, disabled, inline and compact groups; fundamental-styles' texts in the first. |
| fundamental-react FormFieldset | noStyles              | —                        | ➖ n/a     | No `cssNamespace`.                                                                    |
| fundamental-react FormGroup    | primary               | `Groups` ("Form groups") | 🟡 partial | An input in a form group; the input group with a button add-on waits for input-group. |
| fundamental-react FormGroup    | withFormInput         | `Groups` ("Form groups") | ✅ covered | Default, required and password inputs.                                                |
| fundamental-react FormGroup    | withFormTextarea      | `Groups` ("Form groups") | ✅ covered | Text area and text area with counter.                                                 |
| fundamental-react FormGroup    | noStyles              | —                        | ➖ n/a     | No `cssNamespace`.                                                                    |
| fundamental-react FormItem     | primary               | `Items` ("Form items")   | ✅ covered | fundamental-styles' texts.                                                            |
| fundamental-react FormItem     | inline (isHorizontal) | `Items` ("Form items")   | ✅ covered | `horizontal`.                                                                         |
| fundamental-react FormItem     | noStyles              | —                        | ➖ n/a     | No `cssNamespace`.                                                                    |
| fundamental-react FormLabel    | primary               | `Labels`                 | ✅ covered | fundamental-styles' texts.                                                            |
| fundamental-react FormLabel    | required              | `Labels`                 | ✅ covered |                                                                                       |
| fundamental-react FormLabel    | includeColon          | `Labels`                 | ✅ covered | The overflow-proof colon in a 240px item.                                             |
| fundamental-react FormLabel    | disabled              | `Labels`                 | ✅ covered |                                                                                       |
| fundamental-react FormLabel    | dev                   | `Playground`             | ✅ covered | `required`, `colon`, `allowWrap`, `disabled` controls.                                |
| fundamental-react FormLabel    | noStyles              | —                        | ➖ n/a     | No `cssNamespace`.                                                                    |
| fundamental-react FormLegend   | primary               | `Legend`                 | ✅ covered | A legend outside a fieldset.                                                          |
| fundamental-react FormLegend   | noStyles              | —                        | ➖ n/a     | No `cssNamespace`.                                                                    |
| Angular                        | Labels                | `Labels`                 | 🟡 partial | All but inline help (waits for inline-help); fundamental-styles' texts.               |
| Angular                        | Fieldset and groups   | `FieldsetAndGroups`      | ✅ covered | Plus a disabled fieldset and fundamental-styles' three group headers.                 |
| Angular                        | Messages              | `Messages`               | ✅ covered | fundamental-styles' texts for the four types.                                         |
| Angular                        | Message group         | `MessageGroup`           | 🟡 partial | Input-group and multi-input fields are inputs with a button (not ported yet).         |
| Angular                        | Message states        | `MessageStates`          | ✅ covered |                                                                                       |
| Angular                        | Open: message group   | `OpenMessageGroup`       | ✅ covered |                                                                                       |
| Angular                        | Open: rich message    | `OpenRichMessage`        | ✅ covered | Opened from its button.                                                               |
| —                              | Open: message states  | `OpenMessageStates`      | ➕ extra   | A message with a link, checked by axe.                                                |

### Tests vs. sources

| Source            | Behaviour                                                      | React test                                                                              | Status     |
| ----------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------- |
| Angular           | Label names the control and focuses it on click                | names the control and focuses it on click                                               | ✅ covered |
| Angular           | Required asterisk with empty alt text, colon                   | required shows an asterisk with empty alt text and colon a colon                        | ✅ covered |
| Angular           | Inline help icon and its popover                               | —                                                                                       | ⬜ missing |
| Angular           | Disabled label dimmed                                          | a disabled label is dimmed                                                              | ✅ covered |
| Angular           | Independent label centred, no end margin                       | an independent label renders stand-alone: centred, with no end margin                   | ✅ covered |
| Angular           | Generated label id                                             | gets a generated id                                                                     | ✅ covered |
| Angular           | allowWrap wraps, otherwise truncated                           | allowWrap wraps long labels, otherwise they are truncated                               | ✅ covered |
| Angular           | Form item stacks label above control                           | stacks the label above the control by default                                           | ✅ covered |
| Angular           | Horizontal item with unit description                          | horizontal puts label, control and unit description on one line                         | ✅ covered |
| Angular           | Fieldset and legend form a named group, no chrome              | fieldset and legend form a named group                                                  | ✅ covered |
| Angular           | Disabled fieldset disables controls, dims legend               | disabling the fieldset disables its controls and dims the legend                        | ✅ covered |
| Angular           | Disabled legend dimmed on its own                              | a disabled legend is dimmed on its own                                                  | ✅ covered |
| Angular           | Form group column with spacing                                 | a form group stacks items in a column; withSpacing adds the gap                         | ✅ covered |
| Angular           | Inline group in a row                                          | isInline lays the items out in a row                                                    | ✅ covered |
| Angular           | Form header and group header title bars                        | form header and group header are title bars with a bottom line                          | ✅ covered |
| Angular           | Message types: glyph, background, hidden type, prefix          | types show a glyph, a background and a hidden type description                          | ✅ covered |
| Angular           | Author aria-describedby kept, errors invalid                   | the message group keeps an author aria-describedby, adds the message and marks errors … | ✅ covered |
| Angular           | aria-errormessage moved to aria-describedby                    | aria-errormessage is moved to aria-describedby                                          | ✅ covered |
| Angular           | Removing the message removes describedby and invalid           | removing the message removes the managed aria-describedby and aria-invalid              | ✅ covered |
| Angular           | Opens under the field on focus, isOpen follows                 | the message opens under the field on focus and onOpenChange follows it                  | ✅ covered |
| Angular           | One click moves to another group, only its message open        | one click moves focus to another group and only its message stays open                  | ✅ covered |
| Angular           | Rapid focus changes leave only the focused group open          | rapid focus changes across groups leave only the focused group open                     | ✅ covered |
| Angular           | Popover body aria-label (popoverAriaLabel)                     | the message popover body has an aria-label (popoverAriaLabel)                           | ✅ covered |
| Angular           | Non-error types describe without aria-invalid                  | non-error message types set aria-describedby without aria-invalid                       | ✅ covered |
| Angular           | Changing text or type while open updates the popover           | changing the message text or type while open updates the popover                        | ✅ covered |
| fundamental-react | FormLabel is-disabled, spreading, ref                          | a disabled label is dimmed; passes className, native props and the ref to the label     | ✅ covered |
| fundamental-react | FormItem isInline, spreading, ref; FormGroup spreading, ref    | passes className, native props and the ref to the root (fundamental-react)              | ✅ covered |
| fundamental-react | FormFieldset and FormLegend spreading, ref                     | passes className, native props and the ref to fieldset and legend (fundamental-react)   | ✅ covered |
| fundamental-react | FormMessage spreading, ref                                     | passes className, native props and the ref to the root (fundamental-react)              | ✅ covered |
| fundamental-react | Overlay: wrapperProps, className, no message by default, ref   | passes className, native props and the ref to the root (fundamental-react wrapperProps) | ✅ covered |
| fundamental-react | Overlay: formMessageProps, popperClassName, referenceClassName | —                                                                                       | ➖ n/a     |
| fundamental-react | Overlay: shows on focus, hides on blur                         | the message opens under the field on focus and onOpenChange follows it                  | ✅ covered |
| —                 | Tab from the field moves on                                    | the message opens under the field on focus … (Tab focuses the next button)              | ➕ extra   |
| —                 | Field re-renders its own description                           | keeps the message in aria-describedby when the field changes its own description        | ➕ extra   |
| —                 | Hover triggers, pointer on the message                         | hover triggers show the message while the pointer is on the field or the message        | ➕ extra   |
| —                 | Controlled with no triggers, Escape and outside click          | controlled open with no triggers, and Escape and outside clicks when enabled            | ➕ extra   |
| —                 | Checkbox and radio group in a message group                    | describes a checkbox and the radios of a group                                          | ➕ extra   |
| —                 | Legend names a radio group                                     | the legend of a fieldset names the radio group inside it                                | ➕ extra   |
| —                 | static and embedded                                            | static and embedded change the width and the shadow                                     | ➕ extra   |
| —                 | alignLabelEnd                                                  | alignLabelEnd puts the text at the end of the column                                    | ➕ extra   |

The message's own props are its children's (`formMessageProps`), and there is no Popper reference or popper element
to take class names. The inline help test waits for the inline-help component.

### Visual comparison

`pnpm visual form`: 17 cases × 16 combinations, 272/272 matching after the fixes below. Cases, against
fundamental-styles' Form Label, Form Item, Form Header, Form Group, Field Set and Form Message stories (our story
texts are theirs): the label text at rest, required, with colon and disabled, and the labels of the form item and
required form item stories, by pixels; the form header bar (styles: theirs is as wide as the page) and its text (by
pixels); the group header bar, without padding and without border (styles), and its title typography (theirs is an
inner `<h4>`); the fieldset legend; and the success, error, warning and information messages, by pixels. The message
popup is the popover surface without shadow and border, as Angular's `additionalBodyClass`; it was reviewed by eye.

| Difference                                                  | Cause                                                                                  | Resolution                                                                                                |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Form header `box-shadow` with four extra transparent layers | The `shadow-[…]` utility composes Tailwind's ring and inset shadow variables (Angular) | Fixed: `[box-shadow:0_var(--sapGroup_TitleBorderWidth)_0_var(--sapGroup_TitleBorderColor)]`. Not visible. |
| Form header line 3px instead of 2px in the HC themes        | Angular's `hc:[--hdr-bw:calc(var(--sapList_BorderWidth)*3)]`                           | Fixed: `--sapGroup_TitleBorderWidth` (1px, 2px in HC), as fundamental-styles.                             |
| Group header border 1px instead of 2px in the HC themes     | Angular's `border-b`                                                                   | Fixed: `border-b-(length:--sapGroup_TitleBorderWidth)`.                                                   |
| `static` message as wide as its container                   | `w-auto` on a flex box fills a block container (Angular)                               | Fixed: `w-fit`.                                                                                           |

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: Labels, Fieldset and groups, Messages and Message states
(with the error and warning messages open; the message follows the field's start edge in RTL).

Angular issues: the form header line is 3px in the HC themes and the group header border 1px (fundamental-styles:
2px both); the form header shadow carries Tailwind's transparent ring layers; `static` messages still fill a block
container.
