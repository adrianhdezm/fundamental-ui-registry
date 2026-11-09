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
- Tailwind pitfalls (each one was a bug here before):
  - Put `leading-*` after a `text-*` size in the same string or variant: `tailwind-merge` drops a line height that
    comes before a font size.
  - `rounded-[50%]`, not `rounded-full` (Tailwind's is `calc(infinity * 1px)`), where fundamental-styles has 50%.
  - Shadows as `[box-shadow:var(--sap…)]`: `shadow-*` utilities add transparent ring layers.
  - Bold text uses the bold font family with `font-normal`; `font-bold` on 72-Bold adds synthetic bold.
  - Directional glyphs: keep the LTR glyph and let the icon mirror it in RTL; no `rtl:rotate-180` or glyph swap.
  - A size passed to a button is given for both densities (`h-6 compact:h-6`): its `compact:` sizes otherwise win.
  - Gradients as `bg-linear-[to_top,…]` (sRGB); `bg-linear-to-*` blends in oklab.
- Visual reference is fundamental-styles: add cases in `scripts/visual/<name>.mjs` (fields in
  `scripts/visual.config.mjs`) and run `pnpm visual <name>`; also compare in Storybook with the theme, density and RTL
  switchers.

## Tests

- Every behaviour change comes with a browser test in the component's spec (see `docs/testing.mdx`). Test hosts keep
  state in signals; await `fixture.whenStable()` (plus a frame for overlays). No `it.todo` or `it.skip` left behind
  without a reason.
- Stories cover the upstream docs examples. Stories named "Open: …" open their overlay in `play`, so the a11y run
  checks it. A story may turn off an axe rule only where the SAP theme itself is the cause, with a comment.
- The React package's porting tracker counts each component's Angular stories: after adding or removing stories, run
  `pnpm react tracker` (it rewrites only `packages/react/docs/parity/README.md`), or the root `pnpm check` fails.
