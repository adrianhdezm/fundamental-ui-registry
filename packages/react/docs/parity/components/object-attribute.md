## object-attribute

Sources: fundamental-react: none · Angular [`registry/ui/object-attribute`](../../../../angular/registry/ui/object-attribute/) ·
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

### Stories vs. sources

| Source  | Example                    | React story                                  | Status     | Notes                                                                                    |
| ------- | -------------------------- | -------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------- |
| Angular | Playground                 | `Playground`                                 | ✅ covered |                                                                                          |
| Angular | Text, links and truncation | `Text`, `Link`, `DisabledLink`, `Truncation` | ✅ covered | Split by section, each with fundamental-styles' text first, then Angular's; click count. |

### Tests vs. sources

| Source  | Behaviour                                         | React test                                                                                | Status     |
| ------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------- |
| Angular | Label and value as plain text, no link            | renders the label and the value as plain text without a link                              | ✅ covered |
| Angular | linkText without isLink: no role, tab stop, click | shows linkText as plain text without a link role or tab stop when isLink is off           | ✅ covered |
| Angular | isLink: role, tabindex, title, click and Enter    | with isLink renders a focusable link that calls onObjectAttributeClick on click and Enter | ✅ covered |
| Angular | Disabled link                                     | disabled link is removed from the tab order, marked aria-disabled and does not activate   | ✅ covered |
| Angular | Link colour only for action links                 | uses the link colour only for action links, underlined on hover                           | ✅ covered |
| Angular | Truncation and label title                        | truncates to a single line with an ellipsis and keeps the label as title                  | ✅ covered |
| Angular | No title without a label                          | has no title without a label                                                              | ✅ covered |
| —       | Prop spreading, ref (registry convention)         | passes className, native props and the ref through; render swaps the element              | ✅ covered |

### Visual comparison

fundamental-styles' object attribute is a dev component: its Storybook renders the stories without
`object-attribute.css`, so colours, cursor, decoration, opacity and truncation are the browser's defaults there.

- `pnpm visual object-attribute`: 6 cases × 16 combinations, **96/96**, by computed style only, with the properties
  the missing stylesheet leaves unstyled ignored (colour, cursor, decoration, opacity; the size of the truncated and
  disabled examples). Cases: the text, the action link at rest, on hover and with focus, the disabled link, and the
  truncated text in a 120px container, against fundamental-styles' `Text`, `Text With Link`, `Disabled Link` and
  `Truncated Text` stories, with their texts.
- Full comparison: the same cases with the published `object-attribute.css` of fundamental-styles 0.42.0 injected
  into its stories, every property and by pixels (the disabled link by style: the reference is a block): **80/96**;
  the 16 left are the `height` property of the disabled link (`auto` on our inline link, `16px` on the reference's
  block), not visible: both boxes are 16px high.

Reviewed by eye in Horizon cozy and compact, LTR and RTL (`Text`, `Link`, `DisabledLink`, `Truncation`): no density
dependence; in RTL the ellipsis is on the left, as fundamental-styles'.

| Difference                                                                | Cause                                                                                                     | Resolution                                                                            |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| fundamental-styles' Storybook shows the dev stories unstyled              | It does not load `object-attribute.css` for the dev component                                             | Compared against the published stylesheet injected into the stories, as above.        |
| Disabled link: `height` `auto` (ours) instead of `16px` (16 combinations) | fundamental-styles' story puts the attribute and link classes on one block `<a>`; ours is the inline link | Kept: Angular's markup (a link inside the attribute); the same 16px box, not visible. |
