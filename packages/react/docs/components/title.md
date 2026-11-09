## title

Sources: fundamental-react [Title](https://github.com/SAP/fundamental-react/tree/main/src/Title) · Angular
[`registry/ui/title`](../../../angular/registry/ui/title/) · fundamental-styles
[Title](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-title--docs)
Registry: `registry/ui/title/`, on Base UI's `useRender`.

API: `level` (1–6) renders `<h1>`…`<h6>`, as fundamental-react's `level`; `headerSize` changes only the visual size
(Angular's input, fundamental-react's `levelStyle`); `wrap` and `twoLineClamp` as in Angular. `render` renders another
element (Angular's `[fdTitle]` on any element): a heading follows its own level, other elements use size 5.
`TitleSizeContext` replaces Angular's `FD_DEFAULT_TITLE_SIZE` token.
