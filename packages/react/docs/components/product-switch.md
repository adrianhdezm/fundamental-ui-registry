## product-switch

Sources: fundamental-react: none · Angular [`registry/ui/product-switch`](../../../angular/registry/ui/product-switch/) ·
fundamental-styles [Product Switch](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-product-switch--docs)
Registry: `registry/ui/product-switch/`, on the registry's `Popover` (Base UI's Popover), with `Button` (the grid
button), `Icon`, `Avatar` and `BusyIndicator`; drag and drop with pointer events (no library), the dragged product's
preview in a React portal.

API: Angular's two components, composed the same way:

```tsx
<ProductSwitch>
  <ProductSwitchBody products={products} onProductsChange={setProducts} onItemClick={(item) => track(item)} />
</ProductSwitch>
```

- **`ProductSwitch`** (`fd-product-switch`): `placement` (`bottom-end`), `disabled`, `closeOnEscapeKey`,
  `closeOnOutsideClick`, `noArrow` (true), `triggers` (`['click']`), `focusTrapped` (false), as Angular. Angular's
  `isOpen` model is `open` / `defaultOpen` / `onOpenChange` (called on user changes only, so not on init, as Angular's
  `isOpenChange`), `beforeOpen` is `onBeforeOpen`, `buttonClass` is `buttonClassName`, and `ariaLabel` is
  `aria-label` (default "Product switch"): it names the grid button and is its `title`. Angular's
  `fdProductSwitchButton` template is the `button` prop, an element that becomes the trigger (with
  `aria-haspopup="menu"` and `aria-expanded`). Native props, `className` and `ref` go to the root (Angular's
  `inline-block` host).
- **`ProductSwitchBody`** (`fd-product-switch-body`): Angular's `products` model is `products` / `defaultProducts` /
  `onProductsChange` (called with the new order after a drop); `dragAndDropEnabled` (true), `forceListMode`, `busy`;
  `itemClicked` is `onItemClick`. Native props, `className` and `ref` go to its root. It works on its own as well
  (the "Products in the page" story); inside a `ProductSwitch`, opening a product closes the switch.
- **`ProductSwitchItem`**: Angular's interface unchanged (`title`, `subtitle`, `callback`, `url`, `target`, `icon`,
  `font`, `avatar`, `disabledDragAndDrop`, `stickToPosition`); `callback` receives React's click event.

Behaviour, as Angular: the grid button is a transparent `Button` (`grid`, cozy) with `aria-haspopup="menu"`; the
popover body has no role (Angular's `bodyRole` null), the products are a `menu` of `menuitem`s with `aria-posinset`
and `aria-setsize`, each named by its title, subtitle and, for a url opening elsewhere, "Opens in a new tab" /
"in the parent frame" / "in the full window". Opening focuses the first product; Escape and an outside click close
the switch, and the focus returns to the button. Arrow keys move between the products (Left and Right swapped in
RTL; Right wraps from the last to the first; Up and Down by a row), Home and End to the first and the last; in the
list layout Up and Down wrap. Enter and Space click the product: `onItemClick`, then its `callback`, or
`window.open(url, target ?? '_blank')`; the switch closes. Products with a url render an `aria-hidden`, untabbable
link around their content (the browser shows the url on hover). Four columns for 7 or more products, three for 3 to
6, two below; the list layout below a window width of 776px (four columns) or 588px, or with `forceListMode`. Busy
covers the products with the busy indicator. Products are reordered with the mouse (or pen): a press that moves 5px
(the CDK's threshold) starts the drag; a preview with fundamental-styles' `dragged` look (`--sapContent_Shadow2`)
follows the pointer, the product's place stays empty (as the CDK's placeholder) and moves to the product under the
pointer, except onto a sticky product's place (Angular's sort predicate); sticky and `disabledDragAndDrop` products
cannot be dragged. The click that ends a drag does not open the product.

**Differences from Angular, on purpose:**

- Drag and drop is written for the product switch with pointer events instead of the Angular CDK; the behaviour is
  the CDK's (threshold, placeholder, live sorting, sort predicate). Touch drags are not supported: the browser
  scrolls the list instead (`pointercancel` ends the drag), where the CDK holds the scroll.
- The dragged preview has fundamental-styles' `dragged` shadow (`--sapContent_Shadow2`; Angular's CDK preview
  `--sapContent_Shadow3`).
- The focus frame is inset by 3px (`-0.1875rem`, fundamental-styles); Angular keeps the 2px inset of the active
  frame (an Angular issue). The pointer cursor is set on hover, as fundamental-styles.
- The icon has `line-height: 1`, as fundamental-styles' `fd-product-switch__icon` (Angular inherits `normal`).
- React writes no whitespace between elements: a space between the title and the subtitle keeps the visible text
  ("Catalog Ariba") part of the item's name (axe's label-content-name-mismatch).

### Visual differences from fundamental-styles, kept on purpose

| Difference                                                                        | Cause                                                                                                                                                 | Resolution                                                                                                      |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| HC Black and HC White: hovered items 8.3–8.5% of pixels (16), icon background (8) | fundamental-styles' stories wrap the icon in a thumbnail avatar, whose HC background (black, white) the icon inherits and keeps over the hovered item | Kept: the product switch's own icon (`fd-product-switch__icon`, `background: inherit`) takes the item's colour. |
