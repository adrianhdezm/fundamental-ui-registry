# fundamental-ui-registry

SAP Fiori Horizon components as copy-paste source files, distributed as [shadcn](https://ui.shadcn.com) registries.

**Site:** https://adrianhdezm.github.io/fundamental-ui-registry/

| Package                                  | Port of                                                                                          | Storybook                                                                     | Registry                                                                      |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| [`packages/angular`](./packages/angular) | [`@fundamental-ngx/core`](https://sap.github.io/fundamental-ngx/#/core/home)                     | [`/angular/`](https://adrianhdezm.github.io/fundamental-ui-registry/angular/) | `https://adrianhdezm.github.io/fundamental-ui-registry/angular/r/<name>.json` |
| [`packages/react`](./packages/react)     | [fundamental-react](https://github.com/SAP/fundamental-react), on [Base UI](https://base-ui.com) | [`/react/`](https://adrianhdezm.github.io/fundamental-ui-registry/react/)     | `https://adrianhdezm.github.io/fundamental-ui-registry/react/r/<name>.json`   |

Each package is an independent registry with its own `registry.json`, Storybook, tests and dependencies. They share
the approach, not code:

- **Unofficial ports of SAP's Fundamental Library** (Apache-2.0, see [License and attribution](#license-and-attribution)):
  the behaviour, ARIA and keyboard handling of the upstream components.
- **Styled with Tailwind CSS v4** on the SAP theme tokens from
  [`@sap-theming/theming-base-content`](https://github.com/SAP/theming-base-content), with the visuals of
  [fundamental-styles](https://github.com/SAP/fundamental-styles). No fundamental-styles CSS at runtime.
- **shadcn-style distribution**: copy a component's folder into your app, or `npx shadcn add <registry-url>/<name>.json`.
- **Themes**: Horizon, Horizon Dark, Horizon HC Black, Horizon HC White. **Density**: cozy, compact (and condensed).
  **RTL**.

See [`packages/angular/README.md`](./packages/angular/README.md) and [`packages/react/README.md`](./packages/react/README.md)
for installing the components in an app, theming, and the token utilities.

## Repository layout

```
packages/
  angular/                the Angular registry (registry.json, registry/, Storybook, tests, scripts)
  react/                  the React registry, the same layout
site/index.html           landing page at the site root
scripts/build-site.mjs    assembles dist/site: the landing page and each package's Storybook under /<package>/
pnpm-workspace.yaml       the pnpm workspace (and its settings)
```

## Commands

Requires Node `>=22.22.3` (see `.nvmrc`) and pnpm (settings in `pnpm-workspace.yaml`). The tests use the Playwright
and Chromium of the dev dependencies (`pnpm angular exec playwright install chromium` once, if Chromium is missing).

```sh
pnpm install
pnpm check              # every package's checks: typecheck, style and registry checks, tests, a11y
pnpm format             # Prettier, whole repository
pnpm build-site         # every package's Storybook and registry, assembled into dist/site
pnpm angular <script>   # a script of packages/angular, e.g. `pnpm angular storybook`
pnpm react <script>     # a script of packages/react, e.g. `pnpm react storybook`
```

## License and attribution

Apache-2.0, see [LICENSE](./LICENSE) and [NOTICE](./NOTICE).

This is an unofficial derivative work of SAP's open source Fundamental Library, which is also licensed under
Apache-2.0:

- The Angular components are **ports of [fundamental-ngx](https://github.com/SAP/fundamental-ngx)**
  (`@fundamental-ngx/core`): behaviour, keyboard handling, ARIA and APIs come from it, rewritten with signals, the
  Angular CDK and Tailwind CSS.
- The React components are **rewrites of [fundamental-react](https://github.com/SAP/fundamental-react)** with the
  behaviour of the Angular package, built on Base UI and Tailwind CSS.
- Their **visual design follows [fundamental-styles](https://github.com/SAP/fundamental-styles)**, rebuilt as Tailwind
  utilities; `packages/angular/registry/styles/extensions.css` holds theme values taken from it.
- The **theme values, the "72" typeface and the SAP icon fonts** come from
  [`@sap-theming/theming-base-content`](https://github.com/SAP/theming-base-content).

Every component file starts with a header naming the code it is ported from, its copyright holders and the license, so
the attribution travels with the file when you copy it into your app. Keep these headers, and keep the `LICENSE` and
`NOTICE` information with any redistribution.

SAP and SAP Fiori are trademarks of SAP SE. This project is not affiliated with, endorsed by or sponsored by SAP SE.
