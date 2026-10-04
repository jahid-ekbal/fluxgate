# playwright-cli cheat-sheet

Running record of UI element names, routes, form shapes, and flow gotchas discovered while testing with `playwright-cli`. Consult before scanning snapshots. Append new learnings as they are discovered.

## Routes

Page paths and their purpose.

- `/` public landing with Header and ToastButton.
- `/login` public sign in, redirects to `/dashboard` when session exists.
- `/register` public sign up, redirects to `/dashboard` when session exists, on success goes to `/login` because `autoSignIn` is false.
- `/dashboard` private, proxy plus layout guard redirect to `/login` without session cookie.
- `/api/auth/[...all]` BetterAuth handler, `GET /api/auth/ok` returns status ok.

## UI element names

Accessible names, testids, and where they live.

- Login Card title `Welcome back`, fields `Email` and `Password`, submit `Login`, footer link `No account yet? Register` to `/register`.
- Register Card title `Create account`, fields `Full Name` and `Email` and `Password`, submit `Register`, footer link `Have an account? Login` to `/login`.
- Dashboard heading `Welcome {name}`, paragraph user email, button `Logout`.
- Toast region `Notifications`, alerts used for success and error feedback.

## Form shapes

Fields, schemas, and defaults per form.

- Login defaults `{ email: "", password: "" }`, zod min 12 max 128 on password, email format check, `mode all`, `noValidate`.
- Register defaults `{ name: "", email: "", password: "" }`, name trim min 2 max 50, password min 12 max 128 with uppercase, lowercase, number, symbol checks.
- Server actions return `{ success, error }`, forms map failure to `setError` plus toast.

## Flow gotchas

Ordering, timing, and state pitfalls found during click-testing.

- Register does not create a session with `autoSignIn false`, so it must go to `/login`, not `/dashboard`, or the private guard bounces back.
- After fill plus click, wait about 5 seconds for server action plus `replace` before snapshot.
- Snapshot refs change prefix per navigation, recapture snapshot before fill and click in each new page.
- Logout uses `useTransition` plus `replace("/login")`, then direct `/dashboard` stays on `/login` when cookie is gone.
