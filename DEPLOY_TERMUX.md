# Deploying the CGT Unified Platform from Termux

This is a complete, copy-paste walkthrough to take the project from a ZIP on your
phone to a live URL. You've done this before with NEXUS CGT, so this will feel
familiar — same stack (GitHub → Supabase → Vercel), just a new repo.

Total time: ~25–40 minutes the first time.

---

## 0. What you need

- The `cgt-platform.zip` file saved on your phone
- A GitHub account
- A Supabase account (free tier is fine)
- A Vercel account (free Hobby tier is fine)
- Termux installed (F-Droid build recommended over the Play Store one)

---

## 1. Set up Termux

```bash
pkg update -y && pkg upgrade -y
pkg install -y nodejs git unzip openssh
node -v        # should print v20.x or similar
git --version
```

Set your git identity (once):

```bash
git config --global user.name  "Sachin Pawar"
git config --global user.email "you@example.com"
```

---

## 2. Unzip the project

Assuming the ZIP landed in your Downloads:

```bash
termux-setup-storage          # grant storage permission when prompted
cd ~
unzip ~/storage/downloads/cgt-platform.zip -d ~/
cd ~/cgt-platform
ls                            # you should see src/, supabase/, package.json, etc.
```

---

## 3. Push to GitHub

Create an **empty** repo on GitHub first (no README, no .gitignore) — e.g.
`cgt-unified-platform`. Copy its URL.

Then, from inside `~/cgt-platform`:

```bash
git init
git add .
git commit -m "Initial commit: CGT Unified Platform"
git branch -M main
git remote add origin https://github.com/<your-username>/cgt-unified-platform.git
git push -u origin main
```

When prompted for a password, use a **GitHub Personal Access Token**, not your
account password (Settings → Developer settings → Personal access tokens →
Tokens (classic) → generate with `repo` scope). Paste the token as the password.

---

## 4. Create the Supabase backend

1. Go to supabase.com → **New project**. Pick a name, a strong DB password, and a
   region close to India (e.g. Mumbai / `ap-south-1`).
2. Wait for it to finish provisioning (~2 min).
3. Open the project → **SQL Editor** → **New query**.
4. Open `supabase/migrations/0001_init.sql` from the project (you can `cat` it in
   Termux or open it in a text editor), copy the **entire** contents, paste into
   the SQL editor, and click **Run**. This creates all tables, the audit trigger,
   the profile-on-signup trigger, and Row Level Security policies.
5. New query again → paste the contents of `supabase/seed.sql` → **Run**. This
   loads demo rows so the app isn't empty on first login.

> Tip to read a file in Termux: `cat supabase/migrations/0001_init.sql`
> then long-press to select all and copy.

### Grab your API credentials

In Supabase: **Project Settings → API**. Copy two values:

- **Project URL** → looks like `https://abcdxyz.supabase.co`
- **anon / public** key → a long JWT string

You'll paste these into Vercel in the next step. (The `anon` key is safe to expose
in a frontend — RLS is what protects your data.)

---

## 5. Deploy to Vercel

The easiest path on mobile is the **GitHub import** flow in a browser, not the CLI:

1. Go to vercel.com → **Add New → Project**.
2. **Import** your `cgt-unified-platform` GitHub repo.
3. Vercel auto-detects Vite. Leave the build settings as-is:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Expand **Environment Variables** and add these two (names must match exactly):

   | Name | Value |
   |------|-------|
   | `VITE_SUPABASE_URL` | your Project URL from step 4 |
   | `VITE_SUPABASE_ANON_KEY` | your anon key from step 4 |

5. Click **Deploy**. After ~1 minute you'll get a live `*.vercel.app` URL.

> Prefer the CLI? `npm i -g vercel && vercel` works in Termux too, but you'll still
> set the two env vars with `vercel env add VITE_SUPABASE_URL` etc., then
> `vercel --prod`. The browser flow is less fiddly on a phone.

---

## 6. Create your account and become admin

1. Open your live Vercel URL. You'll see the login screen.
2. Click **Need an account? Sign up**, register with your email + a password.
   (Supabase may require email confirmation — check Authentication → Providers →
   Email; for a quick start you can disable "Confirm email" there.)
3. The signup trigger automatically creates a row for you in `public.profiles`
   with the default role `viewer`. To give yourself full write access, go back to
   Supabase **SQL Editor** and run:

   ```sql
   update public.profiles
   set role = 'admin'
   where email = 'you@example.com';
   ```

4. Refresh the app. You can now create, edit, and delete records across every
   module, and every change is written to the audit trail automatically by the
   database.

Roles that can write: `admin`, `manager`, `analyst`. `viewer` is read-only.
Change anyone's role with the same `update` statement.

---

## 7. Day-to-day updates

Whenever you change code on your phone:

```bash
cd ~/cgt-platform
git add .
git commit -m "describe your change"
git push
```

Vercel redeploys automatically on every push to `main`. Schema changes go through
the Supabase SQL editor the same way you ran `0001_init.sql`.

---

## Troubleshooting

- **Login screen says "backend not configured"** → the two `VITE_` env vars aren't
  set in Vercel, or you set them after deploying. Add them, then trigger a redeploy
  (Vercel → Deployments → ⋯ → Redeploy). Vite bakes env vars in at build time, so a
  rebuild is required after changing them.
- **"permission denied for table ..."** → you're signed in as a `viewer`. Run the
  `update public.profiles set role='admin'` query.
- **Tables empty / dropdowns blank** → you skipped `seed.sql`, or the migration
  failed partway. Re-run the migration (it's safe — it uses `if not exists`).
- **`git push` rejected** → you used your password instead of a Personal Access
  Token.
- **Build fails on Vercel** → confirm Node 18+ in Vercel Project Settings →
  General → Node.js Version.
