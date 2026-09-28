# Repository Guidelines

## Project Structure

This is a static Vietnamese tea-shop game and PWA. `index.html` is the source for the UI, styles, game data, and runtime. `sw.js`, `manifest.webmanifest`, and root icons support offline use and installation. Images are in `img/`, audio in `snd/`, and font copies in `fonts.*` and `s/`. The repo is the source of game code; there is no upstream sync pipeline.

## Build and Development

- `py -3 -m http.server 8000` serves the app at `http://localhost:8000/`; use a local server to exercise service-worker behavior.
- `node test_backup.js` checks TTN2 backups and restore failures.

There is no package manager, build step, formatter, or linter.

## Style

Follow nearby code: two spaces in readable JavaScript and CSS, four spaces in Python. Use `camelCase` in JavaScript and `snake_case` in Python. Keep asset paths relative and lowercase. Avoid reformatting large inline data tables for a small behavior change. Bump `VERSION` in `sw.js` when cached assets change.

## Testing

After game changes, open the site in a browser and check a new game, preparation, one selling day, saving/reloading, and backup restore. For offline changes, load once online, switch DevTools to offline, and reload. Add a small runnable check for new nontrivial logic; name standalone checks `test_*.py` or `test_*.js`.

## Commits and Pull Requests

Use short imperative Conventional Commit subjects such as `fix: validate backup before restore`. PRs should explain player-visible behavior, list checks run, and include screenshots for UI changes. GitHub Pages deployment in `.github/workflows/static.yml` is manual; there is no sync workflow.

## Agent Skills

- Use GitHub Issues for issue specs; see `docs/agents/issue-tracker.md`.
- Use the triage labels in `docs/agents/triage-labels.md`.
- Keep domain context and decisions in the root `CONTEXT.md` and `docs/adr/`; see `docs/agents/domain.md`.
