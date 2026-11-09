## pagination

Sources: fundamental-react [Pagination](https://github.com/SAP/fundamental-react/tree/main/src/Pagination) · Angular
[`registry/ui/pagination`](../../../../angular/registry/ui/pagination/) · fundamental-styles
[Pagination](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-pagination--docs)
Registry: `registry/ui/pagination/`, built on our [button](button.md) (transparent page, arrow and media buttons),
[input](input.md) (`Input` with `noNumberSpinner` for the page input) and [select](select.md) (`Select`,
`SelectOption` for the items per page). No Base UI primitive of its own: Base UI has no pagination; the roving tab
stop and the arrow keys are Angular's, ported as they are.

API: Angular's inputs as props: `totalItems`, `itemsPerPageOptions`, `displayTotalItems`, `mobile`, and the labels
`firstLabel`, `previousLabel`, `nextLabel`, `lastLabel`, `pageLabel` (`{page}`), `pageInputLabel`, `ofLabel`
(`{total}`), `itemsPerPageLabel`, `totalResultsLabel` (`{from}`, `{to}`, `{total}`) and `pageAnnouncement` (`{page}`,
`{total}`). Angular's `ariaLabel` (default "Pagination") is `aria-label`, which names the `<nav>`. The `currentPage`
model is `currentPage`/`defaultCurrentPage`/`onCurrentPageChange`, the `itemsPerPage` model is
`itemsPerPage`/`defaultItemsPerPage`/`onItemsPerPageChange`; `pageChangeStart` is `onPageChangeStart`, called at the
same moments as `onCurrentPageChange` (a page button, an arrow, Enter in the input, or a smaller page count after a new
page size). `itemsPerPageTemplate` is `renderItemsPerPage({ onSelect, pageOptions })` and `displayTextTemplate` is
`renderDisplayText(showing)`. The values are coerced as in Angular: `itemsPerPage` rounded down, at least 1, 10 when it
is not a number; `currentPage` rounded down and kept in range; the options rounded down, without values below 1, with
`itemsPerPage` added and sorted. `paginationPages(totalPages, currentPage)` is exported as in Angular. Native props,
`className` and `ref` go to the root `<div>`.

fundamental-react's props map as follows: `itemsTotal` is `totalItems`; `onClick(page)` is `onPageChangeStart` (or
`onCurrentPageChange`); `initialPage` is `defaultCurrentPage`; `itemsPerPage` and `className` keep their names;
`displayTotal` is `displayTotalItems`; `totalText` is `totalResultsLabel` (`"{total} items"`);
`localizedText.previous`/`next` are `previousLabel`/`nextLabel`; `linkProps`, `prevProps`, `nextProps` and
`displayTotalProps` are `pageProps`, `previousProps`, `nextProps` and `displayTotalProps` (spread on our buttons and the
results text). `visiblePageTotal` has no counterpart: the pages shown are always Angular's (the ends and two on each
side of the current page, all of them up to nine pages). `cssNamespace` is n/a.

