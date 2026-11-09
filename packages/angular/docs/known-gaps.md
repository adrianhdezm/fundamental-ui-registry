# Known gaps

What the Angular package does not match in `@fundamental-ngx/core` (compared at `SAP/fundamental-ngx` `main`
[`3879bc0`](https://github.com/SAP/fundamental-ngx/tree/3879bc03796ed8d72d759e3891e873f20cf4a5ed), October 2026). The
rest of its documentation examples have a story and the rest of its spec behaviours a test. Remove an entry in the
pull request that closes it.

## Blocked

On a feature that is not ported. Each needs a design decision and a `feat` pull request first:

| Blocker                                                                                     | Blocks                                                                                                                          |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Drag and drop (`fd-dnd-list`)                                                               | list and grid-list "Drag and drop"                                                                                              |
| `fd-card-bar`                                                                               | card "Bar Chart List"                                                                                                           |
| `searchResultsList` / `suggestion` in list, suggestions in `fd-shellbar-search`             | list "Search Results", shellbar "complex search results"                                                                        |
| `dataRequested` / `dataReceived` outputs                                                    | multi-combobox "Loading"                                                                                                        |
| Popover `mobile`, `placementContainer`, lazy `fdPopoverBody`, repositioning on layout shift | popover "Mobile Mode", "Positioning & Container", "Lazy Loading", "Dynamic Container Height"; form message `placementContainer` |
| Router in stories (`provideRouter` decorator)                                               | breadcrumb `routerLink`, dynamic-page routing                                                                                   |

## Decisions needed

- **content-density:** upstream's "a restricting parent wins over a child" is not matched. Our density is CSS-driven
  and the nearest ancestor wins; matching upstream would mean rewriting every `compact:`/`condensed:` variant. A test
  pins the current rule. Invalid density strings are also not validated.
- **datetime-picker:** a typed date rejected by `disableFunction` does not emit `dateChange`. Upstream doesn't check
  `disableFunction` for typed text, so it emits there.

## Kept on purpose

Each is pinned by a test: `aria-haspopup="dialog"` on the date
pickers (the popup is a dialog), the user-menu tab stop resetting only when focus leaves its overlays, menu arrow keys
not wrapping (as upstream), and Tab cycling inside the time-picker columns (as upstream).

## Not yet ported

object-page, truncate, global-config, theming and the datetime adapters (no Moment adapter).
