# fundamental-ui-registry

SAP Fiori Horizon components distributed shadcn-style (copy-paste source), as a pnpm workspace of independent
registries. Each package has its own `registry.json`, Storybook, tests, tsconfig and dependencies, and imports nothing
from the others. See `README.md` for the layout and usage.

| Package            | Port of                       | Published at (site root `https://adrianhdezm.github.io/fundamental-ui-registry/`) |
| ------------------ | ----------------------------- | --------------------------------------------------------------------------------- |
| `packages/angular` | `@fundamental-ngx/core`       | Storybook `/angular/`, registry `/angular/r/<name>.json`                          |
| `packages/react`   | fundamental-react, on Base UI | Storybook `/react/`, registry `/react/r/<name>.json`                              |

Each package has its own `CLAUDE.md` with its component and test rules; read it before working in that package.

## Workflow

- **One pull request per change.** Branch from an up-to-date `main`, push the branch, and open a pull request into
  `main`. Never push to `main` directly, and never reuse the branch of a merged pull request for new work: start the
  next change from `main` again.
- **Conventional Commits** for every commit and pull request title: `type(scope): summary` in the imperative, lower case,
  no trailing period. Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`. The scope
  is the component or area, e.g. `fix(menu): stop trapping focus in desktop menus`, `feat(date-picker): add today button`,
  `build: move pnpm settings to pnpm-workspace.yaml`. Mark breaking changes with `!` and a `BREAKING CHANGE:` footer.
  The body explains what changed and why.
- Run `pnpm check` before pushing; it must pass.

## Layout

```
packages/angular/         the Angular registry (see packages/angular/CLAUDE.md)
packages/react/           the React registry (see packages/react/CLAUDE.md)
site/index.html           landing page at the site root
scripts/build-site.mjs    assembles dist/site: the landing page and each package's Storybook under /<package>/
.github/workflows/        GitHub Pages deployment of dist/site
```

## Commands

Node 24 (`.nvmrc`) and pnpm (settings in `pnpm-workspace.yaml`, not in `package.json`). Run at the repository root:

```sh
pnpm install
pnpm check                  # every package's check, one package at a time
pnpm format                 # Prettier, whole repository (config at the root)
pnpm build-site             # every package's Storybook and registry, assembled into dist/site
pnpm angular <script>       # a script of packages/angular, e.g. `pnpm angular test`
pnpm react <script>         # a script of packages/react, e.g. `pnpm react storybook`
```
