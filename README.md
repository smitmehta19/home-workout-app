# Home Gym

A guided workout web app built for one specific setup: **two loadable dumbbells, a loadable rod, light resistance bands, a mat — and no bench.**

You open it, it tells you what to train today, and you press Start. It counts your sets, times your rest, shows you how each movement is performed, and works out what weight you should be lifting based on what you lifted last time.

No account. No server. No network required. Everything lives in your browser.

---

## What it does

**Today** — A weekly split, generated for you. Each session lists its exercises with a set and rep target and a suggested working weight. Tap any exercise to see how to do it.

**Guided session** — Press Start and it walks you through the whole thing in three phases: the warm-up, then every working set, then the stretch routine. Each working set gives you the movement, an animated demo, your rep target, weight and rep steppers, then an automatic rest countdown with a chime and a preview of what's next. Leave mid-workout and it picks up exactly where you left off.

**Muscle map** — A front and back body diagram where every muscle is tappable. Tap one and you get every exercise in the library that trains it, split into direct work and assistance, along with how many sets a week your current plan gives it.

**History** — Weekly volume trend, estimated one-rep-max personal bests, and a log of every session.

---

## Warm-up and stretching are not optional

Both are phases of the session. You walk through them the same way you walk through your working sets, and the summary reports whether you finished them.

**The warm-up follows RAMP** — Raise, Activate, Mobilise, Potentiate. About six or seven minutes: raise your temperature, switch on the muscles you are about to load, take the joints through the ranges this session needs, then a light ramp-up set of the day's first exercise. The app names that exercise for you, so the last warm-up step is specific to what you are actually about to do.

**The cool-down is static stretching**, 30 seconds a hold, per side where it matters. This is deliberately placed *after* training and never before it: static stretching a cold muscle measurably reduces force output for the session that follows, while the same stretching on warm tissue is where flexibility is actually gained. The routine matches the day — chest, shoulders, triceps, lats and spine after upper days; quads, hamstrings, glutes, hip flexors, calves and adductors after lower days.

---

## How the programming works

**The split.** Choose 3, 4 or 5 days a week in Settings. The default is a four-day upper/lower — the most reliable structure there is for this equipment. Every split trains each major muscle at least twice a week, which consistently beats once a week for growth at matched weekly volume, and lands most muscles in the 10–20 weekly set range.

**Exercise rotation.** A session is built from *slots* — "heavy horizontal press", "single-leg", "rear delts" — rather than fixed exercises. Each slot has a pool of movements that satisfy it, and the app rotates through the pool week by week. You get variety without the programme drifting out of shape.

**Progressive overload.** The app uses **double progression**: hold the weight and climb the rep range, then add weight and drop back to the bottom of the range.

> Hit 8 reps on all four sets of a 6–8 range? Next session it puts the weight up one increment and resets you to 6.
> Didn't? It keeps the weight and asks for one more rep than last time.

This matters more at home than in a gym. With real plates your smallest jump might be 2.5 kg, which on a 10 kg curl is a 25% increase nobody absorbs weekly. Climbing reps first bridges the gap between the weights you can physically make.

**It knows your gear.** Tell Settings your rod weight, your loading ceilings and your smallest plate jumps. The app only ever suggests weights you can actually load, and when you hit the ceiling of what your equipment holds it stops asking for more weight and asks for more reps instead.

---

## The no-bench constraint

All 101 exercises are performable on the floor with your kit. There are no bench presses, no incline work, no dips, no pull-ups, nothing requiring a rack or a machine. If a movement isn't in the library, the app can never prescribe it.

The library goes well past the obvious. Barbell work includes Zercher squats, push presses, Yates rows, high pulls and behind-the-back deadlifts — all loadable without a rack. Dumbbell work includes squeeze presses, glute-bridge floor presses, thrusters, cleans, swings, Turkish get-ups, windmills, Cossack squats and loaded carries. Wide-stance work (plié squats, lateral lunges, Cossacks) covers the adductors, which almost nothing else at home trains directly, and pike push-ups give you a genuinely hard vertical press once your rod caps out.

## About the demos

The animations are drawn, not filmed. Each movement is a small articulated figure posed with joint angles, eased between a start and an end position on a loop. That keeps the whole app under a megabyte, free of licensing problems, and working offline.

They show you the shape of the movement, not the fine detail of technique. Every exercise page also has full written cues and common mistakes, plus a one-tap link to video demonstrations.

---

## Running it

There is no build step and no dependencies. It is plain HTML, CSS and ES modules.

```bash
# any static server will do
npx http-server .
# then open http://localhost:8080
```

To install it on your phone, open the deployed URL in your browser and choose "Add to Home Screen". It then launches full screen like a native app and works with no signal.

### Deploying

Push to `main` and the included GitHub Actions workflow publishes the site to GitHub Pages.

Two things are worth knowing if you fork this or start it fresh:

- **Pages must be switched on once by hand**: *Settings → Pages → Source → GitHub Actions*. The workflow asks to enable it automatically, but `GITHUB_TOKEN` cannot create a Pages site without repository admin rights and fails with *"Resource not accessible by integration"* until you flip that switch.
- **Deploys only run from the default branch.** The `github-pages` environment GitHub creates rejects deployments from any other branch before the job starts. The workflow skips non-default branches rather than failing on them, and reads the default branch at run time, so it needs no edit if you change it.

---

## Your data

Everything is stored in `localStorage` in the browser you use it in. Nothing is transmitted anywhere.

The trade-off is real: **clearing your browsing data erases your training history.** Settings has an Export button that saves a JSON backup, and a Restore button that reads one back. Use it occasionally.

---

## Project layout

```
index.html            shell and bottom navigation
sw.js                 service worker — caches the app for offline use
css/styles.css        all styling
js/
  app.js              hash router
  state.js            localStorage persistence
  plan.js             session generation and the progression engine
  ui.js               DOM helpers, bottom sheets, toasts
  data/
    exercises.js      the 101-exercise library
    mobility.js       RAMP warm-ups and static stretch routines
    plans.js          the 3, 4 and 5 day split templates
    muscles.js        muscle groups
  components/
    figure.js         animated demo figure and movement patterns
    bodymap.js        interactive front/back muscle chart
    timer.js          rest countdown, audio cues, wake lock
    exercise-sheet.js exercise detail view
  views/              today, player, muscles, history, settings
```

## A note on the training advice

The programming here follows mainstream evidence-based strength and hypertrophy practice: train each muscle at least twice weekly, keep most work in the 5–20 rep range close to but short of failure, rest 2–3 minutes on compounds and 60–90 seconds on isolation work, and add load or reps over time. Warm-ups follow the RAMP model; stretching follows the usual flexibility guidance of 30-second holds performed after training rather than before it.

It is a training tool, not medical advice. If you have an injury or a health condition, talk to someone qualified before following any of it.
