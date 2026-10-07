# Build Your Own Civilization

A bilingual English/Japanese team activity about geography and society. Students explore one of eleven regions, build two development trees, respond to an event, and present their civilization.

## Choose the lesson

Choose the version on the teacher dashboard **before students start working**.

| | Full activity | 90-minute activity (Short) |
| --- | --- | --- |
| Regional reading | Separate land, climate, and resource screens | Combined overview with expandable details |
| Development exploration and predictions | Included | Included |
| Trees and dice events | Same rules | Same rules |
| Required writing | Name + seven explanations | Name + four explanations: geography, government, economy, event |
| Society choices | Government, 1–3 economic activities, belief | Same; a custom belief also needs a short description |
| Presentation | About 3 minutes | 2–3 minutes |
| History | Teacher opens the historical reading; three written reflections and a separate submission | Class discussion; no historical reveal, comparison screens, written reflections, or second submission |

Short answers should be 2–3 sentences. Its 90-minute plan assumes 7–8 teams: joining 5, exploration 8, trees 17, event 6, writing 15, presentations 25, discussion 14 minutes. These are pacing targets, not timers.

The version is shared and persists across restarts. The first saved student choice or answer locks it, including predictions and society selections. Undoing or reopening does not unlock it. Remove worked teams only when their work is no longer needed, then prepare the next class. Existing classrooms default to Full.

## Classroom flow

1. Give each group its team code. Students join with their names; no individual accounts are needed.
2. Read about the region, explore all developments, predict suitability, then compare the ratings.
3. Build Science and Society trees: **7 points each**, at least one card in each, all prerequisite arrows satisfied.
4. Confirm the trees and roll the two-dice event once. Normal tree editing locks; resolve required gains, losses, or choices.
5. Name the civilization, choose its society, write the required answers, review, and submit.
6. Present using the poster. Full continues to the teacher-controlled history task; Short finishes with discussion.

Each browser controls its own reading screen. Team answers, selections, cards, and rolls are shared. The teacher can review work, print posters, manage teams/codes, and reopen submissions. Full reflections can be reopened separately.

## Saving and shared writing

- Answers autosave. Limits: name 40 characters, explanations 1,200, optional notes 300.
- Unsaved drafts have a browser recovery copy, identified by team and student name. Rejoin with the same name on the same browser to recover them. Clearing browser storage removes these copies.
- Reconnection retries pending drafts. **Saved** means no local answer draft remains pending; it is separate from merely reconnecting.
- If someone changes the same answer, review both versions and choose **Save my draft instead** or **Use the team answer**. Different answers can be edited concurrently.
- Failed saves retain drafts and offer **Retry saving**. If browser storage is unavailable, keep the page open until saving succeeds.
- Live redraws wait until Japanese text composition finishes. Paste and drop into answer boxes remain blocked as a classroom deterrent.
- Submission waits for local saves. Submitted work is locked; ask the teacher to reopen it to make changes.

Recovery copies are not database backups or a full answer history. Conflict protection uses the updated client; reload student tabs after deploying an update.

## Game rules

| Rating | Cost | Effect |
| --- | --- | --- |
| ★ | 0 | Thrives |
| ● / normal | 1 | Works |
| △ | 2 | Server die: 3–6 works; 1–2 partly works |
| ✗ | — | Cannot be selected |

Free cards still need prerequisites. A partly working card unlocks children but gives no event protection. Removing a prerequisite removes unsupported descendants after confirmation. Re-adding a difficult card reuses its saved roll.

Two dice select one of twelve equally likely events: the first die chooses row 1–6; the second chooses the first set (1–3) or second set (4–6). Dice are generated and saved atomically on the server.

| Event | Effect |
| --- | --- |
| Drought | Lose Irrigation unless Masonry works |
| Great flood | Lose one Science card unless Construction works |
| Newcomers | Trade for a Foreign Trade-line card, or fight; working Archery protects a fight, otherwise lose one card |
| Epidemic | Lose one Society card; two if Foreign Trade was held, including partly working Trade |
| Worn-out soil | Lose one Science card unless Foreign Trade works |
| Good years | Gain one card from either tree |
| Severe storm | Lose one Science card unless Engineering works |
| Trade route disruption | Lose one Foreign Trade-line Society card unless Sailing or Horseback Riding works |
| Dispute over collective work | Lose one Society card unless Political Philosophy works |
| Useful raw-material discovery | Gain one eligible Science card |
| Skilled visitors | Gain one eligible Society card |
| Knowledge exchange gathering | Gain one eligible card from either tree |

Losses preserve prerequisites. Gains cost no points but must be possible in the region and satisfy prerequisites. Requirements stop when no eligible card remains. Losing all Society cards does not itself block submission. Protection uses the cards held before the event.

## Run and test

Requires Node.js 24.x.

```powershell
npm ci
$env:TEACHER_PASSWORD = 'choose-a-private-password-at-least-12-characters'
npm run dev
```

Open the printed address, usually `http://127.0.0.1:5173`. Local mode uses SQLite; the hosted app uses Firestore. See [DEPLOYMENT.md](DEPLOYMENT.md) for setup and troubleshooting.

```powershell
npm test
npm run build
npm run test:firebase # Requires Java 21+; uses a demo emulator, not production
```

## Storage and maintenance

Local data lives in `data/classroom.sqlite` with `data/secret.key`; keep them together. `DATA_DIR` selects another folder. Use one local server process. Stop it normally before backing up; copying only the database while it is writing may miss WAL data.

Legacy upgrades make backups under `data/backups/` before migrations. Old answers remain available as legacy work; review older teams after rule or geography changes. Keep independent backups. Production requires HTTPS and a teacher password of at least 12 characters.

Online redeployments must retain the Firebase project and `SESSION_SECRET`. Never commit credentials or classroom data. Local SQLite work is not automatically copied online.

## Content and project map

Regional ratings are classroom modeling assumptions, not claims that geography determines society. Climate charts distinguish modern station averages from coarse ancient estimates. Historical readings cite their sources. Full-mode history is bundled in browser code: its gate controls lesson timing, not secrecy.

Preserve photo credits in `shared/credits.json` and `shared/credits.js`. Generated atmospheric images are illustrative; their provenance is in [artifacts/image-prompts.md](artifacts/image-prompts.md).

| Location | Purpose |
| --- | --- |
| `shared/game.js`, `cards.js`, `regions.js` | Rules, developments, regional content |
| `shared/lesson.js`, `flow.js` | Full/Short requirements and progression |
| `public/` | Student/teacher screens, saving, posters, styling |
| `server/http.js` | Authentication and API |
| `server/store.js`, `firestore-store.js` | SQLite and Firestore transactions |
| `client/firebase.js` | Hosted live updates |
| `tests/` | Regression, HTTP, content, and Firestore checks |

See [verification](artifacts/implementation-verification.md) and the [reliability audit](artifacts/reliability-audit-2026-10-07.md) for test scope and release status.
