## message-page

Sources: fundamental-react [MessagePage](https://github.com/SAP/fundamental-react/tree/main/src/MessagePage)
(`MessagePage.js`) · Angular [`registry/ui/message-page`](../../../../angular/registry/ui/message-page/) ·
fundamental-styles [Message Page](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-message-page--docs)
Registry: `registry/ui/message-page/`, on Base UI's `useRender`, with the `icon` component.

API: five components, as Angular's `fd-message-page` with its four part directives.

```tsx
<MessagePage type="search">
  <MessagePageTitle>No matching items found.</MessagePageTitle>
  <MessagePageSubtitle>Check the search term.</MessagePageSubtitle>
  <MessagePageActions>
    <Button variant="emphasized" label="Clear search" />
  </MessagePageActions>
</MessagePage>
```

- `MessagePage` takes Angular's inputs: `type` (`''`, `filter`, `search`, `no-items`, `error`: the documents, filter,
  search, product and document icons), `hasIcon` (default true), `glyph` (an icon instead of the type's) and
  `glyphFont`. It fills its container (`size-full`, on the background colour) and centres a rounded container with
  the icon and the content. The content is a polite live region (`role="status"`, `aria-live="polite"`); the icon is
  decorative (`role="presentation"`, `aria-hidden`).
- `MessagePageTitle`, `MessagePageSubtitle`, `MessagePageActions` (buttons side by side, wrapping, gap 0.5rem) and
  `MessagePageMore` (Angular's `fd-message-page-title`, `-subtitle`, `-actions`, `-more`). As Angular's slots, the page
  places them in that order whatever the order of the children; other children keep their place (as in
  [layout-panel](layout-panel.md)).

All render a `<div>`, pass native props and refs through, merge `className` and take `render` for another element
(e.g. `<section>` for the page, as fundamental-react's root, or a heading for the title).

fundamental-react's props are kept on `MessagePage`: `title`, `subtitle`, `actions` and `more` render the matching
part (sorted with the children), `glyph` is `glyph`, and `image` replaces the icon with other content (an
illustration) in the icon area. `title` replaces the native `title` attribute on the root. `cssNamespace` is gone.

**Differences, on purpose:**

- The default icon (no `type`, no `glyph`) is Angular's and fundamental-styles' `documents`; fundamental-react's
  default `glyph` was `product` (the `no-items` icon here).
- fundamental-react gave the icon an `aria-label` (the glyph name); here it is decorative, as Angular and
  fundamental-styles (`role="presentation"`): the title says what happened.
- The icon is as wide as its glyph (`w-auto` over the icon's 1em box), as fundamental-styles' `.fd-message-page__icon`;
  the container centres it, so nothing moves.
- The subtitle is start-aligned, as fundamental-styles: the column centres a one-line subtitle, and a long one reads
  from the start. Angular centres every line (`text-center`).

### Stories vs. sources

| Source            | Example                 | React story   | Status     | Notes                                                                             |
| ----------------- | ----------------------- | ------------- | ---------- | --------------------------------------------------------------------------------- |
| fundamental-react | primary                 | `Primary`     | ✅ covered | The `title` prop; the documents icon instead of product (see above).              |
| fundamental-react | complex                 | `Complex`     | ✅ covered | `title`, `subtitle`, `actions` (emphasized "Try again"), `more` (a link), search. |
| fundamental-react | customImage             | `CustomImage` | ✅ covered | A placeholder logo (data URI) instead of the SAP logo from unpkg.                 |
| Angular           | With actions            | `Actions`     | ✅ covered | Formatted subtitle, two actions and a "more" transparent button.                  |
| Angular           | Types                   | `Types`       | ✅ covered | `type` as a control (search by default); the page props as controls.              |
| Angular           | Filter                  | `Filter`      | ✅ covered | fundamental-styles' texts.                                                        |
| Angular           | No items                | `NoItems`     | ✅ covered | fundamental-styles' texts.                                                        |
| Angular           | Error                   | `ErrorPage`   | ✅ covered | "Home Page" link, fundamental-styles' text.                                       |
| Angular           | Custom icon and no icon | `CustomIcon`  | ✅ covered | `glyph="retail-store"` with a "more" button, and `hasIcon={false}`.               |
| —                 | (fundamental-styles)    | `Search`      | ➕ extra   | fundamental-styles' Search story (title only), for the visual comparison.         |

### Tests vs. sources

| Source            | Behaviour                                                    | React test                                                                                     | Status     |
| ----------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ---------- |
| Angular           | Polite status, icon per type, `glyph` wins, `hasIcon`        | announces its content and shows the icon of its type                                           | ✅ covered |
| Angular           | Subtitle below the title, both centred                       | renders the subtitle below the title                                                           | ✅ covered |
| Angular           | Actions side by side and more after the subtitle, any order  | renders actions and the more area after the subtitle                                           | ✅ covered |
| fundamental-react | should be created (`title`)                                  | title (fundamental-react: should be created) and the other props render the parts              | ✅ covered |
| fundamental-react | Prop spreading                                               | spreads native props (fundamental-react), merges className and forwards the refs of every part | ✅ covered |
| —                 | Glyph of every type, documents by default, `glyphFont`, look | has an icon per type, documents by default, and takes the glyph font                           | ➕ extra   |
| —                 | Fills and centres                                            | centres the content in the page it fills                                                       | ➕ extra   |
| —                 | Prop parts sorted with children, wrappers in place           | sorts the prop parts with the children and keeps other children in place                       | ➕ extra   |
| —                 | `image` (fundamental-react's custom image story)             | image replaces the icon (fundamental-react)                                                    | ➕ extra   |
| —                 | SAP typography, `render`                                     | uses the SAP text typography on the background colour; renders another element with render     | ➕ extra   |

### Visual comparison

`pnpm visual message-page`: 19 cases × 16 combinations, 304/304 matching after the fixes below. Cases, against
fundamental-styles' Message Page stories: the page (Filter; computed styles, our frame is 32rem high instead of
600px), the whole container by pixels in Filter, Search, No items and Error (the same texts and icons), the icon
container, the icon of each type and the default one (Formatted text and buttons), the content, the title and the
subtitle (Filter), the subtitle with a link (Error); and from the actions story, by computed styles only (Angular's
texts, fundamental-styles' lorem ipsum and title-case labels): the title, the formatted subtitle, the actions and the
more area.

| Difference                                          | Cause                                                                                                   | Resolution                                                     |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Icon 96px wide instead of the glyph width (72-84px) | The icon component's 1em box (`w-[1em]`); fundamental-styles' icon is as wide as its glyph              | Fixed: `w-auto` on the icon. Not visible (the box is centred). |
| Subtitle `text-align: center` instead of `start`    | Angular's `text-center`; fundamental-styles' subtitle has no alignment, so long subtitles start-aligned | Fixed: no `text-center`. Angular issue (multi-line subtitles). |

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: With actions, Custom icon and no icon, Complex and
Custom image.
