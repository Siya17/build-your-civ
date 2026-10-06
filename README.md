# Build Your Own Civilization

A bilingual English/Japanese classroom activity for Tama University Week 2. Teams learn about one of eleven places, build Science and Society trees, adapt to a dice event, and present their choices before the teacher opens the historical reveal.

## Run locally

Requires Node.js 24 or newer. No npm packages are needed.

```powershell
$env:TEACHER_PASSWORD = 'choose-a-long-private-password'
npm run dev
```

Open the URL printed in the terminal, usually [http://127.0.0.1:5173](http://127.0.0.1:5173). Students and teachers use the same sign-in page. If no password is set in development, a temporary teacher password is printed in the terminal. Stop the previous server before starting another on the same classroom database.

Run the rules, content, flow and HTTP integration checks with `npm test`. Tests use a temporary database and include a 30-student classroom simulation.

## Classroom workflow

1. **Meet your place.** Read the regional context, study the world and physical maps, and examine climate and resources. Browse all 33 technologies and cultural developments: each shows a short definition on hover or focus and its full explanation on click. On the challenge screen, every development starts as normal, and the team marks only the ones it expects to be easy or difficult here; marks are shared live. Then compare the marks with the local suitability ratings and learn the point rules. Short, optional team notes answer the discussion prompts on both screens. A new database starts with Team A through Team K, each fixed to its matching place.
2. **Build two trees.** Spend up to **7 points in each tree**, with at least one card in each. Follow the arrows: every listed parent must be chosen to meet a prerequisite. Free cards still need their prerequisites. Unused points are allowed.
3. **Roll the event.** Confirm the team's developments, then roll two dice once to select one of twelve events. The first die selects a row (1–6); the second selects the first set on 1–3 or the second set on 4–6. All twelve events have equal probability. Tree editing locks at this point. Resolve any required losses, gains or choice.
4. **Prepare and present.** Name the civilization and write seven explanations about the event, geography, government, economy, beliefs, technology and culture, and an alternative. Select one government, one to three economic activities, and what the people hold most sacred (ancestors, sacred animals, the river, the sea, mountains, the sky, many gods, one god, or a custom belief). The belief answer describes a ritual and who leads it. Review and submit, then use the poster for a three-minute talk.
5. **Compare with history.** The teacher opens the class-wide reveal. Teams read a sourced historical account and submit three additional answers about a difference, a historical project or practice, and an aspect the model omits. These reflections have their own submission and reopening controls; the original civilization stays locked.

| Card symbol | Cost and effect |
| --- | --- |
| ★ | 0 points; thrives in this place |
| ● / unmarked | 1 point; works |
| △ | 2 points; the server rolls a die: 3–6 works, 1–2 partly works |
| ✗ | Cannot be chosen in this place |

A partly working card remains chosen and still unlocks its children, but it provides no event protection. Removing and re-adding a △ card reuses its original roll. Removing a prerequisite also removes any descendants left without another chosen parent; the student confirms that removal first.

## The twelve events

Protection is checked against the cards held before the event. A protective card must work fully.

| Event | Event name | Rule |
| --- | --- | --- |
| 1 | Drought | Lose Irrigation unless Masonry works. Without Irrigation, nothing is lost. |
| 2 | Great flood | Lose one Science card unless Construction works. |
| 3 | Newcomers | Choose trade to gain one Foreign Trade line card, or fight. Working Archery protects a fight; otherwise lose one card from either tree. |
| 4 | Epidemic | Lose one Society card, or two if the team had Foreign Trade, even when it only partly works. |
| 5 | Worn-out soil | Lose one Science card unless Foreign Trade works. |
| 6 | Good years | Gain one card from either tree. |
| 7 | Severe storm | Lose one Science development unless Engineering works. |
| 8 | Trade route disruption | Lose one Society development in the Foreign Trade line unless Sailing or Horseback Riding works. |
| 9 | Dispute over collective work | Lose one Society development unless Political Philosophy works. |
| 10 | Useful raw-material discovery | Gain one eligible Science development. |
| 11 | Skilled visitors | Gain one eligible Society development. |
| 12 | Knowledge exchange gathering | Gain one eligible development from either tree. |

Event identifiers are separate from dice faces: `id = firstDie + (secondDie > 3 ? 6 : 0)`. Both faces are generated and saved atomically by the server. Older single-die events retain their original result and display one saved face; they are never rerolled.

Losses must come from the end of a branch, preserving every remaining card's prerequisites. Gains ignore the point budget and cost 0 points, but must be possible in the region and meet a prerequisite. A △ gain receives a server roll or reuses its saved roll. Required gains and losses stop when no eligible card remains. An Epidemic may leave Society empty without blocking submission.

The Newcomers choice is final, and the screen previews both outcomes. The Foreign Trade line includes Foreign Trade and its descendants; the unlocking parent must also be in that line. Foreign Trade itself requires Code of Laws. For example, Political Philosophy unlocked only through State Workforce cannot be gained by trade. Having partly working Foreign Trade doubles the Epidemic loss but does not protect against Worn-out soil; this is the implemented interpretation of the supplied design.

## Shared progress and teacher controls

Students join with their team's code and their name, without a university account. Codes such as `A-427` accept case changes and punctuation; older join codes remain valid. The teacher can create teams, add missing A–K teams, replace join codes, review work and activity, print posters, delete teams, and reopen submissions.

Each team's cards, rolls, event, selections and answers are shared through live updates. Reading screens and navigation belong to each device, so students can review without moving teammates. Late joiners can read the introductions or jump to their team's current task. Dice results are generated and saved by the server inside the same database transaction as the action. The browser never supplies a result.

Answers save automatically and allow 1,200 characters each; the required name allows 40. Failed saves retain local drafts. Submission requires the name, all seven answers, the government/economy/belief selections, and a resolved event. Historical reflections save separately after submission and while the reveal is open; all three answers are required for their final submission. The teacher can reopen the reflection independently. Reopening the civilization also reopens its reflection, preserving the text for review. Answer boxes block browser paste and drop as a classroom deterrent; this does not prove that every answer was typed.

The reveal setting persists across server restarts. Close it on the dashboard before the next class. Reconnecting students receive its current value immediately. Historical reveal content is bundled in browser JavaScript, so the gate controls the classroom screen sequence rather than keeping the material secret from developer tools.

## Storage, deployment and older classrooms

The default storage folder is `data/`, containing `classroom.sqlite` and `secret.key`. Keep the secret with its database: it is used to verify sessions and join codes. `DATA_DIR` selects another persistent directory; `HOST` and `PORT` select the listening address (defaults: `127.0.0.1:5173`). Production requires `NODE_ENV=production` and a `TEACHER_PASSWORD` of at least 12 characters. Serve production behind HTTPS because production session cookies are secure. Use one server process for a classroom so all students share its live event stream.

Before upgrading an existing classroom, stop its server normally with Ctrl+C or SIGTERM. Shutdown checkpoints SQLite's write-ahead log. The updated server automatically creates a consistent database backup and copies its secret into `data/backups/pre-v2-<timestamp>-<suffix>/` before changing an older database or saved state. Changes to prerequisites and this lesson's event/belief format receive corresponding `pre-rules` and `pre-lesson` backups before affected states are saved. Keep regular backups of the whole data folder in another location too. Never copy only the database while the server is writing to it; an active `classroom.sqlite-wal` may hold the latest work. Do not commit or share classroom data or the secret.

Older saved states are normalized on read and saved in the new `v:2` format on the next successful action. Core cards and valid places are retained; old special cards, map buildings, trails, routes and story events are removed. Old answers and decisions remain visible to the teacher under `legacy`; the previous belief answer is retained as the new belief answer. Old event rolls do not become new events. Existing database tables from the retired experimental world are left intact.

Old teams may exceed the new budget or have △ cards without a stored roll. The event screen blocks until they remove excess cards or roll the outstanding cards. Regions now follow the supplied A–K classroom locations, so the teacher should review older teams whose geography meant something different. Previously submitted teams remain submitted; reopen them to finish the new questions and event. The retired `/play`, hex-map, route and cooperative-world interfaces are no longer served.

## Content and attribution

The supplied Week 2 slides define the A–K locations and event rules; the Science and Civics flowcharts supply the development cards. Slide 18 supplies only the Nile example: ★ Irrigation, ★ Sailing, △ Horseback. The existing prices for the other ten regions, and their geography explanations, were authored for this implementation. They are classroom assumptions for instructor review, rather than price tables transcribed from the slides. They were checked against sources in October 2026: Yellow River Bronze is now an ordinary card because tin was scarce there, while its ★ Animal Husbandry reflects early pig domestication in the middle Yellow River; Zimbabwe's Foreign Trade is an ordinary card, keeping each region to three ★ cards at most; Andes Irrigation is ★ because coastal farming depended on canals, Greenland's △ Irrigation reflects the labour of Norse hayfield irrigation, and its ★ Craftsmanship reflects skilled work with scarce materials. All unspecified cards cost 1 point. Edit `shared/regions.js` to revise a table; avoid changing prices during a class because saved teams may then become invalid or exceed their budgets.

Climate charts are rounded modern station averages with a source label in each region. A dashed overlay estimates conditions around 2000 BCE by shifting today's averages by a temperature change and a rainfall factor taken from cited palaeoclimate research; these are coarse classroom estimates, not reconstructed monthly values. Every historical example dates from about 2000 BCE or earlier, and each reading names its period. Card trees simplify development for discussion and do not claim a universal sequence or imply that geography determines a society's choices.

Regional physical maps use bundled, simplified Natural Earth data with bilingual labels and source captions. They work without an external map service. Historical readings cite institutional and research sources beside the supported paragraphs. Comparison lists contain developments discussed in the reading; omission from a list is not evidence that a historical society lacked a development.

Photos, resource examples and diagrams illustrate the material; some show comparable landscapes or materials outside the named region. Their author, license and original source page are recorded in `shared/credits.json` and the matching browser module `shared/credits.js`, and shown with images in the app. Preserve those credits when replacing assets. The world map uses NASA Blue Marble imagery; the Budj Bim channel diagram is an authored illustration with its source listed in the same manifest.

## Project layout

| Path | Purpose |
| --- | --- |
| `shared/cards.js` | Core cards, tree structure and prerequisites |
| `shared/regions.js` | Bilingual places, prices, climate, events and historical examples |
| `shared/game.js` | Point budgets, normalization, actions, dice rules, event resolution and submission validation |
| `shared/flow.js` | Device reading steps and shared team progression |
| `shared/i18n.js`, `shared/glossary.js` | Bilingual interface and glossary text |
| `shared/credits.json`, `shared/credits.js` | Asset attribution manifest and browser export |
| `public/` | Student and teacher views, trees, poster, styles and image assets |
| `server/http.js` | Authentication, action API and live event streams |
| `server/store.js` | SQLite storage, migrations, sessions, submissions and reveal setting |
| `server.mjs` | Startup, classroom seeding and graceful shutdown |
| `tests/` | Shared rules, migration, flow, bilingual content and HTTP integration checks |
