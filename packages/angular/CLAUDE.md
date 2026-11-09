# packages/angular

SAP Fiori Horizon components for Angular. Each component is a port of `@fundamental-ngx/core` (behaviour, ARIA,
keyboard), with the visuals of fundamental-styles rebuilt as Tailwind v4 utilities on the
`@sap-theming/theming-base-content` tokens. See `README.md` in this folder for the layout and usage, and the root
`CLAUDE.md` for the workflow.

Published at `https://adrianhdezm.github.io/fundamental-ui-registry/angular/` (Storybook) and
`https://adrianhdezm.github.io/fundamental-ui-registry/angular/r/<name>.json` (registry).

## Commands

Run in `packages/angular/`, or from the repository root as `pnpm angular <script>` (e.g. `pnpm angular test`,
`pnpm angular exec vitest run --project unit registry/ui/menu/`).

```sh
pnpm check                                  # everything below; takes about 5 minutes
pnpm typecheck && pnpm typecheck:tests      # strict templates for sources and specs
pnpm check:styles                           # SAP token classes
pnpm registry:check                         # registry.json and each component's imports
pnpm tracker:check                          # docs/issues/README.md is up to date with tracker.json (`pnpm tracker` rewrites it)
pnpm test                                   # component and lib tests (Vitest browser mode, project "unit")
pnpm test:a11y                              # axe on every story, Horizon and Horizon HC Black
pnpm exec vitest run --project unit registry/ui/menu/   # one component; keep the trailing slash
pnpm storybook                              # http://localhost:6006
pnpm build-storybook && pnpm visual icon    # compare with fundamental-styles, 16 combinations (report in .visual/icon/)
```

## Components

- One folder per component: `registry/ui/<name>/<name>.ts`, `<name>.spec.ts`, `<name>.stories.ts`, `index.ts`, and an
  entry in `registry.json` (`registryDependencies` lists the components and libs it imports). Imports use the aliases
  `@/ui/*` and `@/lib/*`.
- Standalone, signal inputs/models/outputs, `ChangeDetectionStrategy.OnPush`, zoneless. Behaviour from the Angular
  CDK; ARIA and keyboard handling ported from `@fundamental-ngx/core`.
- Every source file keeps its attribution header (ported from, copyright, Apache-2.0).
- Styling: Tailwind classes on SAP tokens only (`bg-sap-button-hover-background`, see README "Token utilities"); no
  hard-coded colours or sizes where a token exists. Class strings must be literal for Tailwind to find them: no
  `${}` inside a class name (a module-level constant interpolated whole is fine, declared above the component). Dynamic
  values go through CSS variables. Variants: `compact:`, `condensed:`, `hc:`, `toggled:`, `rtl:`.
- Visual reference is fundamental-styles: add cases in `scripts/visual/<name>.mjs` (fields in
  `scripts/visual.config.mjs`) and run `pnpm visual <name>`; also compare in Storybook with the theme, density and RTL
  switchers.

## Issues

- `docs/issues/tracker.json` tracks the Angular issues found while porting to React, from reported to verified (see
  `docs/issues/README.md` for the fields and statuses). Update it, then `pnpm tracker`, in every pull request that
  works on one, and name the issue ids in the commit message.

## Tests

- Every behaviour change comes with a browser test in the component's spec (see `docs/testing.mdx`). Test hosts keep
  state in signals; await `fixture.whenStable()` (plus a frame for overlays). No `it.todo` or `it.skip` left behind
  without a reason.
- Stories cover the upstream docs examples. Stories named "Open: …" open their overlay in `play`, so the a11y run
  checks it. A story may turn off an axe rule only where the SAP theme itself is the cause, with a comment.
