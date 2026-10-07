# Verification — 7 October 2026

## Current working copy

- Full and 90-minute (Short) modes share game rules and use separate writing/ending requirements.
- Draft recovery survives refresh and rejoining with the same team/name/browser.
- Save status stays pending until drafts are acknowledged; reconnect retries saves.
- Same-answer conflicts retain both versions for an explicit choice. Different fields remain independent.
- Japanese composition defers redraws and autosaves until composition ends.

These changes are **local and not yet deployed**.

## Checks

| Check | Result |
| --- | --- |
| `npm test` | 151 passed |
| `npm run test:firebase` | 12 passed |
| `npm run build` | Passed |

New regressions cover recovery isolation, stale bases after refresh, reconnect status/retry, repeated conflicts, choosing either version, lost acknowledgements, and Firestore concurrent writers.

The existing suite covers both lesson versions, validation, event transactions, submission/reopening, live updates, migrations, permissions, and a 30-student local simulation.

## Browser check

On an isolated local classroom, a conflicting edit kept both answers. A fresh page recovered the unsaved draft; choosing it saved the selected text and returned the status to Saved.

## Earlier production audit

30 student sessions across six QA teams completed 90 concurrent-round saves. Six submissions matched teacher API reads and fresh student logins. Browser typing survived refresh and received a teammate update. Original classroom teams were untouched; QA teams were removed.

That audit tested the previous deployment. See [the reliability audit](reliability-audit-2026-10-07.md) for its limits. Production must be redeployed and checked before these fixes reach students.

## Limits

- Browser storage can be blocked or cleared; recovery copies are not backups.
- Existing tabs need a reload to use conflict-aware saves.
- No full answer-version history was added.
- Tests do not guarantee school-network reliability, quota availability, or physical Japanese IME behavior on every device.
