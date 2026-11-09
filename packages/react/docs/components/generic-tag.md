## generic-tag

Sources: fundamental-react: none · Angular [`registry/ui/generic-tag`](../../../angular/registry/ui/generic-tag/) ·
fundamental-styles [Generic Tag](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-generic-tag--docs)
Registry: `registry/ui/generic-tag/`, on Base UI's `Button`.

API: the Angular inputs as props: `type` (`error`, `success`, `warning`, `information`; neutral when unset), `name`
(required), `value` and `ariaRoleDescription` ("Generic Tag" by default). Angular's `[fd-generic-tag]` attribute
component goes on any host; here it renders a `<div>`, and `render` renders another element (`nativeButton` is
detected for a `<button />`). Native props (`onClick`, `aria-*`, ...), `className` and `ref` pass through to the root.

Behaviour as Angular: the tag is a `role="button"` with `tabindex="0"` and the role description, named by its name
and value; the status icon (`message-<type>`) is decorative. Click, Enter and Space activate it: Base UI's `Button`
(non-native) does what Angular's `activate()` keydown handler does. The name and value truncate with an ellipsis and
keep their full text as `title`; the value stays visible next to a truncated name. The status is a decorator strip on
the start edge over the status background; hover and active take the list hover and active backgrounds (the HC themes
also switch the texts and icon to the active text colour), focus and active show the SAP focus outline (inset in HC).
Vertical margin 0.5625rem, 0.1875rem in compact.

**Differences from Angular, on purpose:** none in behaviour. The root sets fundamental-styles' `leading-[normal]`,
`font-normal`, `border-0`, `text-sap-text-color` and `forced-color-adjust-none`, which Angular leaves to the page, and
the shadow is `[box-shadow:var(--sapContent_Shadow0)]` instead of the `shadow-sap-content-shadow0` utility (whose ring
layers fail the style comparison).
