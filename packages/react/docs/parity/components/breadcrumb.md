## breadcrumb

Sources: fundamental-react [Breadcrumb](https://github.com/SAP/fundamental-react/tree/main/src/Breadcrumb) · Angular
[`registry/ui/breadcrumb`](../../../../angular/registry/ui/breadcrumb/) · fundamental-styles
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

### Stories vs. sources

| Source             | Example               | React story    | Status     | Notes                                                                                 |
| ------------------ | --------------------- | -------------- | ---------- | ------------------------------------------------------------------------------------- |
| fundamental-react  | primary               | `Primary`      | ✅ covered | Three "Link Text" links.                                                              |
| fundamental-react  | With url property     | `Primary`      | ✅ covered | The same markup as `primary`; no `url` prop (an item holds a `Link`).                 |
| fundamental-react  | noStyles              | —              | ➖ n/a     | No `cssNamespace`.                                                                    |
| Angular            | Breadcrumb            | `Default`      | ✅ covered | Resizable frame, separator and reverse controls, collapsed count and last navigation. |
| Angular            | Separator styles      | `Separators`   | ✅ covered | With fundamental-styles' texts, for the pixel comparison.                             |
| Angular            | Collapsed items       | `Overflow`     | ✅ covered | `play` waits for the collapse, so axe scans the final DOM.                            |
| Angular            | Open: collapsed items | `OpenOverflow` | ✅ covered |                                                                                       |
| fundamental-styles | Current Item          | `CurrentItem`  | ✅ covered | The current page as text, and as a link with `aria-current="page"`.                   |

### Tests vs. sources

| Source            | Behaviour                                                       | React test                                                                            | Status     |
| ----------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------- |
| Angular           | Labelled navigation list, separators, none after current page   | is a labelled navigation list with separators and no separator after the current page | ✅ covered |
| Angular           | One tab stop, arrow keys                                        | has one tab stop and moves between the links with the arrow keys                      | ✅ covered |
| Angular           | Collapsed items in a menu that follows their links              | collapses items that do not fit into a menu that follows their links                  | ✅ covered |
| Angular           | Separator of each `separatorStyle`, updates                     | renders the separator of each separatorStyle and updates when it changes              | ✅ covered |
| Angular           | Restores collapsed items when the container grows               | restores collapsed items when the container grows                                     | ✅ covered |
| Angular           | Last link to the current page and back, stops at the first link | moves from the last link to the current page and back, and stops at the first link    | ✅ covered |
| Angular           | ArrowDown / ArrowUp                                             | moves next with ArrowDown and back with ArrowUp                                       | ✅ covered |
| Angular           | RTL arrows                                                      | mirrors ArrowLeft and ArrowRight in RTL                                               | ✅ covered |
| —                 | `reverse` order of the menu                                     | lists the collapsed items from the root down with reverse                             | ✅ covered |
| —                 | Separator after a last item that is a link                      | keeps the separator after a last item that is a link                                  | ✅ covered |
| —                 | "More" link in the tab stop and the arrow keys                  | the "more" link joins the tab stop and the arrow keys when items collapse             | ✅ covered |
| —                 | Visible and hidden counts                                       | reports the visible and hidden counts                                                 | ✅ covered |
| —                 | Disabled collapsed link                                         | disables the menu item of a disabled collapsed link                                   | ✅ covered |
| fundamental-react | Prop spreading on Breadcrumb and Breadcrumb.Item, ref           | passes className, native props and the ref through, on the trail and on items         | ✅ covered |

### Visual comparison

`pnpm visual breadcrumb`: 18 cases × 16 combinations, 288/288 matching after the fixes below. Cases, by pixels and
computed style unless noted, against fundamental-styles' Standard, Current Item, Styles and Overflow stories (our
`Separators` and `CurrentItem` stories use their texts): the first item and a wide one (each with its separator), the
first link, its text, a link on hover and with keyboard focus, the current page as text (item and text) and as a link
with `aria-current="page"`, the separator of each of the six styles, the "more" link (computed style only:
fundamental-styles puts the separator inside it, so it is wider) and its overflow and arrow icons. The open menu is
the registry's `Menu` (see its report). Horizon cozy and compact, LTR and RTL were also reviewed by eye (`Default`,
`Separators`, `Overflow`, `OpenOverflow`).

| Difference                                                                       | Cause                                                                                                                                                         | Resolution                                                                                                                                                                       |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Separators 8px narrower than fundamental-styles' (e.g. 4px against 12px for `/`) | Angular's `mx-1` is outside the separator's box; fundamental-styles' empty separator span holds an `::after` with the margin, so its box includes the spacing | Fixed: `px-1` instead of `mx-1` (same look: the items with their separators already matched by pixels); `padding-left`/`padding-right` are not compared for the separator cases. |
| "More" link 21px high instead of 24px                                            | The link holds only icons, so its `leading-6` gives no line box; fundamental-styles' link is 1.5rem high (`--fdLink_Line_Height`)                             | Fixed: `h-6` on the "more" link. Angular issue (seen in the React port with Angular's classes).                                                                                  |
| "More" arrow icon 16px wide instead of 10px                                      | The registry's `Icon` is 1em wide (`w-[1em]`, a fix for menu buttons); fundamental-styles' icon in a link is as wide as its glyph                             | Fixed: icons of the "more" link are `w-auto`. Not an Angular issue (Angular's icon has no 1em width).                                                                            |
| 4px more space between the "more" separator and the first visible item (by eye)  | The overflow layout's `gap-1` between the "more" control and the row; fundamental-styles' items follow each other with only the separator's spacing           | Fixed: `gap-0` on the breadcrumb's overflow layout. Angular issue.                                                                                                               |
| Items: no 1px vertical padding (`0.0625rem` in fundamental-styles)               | Angular's item classes have `py-px` before `p-0`, so `tailwind-merge` keeps `p-0`                                                                             | Ported in that order (`p-0 py-px`), which matches. Angular issue (items 2px shorter).                                                                                            |