ARIA and keyboard as Angular: a `<nav>` with its label, described by the results text; page buttons named and titled
"Page N"; the current page is a pressed-looking button with `aria-current="page"` (up to nine pages) or a number input
labelled by "Page:" and "of N" (`aria-labelledby`, the labels hidden outside the mobile layout), `aria-invalid` while
the typed page is out of range, applied with Enter and reset on Enter and on blur. The controls form one tab stop (the
current page by default, then the last focused control); Left and Right (swapped in RTL), Home and End move between
the enabled ones (Home and End stay in the input). After a page button or the input changes the page, the focus goes
to the current page. Page changes are announced in a polite live region (Angular's `LiveAnnouncer`). The ellipses are
`aria-hidden`. The items per page select is labelled by "Results per page:", or by its `aria-label` in the mobile
layout, where the label is not shown.

**Differences, on purpose:**

- With `currentPage` (controlled) the page changes only when the app passes the new page, as React components do;
  Angular's `model` also changes its own value when it is bound one way. The Basic story shows the request flow.
- `itemsPerPage={0}` gives one item per page (Angular); fundamental-react falls back to 10.
- The tab stop falls back to the current page when its control disappears (a page button scrolled out of the shown
  range by the app, or a button that became disabled); in Angular it can be left without a tab stop.
- The nav is described by the results text only while it is shown; Angular points `aria-describedby` at the results
  text in the mobile layout too, where it is not rendered (Angular issue below).
- The arrow glyphs mirror themselves in RTL (our icon's mirrored glyphs), so only the first and last (media) icons are
  turned with `rtl:rotate-180`; Angular turns every icon.
- The live region is a polite `role="status"` element inside the pagination instead of the CDK's global announcer.

### Stories vs. sources

| Source             | Example                                  | React story                           | Status     | Notes                                                                                                      |
| ------------------ | ---------------------------------------- | ------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------- |
| fundamental-react  | primary                                  | `Primary`                             | ✅ covered | 101 items.                                                                                                 |
| fundamental-react  | initialSetPagination                     | `InitialPage`                         | ✅ covered | `defaultCurrentPage={5}` (fundamental-react's story misspells `initalPage`, so it starts on page 1).       |
| fundamental-react  | itemsPerPagePagination                   | `PageSizes`                           | ✅ covered | 25 items per page.                                                                                         |
| fundamental-react  | hideTotalItemsPagination                 | `HideTotal`                           | ✅ covered |                                                                                                            |
| fundamental-react  | totalTextPagination                      | `TotalText`                           | ✅ covered | `totalResultsLabel="{total} Dalmations"`.                                                                  |
| fundamental-react  | itemsPerPageZeroPagination               | `PageSizes`                           | ✅ covered | 0 items per page: one per page (Angular).                                                                  |
| fundamental-react  | visibleTotalPagesPagination              | `ManyPages`                           | ✅ covered | 221 items; the shown pages follow Angular (no `visiblePageTotal`).                                         |
| fundamental-react  | visibleTotalPagesWithItemTotalPagination | `ManyPages`                           | ✅ covered | 10 items, one per page.                                                                                    |
| fundamental-react  | visibleTotalPagesZeroPagination          | `ManyPages`                           | ✅ covered | 200 items, 0 per page.                                                                                     |
| fundamental-react  | dev                                      | `Playground`                          | ✅ covered |                                                                                                            |
| fundamental-react  | noStyles                                 | —                                     | ➖ n/a     | No `cssNamespace`.                                                                                         |
| Angular            | Playground                               | `Playground`                          | ✅ covered |                                                                                                            |
| Angular            | Basic                                    | `Basic`                               | ✅ covered | Controlled `currentPage`, the page set after a simulated request from `onPageChangeStart`.                 |
| Angular            | Showing items                            | `ShowingItems`                        | ✅ covered | `renderDisplayText`.                                                                                       |
| Angular            | Items per page                           | `ItemsPerPage`                        | ✅ covered | `itemsPerPage`, the default select, and a segmented button from `renderItemsPerPage`.                      |
| Angular            | Mobile                                   | `Mobile`                              | ✅ covered | fundamental-styles' values (2000 items, 4 per page, options 4–32, page 500) instead of Angular's 50 items. |
| Angular            | Open: items per page                     | `OpenItemsPerPage`                    | ✅ covered | Opens the first select, so axe checks the list.                                                            |
| fundamental-styles | First Page, Middle Page, Last Page       | `FirstPage`, `MiddlePage`, `LastPage` | ✅ covered | Their > 9 and < 9 pages examples, one item per page, with their labels.                                    |
| fundamental-styles | Per Page                                 | `PerPage`                             | ✅ covered | 2000 items, so the results read "2000 Results" (theirs "500 Results").                                     |
| fundamental-styles | Mobile                                   | `Mobile`                              | ✅ covered |                                                                                                            |

### Tests vs. sources

| Source            | Behaviour                                                         | React test                                                                                            | Status     |
| ----------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------- |
| Angular           | `paginationPages`: all pages up to nine, ellipses beyond          | shows all pages up to nine and ellipses beyond; shows only one ellipsis while the current page is …   | ✅ covered |
| Angular           | Buttons go to pages, disabled at the ends, results text           | goes to pages with the buttons and disables them at the ends                                          | ✅ covered |
| Angular           | Page input with more than nine pages, invalid pages               | takes a page from the input when there are more than nine pages                                       | ✅ covered |
| Angular           | "Page:" and "of" labels shown in mobile only, naming the input    | shows the "Page:" and "of" labels of the input in the mobile layout only, naming the input in both    | ✅ covered |
| Angular           | Arrow keys, Home, one tab stop                                    | moves between the controls with the arrow keys as one tab stop                                        | ✅ covered |
| Angular           | Items per page select keeps the page in range                     | changes the items per page and keeps the page in range                                                | ✅ covered |
| Angular           | Mobile nav centred, at the end after a select                     | centres the mobile nav, and puts it at the end after an items per page select                         | ✅ covered |
| Angular           | First and last buttons in mobile mode                             | shows first and last buttons in mobile mode                                                           | ✅ covered |
| Angular           | `itemsPerPage` coercion                                           | rounds itemsPerPage down, keeps it at least 1 and falls back to 10 when it is not a number            | ✅ covered |
| Angular           | First page by default                                             | starts on the first page by default                                                                   | ✅ covered |
| Angular           | `currentPage` coercion                                            | rounds a fractional currentPage down and keeps it in range                                            | ✅ covered |
| Angular           | Options coercion                                                  | rounds items per page options down, drops values below 1, adds itemsPerPage and sorts them            | ✅ covered |
| Angular           | Invalid input reset on Enter and blur                             | resets an invalid page in the input to the current page on Enter and on blur                          | ✅ covered |
| fundamental-react | Previous page, not before the first                               | navigates to the previous page, and not before the first                                              | ✅ covered |
| fundamental-react | Next page, not after the last                                     | navigates to the next page, and not after the last                                                    | ✅ covered |
| fundamental-react | Page clicked, `onClick`                                           | navigates to the page clicked                                                                         | ✅ covered |
| fundamental-react | 23 links for 221 items, 12 for 10 items one per page              | creates 23 pages for 221 items and 10 pages for 10 items one per page                                 | ✅ covered |
| fundamental-react | Prop spreading on the root, `className`                           | passes className, native props and the ref to the root                                                | ✅ covered |
| fundamental-react | `linkProps`, `prevProps`, `nextProps`, `displayTotalProps`        | spreads props to the page, previous and next buttons and to the results text                          | ✅ covered |
| —                 | RTL arrows, focus after a page change, live announcement          | swaps Left and Right in RTL; moves the focus to the current page …; announces page changes …          | ➕ extra   |
| —                 | Labels of the select, the 1023px breakpoint                       | labels the items per page select …; uses the mobile layout on screens up to 1023px                    | ➕ extra   |
| —                 | Uncontrolled and controlled pages, no requests out of range       | changes pages on its own when uncontrolled; waits for currentPage when controlled; does not request … | ➕ extra   |
| —                 | Labels and `renderDisplayText`, `renderItemsPerPage`, empty lists | takes the results text, the labels and the item range from props; renders a custom items per page …   | ➕ extra   |

### Visual comparison

`pnpm visual pagination`: 29 cases × 16 combinations, 464/464 matching. Cases, by pixels and computed style against
fundamental-styles' Pagination stories (our `FirstPage`, `MiddlePage`, `LastPage`, `PerPage` and `Mobile` stories use
their values and labels): the whole pagination with more than nine pages (input) and with less (current page button)
on the first, middle and last page; the nav; a page button at rest, hovered and focused; the current page button;
the ellipsis; the previous button at rest, hovered, focused and disabled; the next button and the disabled one; the page
input at rest, hovered and focused; the results text; the items per page label, select and nav (Per Page); the mobile
nav, first button, "Page:" label and input (Mobile).

| Difference                                                       | Cause                                                                                                      | Resolution                                                                        |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Cozy page buttons 2px narrower (8px instead of 9px side padding) | Angular's `px-2` on the page and current page buttons; fundamental-styles keeps the button padding         | Fixed: the button padding (`min-w-9 compact:min-w-8` only).                       |
| Mobile nav 16px narrower                                         | fundamental-styles' "Page:" and "of N" are form labels with a 0.5rem end margin                            | Fixed: `me-2` on both labels.                                                     |
| Labels: `cursor` auto instead of text                            | fundamental-styles' form labels have a text cursor                                                         | Fixed: `cursor-text` on the "Page:", "of N", items per page and results labels.   |
| The nav 8px off centre (HC cases over the tolerance)             | Angular's `gap-4` on the root takes 16px from the space the nav is centred in; fundamental-styles has none | Fixed: no gap on the root.                                                        |
| Results text `height` 16px instead of auto                       | fundamental-styles' label is an inline span in a div; ours is a flex item                                  | Kept (ignored): not visible.                                                      |
| Focused input: value selected                                    | Keyboard focus selects the value of our input; fundamental-styles' is focused from script                  | Kept: browser behaviour; the case compares styles only.                           |
| HC: items per page select without its bottom line                | fundamental-styles' Per Page shows the select open (`aria-expanded`); ours is closed                       | Kept: the case compares styles only; select's own cases compare the open control. |

Angular issues: page buttons 2px narrower in cozy (`px-2`); the "Page:" and "of N" labels of the mobile layout lack
the form label end margin (nav 16px narrower); the root's `gap-4` moves the nav 8px off centre; the labels have no text
cursor; in the mobile layout the nav's `aria-describedby` points at the results text, which is not rendered there.

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: Items per page, Middle page, Mobile (in RTL the first and
last icons turn, the arrows mirror, and the mobile nav sits at the end).
