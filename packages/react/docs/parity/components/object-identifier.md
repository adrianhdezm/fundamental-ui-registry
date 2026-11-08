## object-identifier

Sources: fundamental-react: none · Angular [`registry/ui/object-identifier`](../../../../angular/registry/ui/object-identifier/) ·
fundamental-styles [Object Identifier](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-object-identifier--docs)
Registry: `registry/ui/object-identifier/`, on Base UI's `useRender`.

API: the Angular inputs as props: `description`, `bold`, `medium`, `id`. The projected title is `children` (text, or a
`Link`). Renders a `<div>` (fundamental-styles' element; `render` renders another one); native props, `className`
and `ref` pass through. The ids of the title (`<id>-title`), description (`<id>-text`) and hidden text
(`<id>-description`) come from `id`, or from `useId` when there is none (Angular counts instances).

Behaviour as Angular: a link in the title (Angular: projected `fdLink`s; here any `<a>` or `role="link"` element, as
React's `Link` has no marker) takes the title's font size and weight, gets an id if it has none, and is labelled
(`aria-labelledby`) by its own text, the hidden "Object Identifier" text and the description; that hidden text is then
`aria-hidden`, so it is read only through the link. The labels follow the description and the links as they come and
go: a layout effect after every render, plus a `MutationObserver` on the title for links a child component shows on
its own (Angular's `contentChildren` sees those too).

**Differences from Angular, on purpose:** Angular's `ariaLabel` and `defaultAriaLabel` both set the hidden text; here
it is one prop, `objectIdentifierLabel` (default "Object Identifier"), so the native `aria-label` keeps its meaning and
passes through. `description` takes any React node.

### Stories vs. sources

| Source  | Example                     | React story                               | Status     | Notes                                                                      |
| ------- | --------------------------- | ----------------------------------------- | ---------- | -------------------------------------------------------------------------- |
| Angular | Playground                  | `Playground`                              | ✅ covered |                                                                            |
| Angular | Title, bold and description | `Default` ("Title, bold and description") | ✅ covered | fundamental-styles' texts ("NoteBook Basic 15" and its description).       |
| Angular | Title as link               | `WithLink` ("Title as link")              | ✅ covered | With `Link`, fundamental-styles' texts.                                    |
| Angular | Medium size in a table      | `Medium` ("Medium size in a table")       | ✅ covered | Plus a standalone medium identifier with fundamental-styles' texts on top. |

### Tests vs. sources

| Source  | Behaviour                                        | React test                                                                              | Status     |
| ------- | ------------------------------------------------ | --------------------------------------------------------------------------------------- | ---------- |
| Angular | Title, description below                         | renders the title and the description below it                                          | ✅ covered |
| Angular | No description                                   | omits the description when there is none                                                | ✅ covered |
| Angular | Bold                                             | bold title is bold, regular otherwise                                                   | ✅ covered |
| Angular | Large unless medium                              | uses the large font size unless medium                                                  | ✅ covered |
| Angular | Link inherits font size and weight               | a link in the title inherits the title font size and weight                             | ✅ covered |
| Angular | Hidden role text, ariaLabel                      | has a hidden role text for assistive technology, overridable with objectIdentifierLabel | ✅ covered |
| Angular | Link labelled by text, role text and description | a link in the title is labelled by its text, the role text and the description          | ✅ covered |
| Angular | Label follows the description                    | updates the link label when the description goes away and comes back                    | ✅ covered |
| Angular | Existing link id kept                            | keeps an existing link id                                                               | ✅ covered |
| Angular | Role text exposed again without link             | the role text is exposed again when the link is removed                                 | ✅ covered |
| —       | Link shown later by a child component            | labels a link that a child component shows later                                        | ✅ covered |
| —       | Generated ids                                    | generates ids when none is given                                                        | ✅ covered |
| —       | Prop spreading, ref (registry convention)        | passes className, native props and the ref through; render swaps the element            | ✅ covered |

### Visual comparison

`pnpm visual object-identifier`: 17 cases × 16 combinations, 272/272 matching, no differences found. Cases, by pixels
(texts as fundamental-styles'): the title-only identifier and its title, the bold title, the identifier with a
description, the description, the bold identifier with a description (Title Only, Bold, Descriptive stories); the link
title, the link at rest, on hover and with focus, the bold link (Link story), the link and bold link identifiers with a
description (Descriptive); the medium identifier, its title and description (Medium Size); and, by computed styles only,
the medium title in the table (its texts are not fundamental-styles'; width ignored, a table cell). Reviewed by eye in
Horizon cozy and compact, LTR and RTL (`Default`, `WithLink`, `Medium`): no density dependence, mirrored in RTL.

No differences, so nothing logged; no Angular issue found.
