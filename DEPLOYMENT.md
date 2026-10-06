# Put Build Your Own Civilization online

This guide works with your own repository and accounts. No particular school, organization, GitHub username, or custom domain is required.

## What you are setting up

Think of the app as three parts:

- **Vercel is the front door.** It hosts the website and runs the code that checks sign-ins and game actions.
- **Firestore is the notebook.** It remembers teams, answers, and dice rolls after everyone closes their browser.
- **Firebase Authentication is the entry pass for live updates.** It lets each team see its own saved work. Students still enter a team code and name, not a Firebase password.

When someone chooses a card, the browser asks the Vercel server to save it. The server checks the rules, saves the result in Firestore, and teammates receive the update. Dice are rolled by the server, then saved.

You set this up once. After deployment, students need only the website link and their team code. Your computer can be switched off.

## Before you begin

You need a GitHub account, a Vercel account, and a Google account for Firebase. Put this project in a GitHub repository you own or can deploy. If it is already there, push your latest changes first.

Use a Vercel plan that fits your use. Review [Vercel's usage guidelines](https://vercel.com/docs/limits/fair-use-guidelines) and [Firebase's plans](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans). The app does not need Firebase Hosting, Cloud Functions, or Cloud Storage.

Keep secret files out of Git. The repository ignores `.env`, but that file is **not automatically uploaded to Vercel or loaded by `npm start`**. For the online app, enter the variables in Vercel as described below.

## Step 1: Create the place where work is saved

