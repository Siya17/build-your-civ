# Build Your Own Civilization

A bilingual, shared classroom game for the Tama University Week 2 activity. The newer slide deck supplies the A–K map and contact question; the supplied science and civics flowcharts supply the development cards.

## What it does

- A new classroom starts with eleven teams, Team A to Team K. Each one begins at, and keeps, its own map point. The teacher can delete any team, bring missing letters back with "Add missing teams A–K", and create extra teams, which choose their own place.
- Each team's join code is its short name and a three-digit PIN, e.g. `A-427` or `RIVERMAKER-315`. Students can type it in any case, with or without the dash. The teacher page shows every code at all times, and "New join code" replaces one. Codes from before this change still work.
- Students sign in with the team code and their names. No university account integration is required.
- Each team shares one character, chapter, set of choices, and five short answers. Live events update teammates’ screens.
- A–K each open a distinct seven-second animated landscape and a bilingual, sourced geography card. Motion can be replayed or stopped.
- Four quests and badges guide the team through two branching story events. Event choices unlock special development cards and show a possible benefit and tradeoff.
- The science and society trees each permit seven choices, with prerequisites checked by the server. They are drawn as connected trees, and the chosen path lights up.
- Each team has a hex homeland built from its map point: coast, rivers, mountains and deserts follow the geography card. Every chosen card raises a building on a fitting hex. Teams can move buildings, and pointing at a hex explains which buildings suit that land. Exploring outward and travel technologies clear the fog. The settlement grows from village to town to city. There is no score.
- The default student screen is a guided four-step activity: know your place, discover technology, shape society, choose your future. Each team advances independently. The council holds the current step's objectives and short questions; the map shows its choices. There is no shared turn clock or resource management.
- The final step offers local development, a caravan route, a water route, or a learning network. Outward routes unlock only when the team has a matching technology AND civic; each shows its prerequisites and tradeoff. Local development is always a valid finish. The teacher receives the chosen route with the existing answers.
- Decisions show on the land. The place's hard season (flood, drought, storm or frost) is marked before the first decision. Protecting supplies lights the stores; mapping paths outward draws a route that clears the fog. In step 3 a neighbouring camp appears at the edge. The final route is drawn as a proposed connection.
- Council questions and sentence starters are written from the team's own place, buildings, cards and decisions. The five answers the teacher receives are unchanged.
- Clicks update the page immediately, and the server's answer confirms or rolls back the change. Only the changed parts of the page are redrawn.
- A complete team can submit once. Submission locks editing until the teacher reopens it.
- The teacher dashboard shows team progress, rosters, and submitted answers.
- Text fields block browser paste, copy, cut, and drop. This is a classroom deterrent, not proof that every answer was typed; browser controls can be bypassed.

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

The A–K world map comes from the supplied current Week 2 slides. Its pins indicate approximate broad areas, not exact historical sites. Each geography card links to the NASA Earth Observatory page supporting its physical-geography clues; those observations describe present-day landscapes, and past conditions could differ. The eleven original SVG motion scenes and four character portraits are stylized illustrations, not reconstructions of specific people or societies. Each scene runs as a seven-second muted CSS animation, with the same SVG as its still poster when motion is stopped or reduced motion is requested. The three older landscape images remain in the sign-in and teacher views. Flowchart paths are discussion prompts and do not claim one universal sequence of history. Where a card has multiple incoming arrows, any one earlier card unlocks it so paths remain possible within seven choices.
