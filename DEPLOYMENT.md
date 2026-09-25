# Hosted classroom deployment

## Capacity and persistence

The app uses one Node.js process, SQLite in WAL mode, and server-sent events. The integration test signs in 30 students and checks shared state, submission, and reopening. This is a suitable starting configuration for one 20–30 person class on a single server. It has not yet been load-tested across a campus network or deployed to a public host.

Keep `data/` on persistent storage. Back up `classroom.sqlite`, its WAL files if present, and `secret.key` together. The secret is used to hash join codes and sessions; losing it invalidates existing codes and sessions.

## Hosted HTTPS path

`render.yaml` prepares a Render web service with a persistent 1 GB disk. Render provides the HTTPS address and terminates TLS before forwarding requests to this Node server. A persistent disk requires a paid web service. As checked on 25 September 2026, Render lists the small paid instance at **$7/month** and disk storage at **$0.25/GB/month**, before any extra bandwidth. Confirm current billing in Render before creating the service.

To deploy, push this project to a Git repository connected to Render and create a Blueprint from `render.yaml`. During creation, enter a private `TEACHER_PASSWORD` of at least 12 characters. Keep the service at one instance because the SQLite database and live event stream are process-local. Render's default HTTPS domain can then be shared with students.

## Production settings

Set these environment variables before starting the server:

| Variable | Purpose |
| --- | --- |
| `NODE_ENV=production` | Requires a strong teacher password and secure cookies |
| `TEACHER_PASSWORD` | At least 12 characters, private to the teacher |
| `DATA_DIR` | Persistent directory for SQLite and secret key |
| `HOST` | Usually `0.0.0.0` in a hosting container |
| `PORT` | Internal HTTP port, default `5173` |

Serve the app to students through HTTPS. The reverse proxy should forward the app and `/api/events` without buffering the event stream and allow long-lived connections. Keep one Node process for this SQLite-backed version. Do not put `data/` inside any public web directory.

## Class setup

1. Start the app and sign in through **Teacher access**.
2. Create teams and distribute each code. The code is displayed once; **New join code** invalidates the old one.
3. Students join with a team code and their names. Team members see the same chapter and answers.
4. Review submitted teams in the dashboard. A submitted team is locked until **Reopen submission** is used.

Teacher and student sessions expire after 12 hours. Sign-in attempts are rate-limited. The app uses HTTP-only, SameSite cookies and checks request origins for JSON writes. For institutional sign-in, audit trails, or multiple simultaneous classes, a further authentication and data model upgrade would be needed.
