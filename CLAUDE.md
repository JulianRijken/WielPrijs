# CLAUDE.md

WielPrijs compares the true cost of transport options (owned vehicles, leases,
public transport) in the Netherlands. It is a static web page meant for GitHub
Pages.

## Workflow (always)

Follow [CONTRIBUTING.md](CONTRIBUTING.md):

- Work on a `<type>/<description>` branch off `main`; merge with `--no-ff`.
- Conventional Commits, small commits, tests passing at every commit.
- Add user-facing changes to `## [Unreleased]` in `CHANGELOG.md`.
- After merging a `feat`/`fix` branch, cut a release (version bump, changelog,
  `chore(release): x.y.z` commit, `vx.y.z` tag).

## Architecture

- Classic scripts on one `WielPrijs` namespace; order in `index.html` matters,
  and non-DOM scripts are mirrored in `test/load.js`.
- A vehicle is a list of cost blocks (`js/blocks/`). The model only sums
  blocks; vehicle-specific behaviour belongs in a block, never in the model.
- The editor and sidebar are generated from block `fields` and
  `js/settings.js`; UI text comes from `js/locales/` (keep `en` and `nl` in step).
- `test/fixtures/prototype.js` pins the original prototype's totals; it must
  keep passing.

## Constraints

- No build step and no ES modules: `index.html` must open from disk.
- The user is a developer: keep code clean, simple and extendable, and ask
  when a requirement is unclear.
