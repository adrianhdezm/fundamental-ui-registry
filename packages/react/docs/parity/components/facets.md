## facets

Sources: fundamental-react: none · Angular [`registry/ui/facets`](../../../../angular/registry/ui/facets/) ·
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

### Stories vs. sources

| Source  | Example          | React story  | Status     | Notes                                                                                                          |
| ------- | ---------------- | ------------ | ---------- | -------------------------------------------------------------------------------------------------------------- |
| Angular | Facet group      | `Group`      | ✅ covered | fundamental-styles' Combined texts; a real `RatingIndicator` instead of Angular's icons, without subtitle.     |
| Angular | Form facet       | `FormFacets` | ✅ covered | The contact facet takes fundamental-styles' Form Facet Link texts and icons; `FacetFormValue` in its last row. |
| Angular | Key-value facets | `KeyValue`   | ✅ covered |                                                                                                                |
| Angular | Alignment        | `Alignment`  | ✅ covered |                                                                                                                |
| Angular | Custom facet     | `Custom`     | ✅ covered | `FacetContainer` layouts with `Title`, `Button`, `Link`, `FormLabel` and `Text`.                               |
| Angular | Loading          | `Loading`    | ✅ covered | `Skeleton` facets in an `aria-busy` group.                                                                     |
| —       | Rating, subtitle | `Rating`     | ✅ added   | The rating facet alone and with `subtitle` (Angular shows the subtitle only in its group story).               |

There is no fundamental-react source, and the facets are not an overlay, so there is no "Open: …" story.

### Tests vs. sources

| Source  | Behaviour                                      | React test                                                                                  | Status     |
| ------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------- |
| Angular | Group role and name, facet spacing, wrapping   | facet group is a group with an accessible name; facets wrap with the reference spacing      | ✅ covered |
| Angular | Facets labelled by their title, `headingLevel` | non-image facets are groups labelled by their title; headingLevel makes the title a heading | ✅ covered |
| Angular | Image facets first, no title                   | image facets come first (order -1) and have no title                                        | ✅ covered |
| Angular | Form rows spacing, icon end margin             | form facet rows space evenly and icons get an end margin                                    | ✅ covered |
| Angular | Regular font for large object statuses         | key-value facets use the regular font family for large object statuses                      | ✅ covered |
| Angular | Rating subtitle below the title                | rating facet shows the subtitle (review count) under the title                              | ✅ covered |
| Angular | `alignEnd` in LTR and RTL                      | alignEnd pushes the facet to the end in LTR and RTL                                         | ✅ covered |
| Angular | Facet container flex options                   | facet container lays out its content with the given flex options                            | ✅ covered |
| —       | Form value colour and tag                      | form values use the group title text colour                                                 | ✅ covered |
| —       | Rating indicator stacked in a rating facet     | rating facet stacks a rating indicator with its dynamic text at the end                     | ✅ covered |
| —       | Container defaults                             | facet container defaults to a column with a 1rem gap                                        | ✅ covered |
| —       | Generated ids                                  | generates the facet and title ids unless an id is given                                     | ✅ covered |
| —       | Prop spreading, refs, user class wins          | passes className, native props and the ref to every part                                    | ✅ covered |
| —       | `render`                                       | FacetContent and FacetFormValue render another element with render                          | ✅ covered |

### Visual comparison

`pnpm visual facets`: 12 cases × 16 combinations, 192/192 matching. fundamental-styles has the facets under
`sap-design-dev-facets--*`. `Group` uses the texts of its Combined example and `FormFacets` those of its Form Facet
Link example. By pixels, with the margins and flex layout as computed styles: the image facet, the form facet, its
title and first row, the Status, Assembly Option and Pricing key-value facets and the rating facet. By computed style:
the group (as wide as the canvas), the Delivery Time facet, the facet with links (fundamental-styles' is not in a
group, so it is as wide as the canvas) and a row with an icon and a link.

| Difference                                                                 | Cause                                                                                                      | Resolution                                                                                                                                                                                                                          |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Facets 16px shorter: content right below the title                         | Angular's facet title has no bottom margin; fundamental-styles' has 1rem                                   | Fixed: `mb-4` on the title (on the subtitle when there is one). An Angular issue.                                                                                                                                                   |
| Values 4px further from their label (and links from their icon)            | Angular's `gap-1` on form rows, on top of the label's (or icon's) 0.5rem end margin                        | Fixed: no gap. An Angular issue.                                                                                                                                                                                                    |
| Icon rows 18px high, the link 2px below its icon                           | Angular's `items-baseline` on form rows; fundamental-styles' rows stretch                                  | Fixed: rows stretch. An Angular issue.                                                                                                                                                                                              |
| Rating indicator with 13px block margins and stars beside the dynamic text | The rating indicator's own layout; fundamental-styles' rating facet stacks them without margins            | Fixed: the rating facet styles a `RatingIndicator` inside it (Angular's stories use icons, so Angular does not show it).                                                                                                            |
| Image facet `order: -1` instead of 0                                       | Angular's: the image comes first whatever its source position; fundamental-styles' story has it first      | Kept: not visible where the image is first in the source, as in fundamental-styles; `order` is not compared for that case.                                                                                                          |
| Delivery Time facet 8px narrower                                           | fundamental-styles' story adds `fd-margin-end--tiny` to the status icon, on top of the status' 0.25rem gap | Kept: story markup, not a facet style; our `ObjectStatus` keeps its gap. That facet compares by computed style; for the same reason fundamental-styles' rating facet wraps to a second line, so the group's height is not compared. |

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: `Group`, `FormFacets`, `Rating`, `Alignment`, `Custom` and
`Loading`.
