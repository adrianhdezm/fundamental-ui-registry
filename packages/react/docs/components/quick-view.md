## quick-view

Sources: fundamental-react: none · Angular [`registry/ui/quick-view`](../../../angular/registry/ui/quick-view/) ·
fundamental-styles [Quick View](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-quick-view--docs)
Registry: `registry/ui/quick-view/`, on the registry's `Bar`, `Form`, `PopoverBodyHeader` and `Title`, and Base UI's
`useRender` (the group title and the value element).

API: Angular's components and directives as components, composed the same way:

```tsx
<QuickView>
  <QuickViewTitle align="left">Employee</QuickViewTitle>
  <QuickViewSubheader>
    <Avatar size="s" label="Ann Smith" />
    <QuickViewSubheaderTitle>Ann Smith</QuickViewSubheaderTitle>
    <QuickViewSubheaderSubtitle>Senior sales manager</QuickViewSubheaderSubtitle>
  </QuickViewSubheader>
  <QuickViewGroup>
    <QuickViewGroupTitle>Contact details</QuickViewGroupTitle>
    <QuickViewGroupItem>
      <QuickViewGroupItemLabel>Email</QuickViewGroupItemLabel>
      <QuickViewGroupItemContent>
        <QuickViewGroupItemContentElement render={<Link href="mailto:ann.smith@example.com" />}>
          ann.smith@example.com
        </QuickViewGroupItemContentElement>
      </QuickViewGroupItemContent>
    </QuickViewGroupItem>
  </QuickViewGroup>
</QuickView>
```

- **`QuickView`** (`fd-quick-view`): a `<div>` with Angular's `id` (`fd-quick-view-…` by default). Its
  `QuickViewTitle` children go on top, the others into the content area (Angular's content projection; fragments are
  looked into). The content area drops its vertical padding in a `DialogBody` (Angular's `[fd-dialog-body_&]:py-0`,
  fundamental-styles' `.fd-dialog__body .fd-quick-view__content`). Native props, `className` and `ref` go to the root.
- **`QuickViewTitle`** (`align`: `left`, `middle` (default), `right`): a header bar (`role="group"`) in a
  `PopoverBodyHeader`, so it stays in place while a popover body scrolls; the title truncates. Native props go to the
  sticky header element.
- **`QuickViewSubheader`**: a header-with-subheader bar (`role="group"`, native props on it); the avatar (any child
  other than the title and subtitle, Angular's `fd-avatar` slot) first with a 0.75rem end margin, then
  **`QuickViewSubheaderTitle`** (`allowWrap`, `headerSize` 5 by default) and **`QuickViewSubheaderSubtitle`**
  (`allowWrap`) in a column.
- **`QuickViewGroup`**: a `FormGroup` with `role="group"`, named by its **`QuickViewGroupTitle`** (`allowWrap`, `id`
  (`fd-quick-view-group-title-…`), `headingLevel` 3 by default): the title registers its id with the group through
  context (Angular's `contentChild`). An `aria-labelledby` or `aria-label` on the group wins.
- **`QuickViewGroupItem`** (`id`, `fd-quick-view-group-item-…`): a `FormItem` with a 0.75rem top padding (none right
  after the group title) and a 0.25rem gap. **`QuickViewGroupItemLabel`** (a `FormLabel`, `allowWrap` and its other
  props) takes the id `<item id>-label`; **`QuickViewGroupItemContent`** wraps the value; and
  **`QuickViewGroupItemContentElement`** (Angular's `fd-quick-view-group-item-content-element` directive) is the
  value element, a `<div>` or the element of `render` (e.g. a `Link` or a `Text`), with the id `<item id>-content` and
  `aria-labelledby="<item id>-label <item id>-content"`, so it is announced with its label.

Deliberate differences:

- The subheader title and the group title are `<h1>`…`<h6>` elements (fundamental-styles' `<h5 class="fd-title">` and
  `<h4 class="fd-form-group__header-text">`); Angular uses `<span role="heading" aria-level>`. The levels are the same.
- The subheader keeps the bar's minimum height (2.75rem, 2.5rem compact), as fundamental-styles; Angular's `min-h-0`
  removes it (only visible with a title alone, no avatar or subtitle).
- No rounding of the content area inside a popover body (Angular's `[fd-popover-body_&]:rounded-…`): the registry's
  popover clips its content to its radius, so it is not needed.

### Visual differences from fundamental-styles, kept on purpose

| Difference                                     | Cause                                                                                                                              | Resolution                                                               |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Quick view radius 0 against 8px                | fundamental-styles rounds the first and last child of a popover body; our popover clips its content to its radius (scroll wrapper) | Kept, not visible; the radius is not compared on the two quick views.    |
| Group header font 72-Bold 16px against 72 14px | Angular's form group header carries the header font; fundamental-styles sets it on the inner heading only                          | Kept, not visible: the header's only text is the heading, which matches. |
