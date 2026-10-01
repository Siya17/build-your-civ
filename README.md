# Build Your Own Civilization

A bilingual, shared classroom game for the Tama University Week 2 activity. The newer slide deck supplies the A–K map and contact question; the supplied science and civics flowcharts supply the development cards.

## How to play

Each team builds one community at a real place on the Week 2 class map, in four chapters:

1. **Your place.** Meet your homeland, describe it, and decide how to face its hard season (flood, drought, storm or frost).
2. **Discover technology.** Pick technology cards. Each card becomes a building you place on your land. Then check whether your food is safe and explain your most important tool.
3. **Shape society.** Decide how to answer a neighboring community, pick society cards, check which buildings your community buildings reach, and explain your society and beliefs.
4. **Choose your future.** Stay local or open a caravan, water or learning route, explain your connections, then review and submit.

Each story decision unlocks one special card, and each screen names it before you choose. Buildings have one of four roles: food, storage, community or other. A building works when it touches the settlement, another building or a path. The map home always shows one next task and a short "How this game works" guide. There is no score. The teacher receives the five written answers along with a plain-language summary of the map.

## What it does

- A new classroom starts with eleven teams, Team A to Team K. Each one begins at, and keeps, its own map point. The teacher can delete any team, bring missing letters back with "Add missing teams A–K", and create extra teams, which choose their own place.
- Each team's join code is its short name and a three-digit PIN, e.g. `A-427` or `RIVERMAKER-315`. Students can type it in any case, with or without the dash. The teacher page shows every code at all times, and "New join code" replaces one. Codes from before this change still work.
- Students sign in with the team code and their names. No university account integration is required.
- Each team shares one character, chapter, set of choices, and five short answers. Live events update saved progress while each student browses tasks independently.
- A–K each open a distinct illustrated landscape with a brief reveal and a bilingual, sourced geography card. Reduced motion keeps the landscape still.
- Four quests and badges guide the team through two branching story events. Event choices unlock special development cards and show a possible benefit and tradeoff.
- The science and society trees each permit seven choices, with prerequisites checked by the server. They are drawn as connected trees, and the chosen path lights up.
- The map is the home screen with one next-task button. Introductions, writing, decisions, placement previews, checks, and outcomes each have a focused screen. Back and review preserve writing and do not move teammates. Task transitions take about 250 ms and respect reduced motion.
- Each development is learned only after confirming a fitting location or explicitly keeping an unbuilt plan. Free moves change connections, storage protection, and community service coverage. Confirmed trails bridge gaps and remain after buildings move. Connected food sources support local access; connected storage buffers exposed production within one hex. Flood, drought, storm, and frost depend on the actual site.
- The four classroom chapters remain: know your place, discover technology, shape society, choose your future. Map outcomes are qualitative tradeoffs and never block an otherwise complete submission. There is no shared turn clock or resource management.
- The final step offers local development, a caravan route, a water route, or a learning network. Outward routes unlock only when the team has a matching technology AND civic; each shows its prerequisites and tradeoff. Local development is always a valid finish. The teacher receives the chosen route with the existing answers.
- An outward route is separately assessed as planned or operating. Land and learning routes need connected required facilities and an explored land edge reached by paths. Water routes need a connected harbor, a qualifying civic facility, and revealed water to the edge. The student and teacher review include actual map consequences.
- Council questions and sentence starters are written from the team's own place, buildings, cards and decisions. The five answers the teacher receives are unchanged.
- Saves confirm before continuing. Failed saves keep drafts on the current screen. Placement and trail edits reject stale previews and require another confirmation after refreshing.
- A complete team can submit once. Submission locks editing until the teacher reopens it.
- The teacher dashboard shows team progress, rosters, and submitted answers.
- Answer fields block browser paste and drop; copying work out remains available. This is a classroom deterrent, not proof that every answer was typed; browser controls can be bypassed.

## Run locally

Requires Node.js 24 or newer. No npm packages are needed.

```powershell
$env:TEACHER_PASSWORD = 'choose-a-long-private-password'
npm run dev
```

Open the URL printed in the terminal (usually [http://127.0.0.1:5173](http://127.0.0.1:5173)). If that port is occupied, stop the older server before restarting this one; two servers would split live updates between connected students. If no password is set in development, a temporary teacher password is printed in the terminal.

Run tests with `npm test`. The server stores activity data in `data/classroom.sqlite` and a local secret in `data/secret.key`. Back up the whole `data` directory after class. Do not commit or share it.

## Cooperative strategy engine

The opt-in rules engine in `shared/strategy/` adds one fixed era, twelve seasonal
rounds, paid permanent districts, adjacency yields, asymmetric civilizations,
physical supply routes, ecosystem crises and a cooperative Winter Sanctuary.
Run `npm run demo:coop` for a complete legal session. Its TypeScript contracts are
in `shared/strategy/types.d.ts`; runtime code remains dependency-free JavaScript.
See [COOPERATIVE_DESIGN.md](COOPERATIVE_DESIGN.md) for the repository audit, rules
and the original integration roadmap. An experimental turn-based browser is kept
separately at `/play`; `/` and `/classroom` serve the team-paced classroom activity.
The experimental world data is separate from classroom teams and submissions.

## Project layout

| Path | Purpose |
| --- | --- |
| `public/` | Student and teacher interface, styles, generated artwork, slide map |
| `shared/game.js` | Shared game content, branch rules, prerequisites, and validation |
| `shared/routes.js` | Final route definitions, technology/civic requirements and unlock checks |
| `shared/world.js` | Bilingual A–K geography cards, source links, characters, and outcomes |
| `shared/land.js` | Homeland terrain per map point, buildings per card, fog of war and placement rules |
| `public/hexmap.js` | SVG drawing of the homeland map and the story decisions on it |
| `public/prompts.js` | Council questions and sentence starters written from the team's choices |
| `server/http.js` | HTTP API, authentication, live event stream |
| `server/store.js` | SQLite storage, sessions, submissions |
| `tests/` | Game and 30-student integration tests |
| `GAME_DESIGN.md` | RPG loop and classroom design notes |
| `DEPLOYMENT.md` | Hosting and operations |

## Source and asset notes

The A–K world map comes from the supplied current Week 2 slides. Its pins indicate approximate broad areas, not exact historical sites. Each geography card links to the NASA Earth Observatory page supporting its physical-geography clues; those observations describe present-day landscapes, and past conditions could differ. The landscape illustrations use brief motion reveals with a still view for reduced motion. All twelve portraits are fictional people living approximately 5,000 years ago, in unadorned handworked hide or coarse undyed plant-fiber clothing, with practical irregular hair and neutral backgrounds. They do not depict a named culture. Built-in imagegen produced each portrait independently; exact prompts and archaeology references are saved in `public/assets/portraits/provenance.json`, and the complete set is shown in `artifacts/portraits-preview.png`. The three older landscape images remain in the sign-in and teacher views. Flowchart paths are discussion prompts and do not claim one universal sequence of history. Where a card has multiple incoming arrows, any one earlier card unlocks it so paths remain possible within seven choices.
