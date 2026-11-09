## feed-list

Sources: Angular [`registry/ui/feed-list`](../../../../angular/registry/ui/feed-list/) (itself from
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

### Stories vs. sources

| Source  | Example                 | React story         | Status     | Notes                                         |
| ------- | ----------------------- | ------------------- | ---------- | --------------------------------------------- |
| Angular | Default                 | `Default`           | ✅ covered | Linked author, collapsed long text, rich text |
| Angular | With actions            | `WithActions`       | ✅ covered | An ActionSheet (Edit, Share, Delete) per post |
| Angular | No avatars              | `NoAvatars`         | ✅ covered |                                               |
| Angular | Borderless              | `Borderless`        | ✅ covered |                                               |
| Angular | Mobile                  | `Mobile`            | ✅ covered | Mobile action sheets                          |
| Angular | Custom more/less labels | `CustomLabels`      | ✅ covered |                                               |
| Angular | Open: actions           | `OpenActions`       | ✅ covered |                                               |
| Angular | Open: mobile actions    | `OpenMobileActions` | ✅ covered |                                               |
| —       | Controls                | `Playground`        | ✅ new     | `mobile`, `isGroup`, `borderLess`             |

### Tests vs. sources

| Source  | Behaviour                                          | React test                                                               | Status     |
| ------- | -------------------------------------------------- | ------------------------------------------------------------------------ | ---------- |
| Angular | List of posts, author as a link                    | renders a list of posts with the author as a link                        | ✅ covered |
| Angular | More/Less on long texts                            | collapses long texts with a More/Less link                               | ✅ covered |
| Angular | Rich text in full                                  | renders rich text in full                                                | ✅ covered |
| Angular | Mobile header with author, footer and actions      | moves the author, footer and actions above the text in mobile mode       | ✅ covered |
| Angular | Author as text without `authorLink`                | renders the author as text without authorLink                            | ✅ covered |
| Angular | Custom `moreLabel`/`lessLabel`                     | uses custom moreLabel and lessLabel                                      | ✅ covered |
| Angular | No live `javascript:` author link                  | does not render a javascript: authorLink as a live link                  | ✅ covered |
| Angular | `borderLess` removes the borders                   | removes the borders between items with borderLess                        | ✅ covered |
| —       | Actions at the end in LTR and RTL                  | floats the actions to the end beside the text on desktop, in LTR and RTL | ✅ new     |
| —       | A new text collapses again                         | collapses again when the text changes                                    | ✅ new     |
| —       | Default limits 500 / 300 (list or item mobile)     | collapses at 500 characters, or 300 in mobile mode, without maxChars     | ✅ new     |
| —       | `isGroup`                                          | stacks the items unless isGroup is false                                 | ✅ new     |
| —       | Byline bullets                                     | separates the footer bylines with bullets                                | ✅ new     |
| —       | Native props, className, ref (registry convention) | passes className, native props and the ref through                       | ✅ new     |

### Visual comparison

`pnpm visual feed-list`: 22 cases × 16 combinations, **352/352** matching, against fundamental-styles' Group,
Borderless group, Standard, Linked, Show more, Actions and Mobile stories, by computed style (the posts, names and
avatars differ): the list, the first, middle and last item (borders) and the three borderless items (padding), the
avatar box (size and end margin) and the avatar (size and radius), the author and the author link, the text, the More
link at rest, hovered and focused, the footer, the actions (position) and their button, and in mobile mode the header,
the actions and the text. The byline ("Aug 21, 2020" with its bullet) and the actions button are also compared by
pixels. Reviewed by eye in Horizon, cozy and compact, LTR and RTL: Default, With actions, Borderless and Mobile; in
RTL the actions sit at the end (left). As in timeline, English names and texts in RTL are LTR runs that the bidi
algorithm reorders ("Cruz:" with its end margin on the outside).

| Difference                                                         | Cause                                                                                                   | Resolution                                                                                                          |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Author link `font-weight` 700 (fundamental-styles: 400)            | The emphasized link (72-Bold) inherits `font-bold` from the author span: synthetic bold on a bold face  | Fixed: `font-normal` on the author link                                                                             |
| Footer 22px high (17px), bylines 16px high at 9.5px (11px at 10px) | The Reply link keeps the link's 1rem line height and stretches the row; preflight sets `<small>` to 80% | Fixed: footer links inherit font size and line height; bylines use `font-size: smaller` as the browser default      |
| Borderless last item: 12px bottom padding (16px)                   | `[&+&]:py-3` (two classes) beats `last:pb-4`                                                            | Fixed: `[&+&]:pt-3`, so `last:pb-4` applies                                                                         |
| Actions at the start in RTL                                        | `rtl:float-start` on top of `float-end`, which is already logical (`inline-end`) in Tailwind v4         | Fixed: `float-end` only; computed `inline-end` against fundamental-styles' `right`/`left` is ignored (same place)   |
| More link not capitalised ("39 more"; fundamental-styles: "More")  | fundamental-styles sets `text-transform: capitalize` on its More link                                   | Kept: `moreLabel`/`lessLabel` show as written (the default "{count} more" is Angular's; "Show less" stays as given) |
| Author and More link margins (0.25rem; fundamental-styles: 0)      | fundamental-styles spaces them with a space character in the markup                                     | Not visible: the 0.25rem margin is the width of the space; ignored in the cases                                     |
| Mobile actions `float: none` (fundamental-styles: `right`)         | A float does nothing on a flex item                                                                     | Not visible; ignored in the case                                                                                    |

### Angular issues

- In RTL the desktop actions float to the start (right) instead of the end: `rtl:float-start` is added to
  `float-end`, which Tailwind v4 already compiles to the logical `float: inline-end`. Found by reading the code and
  checked with the same classes in the React port.
- Borderless lists give the last item a 12px bottom padding instead of fundamental-styles' 16px: `[&+&]:py-3` has a
  higher specificity than `last:pb-4`.
- The author link is rendered in synthetic bold (font-weight 700 on the 72-Bold face) because the author span is
  `font-bold`; fundamental-styles uses weight 400.
- Links in the footer keep the link's 1rem line height, so a Reply link makes the footer 5px taller than
  fundamental-styles' (22px instead of 17px), and the bylines are 9.6px (preflight's `small { font-size: 80% }`)
  instead of 10px.
