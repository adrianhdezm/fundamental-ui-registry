## pagination

Sources: fundamental-react [Pagination](https://github.com/SAP/fundamental-react/tree/main/src/Pagination) · Angular
[`registry/ui/pagination`](../../../angular/registry/ui/pagination/) · fundamental-styles
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

### Visual differences from fundamental-styles, kept on purpose

| Difference                                        | Cause                                                                                     | Resolution                                                                        |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Results text `height` 16px instead of auto        | fundamental-styles' label is an inline span in a div; ours is a flex item                 | Kept (ignored): not visible.                                                      |
| Focused input: value selected                     | Keyboard focus selects the value of our input; fundamental-styles' is focused from script | Kept: browser behaviour; the case compares styles only.                           |
| HC: items per page select without its bottom line | fundamental-styles' Per Page shows the select open (`aria-expanded`); ours is closed      | Kept: the case compares styles only; select's own cases compare the open control. |
