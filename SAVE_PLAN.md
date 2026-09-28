# Local progress and portable backups

Issue #1 implements a new save generation. Progress stays in the browser; players export or import files and long TTN2 codes themselves. The repo is the source of game code and the server only hosts static files.

## Behavior

- The game stores progress in `localStorage` under the `ttn*` namespace. It does not read, migrate, or delete legacy `ts*` save keys, TTN1 codes, or eight-digit codes. New progress starts from day 1.
- Saves run throughout play. The game keeps three end-of-day autosaves and one separate copy from immediately before the latest restore.
- TTN2 codes and text files can be created and restored offline. A restore previews the shop name, day, and money, then opens at preparation without the active customers, orders, or shift clock.
- Copies contain shop progress only; owner configuration, theme, and audio remain separate. A file download is not counted as kept until the player confirms it; copying the code counts after clipboard copy succeeds.
- The import is parsed, validated, and staged before it replaces the active game or primary save. Invalid data is rejected. The displayed review face is escaped before rendering.
- If storage writes fail, the primary save and recovery copies are not deleted. The player can keep playing in memory and export progress. Restore stops before replacing progress if it cannot first store the pre-restore copy.
- The app has no save account, backend, or save API call. The old external Worker and data already stored there are outside this repo and are left untouched.

## Source and release

`index.html` is maintained directly in this repo. The upstream fetch/transform script, its workflow, and deobfuscation-only artifacts have been removed. `.github/workflows/static.yml` continues to deploy the static app manually; the service worker continues to cache game assets.

## Verification

Run `node test_backup.js` for the TTN2 and restore regression check. Before release, use a browser on a local server to verify a new game and reload, one selling day, TTN2 code and file export/import, cancel and successful restore, rejection of TTN1/eight-digit/corrupt data, three autosaves plus the pre-restore copy, quota failure, and offline reload after caching. Confirm the browser makes no request to the old save API.

Keep `localStorage` unless measured save size or an observed quota failure shows it no longer fits. Progress remains local to the browser and origin; players must use TTN2 files or codes to move it between devices.
