# Repository Guidelines

## Project Structure & Module Organization

This is a static Vietnamese tea-shop game and progressive web app. `index.html` contains the UI, CSS, game data, and runtime JavaScript. `sw.js` caches the app for offline use; `manifest.webmanifest` and the root icons provide install metadata. Images are in `img/`, audio in `snd/`, and font copies in `fonts.*` and `s/`. `sync.py` fetches and transforms the upstream site; `deobf.py`, `decrypted.js`, and `test.txt` are deobfuscation artifacts. GitHub Actions workflows in `.github/workflows/` sync the site and deploy it to Pages. There is no dedicated test directory or package manager.

## Build, Test, and Development Commands

- `py -3 -m http.server 8000` serves the site at `http://localhost:8000/`. Use a local server so service-worker behavior can be checked.
- `py -3 -m py_compile sync.py deobf.py` checks Python syntax.
- `node --check decrypted.js` checks the extracted JavaScript artifact. It does not check the inline script in `index.html`.
- `py -3 sync.py` fetches upstream files and rewrites `index.html`; run it only when intentionally syncing, then inspect every changed file.

There is no build step, automated test runner, formatter, or linter configured.

## Coding Style & Naming Conventions

Follow nearby code: two-space indentation in readable JavaScript and CSS blocks, four spaces in Python. Use `camelCase` for JavaScript functions and state fields, `UPPER_SNAKE_CASE` for constants, and `snake_case` for Python functions. Keep asset paths relative and lowercase. Avoid reformatting large inline data tables when changing a small behavior. Bump `VERSION` in `sw.js` when cached assets change.

## Testing Guidelines

After game changes, open the site in a browser and check a new game, preparation, one selling day, saving/reloading, and restore from a backup. For offline changes, load once online, switch DevTools to offline, and reload. Add a small runnable check for new nontrivial logic; name standalone tests `test_*.py` or `test_*.js`. No coverage threshold exists.

## Commit & Pull Request Guidelines

No established contributor commit convention exists yet. Use short imperative Conventional Commit subjects such as `fix: validate backup before restore`. PRs should explain player-visible behavior, list checks run, and include screenshots for UI changes. Both GitHub Actions workflows currently require manual dispatch. Note whether `sync.py` will overwrite the change on its next run; changes to generated `index.html` may need a corresponding sync transformation.

## Agent skills

### Issue tracker

Use GitHub Issues for issues and specs. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the five default triage labels. See `docs/agents/triage-labels.md`.

### Domain docs

Use a single root context and root ADR directory. See `docs/agents/domain.md`.
