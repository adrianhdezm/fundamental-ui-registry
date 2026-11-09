## card

Sources: fundamental-react: none · Angular [`registry/ui/card`](../../../angular/registry/ui/card/) ·
fundamental-styles [Card](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-card-card--docs)
and [Media Card](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-card-media-card--docs)
Registry: `registry/ui/card/`, on Base UI's `useRender` (every part) and `Button` (the interactive header area), with
the registry's `Avatar` (a slot of the main header) and `ObjectStatus` (the badges).

API: Angular's components and directives as components, composed the same way. The parts read the card (id, type,
role) through React context, as Angular injects the parent `Card`, and register their ids with it for the card's
`aria-labelledby` and `aria-describedby` (Angular's `contentChild` queries); `useCard()` is exported for parts built
on top of the card (e.g. card layouts).

```tsx
<CardList aria-label="Requests">
  <Card role="listitem" badge="New" badgeColor={6}>
    <CardHeader>
      <CardMainHeader interactive onAction={open}>
        <Avatar glyph="cart" circle size="s" aria-label="Cart" />
        <CardTitle>Travel Request</CardTitle>
        <CardSubtitle>Marie Johnson</CardSubtitle>
        <CardHeaderAction>
          <Button variant="transparent" glyph="overflow" aria-label="More" />
        </CardHeaderAction>
        <CardCounter>2 hours ago</CardCounter>
      </CardMainHeader>
      <CardExtendedHeader>...</CardExtendedHeader>
    </CardHeader>
    <CardContent>...</CardContent>
    <CardFooter>
      <CardFooterActions>
        <Button label="Approve" />
      </CardFooterActions>
    </CardFooter>
  </Card>
</CardList>
```

- **`Card`** (`fd-card`): `cardType` (`standard` default … `banner`), `isLoading`, `role` (`region` default),
  `interactive`, `selected` (`data-selected`), the badge inputs (`badge`, `badgeIcon`, `badgeColor`,
  `badgeColorSecondary`, `badgeStatus`, `badgeAriaLabel` and the same six for `secondBadge…`), `id` (default
  `fd-card-…` from `useId`). Angular's `ariaLabel`, `ariaRoledescription`, `ariaDescription`, `ariaDescribedby`,
  `ariaPosinset` and `ariaSetsize` are the native `aria-*` props, with Angular's rules: `aria-label` replaces the title
  reference, the role description defaults to "&lt;Type&gt; Card", list items get "Active, Press Enter to activate" as
  description and keep `aria-posinset`/`aria-setsize` (other roles drop them), `aria-describedby` is appended to the
  subtitle, second subtitle, counter and badge ids. `tabIndex` is 0 for `button` and `listitem`, else -1, unless
  given. Angular's `keyDown` output is the native `onKeyDown`. The footer is placed last and `CardLoader` children
  render only while loading (then nothing else, badges included), as Angular's projection.
- **`CardHeader`** (`role="group"`, "Card Header"), **`CardMainHeader`** (`interactive`, `title` — the hint of the
  interactive area, "Activate for action/navigation"), **`CardExtendedHeader`** (`align` `top`/`bottom`),
  **`CardNumericHeader`**, **`CardHeaderRow`**, **`CardHeaderColumn`** (`align` `left`/`right`). The role
  descriptions are defaults of the native `aria-roledescription` (Angular's `ariaRoleDescription` inputs).
- **`CardTitle`** (an `<h2>`, `level` 1–6), **`CardSubtitle`**, **`CardSecondSubtitle`** (`<div>`s),
  **`CardCounter`** (`status`, a `<span>`): Angular's attribute directives, each with an `id` default (`fd-card-title-…`
  …) and `render` for another element (e.g. `<CardSubtitle render={<h3 />}>`).
- **`CardHeaderAction`**: marks its children as header actions (Angular's `fd-card-header-action` attribute on the
  button); it renders no element.
- KPI: **`CardKpiHeader`**, **`CardKpiValue`** (`status`), **`CardKpiScaleIcon`**, **`CardKpiScaleText`**,
  **`CardKpiAnalytics`**, **`CardKpiAnalyticsLabel`**, **`CardKpiAnalyticsContent`**, **`CardNumericContainer`**,
  **`CardIndicator`**, **`CardIndicatorTitle`**, **`CardIndicatorValue`**. Angular puts the scale directives on an
  object status; here `render={<ObjectStatus status="positive" glyph="up" />}` does it.
- **`CardContent`**, **`CardFooter`**, **`CardFooterActions`**, **`CardLoader`**. Angular's `*fdCardFooterActionItem`
  templates are the children of `CardFooterActions` (the end-aligned actions box Angular renders around them); the
  footer places it after its other children.
- Media: **`CardMedia`** (`hasPadding`, `shellColor` 1–16, `legendColor` 1–20), **`CardMediaImageContainer`**,
  **`CardMediaImage`** (an `<img>`), **`CardMediaContentContainer`** (`isOverlay`, `shellColor`, `legendColor`),
  **`CardMediaHeading`** (`role="heading"`, `level` → `aria-level`, 2 by default; names the card when it has no
  title), **`CardMediaText`** (a `<p>`).
- **`CardList`** (`fd-card-list`): `role="list"`, "Card List"; Arrow keys move the focus to the previous or next card
  of the list (also nested deeper), Home and End to the first and last, without wrapping; every card stays a tab stop.
  Angular's `ariaLabel` is `aria-label`.

Every part renders its element, passes native props and the `ref` through, merges `className` and takes `render`
(except `CardHeaderAction`). As Angular's `select`s, the slots (main header, KPI header, numeric container, indicator,
footer, card) see direct children only: a part inside a wrapper component is not recognised and stays among the other
children.

**Differences from Angular, on purpose:**

- The interactive header area is Base UI's Button (on a `<div>`, `role="button"`, `tabindex="0"`): click, Enter and
  Space call the new `onAction`. Angular only renders the role and lets the app listen to `keyDown` on the card
  (still possible with `onKeyDown`); header actions stay outside the area and do not call it.
- The title has `font-weight: normal` on the bold header font, as fundamental-styles' `fd-card__title`; Angular's
  `font-bold` adds synthetic bold.
- The counter is a 1rem-high flex box with a 1rem line height, as fundamental-styles' object-status counter; Angular's
  inherits `line-height: normal` (14px), so the counter and the header are 2px shorter.
- The badges are 18px high: a minimum height of 0.875rem and the object status' 1rem text line height, as
  fundamental-styles; Angular sets `min-h-0` and a 0.875rem line height (16px badges).
- The card shadow is written `[box-shadow:var(--card-shadow)]`: Angular's `shadow-(--card-shadow)` adds Tailwind's
  four transparent ring layers (computed styles only).
- A text `isOverlay` over a banner image lets the image take the whole width, and is 80% less 3rem wide below 1024px,
  as fundamental-styles; Angular keeps the image at 50% and the text at 50% less 3rem (Angular has no story with an
  overlay).
- Banner cards keep `--sapContent_Shadow0` in the high contrast themes (a 1px ring), as fundamental-styles'
  `fd-card--banner`; Angular drops the shadow of every card in HC.
