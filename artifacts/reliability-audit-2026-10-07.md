# Reliability audit — 7 October 2026

## Outcome

The original deployment passed normal classroom saving and submission tests. Three edge cases needed fixes; they are now addressed in the **local working copy, not yet deployed**.

| Finding | Fix |
| --- | --- |
| Failed drafts vanished after refresh | Browser recovery copies, isolated by team identity and student name |
| Reconnection could falsely show Saved | Pending drafts control save status; reconnect retries saving |
| Two writers could replace the same answer | Transactional base-value comparison; both versions shown for an explicit choice |

Live redraws and autosaves also pause during Japanese text composition.

## Evidence

**Before fixes, production:** 30 independent student sessions, six QA teams, three rounds of 30 simultaneous saves. All 90 values matched teacher API reads. Six complete submissions matched teacher reads and fresh student logins. Browser-typed text survived refresh; teammate updates arrived without refresh.

All seven QA teams, including the separate browser fixture, were removed. The original 11 teams remained untouched and the Short lesson stayed selected and unlocked.

**After fixes, locally:** 151 regression tests, 12 Firestore emulator tests, and the production build passed. See [verification](implementation-verification.md).

## Scope and limits

- The live run was a bounded burst test, not a prolonged soak or deployment/outage recovery test.
- Teacher visibility was checked through its API; production dashboard UI was not tested in that run.
- Browser connection status intermittently showed Reconnecting; continuous network stability is not established.
- Japanese text storage was checked; physical IME behavior still varies by device.
- The first live harness's final roster assertion noticed the separately created browser QA team. All save/submission checks had passed. Cleanup was independently verified; the amended harness was not rerun and has no recorded latency summary.

## Reproduction

- `scripts/audit-drafts.mjs`: runs the updated client regressions without production access.
- `scripts/stress-live.mjs`: opt-in live test; requires `STRESS_BASE` and `TEACHER_PASSWORD`, creates disposable teams, then removes them. Prefer a separate test deployment.

Recovery copies are not a database backup or a full answer history. Refresh existing student tabs after deployment so every writer uses the new conflict checks.
