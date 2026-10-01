# Contributing

## Principles

- **A simple web page.** Plain HTML, CSS and JavaScript. No build step, no
  framework, no bundler. `index.html` must keep working when opened straight
  from disk, so scripts are classic `<script>` tags, not ES modules.
- **Clean and extendable.** Pure calculation code has no DOM access and is
  covered by tests. UI code reads state, calls the model, and draws.

## Running and testing

```bash
npm start   # serves the folder on http://localhost:3000
npm test    # runs the unit tests with Node's built-in test runner
```

Tests need Node 22 or newer. There are no dependencies to install.

## Branches

`main` is always releasable; it is what GitHub Pages serves.

All work happens on a short-lived branch off `main`, named
`<type>/<short-description>` with the same types as commits:

| Prefix      | Use for                                   |
|-------------|-------------------------------------------|
| `feat/`     | New user-facing functionality             |
| `fix/`      | Bug fixes                                 |
| `refactor/` | Code changes that do not change behaviour |
| `test/`     | Adding or improving tests                 |
| `docs/`     | Documentation only                        |
| `chore/`    | Tooling, setup, releases                  |

Branches are merged into `main` with `git merge --no-ff` (or a pull request
once the repository is on GitHub), then deleted.

## Commits

Commit messages follow [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/):

```
<type>(<optional scope>): <description>

<optional body>
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`, `perf`,
`ci`, `build`. Common scopes: `model`, `blocks`, `ui`, `i18n`, `store`.
Mark breaking changes with `!` after the type or a `BREAKING CHANGE:` footer.

Commit small, coherent steps. Every commit should leave the tests passing.

## Versioning and changelog

The project uses [Semantic Versioning](https://semver.org/). Every
user-facing change adds a line under `## [Unreleased]` in
[CHANGELOG.md](CHANGELOG.md), in the same branch as the change.

After merging a branch that contains a `feat` or `fix` into `main`, cut a release:

1. Pick the new version: `fix` bumps the patch, `feat` bumps the minor, a
   breaking change bumps the major (before 1.0.0, the minor).
2. In `CHANGELOG.md`, rename `[Unreleased]` to `[x.y.z] - YYYY-MM-DD` and add
   a fresh empty `[Unreleased]` section above it.
3. Update the version number in the code (see the version test).
4. Commit as `chore(release): x.y.z` and tag it `vx.y.z`.

Merges with only `refactor`, `test`, `docs` or `chore` changes wait under
`[Unreleased]` for the next release.

Version 1.0.0 will be the first public release on GitHub Pages.
