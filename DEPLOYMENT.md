# Deployment

The hosted app uses **Vercel** for the website/API and **Firebase** for persistent data and live updates. Students sign in with a team code and name. Your computer does not need to stay on.

## 1. Configure Firebase

1. Create a Firebase project in the [console](https://console.firebase.google.com/).
2. Create the **default Firestore database**, Standard edition, Production mode, near your students.
3. Initialize **Authentication**. No email or social sign-in provider is needed; the app uses custom tokens.
4. Publish the contents of [firestore.rules](firestore.rules). Do not enable open/test rules.
5. Register a Web app under **Project settings → General**. Save its configuration as JSON:

```json
{"apiKey":"YOUR_API_KEY","authDomain":"YOUR_PROJECT_ID.firebaseapp.com","projectId":"YOUR_PROJECT_ID","appId":"YOUR_APP_ID"}
```

6. Under **Project settings → Service accounts**, generate a private Admin SDK key. Keep the downloaded JSON outside Git.
7. In Google Cloud **IAM & Admin → IAM**, give that key's `client_email` the **Cloud Datastore User** role if it lacks Firestore access.

The web configuration's `projectId` and the private key's `project_id` must match. Web configuration is public; the service-account key is secret.

## 2. Configure Vercel

Import your GitHub repository. Use the directory containing `package.json` as the project root.

| Setting | Value |
| --- | --- |
| Framework | Other |
| Node.js | 24.x |
| Install | `npm ci` |
| Build | `npm run build` |
| Output | `dist` |

The checked-in `vercel.json` supplies routing and build settings. Add these **Production** environment variables:

| Variable | Value |
| --- | --- |
| `TEACHER_PASSWORD` | Private password, at least 12 characters |
| `SESSION_SECRET` | Random secret, at least 32 characters; keep stable |
| `FIREBASE_SERVICE_ACCOUNT` | Entire downloaded private-key JSON |
| `FIREBASE_WEB_CONFIG` | Web configuration JSON from step 1 |

Generate a secret with:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Paste JSON objects, not filenames or JavaScript declarations. Remove surrounding quotes from `.env` values; keep escaped `\n` inside private keys. `.env` is ignored by Git and is not automatically sent to Vercel.

Deploy, then add the production hostname to **Firebase Authentication → Settings → Authorized domains**. Use the hostname only, without `https://`.

Test the Production URL while signed out of Vercel. Students must reach the app without a Vercel login. Use separate Firebase data for previews whenever possible.

**Redeploy after changing environment variables.** Keep the same Firebase project and `SESSION_SECRET`; changing the secret invalidates sessions and join-code lookups.

## 3. Check before class

1. Open `/api/health`; expect `{"ok":true}`.
2. Sign in as teacher. Check Teams A–K and their codes.
3. Choose **Full** or **90-minute activity** before students save work. The choice persists and then locks.
4. In two separate browser sessions, join a disposable test team with different names. Edit different answers and verify live updates.
5. Edit the same answer from both sessions. Confirm the conflict panel preserves both versions.
6. Save, refresh, and confirm the text remains. Submit a completed team and check its answers on the teacher dashboard.
7. Full only: open the historical reveal, submit the three reflections, and test reopening. Short ends with presentations and discussion; it has no history submission.
8. Remove only the disposable test team when finished. Do not test destructive actions on student work.

After an app update, have students reload their tabs. Draft recovery uses the same browser, team, and student name. Clearing browser storage removes recovery copies.

## Lesson requirements

| | Full | Short |
| --- | --- | --- |
| Required writing | Name + seven explanations | Name + geography, government, economy, event explanations |
| Society choices | Government, economy, belief | Same; custom belief needs a brief description |
| Trees and event | Same rules | Same rules |
| Ending | Presentation, historical reading, three submitted reflections | 2–3 minute presentation and class discussion |

See [README.md](README.md) for rules and the 90-minute schedule. Reopening work does not unlock the activity-version selector. Preserve needed work before deleting worked teams for a new class.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Health returns 503 | Vercel Runtime Logs, starting with `Classroom initialization failed:` |
| `PERMISSION_DENIED` in server logs | Service account's Firestore permissions; Cloud Datastore User role |
| Invalid configuration JSON | Bare JSON objects, correct escaping, no extra outer quotes; redeploy |
| Plain text/HTML response or 404 | Root directory, deployed commit, Node 24, build/function logs, `vercel.json` |
| Vercel sign-in appears | Production deployment protection/public access |
| Reconnecting continuously | Firebase Auth initialization, published rules, authorized domain, matching project configuration |
| Failed save | Keep the page open, reconnect, use **Retry saving**; resolve any answer conflicts |
| Recovery-copy warning | Browser storage is unavailable; do not close until the server confirms saving |
| Submission blocked | Complete required answers/choices/event and resolve unsaved drafts; check the selected lesson version |
| Work missing after redeploy | Same Firebase project and secret? Local SQLite is separate from Firestore |
| `ERR_REQUIRE_ESM` involving `jwks-rsa` / `jose` | Deploy both package files; retain the checked-in `jose` override |

Health verifies startup, not the complete student workflow. The tests below do not verify production credentials or school-network connectivity.

## Validation and backups

```powershell
npm test
npm run build
npm run test:firebase
```

The last command needs Java 21+ and uses `demo-build-your-civ` in an emulator. It never targets production.

Keep independent backups of classroom data. Monitor [Firestore usage](https://firebase.google.com/docs/firestore/pricing); exhausted quotas can interrupt saves. The app does not need Firebase Hosting, Cloud Functions, or Cloud Storage.

For local SQLite operation, see [README.md](README.md). Stop the local server normally before copying its data folder, including its secret and any remaining WAL files.
