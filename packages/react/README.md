# fundamental-ui-registry for React

SAP Fiori Horizon components for React, as copy-paste source files. This is the React package of the
[fundamental-ui-registry](../../README.md) workspace. All 94 components are ported: the 45 of fundamental-react and
the other components of the Angular package. The [porting tracker](docs/parity/README.md) lists each component's
sources, stories, tests and visual comparison.

**Storybook:** https://adrianhdezm.github.io/fundamental-ui-registry/react/ (the registry is served from the same site
under `/react/r/<name>.json`).

- **A modern rewrite of [fundamental-react](https://github.com/SAP/fundamental-react)** (Apache-2.0, see
  [License and attribution](#license-and-attribution)), with the behaviour, ARIA and keyboard handling of the Angular
  package (ported from [`@fundamental-ngx/core`](https://sap.github.io/fundamental-ngx/#/core/home)). Not ported: the
  table.
- **Styled with Tailwind CSS v4** on the SAP theme tokens from
  [`@sap-theming/theming-base-content`](https://github.com/SAP/theming-base-content), compared with
  [fundamental-styles](https://sap.github.io/fundamental-styles/) in every theme, density and direction. No
  fundamental-styles or fundamental-react at runtime.
- **Behaviour from [Base UI](https://base-ui.com)** (popups, focus management, form controls, direction).
- **Modern React**: React 19, function components, `ref` as a prop, controlled and uncontrolled props.
- **shadcn-style distribution**: copy `registry/ui/<name>/` into your app, or
  `npx shadcn add <registry-url>/<name>.json`.
- **Themes**: Horizon, Horizon Dark, Horizon HC Black, Horizon HC White. **Density**: cozy, compact. **RTL**.

## Package layout

Paths are relative to `packages/react/`.

```
registry/
  lib/utils.ts            cn() (clsx + tailwind-merge aware of SAP tokens) and cva variants
  styles/                 the SAP theme layer, generated (same rules as the Angular package)
  ui/<component>/         one self-contained folder per component (+ its stories and spec)
registry.json             shadcn registry definition (source of truth)
scripts/
  generate-tokens.mjs     regenerates styles/ and the icon glyph map from theming-base-content
  build-registry.mjs      builds public/r/*.json and checks each component's imports
  check-styles.mjs        compiles every class and flags unknown SAP tokens / broken var() names
  visual.mjs              compares components with the fundamental-styles Storybook (cases in visual/<name>.mjs)
  tracker.mjs             updates the porting tracker in docs/parity/README.md
docs/                     Storybook introduction; parity/ tracks the port, one report per component
.storybook/, tests/       Storybook and Vitest setup
```

## Commands

Run `pnpm install` at the repository root, then these in `packages/react/` (or from the root as
`pnpm react <script>`, e.g. `pnpm react storybook`):

```sh
pnpm storybook          # http://localhost:6007
pnpm build-storybook    # dist/storybook, including the registry under /r (published under /react/)
pnpm check              # typecheck, style, registry and tracker checks, tests, a11y
pnpm test               # component tests in Chromium (Vitest browser mode); specs next to each component
pnpm test:a11y          # every story rendered by Vitest and checked with axe, in Horizon and Horizon HC Black
pnpm visual <name>      # compare with fundamental-styles in 16 combinations (after pnpm build-storybook)
pnpm tracker            # rewrite the tracker table after changing docs/parity/tracker.json
pnpm tokens             # regenerate the theme layer after bumping theming-base-content
```

## Using the components in an app

### With the shadcn CLI

The registry is published at `https://adrianhdezm.github.io/fundamental-ui-registry/react/r/<name>.json`, where
`<name>` is the component's folder name (`button`, `icon`, ...). The CLI copies the source files into your app, along
with the components each one uses, the theme (`src/styles/`), `lib/utils.ts` and the npm packages.

1. Start from a React app with Tailwind CSS v4 and the `@/*` alias, e.g. Vite's React + TypeScript template with
   [`@tailwindcss/vite`](https://tailwindcss.com/docs/installation/using-vite) and
   `"paths": { "@/*": ["./src/*"] }` in `tsconfig.json` and `tsconfig.app.json` (plus the matching `resolve.alias` in
   `vite.config.ts`).
2. Add a `components.json` at the project root:
   ```json
   {
     "$schema": "https://ui.shadcn.com/schema.json",
     "style": "new-york",
     "rsc": false,
     "tsx": true,
     "tailwind": { "config": "", "css": "src/index.css", "baseColor": "neutral", "cssVariables": true },
     "aliases": { "components": "@/components", "ui": "@/components/ui", "utils": "@/lib/utils", "lib": "@/lib" }
   }
   ```
   `"css"` names the stylesheet that imports Tailwind; the CLI adds the theme import to it. Keep `"tsx": true` and
   `"cssVariables": true`.
3. Add components:
   ```sh
   npx shadcn add https://adrianhdezm.github.io/fundamental-ui-registry/react/r/icon.json
   ```
   The first one also adds the theme import after Tailwind in your stylesheet:
   ```css
   @import 'tailwindcss';
   @import './styles/fundamental.css';
   ```

The registry copy of `fonts.css` loads the fonts from the `@sap-theming/theming-base-content` package on jsDelivr. To
self-host them, copy the `.woff2` files instead.

### By copying the files

```sh
pnpm add @base-ui/react clsx tailwind-merge class-variance-authority
```

Copy `registry/styles/` to `src/styles/` and import `fundamental.css` after Tailwind, copy `registry/lib/utils.ts` to
`src/lib/utils.ts`, map `@/lib/*` and `@/ui/*` to those folders in `tsconfig.json`, and copy the component folders you
need (a component's `registryDependencies` in `registry.json` lists the other folders it needs).

### Theme and usage

```html
<html data-sap-theme="sap_horizon" data-density="compact" dir="ltr"></html>
```

```tsx
import { Icon } from '@/components/ui/icon/icon';

<Icon glyph="accept" color="positive" aria-label="Accepted" />;
```

Wrap the app in Base UI's `DirectionProvider` for right-to-left layouts, so popups follow the direction too.

## Token utilities

The same as the Angular package: every SAP theme token is a Tailwind utility, e.g. `bg-sap-button-hover-background`.
See [Token utilities](../angular/README.md#token-utilities).

## License and attribution

Apache-2.0, see [LICENSE](../../LICENSE) and [NOTICE](../../NOTICE). This is an unofficial derivative work of SAP's
Fundamental Library:

- The components are **rewrites of [fundamental-react](https://github.com/SAP/fundamental-react)** and
  **ports of [fundamental-ngx](https://github.com/SAP/fundamental-ngx)** (`@fundamental-ngx/core`), by way of this
  repository's Angular package: their APIs, behaviour, keyboard handling and ARIA, rewritten in React with Base UI and
  Tailwind CSS.
- Their **visual design follows [fundamental-styles](https://github.com/SAP/fundamental-styles)**, rebuilt as Tailwind
  utilities; `registry/styles/extensions.css` holds theme values taken from it.
- The **theme values, the "72" typeface and the SAP icon fonts** come from
  [`@sap-theming/theming-base-content`](https://github.com/SAP/theming-base-content).

Every component file starts with a header naming the code it is ported from, its copyright holders and the license.
Keep these headers, and keep the `LICENSE` and `NOTICE` information with any redistribution.

SAP and SAP Fiori are trademarks of SAP SE. This project is not affiliated with, endorsed by or sponsored by SAP SE.
