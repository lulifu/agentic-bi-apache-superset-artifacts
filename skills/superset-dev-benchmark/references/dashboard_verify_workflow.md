# Dashboard Verify-and-Fix Workflow

`create_dashboard.mjs --create` / `--add-charts` auto-run `verifyDashboard()` and merge the verdict into stdout under `verify`. When `verify.ok === false` (or a standalone `verify_dashboard.mjs` run returns non-zero), use the table below to pick the next step.

**Cap the loop at 3 attempts.** After each fix, re-run verify. If three attempts haven't yielded `ok: true`, surface every attempt's `issues[]` + `verify.dashboard_url` to the user and stop.

## Issue → fix mapping

| Issue text contains | Fix |
| --- | --- |
| `layout skeleton incomplete` | Re-run `create_dashboard.mjs --add-charts` with the original chart IDs. `appendToLayout()` heals a missing `ROOT_ID` and de-dups. **Caveat below.** |
| `layout contains no CHART components` | Same as above. |
| `expected chart N not in layout` | First run `node query_chart.mjs --id N` to confirm the chart exists. **404 → surface and stop**, do NOT push the ID into the layout. Exists → re-run `--add-charts` with that ID. |
| `layout references chart N but it no longer exists (404)` (orphan) | **Do not auto-fix.** Tell the user the chart was deleted; ask whether to remove it from the layout (manual edit, see `dashboard_layout.md`). |
| `dashboard screenshot too small` / `dashboard screenshot failed` | Retry once — could be a backend transient. Persists → surface `dashboard_url` and stop. |
| `position_json is not valid JSON` | Hard error; surface to user. Manual PUT only — do not auto-overwrite. |

**Custom layout caveat**: `--add-charts` appends to the last `GRID`/`TAB`. Do **not** apply the skeleton/missing-chart fixes when the dashboard was built with a `grid` config (`buildLayoutFromGrid`) or has tabs — surface to the user and stop, otherwise the structure gets disrupted.

## Warnings

`issues[]` entries prefixed with `warning:` (transient non-404 chart-detail errors, small-screenshot heuristic, layout-vs-relation count mismatch) do **not** trigger fixes and do **not** count against the 3-attempt cap. Surface them in your reply when relevant.

## Each fix should be minimal

Change one thing per iteration so the next verdict pinpoints whether the change helped. Use `--add-charts` (idempotent) for fixes; do not delete and recreate the dashboard. Send the screenshot only after `verify.ok === true`.
