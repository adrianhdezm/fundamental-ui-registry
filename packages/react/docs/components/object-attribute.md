## object-attribute

Sources: fundamental-react: none · Angular [`registry/ui/object-attribute`](../../../angular/registry/ui/object-attribute/) ·
fundamental-styles [Object Attribute](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-dev-object-attribute--docs)
(a dev component)
Registry: `registry/ui/object-attribute/`, on Base UI's `useRender`.

API: the Angular inputs as props: `label`, `linkText`, `isLink` and `disabled`; Angular's `objectAttributeClick`
output is `onObjectAttributeClick`, called with the click or Enter keydown event. Angular's `<fd-object-attribute>`
element is a block `<span>` here (`render` renders another element, e.g. a `<div>`); `children` come between the
label and the link text, as Angular's `<ng-content />`. Native props, `className` and `ref` pass through to the root.

Behaviour as Angular: the attribute is a single line truncated with an ellipsis, in the label colour, with the label
as its `title`. `linkText` follows the value; without `isLink` it is plain text. With `isLink` it is a
`role="link"` with `tabindex="0"`, its text as `title`, in the link colours (underlined on hover, the SAP focus
outline 1px inside), and a click or Enter calls `onObjectAttributeClick`. A disabled link is `aria-disabled`,
`tabindex="-1"`, without pointer events, at the disabled opacity, and does not activate. No Base UI primitive covers a
link role, so this is a click and keydown handler, as Angular's.

**Differences from Angular, on purpose:** a `title` passed to the root wins over the label tooltip (Angular's host
binding always sets it). The root adds fundamental-styles' `font-normal`, `box-border`, `border-0` and
`forced-color-adjust-none`, which Angular leaves out (not visible in the stories).

### Visual differences from fundamental-styles, kept on purpose

| Difference                                                                | Cause                                                                                                     | Resolution                                                                            |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Disabled link: `height` `auto` (ours) instead of `16px` (16 combinations) | fundamental-styles' story puts the attribute and link classes on one block `<a>`; ours is the inline link | Kept: Angular's markup (a link inside the attribute); the same 16px box, not visible. |
