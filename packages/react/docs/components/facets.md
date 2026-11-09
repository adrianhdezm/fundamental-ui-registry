## facets

Sources: fundamental-react: none · Angular [`registry/ui/facets`](../../../angular/registry/ui/facets/) ·
fundamental-styles [Facets](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-dev-facets--docs)
Registry: `registry/ui/facets/`, on Base UI's `useRender` (`FacetContent`, `FacetFormValue`).

API: composed parts, as Angular's directives:

```tsx
<FacetGroup aria-label="Product facets">
  <Facet type="image">
    <Avatar size="l" glyph="money-bills" aria-label="Product" />
  </Facet>
  <Facet type="form" facetTitle="Technical data" headingLevel={3}>
    <FacetContent>
      <FormLabel colon htmlFor="unit">
        Base unit
      </FormLabel>
      <Text id="unit">Each</Text>
    </FacetContent>
  </Facet>
  <Facet type="key-value" facetTitle="Status" headingLevel={3}>
    <ObjectStatus status="positive" label="Delivery" large />
  </Facet>
  <Facet type="rating-indicator" facetTitle="Average rating" subtitle="6 reviews">
    <RatingIndicator value={2.5} allowHalves nonInteractive aria-label="Average rating" />
  </Facet>
</FacetGroup>
```

| Angular                                                                          | React                                                                                       |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `fd-facet-group` (`ariaLabel`, `class`)                                          | `FacetGroup`: a `<div role="group">`; `aria-label`, `className`, native props and `ref`     |
| `fd-facet`: `type` (default `custom`), `facetTitle`, `subtitle`, `alignEnd`      | `Facet`: the same props (`facetTitle`, so the native `title` attribute stays free)          |
| `headingLevel` (number, or a tag name such as `'h3'`)                            | `headingLevel`: the same (number or string)                                                 |
| `id` (default `fd-facet-<n>`), title id `fd-facet-title-<n>`                     | native `id` (default `fd-facet-<useId>`), title id `fd-facet-title-<useId>`                 |
| `fd-facet-content` / `[fd-facet-content]` (styled by the enclosing facet's type) | `FacetContent`: a `<div>` (`render` for another element); reads the facet type from context |
| `[fd-facet-form-value]`                                                          | `FacetFormValue`: a `<span>` (`render` for another element)                                 |
| `fd-facet-container`: `flexDirection`, `alignItems`, `justifyContent`, `flexGap` | `FacetContainer`: the same props (`flexGap` in rem, default 1; a column by default)         |

Behaviour and ARIA are Angular's: the group is a `group` named by `aria-label`; every facet but an image facet is a
`group` labelled by its title (`aria-labelledby`), and `headingLevel` gives the title `role="heading"` and
`aria-level`. Image facets have no title and come first in the row (`order: -1`) wherever they are in the source;
`alignEnd` pushes a facet to the end of the row (LTR and RTL). The subtitle shows only in rating facets. Key-value
facets set the regular font family on large object statuses (their own is the light one), as fundamental-styles'
`.fd-facet__object-status-text`.

**Differences, on purpose:**

- The facet title has a 1rem bottom margin and truncates, as fundamental-styles' facet titles (`fd-title
fd-margin-bottom--sm`); Angular's title has neither, so its titles sit right on their content. With a subtitle the
  margin moves below the subtitle.
- Form facet rows have no `gap` and stretch their items (fundamental-styles' `.fd-facet__container`). Angular's
  `gap-1` adds 4px to the label's own 0.5rem end margin (and to the icon's), and its `items-baseline` drops a link
  2px below its icon, making icon rows 18px high instead of 16px.
- A `RatingIndicator` in a rating facet stacks its stars and dynamic text, without its block margins, with the text
  at the end (fundamental-styles' `.fd-facet--rating-indicator .fd-facet__container`). Angular's stories stand in
  icons for it.
- Key-value facets find the object status by its `group/os` class (our `ObjectStatus` has no data attribute); form
  rows give the end margin to direct icon children (`[data-glyph]`), not to icons nested in a link.
- The facet and group set `line-height: normal`, as fundamental-styles' (Angular inherits it).

### Visual differences from fundamental-styles, kept on purpose

| Difference                           | Cause                                                                                                      | Resolution                                                                                                                                                                                                                          |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Image facet `order: -1` instead of 0 | Angular's: the image comes first whatever its source position; fundamental-styles' story has it first      | Kept: not visible where the image is first in the source, as in fundamental-styles; `order` is not compared for that case.                                                                                                          |
| Delivery Time facet 8px narrower     | fundamental-styles' story adds `fd-margin-end--tiny` to the status icon, on top of the status' 0.25rem gap | Kept: story markup, not a facet style; our `ObjectStatus` keeps its gap. That facet compares by computed style; for the same reason fundamental-styles' rating facet wraps to a second line, so the group's height is not compared. |
