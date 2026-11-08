## card

Sources: fundamental-react: none · Angular [`registry/ui/card`](../../../../angular/registry/ui/card/) ·
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

### Stories vs. sources

| Source  | Example                                   | React story           | Status     | Notes                                                                                                                                     |
| ------- | ----------------------------------------- | --------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Angular | Header, content and badges                | `Standard`            | ✅ covered |                                                                                                                                           |
| Angular | Footer actions, header action and loading | `FooterAndLoading`    | ✅ covered |                                                                                                                                           |
| Angular | Analytical (KPI header)                   | `Analytical`          | ✅ covered | The scale icon and text are object statuses through `render`.                                                                             |
| Angular | Interactive cards in a card list          | `Interactive`         | ✅ covered | `fd-text` (not ported) is a plain span.                                                                                                   |
| Angular | Media                                     | `Media`               | ✅ covered |                                                                                                                                           |
| Angular | Banner                                    | `Banner`              | ✅ covered | fundamental-styles' banner text, and a third banner with the text over the image (`isOverlay`).                                           |
| Angular | Extended header and header interaction    | `ExtendedHeader`      | ✅ covered |                                                                                                                                           |
| Angular | Empty state                               | `EmptyState`          | ✅ covered | The registry's `IllustratedMessage` (dialog size, SAP Unable To Load illustration) with the Reload button.                                |
| Angular | Object card                               | `ObjectCard`          | ✅ covered |                                                                                                                                           |
| Angular | Calendar card                             | `CalendarCard`        | ✅ covered | The subtitle follows the calendar's view (`onActiveViewChange`).                                                                          |
| Angular | Quick view card                           | `QuickViewCard`       | ✅ covered | The quick view (not ported) is plain markup: subheader with avatar, groups of labels and values, links.                                   |
| Angular | Link list card                            | `LinkListCard`        | ✅ covered |                                                                                                                                           |
| Angular | Loading placeholders                      | `LoadingPlaceholders` | ✅ covered |                                                                                                                                           |
| Angular | Footer with overflow and link             | `FooterOverflow`      | ✅ covered | The overflow is a registry `Menu` with a transparent `Button` trigger.                                                                    |
| Angular | Open: footer overflow menu                | `OpenFooterOverflow`  | ✅ covered |                                                                                                                                           |
| —       | Standard card \| Main Header (fs)         | `Anatomy`             | ➕ added   | fundamental-styles' texts and sizes: non-interactive and interactive headers, truncation, footer link, badges; for the visual comparison. |
| —       | Interactive card with role listitem (fs)  | `InteractiveStates`   | ➕ added   | The five state cards of fundamental-styles, 400px wide, the last selected.                                                                |
| —       | Numeric Header (fs)                       | `NumericHeader`       | ➕ added   | `CardNumericHeader` with a KPI block and two indicators (Angular has the parts but no story).                                             |
| —       | Title on Media (fs)                       | `MediaColors`         | ➕ added   | The media heading on shell colours 1–3 and legend colours 1–3.                                                                            |

### Tests vs. sources

| Source  | Behaviour                                                        | React test                                                                                            | Status     |
| ------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------- |
| Angular | Parts in order, footer last, footer actions at the end, badges   | header, content and footer render in order; badges at the top end corner (two at most)                | ✅ covered |
| Angular | Labelled by the title, described by subtitle, counter and badges | the card is labelled by its title and described by subtitle, counter and badges                       | ✅ covered |
| Angular | Counter status colour                                            | counter color follows its status                                                                      | ✅ covered |
| Angular | Interactive main header                                          | interactive main header: a focusable button; Enter, Space and click call onAction; aria-description … | ✅ covered |
| Angular | Role description and list item hint                              | card role description and hint are exposed on the root                                                | ✅ covered |
| Angular | Role button                                                      | role button makes the whole card focusable and interactive                                            | ✅ covered |
| Angular | Selected                                                         | selected card shows the selection border (data-selected), not aria-selected on listitems              | ✅ covered |
| Angular | KPI header, numeric header, indicators                           | KPI header: value, scale icon/text, analytics labels and indicators (children out of order)           | ✅ covered |
| Angular | KPI values LTR in RTL                                            | KPI values keep their LTR direction in RTL                                                            | ✅ covered |
| Angular | Loader                                                           | loader state shows the loader and renders nothing else                                                | ✅ covered |
| Angular | Media, shell and legend colours, responsive banner               | media card: image container/banner variants, shell and legend colors, responsive banner sizes         | ✅ covered |
| Angular | Card list keyboard                                               | card list: arrow keys move focus between cards, Home/End jump                                         | ✅ covered |
| Angular | Card list ignores other elements                                 | card list ignores keys from elements that are not cards, and calls onKeyDown                          | ✅ covered |
| Angular | Corner rounding                                                  | corner rounding of the first/last part follows the card radius                                        | ✅ covered |
| Angular | Second subtitle in the description                               | aria-describedby includes the second subtitle                                                         | ✅ covered |
| Angular | Extended header                                                  | extended header: a group whose end column aligns to the end and whose content can sit at the bottom   | ✅ covered |
| —       | Generated ids                                                    | generates ids for the card and its parts                                                              | ➕ extra   |
| —       | Overlay over a full-width image                                  | overlay content container sits over an image of the full width                                        | ➕ extra   |
| —       | Main header slots, analytical title and subtitle                 | main header places avatar, texts, KPI, actions and counter in their areas whatever the order          | ➕ extra   |
| —       | Object and compact table content                                 | content of object and compact table cards                                                             | ➕ extra   |
| —       | Title level, subtitle `render`, title weight                     | title level and render                                                                                | ➕ extra   |
| —       | Prop spreading, className, refs (registry convention)            | spreads native props, merges className and forwards the refs of the card and its parts                | ➕ extra   |
| —       | `render`                                                         | renders another element with render                                                                   | ➕ extra   |