1. Open the [Firebase console](https://console.firebase.google.com/) and create a project. Choose your own project name. The Spark plan can be used. Google Analytics is optional; the app does not use it.
2. Open **Build → Firestore Database → Create database**.
3. Create the **default database**, choose **Standard edition**, and choose **Production mode**. Pick a location near your users. Choose carefully: the database location cannot be changed later.
4. Open **Authentication** and click **Get started**. You do not need to enable Google, email, or phone sign-in. This app supplies its own sign-in tokens.
5. Open **Firestore Database → Rules**. Copy all the text from [firestore.rules](firestore.rules), replace the editor's contents, and click **Publish**. Do not use open/test rules. These rules let students read their own team and teachers read all teams; the server handles writes.

## Step 2: Copy two Firebase settings and allow Firestore access

The two settings in A and B are different things. You need both. Then complete C so the server key can save work.

### A. The website settings

In Firebase, open **Project settings → General**, then register a **Web app** using the web icon. You do not need Firebase Hosting.

Firebase shows a block beginning with `const firebaseConfig = ...`. Copy its values into this format:

```json
{"apiKey":"YOUR_API_KEY","authDomain":"YOUR_PROJECT_ID.firebaseapp.com","projectId":"YOUR_PROJECT_ID","appId":"YOUR_APP_ID"}
```

Replace every placeholder with your own value. Keep the double quotes around both names and values. Do not include `const firebaseConfig =`, comments, or a semicolon. This is the value for `FIREBASE_WEB_CONFIG` in Step 3. These web settings are meant to be visible in the browser.

### B. The private server key

In Firebase, open **Project settings → Service accounts → Firebase Admin SDK → Generate new private key**. Download the JSON file somewhere private, outside this repository.

Open it in a text editor. Its **entire contents**, including the opening and closing braces, are the value for `FIREBASE_SERVICE_ACCOUNT` in Step 3. Keep the `\n` characters inside the private key exactly as downloaded. Do not paste this file into GitHub, the website, or a chat.

Both settings must belong to the same Firebase project: the server key's `project_id` must match the website settings' `projectId`.

### C. Let the server key use Firestore

A new Firebase project's server key may be allowed to sign students in but **not** to read or save in Firestore. If you skip this step, the online app fails with “Classroom setup is incomplete” even when every Vercel setting is correct.

1. In the downloaded JSON file, find `client_email`. It looks like `firebase-adminsdk-xxxxx@YOUR_PROJECT_ID.iam.gserviceaccount.com`. Copy that address.
2. Open the Google Cloud console for the same project. From Firebase: click the gear next to **Project Overview → Project settings → Service accounts**, then click **Manage service account permissions**. Alternatively, sign in to the Google Cloud console with the same Google account and choose your Firebase project in the project picker at the top.
3. Open the **☰** menu and choose **IAM & Admin → IAM**.
4. Click **Grant access**. Paste the `client_email` address into **New principals**.
5. Under **Select a role**, search for **Cloud Datastore User** and choose it. Firestore permissions still use the older “Datastore” name.
6. Click **Save**. The change can take a minute or two to apply.

If the address is already listed on the IAM page, you can click the pencil on its row, then **Add another role → Cloud Datastore User → Save**. If it is not listed, tick **Include Google-provided role grants** above the table.

## Step 3: Connect the repository to Vercel

1. Open [Vercel's new-project page](https://vercel.com/new).
2. Import **your own GitHub repository** containing this app.
3. Choose **Other** for the framework. Use the folder containing `package.json` and `vercel.json` as the root directory.
4. Confirm these settings. The checked-in `vercel.json` supplies the install, build, and output settings.

| Setting | Value |
| --- | --- |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node.js version | `24.x` |

5. Before clicking Deploy, add these four environment variables for **Production**. An environment variable is simply a named setting supplied privately to the server.

| Name: copy exactly | Value: supply your own |
| --- | --- |
| `TEACHER_PASSWORD` | A private password with at least 12 characters. This is what you enter on the teacher sign-in screen. |
| `SESSION_SECRET` | A random secret with at least 32 characters. Generate it using the command below and keep it unchanged across deployments. |
| `FIREBASE_SERVICE_ACCOUNT` | The complete private JSON file from Step 2B. |
| `FIREBASE_WEB_CONFIG` | The JSON website settings from Step 2A. |

If Node.js is installed, run this command in a terminal to generate `SESSION_SECRET`:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Paste the result as the value. Do not wrap the value in extra quotation marks. For the two JSON settings, paste the JSON object itself, not a filename: the value must start with `{` and end with `}`. If you copy the values from a local `.env` file, leave out any single or double quotes around them there. A local server strips those quotes, but Vercel keeps them as part of the value, which makes the JSON invalid. You do not need `HOST`, `PORT`, or `DATA_DIR` on Vercel.

6. Click **Deploy** and wait for the deployment to become ready.
7. Copy the production website address Vercel gives you, such as `https://your-project.vercel.app`.
8. In Firebase, open **Authentication → Settings → Authorized domains**. Add the website's hostname, such as `your-project.vercel.app`, without `https://` or a path.

Use the Production address. Preview deployments need their own variables and preferably a separate Firebase project so testing does not change the live activity.

Open the address in a signed-out browser before sharing it. If it asks for a **Vercel login**, students cannot reach the app yet. In the Vercel project's **Settings → Deployment Protection**, check which deployments are protected and use a Production deployment that permits public access. The app's own team-code and teacher-password sign-in still applies. A URL containing `-git-` is a branch address; check the deployment's environment in Vercel rather than assuming it is Production. See [Vercel Authentication](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication).

**If you change any Vercel environment variable later, redeploy.** Changing a saved setting does not update an already running deployment.

## Step 4: Check that it actually works

Do these checks before sharing the link:

1. Add `/api/health` to the production address and open it. For example: `https://your-project.vercel.app/api/health`. You should see `{"ok":true}`. This checks server initialization and Firestore setup; the next checks also verify sign-in and live access.
2. Open the normal home page. Choose **Teacher**, then enter the password from Step 3. The first server startup creates Teams A–K with their places and join codes.
3. Copy one team code. Open two separate browser sessions, such as a normal window and a private window. Join the same team with different names in both sessions. Two private windows in the same browser may share a login, so use separate browsers if necessary.
4. Choose a card or edit an answer. Confirm that the change appears in the other session.
5. On the teacher dashboard, open and close the historical reveal. Submitted teams should be able to enter the history screens only while the reveal is open.
6. Reload. Saved work should still be there. Later deployments using the same Firebase project and `SESSION_SECRET` should retain it too.

## What everyone does during the activity

1. **Teacher:** sign in, find the team codes, and give each group the website link and its code.
2. **Students:** enter their name and code. Everyone with the same code works on the same civilization.
3. **Team:** read about the place and its resources, look through the developments, and predict which ones will be easy or difficult there.
4. **Team:** choose cards in the Science and Society trees. Each tree has its own 7-point budget. Follow the arrows; required earlier cards must be selected first.
5. **Team:** confirm the choices and roll the event. The app saves the dice result and locks normal tree editing. Follow any instructions to gain or lose cards.
6. **Team:** name the civilization, choose its government, economy, and beliefs, and write the seven explanations. Review and submit. Use the poster to present.
7. **Teacher:** open the historical reveal when the class is ready.
8. **Team:** read the historical example, answer the three comparison questions, and submit that reflection separately.

Answers save automatically. Wait for saving to finish before closing the page. Students can read different screens without moving their teammates. The teacher can reopen submitted work when changes are needed.

## If you see “Unexpected token 'A' … is not valid JSON”

This means the browser expected structured app data, but received ordinary text beginning with something like “A server error…”. That message alone does **not** identify the server failure. The updated client shows a readable server-response error instead of the JSON parsing error.

1. Make sure the latest code has been pushed and deployed.
2. Open `/api/health` on the same website.
3. If it fails, open the logs in Vercel: your project → **Deployments** → the latest **Production** deployment → **Logs** (called **Runtime Logs** in some layouts). If the build failed, inspect its **Build Logs** instead. Reload `/api/health` to get a fresh log entry, then look for the line beginning `Classroom initialization failed:`.
4. Confirm Node.js is `24.x`, all four Production variables are set, both JSON values are valid, the Firebase project IDs match, the default Firestore database exists, and the server key has the **Cloud Datastore User** role (Step 2C).
5. Correct the setting identified by the logs, **redeploy**, then repeat Step 4 above.

Startup errors caught by the API return JSON with HTTP 503 and a setup message. That message always says “check the Vercel environment variables”, whatever the actual cause, so treat it as “look at the logs”, not as proof that a variable is wrong. Hosting failures that happen before the function runs can still return plain text or HTML; the browser handles those without exposing the raw response.

If Runtime Logs mention `ERR_REQUIRE_ESM`, `jwks-rsa`, and `jose`, deploy the latest code with both `package.json` and `package-lock.json`. The project overrides only `jwks-rsa`'s `jose` dependency to version `5.10.0`, which supports CommonJS loading. This avoids a Firebase Admin startup failure in Vercel's module loader. The deployment test reproduces that loader restriction and verifies RSA signing-key conversion. This particular error happens before Firebase settings are checked.

| What you see | What to check |
| --- | --- |
| `/api/health` returns 503 and a setup message | Check the Vercel Runtime Logs for the initialization error. Verify variables, JSON, credentials, and Firestore setup. |
| Logs say `PERMISSION_DENIED: Missing or insufficient permissions` | The variables are fine, but the server key cannot use Firestore. Give its `client_email` the **Cloud Datastore User** role (Step 2C), wait a minute, and reload `/api/health`. No variable change or redeploy is needed. |
| Logs say `FIREBASE_SERVICE_ACCOUNT must contain valid JSON` or `FIREBASE_WEB_CONFIG must contain valid JSON` | The value in Vercel is not a bare JSON object. Remove any surrounding quotes copied from `.env`, so it starts with `{` and ends with `}`, then redeploy. |
| `/api/health` returns plain text, HTML, 404, or a hosting error | Check the deployed commit, root directory, Node version, build logs, function logs, and the checked-in `vercel.json`. |
| The website or `/api/health` redirects to Vercel sign-in | Deployment Protection is blocking public access. Use a publicly accessible Production URL and test it while signed out of Vercel. |
| Teacher sign-in works but updates keep reconnecting | Confirm Firebase Authentication was initialized, the API key belongs to the same project, the Firestore rules were published, and the hostname is authorized. |
| Settings were fixed but the error remains | Redeploy, then open the new Production deployment. |
| Preview says setup is incomplete | Use Production, or configure separate Preview variables. |
| Work is missing | Verify that the deployment still uses the same Firebase project. Local SQLite data is not copied online automatically. |

## Keep the saved work

The online app starts a new classroom in Firestore. Local work remains in the local `data/` folder. Keep the same Firebase project and `SESSION_SECRET` for redeployments. Changing the secret invalidates sessions and join-code lookups.

Monitor the Firebase Usage page. Actions and live updates use database reads and writes. See [Firestore quotas and pricing](https://firebase.google.com/docs/firestore/pricing) for current limits. A free plan's quota can stop the activity until it resets.

## Optional: run on your own computer

Install Node.js **24.x**, open a terminal in the project folder, and run:

```powershell
npm ci
$env:TEACHER_PASSWORD = 'choose-a-private-password-at-least-12-characters'
npm run dev
```

Open the address printed in the terminal, usually [http://127.0.0.1:5173](http://127.0.0.1:5173). This version uses SQLite on your computer and does not need Firebase. The PowerShell password command applies to that terminal session.

Before deploying code changes, run:

```powershell
npm test
npm run build
```

The tests cover game behavior, local HTTP requests, and deployment error handling. The build creates `dist/`, including the browser Firebase code. These checks do not prove that your online credentials and permissions are correct: complete Step 4 on the deployed site too.

For additional Firestore transaction and permission checks, install Java 21 or newer and run `npm run test:firebase`. This uses the emulator project `demo-build-your-civ`, not a real Firebase project.
