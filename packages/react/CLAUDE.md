# packages/react

SAP Fiori Horizon components for React: a modern rewrite of fundamental-react, with the API, behaviour, ARIA and
keyboard handling of the Angular package (itself ported from `@fundamental-ngx/core`), Base UI for behaviour, and the
visuals of fundamental-styles as Tailwind v4 utilities on the `@sap-theming/theming-base-content` tokens. See
`README.md` in this folder and the root `CLAUDE.md` for the workflow.

Published at `https://adrianhdezm.github.io/fundamental-ui-registry/react/` (Storybook) and
`https://adrianhdezm.github.io/fundamental-ui-registry/react/r/<name>.json` (registry).

**The port is in progress**: `docs/parity/README.md` is the tracker (what is done, the definition of done, Angular
issues found). Read it first, and update `docs/parity/tracker.json` (then `pnpm tracker`) and the component's report
in `docs/parity/components/` with every component.

## Commands

Run in `packages/react/`, or from the repository root as `pnpm react <script>`.

```sh
pnpm check                                  # typecheck, styles, registry, tracker, tests, a11y
pnpm typecheck && pnpm typecheck:tests      # sources; specs, stories and config
pnpm test                                   # component tests (Vitest browser mode, project "unit")
pnpm test:a11y                              # axe on every story, Horizon and Horizon HC Black
pnpm exec vitest run --project unit registry/ui/button/   # one component; keep the trailing slash
pnpm build-storybook && pnpm visual button  # compare with fundamental-styles, 16 combinations
pnpm storybook                              # http://localhost:6007
```

## Components

- One folder per component: `registry/ui/<name>/<name>.tsx`, `<name>.spec.tsx`, `<name>.stories.tsx`, `index.ts`,
  and an entry in `registry.json` (`registryDependencies` lists the components and libs it imports, `dependencies`
  the npm packages such as `@base-ui/react`). Imports use the aliases `@/ui/*` and `@/lib/*`. Nothing is imported
  from the Angular package.
- Function components, React 19 (`ref` is a regular prop; no `forwardRef`). Native props pass through to the root
  element (`className`, `aria-*`, handlers). Props follow the Angular API in React form: camelCase, `children`,
  `onXChange` callbacks, and `value`/`defaultValue` for controlled and uncontrolled state, as Base UI does.
- Behaviour from Base UI where it has the primitive (popover, menu, select, dialog, checkbox, ...); ARIA and keyboard
  handling from the Angular package.
- Every source file keeps its attribution header (ported from, copyright, Apache-2.0).
- Styling: Tailwind classes on SAP tokens only, as in the Angular package. Class strings must be literal for Tailwind
  to find them. Put `leading-*` after a `text-*` size in the same string or variant: `tailwind-merge` drops a
  line-height that comes before a font size.
- Visual reference is fundamental-styles: add cases in `scripts/visual/<name>.mjs` and run `pnpm visual <name>`.

## Tests

- Every behaviour comes with a browser test in the component's spec (`vitest-browser-react`'s `render`, then
  `rerender` for prop changes).
- Stories cover the fundamental-react and Angular stories of the component. Stories named "Open: …" open their
  overlay in `play`, so the a11y run checks it. A story may turn off an axe rule only where the SAP theme itself is
  the cause, with a comment.
