# Deploy to Vercel and Firebase

This deployment uses Vercel for the website and API, Firebase Authentication for read access to live updates, and Cloud Firestore for persistent classroom work. Students still use a team code and name; teachers still use the private teacher password. No Firebase Cloud Functions or Cloud Storage are used.

Firebase's Spark plan requires no payment information. Vercel Hobby is free for personal, non-commercial projects; Vercel's definition includes paid development work, so check that your university use fits its [fair-use guidelines](https://vercel.com/docs/limits/fair-use-guidelines). See [Firebase plans](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans).

## 1. Create Firebase

1. In the [Firebase console](https://console.firebase.google.com/), create a project and keep it on **Spark**. Google Analytics is optional and is not used by this app.
2. Open **Build → Firestore Database → Create database**. Create the **default database**, using **Standard edition** and **Production mode**. For a class in Japan, a Tokyo location is a reasonable choice; the location cannot be changed later.
3. Open **Authentication** and click **Get started**. The app uses custom tokens issued by its own API; no email, phone or Google sign-in provider is required.
4. In **Project settings → General**, add a **Web app**. Firebase Hosting is not needed. Copy the `firebaseConfig` values for the Vercel environment variable below.
5. Open **Firestore Database → Rules**. Replace the initial rules with the complete contents of [firestore.rules](firestore.rules), then click **Publish**. These rules allow signed-in students to read only their own team's work and signed-in teachers to read all teams. All browser writes are denied; the Vercel API validates changes.
6. Open **Project settings → Service accounts → Firebase Admin SDK → Generate new private key**. Download the JSON to a private location outside the repository. Its complete contents become the `FIREBASE_SERVICE_ACCOUNT` environment variable in Vercel. This file is a secret; it never goes into browser code or GitHub.

## 2. Create Vercel

Commit and push this deployment code to GitHub first. In [Vercel](https://vercel.com/new), import `Siya17/build-your-civ` as a new project. Use **Other** as the framework preset and leave the root directory at the repository root. `vercel.json` supplies these settings:

| Setting | Value |
| --- | --- |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node.js version | `24.x` |

Before deploying, add these environment variables to **Production**:

| Variable | Value |
| --- | --- |
| `TEACHER_PASSWORD` | Your private teacher password, at least 12 characters |
| `SESSION_SECRET` | A random secret of at least 32 characters; retain it across redeployments |
| `FIREBASE_SERVICE_ACCOUNT` | The complete downloaded service-account JSON |
| `FIREBASE_WEB_CONFIG` | The web app's configuration as valid JSON, shown below |

Generate `SESSION_SECRET` locally in PowerShell with:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

`FIREBASE_WEB_CONFIG` must be JSON, rather than the JavaScript `const firebaseConfig = ...` assignment. Replace the placeholders with your web app's values:

```json
{"apiKey":"YOUR_API_KEY","authDomain":"YOUR_PROJECT_ID.firebaseapp.com","projectId":"YOUR_PROJECT_ID","appId":"YOUR_APP_ID"}
```

The web configuration and service account must refer to the same Firebase project. Paste secret values directly into Vercel's environment-variable form. No `HOST`, `PORT`, `DATA_DIR`, Firebase billing account, persistent disk, or custom domain is needed. Production credentials are intentionally not shared with Preview deployments; a Preview needs its own Firebase project and environment variables to avoid editing the live class.

Click **Deploy**. Vercel will give you a `https://…vercel.app` address. In Firebase **Authentication → Settings → Authorized domains**, add that Vercel hostname (without `https://` or a path).

## 3. Check the online classroom

1. Visit `/api/health` on the deployed URL. It should show `{"ok":true}`.
2. Open the home page and sign in as **Teacher**. The first successful startup creates Team A through Team K, each with its own place and team code.
3. Open two private browser windows, sign in to the same team with different names, and confirm that a card or answer change appears in both windows.
4. From the teacher dashboard, open and close the historical reveal and check that the student windows follow it.
5. Reload the page and redeploy the same code. Teams, saved answers and dice results should remain in Firestore.

Give students the public Vercel address and their team code. Your laptop can be switched off after deployment.

## Storage and free quotas

This starts a **new online classroom**. Local SQLite work is retained on your laptop and is not uploaded automatically. Keep the same Firebase project and `SESSION_SECRET` for later deployments. Changing the secret invalidates existing sessions and the join-code lookup hashes.

Firestore's free Standard-edition quota is 1 GiB storage, 50,000 document reads/day and 20,000 writes/day. Team actions, activity entries, sign-in limits, presence heartbeats and live listeners consume quota. Text saves are debounced and presence heartbeats run every 45 seconds. Check the Firebase Usage page after a class; usage depends on class length and student activity. On Spark, operations stop at the quota rather than producing pay-as-you-go charges. See [Firestore pricing](https://firebase.google.com/docs/firestore/pricing).

The API checks session expiry on every request. Firestore Rules check the same sessions for live reads. Deleted teams lose read access immediately; code rotation prevents new sign-ins with the old code and retains already signed-in students, matching local behavior. Dice and state changes are committed together, with database transaction retries unable to reroll a successful event.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| `/api/health` returns 503 | Vercel environment variables, valid JSON, default Firestore database, and matching Firebase project IDs; inspect the function logs |
| Sign-in works but updates show reconnecting | Authentication has been initialized, the supplied web API key matches the project, Firestore Rules have been published, and the Vercel hostname is authorized |
| A Preview says setup is incomplete | Production credentials are not enabled in Preview; use the Production URL |
| Work disappears after a new deployment | Confirm it uses the same Firebase project; this app does not use server-local files on Vercel |

## Local checks

`npm test` checks the existing classroom behavior and local SQLite server. `npm run build` packages the Vercel site and browser Firebase SDK. To verify Firestore transactions and read permissions against the emulator, install Java 21 or newer and run `npm run test:firebase`. The emulator uses the fictional project `demo-build-your-civ` and never touches your real Firebase project.
