## form

Sources: fundamental-react [FormFieldset, FormGroup, FormItem, FormLabel, FormLegend and the validation overlay](https://github.com/SAP/fundamental-react/tree/main/src/Forms)
(`Forms/FormFieldset.js`, `FormGroup.js`, `FormItem.js`, `FormLabel.js`, `FormLegend.js`, `_FormMessage.js`,
`_FormValidationOverlay.js`) · Angular [`registry/ui/form`](../../../angular/registry/ui/form/) (`form.ts`,
`form-message.ts`, `form-input-message-group.ts`) · fundamental-styles
[Form Label](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-forms-form-label--docs),
[Form Item](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-forms-form-item--docs),
[Form Group](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-forms-form-group--docs),
[Form Header](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-forms-form-header--docs),
[Field Set](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-forms-field-set--docs) and
[Form Message](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-forms-form-message--docs)
Registry: `registry/ui/form/` (`form.tsx`, `form-message.tsx`, `form-input-message-group.tsx`), on Base UI's
`Fieldset` (Root, Legend) and `Tooltip` (Root, Portal, Positioner, Popup, Arrow) with the popover's surface; the label's
inline help is the `InlineHelp` component (`registry/ui/inline-help/`).

API: one component per Angular directive or component, its inputs as props; native props, `className` and the `ref`
go to the root element.

- `FormLabel` (`fdFormLabel`): a `<label>` with `required`, `colon`, `allowWrap`, `alignLabelEnd`, `disabled`,
  `unitDescription`, `independent` and a generated `id` (`fd-form-label-…`); `htmlFor` is Angular's `for`. As in
  Angular, the label is a flex row and its text a `<span>` with the label styles (`aria-disabled` when disabled); the
  asterisk (`content: '*' / ''`) and the colon are pseudo-elements at the end, so they stay visible when a long text
  is truncated. Inline help, as Angular: `inlineHelpContent` (a string or any React node, Angular's template) adds a
  focusable question-mark `InlineHelp` icon after the text (`inlineHelpPlacement="before"` before it, with the
  0.25rem margin on the text side); `inlineHelpBodyPlacement` (default `bottom`), `inlineHelpTriggers` (default hover
  and focus, and a click toggles) and `inlineHelpLabel` (the icon's name; by default the help text when it is a
  string, else the inline help's "Help") go to it. The help describes the icon (`aria-describedby`).
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
`isInlineHelp` (a full-width, space-between layout for a label holding fundamental-react's old `InlineHelp`) is
`inlineHelpContent`, which places the icon next to the text; `FormItem`'s `isHorizontal` is `horizontal`, `isInline` the
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
- A click on the label's inline help icon does not activate the label (it would move focus to the field and close
  the help at once): the icon is a control of its own, and the click only toggles the help. In Angular the click
  toggles the help and then focuses the field. As in Angular, the icon's name (the help text by default) is part of
  the field's name ("VAT Country code and digits"); the hidden copy that describes the icon adds nothing to it.
- The label text span has `data-slot="form-label-text"`, and the horizontal item's text spacing targets it: the help
  icon is a `<span>` too (Angular's `fd-icon` is not), and must keep its own margins.
- fundamental-react's `aria-required` on the label is not ported (not allowed on `<label>`; `required` belongs on the
  field). Angular's `selector` alternatives (`fd-form-item`, …) and `fdCompact` are attributes, not components.
