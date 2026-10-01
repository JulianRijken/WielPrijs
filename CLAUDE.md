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

## Constraints

- No build step and no ES modules: `index.html` must open from disk.
- The user is a developer: keep code clean, simple and extendable, and ask
  when a requirement is unclear.
