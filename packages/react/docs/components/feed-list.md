## feed-list

Sources: Angular [`registry/ui/feed-list`](../../../angular/registry/ui/feed-list/) (itself from
`@fundamental-ngx/core`'s feed-list-item) · no fundamental-react source · fundamental-styles
[Feed List and Item](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-feed-list-and-item--docs).
Registry: `registry/ui/feed-list/`: `FeedList`, `FeedListItem`, `FeedListAvatar`, `FeedListAction`, `FeedListFooter`,
`FeedListFooterByline`. Built on Link (the author link and More/Less) and FormattedText (rich text); the byline uses
Base UI's `useRender`. No Base UI primitive applies (a static list); the stories put an ActionSheet in the actions.

API:

| Angular                                                                       | React                                                                                                 |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `fd-feed-list` `ariaLabel`, `ariaLabelledby`, `class`                         | `FeedList` `aria-label`, `aria-labelledby`, `className`                                               |
| `fd-feed-list` `mobile`, `isGroup` (true), `borderLess`                       | `FeedList` `mobile`, `isGroup` (true), `borderLess`                                                   |
| `fd-feed-list-item` `authorTitle`, `authorLink`, `text`, `maxChars`           | `FeedListItem` `authorTitle`, `authorLink`, `text`, `maxChars`                                        |
| `fd-feed-list-item` `isRichText`, `mobile`, `moreLabel`, `lessLabel`          | `FeedListItem` `isRichText`, `mobile`, `moreLabel`, `lessLabel`                                       |
| `fd-feed-list-item` `ariaLabel`, `ariaLabelledby`                             | `FeedListItem` `aria-label`, `aria-labelledby`                                                        |
| projected `fd-feed-list-avatar`, `fd-feed-list-action`, `fd-feed-list-footer` | `FeedListItem` `avatar`, `actions`, `footer` (a `FeedListAvatar`, `FeedListAction`, `FeedListFooter`) |
| `[fd-item-footer-byline]` (on a `<small>`)                                    | `FeedListFooterByline` (a `<small>`; `render` renders another element)                                |

Behaviour as Angular: the list is a `role="list"` of `role="listitem"` posts. The author shows before the text,
bold with a colon from CSS, as an emphasized link (new tab, `title` the name) with `authorLink`. A plain text longer
than `maxChars` (500, or 300 in mobile mode) shows its first characters and `...` with a More link ("{count} more",
the hidden characters) that toggles to Less; a new text starts collapsed again. Rich text shows in full through
FormattedText (sanitised). On desktop the avatar is beside the text and the actions float to its end corner; in
mobile mode (the list's or the item's own `mobile`) avatar, author, footer and actions form a header above the text.
Items are separated by borders (with one below the last), or with `borderLess` by padding only. Footer bylines are
separated by bullets.

**Differences on purpose:**

- Slots are props: Angular projects the avatar, action and footer elements into its template by selector; in React
  the item takes them as `avatar`, `actions` and `footer`, so it can place them in the header in mobile mode. The
  parts are the same components with the same classes.
- An unsafe `authorLink` (a `javascript:` URL) gets Angular's `unsafe:` prefix, as Angular's URL sanitiser does
  (React would only block it with an error on click).
- The rich text's FormattedText renders a `<span>` (`display: block`, as Angular's `fd-formatted-text` host) so the
  paragraph keeps valid markup.
- Fixes of the Angular issues below: actions at the end in RTL, the borderless last item's 16px bottom padding, a
  regular weight for the bold author link, and footer links and bylines at fundamental-styles' size and line height.

### Visual differences from fundamental-styles, kept on purpose

| Difference                                                        | Cause                                                                 | Resolution                                                                                                          |
| ----------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| More link not capitalised ("39 more"; fundamental-styles: "More") | fundamental-styles sets `text-transform: capitalize` on its More link | Kept: `moreLabel`/`lessLabel` show as written (the default "{count} more" is Angular's; "Show less" stays as given) |
