# Build Your Own Civilization

A bilingual, shared classroom game for the Tama University Week 2 activity. The newer slide deck supplies the A–K map and contact question; the supplied science and civics flowcharts supply the development cards.

## What it does

- Teacher creates teams and gives each team a nine-character join code.
- Students sign in with the team code and their names. No university account integration is required.
- Each team shares one current chapter, one set of choices, and one saved written response. Live events update teammates’ screens.
- The science and society trees each permit seven choices, with prerequisites checked by the server.
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

## Project layout

| Path | Purpose |
| --- | --- |
| `public/` | Student and teacher interface, styles, generated artwork, slide map |
| `shared/game.js` | Shared game content, prerequisites, and validation |
| `server/http.js` | HTTP API, authentication, live event stream |
| `server/store.js` | SQLite storage, sessions, submissions |
| `tests/` | Game and 30-student integration tests |
| `GAME_DESIGN.md` | Analysis of the activity as a game |
| `DEPLOYMENT.md` | Hosting and operations |

## Source and asset notes

The A–K world map comes from the supplied current Week 2 slides. The three landscape illustrations were generated for this app with the built-in imagegen tool using prompts for a river settlement, connected terrain islands, and a meeting between communities. They are atmospheric artwork, not reconstructions of specific historical sites. Flowchart paths are discussion prompts and do not claim one universal sequence of history. Where a card has multiple incoming arrows, any one earlier card unlocks it so paths remain possible within seven choices.