### Visual comparison

`pnpm visual card`: 44 cases × 16 combinations, 704/704 matching. The "Main header anatomy", "Interactive card
states", "Numeric header" and "Title on media colours" stories follow fundamental-styles' stories with the same texts
and sizes. fundamental-styles' avatars and media images do not load in its Storybook (an empty box), ours show a
photo, so parts holding an avatar or an image compare by computed styles; the rest also by pixels. Cases: the card,
header, main header and its container, title, subtitle, title and subtitle truncated after three and two lines,
counter, header actions (overflow button and counter), content, footer with actions, footer with a link, the
interactive header hovered and its area focused, the badge box, a badge, a long truncated badge with icon, a badge in
the secondary indication colours; the interactive (listitem) card at rest, hovered and focused, the content of a
hovered card and of a selected card (the frame) by pixels; the numeric header, its row, an indicator with its title
and value; the extended header (centred and bottom-aligned) and an end-aligned column; media with an image and with
padding, the heading on shell colours 1 and 3 and legend colour 1, the media heading; a banner on a shell colour and
its text by pixels, the overlay text and the image beside it; the analytical second subtitle and the object card
content. The press state of interactive cards cannot be held by the script (its classes are Angular's, checked in the
spec for hover).

| Difference                                                                  | Cause                                                                                                                                              | Resolution                                                                              |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Title weight 700 against 400                                                | Angular's `font-bold` on the `72-Bold` header face (synthetic bold); fundamental-styles keeps `font-weight: normal`                                | Fixed: `font-normal`. Angular issue.                                                    |
| Counter 14px high against 16px (header and actions 2px shorter)             | Angular's counter inherits `line-height: normal`; fundamental-styles' counter is an object status: flex, 1rem line height and min height           | Fixed: `flex min-h-4 leading-4`. Angular issue.                                         |
| Badges 16px high against 18px                                               | Angular's badge class sets `min-h-0` and a 0.875rem text line height; fundamental-styles: min height 0.875rem, the object status' 1rem             | Fixed: `min-h-[0.875rem]`, the object status' line height. Angular issue.               |
| Card `box-shadow` with four transparent layers                              | `shadow-(--card-shadow)` adds Tailwind's ring layers                                                                                               | Fixed: `[box-shadow:var(--card-shadow)]`. Angular issue (computed styles only).         |
| HC Black and HC White: banner without its 1px ring (`--sapContent_Shadow0`) | Angular sets `hc:[--card-shadow:none]` on every card; fundamental-styles' `fd-card--banner` keeps `box-shadow: var(--sapContent_Shadow0)`          | Fixed: banners keep `--sapContent_Shadow0` in HC. Angular issue.                        |
| Overlay text: the image beside it 50% wide against the whole width          | Angular's banner sets the image to 50% whenever there is one; fundamental-styles' overlay rule sets 100% (and the text to 80% − 3rem below 1024px) | Fixed (see the API notes), with a spec test. Angular issue (no Angular story shows it). |
| Long badge in RTL 16–19% of pixels                                          | Our story's badge text was shorter than fundamental-styles' (RTL truncates at the other end)                                                       | Fixed: the story uses fundamental-styles' text.                                         |
| Selected card footer 3.0–3.6% of pixels in compact and in Horizon Dark      | fundamental-styles' cards sit at a fractional offset (0.84px); the script snaps the footer to whole pixels but not the card's frame                | Case dropped: the frame is compared on the content of the selected card, which matches. |

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: Main header anatomy, Header, content and badges,
Interactive cards in a card list, Extended header and header interaction, Analytical, Banner.

Angular issues found: the title's synthetic bold; the counter's `line-height: normal` (2px shorter header); the 16px
badges (`min-h-0`, 0.875rem line height); the card shadow's transparent ring layers (computed styles only); the
banner's missing HC ring; the overlay banner's 50% image.
