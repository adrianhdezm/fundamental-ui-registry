## quick-view

Sources: fundamental-react: none · Angular [`registry/ui/quick-view`](../../../../angular/registry/ui/quick-view/) ·
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

### Stories vs. sources

| Source  | Example                                  | React story   | Status     | Notes                                                                                                                                                                        |
| ------- | ---------------------------------------- | ------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Angular | Quick view                               | `Default`     | ✅ covered | Same data (employee, contact details, company), avatar with initials.                                                                                                        |
| Angular | With header                              | `WithTitle`   | ✅ covered | Header aligned left.                                                                                                                                                         |
| Angular | In a popover or a dialog                 | `InOverlays`  | ✅ covered | The registry's `Popover` (right-start, with arrow, at most 37.5rem wide), one without the header, and the registry's `Dialog` (25rem) with an `<h4>` title.                  |
| Angular | Long texts                               | `LongTexts`   | ✅ covered | `allowWrap` on the subheader texts, group titles and labels.                                                                                                                 |
| Angular | Open: In a popover                       | `OpenPopover` | ✅ covered |                                                                                                                                                                              |
| Angular | Open: In a dialog                        | `OpenDialog`  | ✅ covered |                                                                                                                                                                              |
| —       | —                                        | `Playground`  | ➕ added   | Controls for the header, its alignment and the long texts.                                                                                                                   |
| —       | Popover, Without the header, Dialog (fs) | `Examples`    | ➕ added   | fundamental-styles' three examples with their texts, in place on a popover surface and in a dialog body; for the visual comparison. Values use the ported `Text` and `Link`. |

### Tests vs. sources

| Source  | Behaviour                                                         | React test                                                                        | Status     |
| ------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------- |
| Angular | Values labelled by their label; titles are headings of the levels | labels each value with its label and marks titles as headings                     | ✅ covered |
| Angular | Each group named by its title                                     | names each group by its title                                                     | ✅ covered |
| Angular | Given and generated id on the quick view                          | renders the id on the quick view                                                  | ✅ covered |
| Angular | Title on the left, middle or right by `align`                     | shows the title in a header bar on the left, middle or right by align             | ✅ covered |
| Angular | `allowWrap` wraps instead of truncating                           | allowWrap wraps the titles and labels instead of truncating                       | ✅ covered |
| —       | Group named by its own `aria-labelledby`/`aria-label`             | names a group by its own aria-labelledby or aria-label instead                    | ➕ added   |
| —       | Title above the content area (also from a fragment), sticky       | puts the title above the content area and the other children into it              | ➕ added   |
| —       | Avatar first with its margin; subheader paddings                  | puts the avatar before the subheader texts, with a gap                            | ➕ added   |
| —       | `headerSize` of the subheader title                               | sets the heading level and size of the subheader title                            | ➕ added   |
| —       | Item spacing, none after the group title                          | spaces the items, except the first one after the group title                      | ➕ added   |
| —       | Item `id` for the label and value ids; no ids outside an item     | uses the item id for the label and the value; leaves the value element unlabelled | ➕ added   |
| —       | Content paddings, none vertically in a dialog body; min width     | has the content paddings, without the vertical ones in a dialog body              | ➕ added   |
| —       | Native props, className, ref                                      | passes native props, className and ref to the root                                | ➕ added   |

### Visual comparison

`pnpm visual quick-view`: 24 cases × 16 combinations, 384/384 matching. Cases, against fundamental-styles' Popover,
Without the header and Dialog examples (our `Examples` story has their texts and icon avatars): the quick view, the
header bar and its title, the content area, the subheader (bar, start area, avatar margins, text column, title and
subtitle), both groups, the group header and title, the item after the title and the next one, the label, the link
and the text value; the quick view, content and group of the example without the header; and the content area and
subheader in a dialog body (styles only: fundamental-styles' dialog is as wide as its content, ours 25rem).

| Difference                                                         | Cause                                                                                                                                        | Resolution                                                                                   |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Subheader minimum height 0 against 44px (40px compact)             | Angular's `min-h-0` on the subheader bar; fundamental-styles keeps the bar's minimum height                                                  | Fixed: the bar's minimum height stays. Angular issue (visible with a subheader title alone). |
| Quick view radius 0 against 8px                                    | fundamental-styles rounds the first and last child of a popover body; our popover clips its content to its radius (scroll wrapper)           | Kept, not visible; the radius is not compared on the two quick views.                        |
| Group header font 72-Bold 16px against 72 14px                     | Angular's form group header carries the header font; fundamental-styles sets it on the inner heading only                                    | Kept, not visible: the header's only text is the heading, which matches.                     |
| Text value computed height `auto` against 32px                     | Our story's `Text` was a `<span>` in the content wrapper (inline); fundamental-styles' `fd-text` is a flex item of the form item             | Fixed in the story: the `Text` is its default `<p>`. Same box either way.                    |
| Long header title wraps over three lines (seen by eye, Long texts) | The bar element's `[text-wrap:auto]` comes after `truncate`'s `white-space: nowrap` in the stylesheet (Angular's `[&]:truncate` sorts later) | Fixed: `[text-wrap:nowrap]` on the title, with a spec test. Not an Angular issue.            |

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: Quick view, With header, Long texts, Company examples and
the open popover and dialog. In RTL, phone numbers show with the plus sign at the end (bidirectional text of the
values, as in fundamental-styles).
