## object-identifier

Sources: fundamental-react: none · Angular [`registry/ui/object-identifier`](../../../angular/registry/ui/object-identifier/) ·
fundamental-styles [Object Identifier](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-object-identifier--docs)
Registry: `registry/ui/object-identifier/`, on Base UI's `useRender`.

API: the Angular inputs as props: `description`, `bold`, `medium`, `id`. The projected title is `children` (text, or a
`Link`). Renders a `<div>` (fundamental-styles' element; `render` renders another one); native props, `className`
and `ref` pass through. The ids of the title (`<id>-title`), description (`<id>-text`) and hidden text
(`<id>-description`) come from `id`, or from `useId` when there is none (Angular counts instances).

Behaviour as Angular: a link in the title (Angular: projected `fdLink`s; here any `<a>` or `role="link"` element, as
React's `Link` has no marker) takes the title's font size and weight, gets an id if it has none, and is labelled
(`aria-labelledby`) by its own text, the hidden "Object Identifier" text and the description; that hidden text is then
`aria-hidden`, so it is read only through the link. The labels follow the description and the links as they come and
go: a layout effect after every render, plus a `MutationObserver` on the title for links a child component shows on
its own (Angular's `contentChildren` sees those too).

**Differences from Angular, on purpose:** Angular's `ariaLabel` and `defaultAriaLabel` both set the hidden text; here
it is one prop, `objectIdentifierLabel` (default "Object Identifier"), so the native `aria-label` keeps its meaning and
passes through. `description` takes any React node.
