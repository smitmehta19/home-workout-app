# Tests

Browser tests driven by Playwright. They exist because several bugs shipped
that unit-level checking would never have caught — a back button that
navigated the page instead of closing a dialog, and a service worker that
pinned returning users to an old build so fixes never arrived at all.

```sh
npm i -g playwright && playwright install chromium
./tests/run.sh
```

| File | What it protects |
|---|---|
| `session.test.mjs` | A full workout end to end: warm-up first, working sets, stretches after, session saved, progression carried into the next session. |
| `navigation.test.mjs` | The phone's back gesture closes a sheet from every place one can be opened, and never navigates the page underneath. Also paging between movements, Escape, and stacked dialogs. |
| `guidance.test.mjs` | Every movement shows a demonstration, and guidance is never blank when the photo host is unreachable. |
| `updates.test.mjs` | A shipped change actually reaches someone who already has the app installed, and the app still loads with no network. |

## Two traps worth knowing

**`page.goto()` to a URL that is already loaded does not re-navigate.** An
update test written that way passes or fails for the wrong reason. Use
`page.reload()`, or close the page and open a new one, to model a real
relaunch.

**A fresh browser context has no service worker.** Tests that only ever run
in a clean context never exercise the upgrade path, which is exactly where
caching bugs live. `updates.test.mjs` deliberately installs the worker first,
then changes a file, then relaunches.
