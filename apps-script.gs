# Task 1 — class edition (11 students, one shared network)

Name dropdown → chart + writing → submit → instant feedback on screen, and a copy lands in your Gmail with a row in a Google Sheet you can scroll through after class.

Two separate things to set up: the **Netlify site** (as before) and the **Google side** (new). Do the Google side first — you need one thing from it before Netlify works fully.

---

## Part 1 — Google side (do this first)

### 1. Make the Sheet

Go to sheets.google.com → Blank spreadsheet. Name it "Task 1 Results" or similar.

### 2. Attach the script

Extensions → Apps Script. Delete the placeholder code in the editor. Open `apps-script.gs` from this folder, copy everything, paste it in.

### 3. Set your email

At the top of the pasted code:
```js
const TEACHER_EMAIL = "your.email@gmail.com";
```
Change it to your real Gmail address. Save (Ctrl+S / Cmd+S).

### 4. Test it once

In the Apps Script toolbar, the function dropdown (next to Run) → select `testDoPost` → click **Run**. Google will ask you to authorize the script — click through (Advanced → Go to project → Allow). Check your Sheet: a "Results" tab should appear with one test row. Check your Gmail: one email should have arrived.

If both worked, delete that test row from the Sheet before the real class runs.

### 5. Deploy as a web app

Deploy → New deployment → gear icon → **Web app**.
- Execute as: **Me**
- Who has access: **Anyone**

Click Deploy, authorize again if asked. Copy the URL it gives you — it ends in `/exec`. This is your `SHEET_WEBHOOK_URL`.

Keep that URL — you need it in Part 2, step 3.

---

## Part 2 — Netlify side

```bash
npm install -g netlify-cli   # skip if already installed
cd task1-class
npm install
netlify deploy --prod
```

### Environment variables

Netlify dashboard → Site configuration → Environment variables:

| Key | Value |
|---|---|
| `OPENAI_API_KEY` | your `sk-...` key |
| `ACCESS_CODE` | a code you invent, e.g. `MKS-JULY` |
| `SHEET_WEBHOOK_URL` | the `/exec` URL from Part 1, step 5 |

### Enable Blobs

Netlify dashboard → Blobs → enable it. This is what stops one student's rapid re-submits from being unlimited — it does not throttle across students, only within one name.

### Redeploy

```bash
netlify deploy --prod
```

---

## The class list and charts are already loaded

`roster.js` has your 12 real students. `charts.js` has 5 real Task 1 charts
(factory workers in Germany, CO2 emissions, hospital admissions, aluminium
recycling, Manchester crime) with the exact data figures from each chart
built into the marking prompt — so the examiner checks students against
real numbers, not guesses.

Attendance is a non-issue: any subset of the 12 names works on any given
day. Nobody needs to be present for the system to work for whoever is.

**To add or remove a student:** edit the array in `roster.js`.
**To add another chart:** copy the shape of an existing entry in `charts.js`,
drop the image in `charts/`, and if it has real data, put the figures in
the `prompt` field the same way — that is what lets the examiner verify
numbers instead of just matching topic and vocabulary.

---

## On exam day

1. Open the site URL on all 11 machines (bookmark it beforehand — one shared Google login doesn't need to touch this page at all, it's unrelated to Google auth).
2. Each student picks their own name from the dropdown, enters the access code, clicks Begin.
3. They write, click Submit, read their result on screen.
4. You watch your Gmail fill up in real time, or open the Sheet at the end and see all 11 rows sorted by timestamp.

**Why this doesn't break with 11 at once:** the rate limiter is keyed on the name each student picked, not on the shared network address. All 11 submitting in the same minute are 11 separate counters. Only rapid re-submission *by the same name* gets capped (4 per hour) — that stops one student from hammering the button, without touching anyone else's access.

**If the Sheet/email step is broken** (wrong URL, script not deployed, whatever): students still get their result on screen — that part never depends on Google. They'll see a small note saying "show your screen to your teacher" so nothing is silently lost. Fix the webhook after class; nobody's work vanishes in the meantime.

---

## Cost

Same as before: `gpt-4o-mini`, roughly $0.0003 per essay. 11 students submitting once each is about 3 cents. Set a $5/month cap on your OpenAI account regardless — platform.openai.com → Settings → Limits.

---

## If something breaks

| Symptom | Cause |
|---|---|
| "Pick your name first" | Dropdown wasn't touched — should not happen if roster.js loaded |
| No email arriving | `SHEET_WEBHOOK_URL` missing/wrong, or Apps Script deployed as "Only myself" instead of "Anyone" |
| Sheet has no "Results" tab | Run `testDoPost` manually once from the Apps Script editor |
| Student sees "not saved to class record" | Webhook is down — their result is still correct on screen, this only affects your copy |
| One student blocked, others fine | Working as designed — that student hit 4 submissions in an hour |
| Everyone blocked at once | Blobs is off and no ACCESS_CODE set — the function fails closed on purpose |
