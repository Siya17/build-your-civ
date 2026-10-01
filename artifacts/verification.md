# Guided game verification

Verified on 2026-10-01 using isolated temporary classroom data.

- Complete suite: **96 passing tests**, zero failures (`npm test`).
- Cooperative demo: all twelve turns completed with a shared win (`npm run demo:coop`).
- Public, shared, and server JavaScript passed syntax checks; `git diff --check` found no whitespace errors.
- Automated coverage includes A–K landscapes, legacy automatic placements, explicit unbuilt plans, idempotent placement confirmation, storage and service relocation, trail connection/removal, dormant shore segments, four seasonal hazards, land and water operation, submission locking, and stale version rejection.
- Cooperative previews were checked against authoritative yields, seasonal harvests, logistics capacity, and action validation. Cargo, route review, research confirmation, and outcomes render as separate tasks in both languages.
- Browser checks completed the classroom sequence with five typed answers and submission. Two simultaneous views retained independent navigation and active writing during a shared relocation and trail edit.
- Disconnecting the local test server preserved an unsaved draft on its current writing task. Reconnecting and retrying saved it and allowed progression.
- Browser checks covered cooperative scouting, road placement, a zero-action end-turn review, confirmation, result, and explicit handover.
- Responsive browser views were inspected at phone (390 px), tablet (768 px), and desktop widths. English and Japanese labels, portrait display, and keyboard map movement were checked. Reduced-motion rules were inspected in both stylesheets; the operating-system preference was not changed.
- All twelve portrait assets were visually inspected together. The consistent square composition also supports the circular game crops. Exact imagegen prompts and source references are in `public/assets/portraits/provenance.json`.

No database-column migration is required. Classroom map tradeoffs remain qualitative and do not add submission requirements.
