## breadcrumb

Sources: fundamental-react [Breadcrumb](https://github.com/SAP/fundamental-react/tree/main/src/Breadcrumb) · Angular
[`registry/ui/breadcrumb`](../../../angular/registry/ui/breadcrumb/) · fundamental-styles
[Breadcrumb](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-breadcrumb--docs)
Registry: `registry/ui/breadcrumb/`, on the registry's `OverflowLayout` (collapsed items), `Menu` (Base UI's Menu,
for the collapsed items), `Link` and `Icon`.

API: `Breadcrumb` with `BreadcrumbItem` children, as Angular's `fd-breadcrumb` and `fd-breadcrumb-item`:

```tsx
<Breadcrumb separatorStyle="greater-than" onHiddenItemsCountChange={setHidden}>
  <BreadcrumbItem>
    <Link href="/">Home</Link>
  </BreadcrumbItem>
  <BreadcrumbItem>
    <span aria-current="page">Laptops</span>
  </BreadcrumbItem>
</Breadcrumb>
```

- `Breadcrumb` takes Angular's inputs as props: `reverse`, `separatorStyle` (`''` for `/`, `backslash`,
  `double-slash`, `double-backslash`, `greater-than`, `double-greater-than`), `ariaLabel` (default "Breadcrumb
  trail"), `moreLabel` (default "More"), and the outputs `onVisibleItemsCountChange` and `onHiddenItemsCountChange`.
  Native props, `className` and `ref` go to the root `<nav>` (Angular's host with `role="navigation"`); an
  `aria-label` prop wins over `ariaLabel`.
- `BreadcrumbItem` is a `<span>` with its content (a `Link`, or the current page as a `<span aria-current="page">`)
  and the separator after it; native props, `className` and `ref` go to the `<span>`. As Angular, a last item without
  a link has no separator; "a link" is a `Link`, `<a>` or `<button>` anywhere in the item's children (Angular looks
  for a `fdLink` content child).
- fundamental-react's `Breadcrumb.Item` `name` and `url` props are not ported: an item holds a `Link` (fundamental-react
  also accepted a link as child), so router links work through the link's `render`.

Behaviour as Angular: the items are in an `OverflowLayout` with the "more" control at the start
(`showMorePosition="left"`, so items collapse from the root), `ariaRole="list"` (each item in a `listitem`) and the
layout's own arrow keys off. Collapsed items are listed in a `Menu` behind a "more" `Link` (`role="button"`,
overflow and arrow icons, named and titled with `moreLabel`, followed by a separator), from the current page up, or
from the root down with `reverse`. A menu item shows the item's link text and activates the hidden item's own
control (`click()`), so `href`, `onClick` and router links behave as in the trail; a disabled link (`aria-disabled`)
gives a disabled menu item. The trail has one tab stop (the last focused visible link, or the first one, which is the
"more" link when items are collapsed); ArrowRight/ArrowDown and ArrowLeft/ArrowUp move between the visible links, the
"more" link and the current page (mirrored in RTL, from the computed direction), and stop at the ends.

**Differences from Angular, on purpose:**

- The collapsed items render in a hidden `<div>` next to the "more" link, where the menu reads their text and
  disabled state and clicks their control; Angular keeps them in its hidden content projection. The overflow layout
  does not render hidden items when it has a custom "more" control, so each item is in the DOM once.
- The menu placement is `bottom-start` in both directions: Base UI's alignment is logical, so the RTL swap of Angular
  (`bottom-end`) is not needed.
- Enter and Space on the "more" link open the menu through Base UI's trigger (Angular binds them by hand).
