## message-page

Sources: fundamental-react [MessagePage](https://github.com/SAP/fundamental-react/tree/main/src/MessagePage)
(`MessagePage.js`) · Angular [`registry/ui/message-page`](../../../angular/registry/ui/message-page/) ·
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
