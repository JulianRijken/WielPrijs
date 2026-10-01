# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.0] - 2026-10-01

### Added

- Changes are saved in the browser and restored on the next visit.
- Export the whole setup to a JSON file, and import it again, for a backup or
  another device.
- The footer shows the version and that settings never leave the browser.

### Changed

- Reset to defaults asks for confirmation first.

### Fixed

- The sidebar scrolls on its own when it is taller than the window, so the
  vehicle list and buttons are always reachable.

## [0.3.0] - 2026-10-01

### Added

- Every vehicle is now a list of cost blocks that can be edited in the page:
  purchase and resale, insurance, road tax, fuel or electricity, maintenance,
  battery packs, lease, public transport and extra costs.
- Add vehicles from templates (electric scooter, motorbike, car, electric car,
  lease, public transport or empty), save a vehicle as a copy, or delete it.
- Show or hide vehicles, and choose which one the others are compared with.
- Extra cost block for anything else, once or yearly; negative amounts count
  as income.
- Diesel price setting, and up to 15 years.

### Changed

- Settings that belonged to one vehicle (free charging, battery scenario and
  pack price, public transport ticket and rush-hour share, lease price) moved
  from the sidebar into that vehicle's cost blocks.
- Public transport ticket choice and battery events are listed per vehicle
  below the charts.

## [0.2.0] - 2026-10-01

### Added

- Dutch translation alongside English, with a language switch. The page
  starts in the browser's language and remembers an explicit choice.
- Amounts and numbers are formatted for the chosen language.

### Changed

- Default vehicle names no longer refer to specific people.

## [0.1.0] - 2026-10-01

### Added

- Cost comparison of a Vmoto TC electric scooter with motorcycles, cars, a
  leased VW ID.7 and public transport in the Netherlands.
- Ranking table, cumulative cost line chart and cost breakdown bar chart.
- Settings for years, km per year, energy prices, public transport ticket,
  Vmoto battery scenario and lease price.
