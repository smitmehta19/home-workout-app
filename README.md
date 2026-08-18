# Home Gym

A guided workout web app built for one specific setup: **two loadable dumbbells, a loadable rod, light resistance bands, a mat — and no bench.**

You open it, it tells you what to train today, and you press Start. It counts your sets, times your rest, shows you how each movement is performed, and works out what weight you should be lifting based on what you lifted last time.

No account. No server. No network required. Everything lives in your browser.

---

## What it does

**Today** — A weekly split, generated for you. Each session lists its exercises with a set and rep target and a suggested working weight. Tap any exercise to see how to do it.

**Guided session** — Press Start and it walks you through three phases: the warm-up, every working set, then the stretch routine. Each set gives you the movement, an animated demo, your rep target, weight and rep steppers, then an automatic rest countdown with a chime and a preview of what's next. Leave mid-workout and it picks up exactly where you left off.

**Muscle map** — A front and back body diagram where every muscle is tappable. Tap one and you get every exercise in the library that trains it, split into direct work and assistance, along with how many sets a week your current plan gives it.

**History** — Weekly volume trend, estimated one-rep-max personal bests, and a log of every session.

---

## How the programming works

**The split.** Choose 3, 4 or 5 days a week in Settings. The default is a four-day upper/lower — the most reliable structure there is for this equipment. Every split trains each major muscle at least twice a week, which consistently beats once a week for growth at matched weekly volume, and lands most muscles in the 10–20 weekly set range.

**Exercise rotation.** A session is built from *slots* — "heavy horizontal press", "single-leg", "rear delts" — rather than fixed exercises. Each slot has a pool of movements that satisfy it, and the app rotates through the pool week by week. You get variety without the programme drifting out of shape.

**Progressive overload.** The app uses **double progression**: hold the weight and climb the rep range, then add weight and drop back to the bottom of the range.

> Hit 8 reps on all four sets of a 6–8 range? Next session it puts the weight up one increment and resets you to 6.
> Didn't? It keeps the weight and asks for one more rep than last time.

This matters more at home than in a gym. With real plates your smallest jump might be 2.5 kg, which on a 10 kg curl is a 25% increase nobody absorbs weekly. Climbing reps first bridges the gap between the weights you can physically make.

**Every movement can be opened.** Tap any exercise, warm-up drill or stretch — from the home screen, the muscle map, the session preview or mid-workout — and you get how to set up, numbered steps, the cues that matter, what to avoid, and a demonstration.

Demonstrations use real start/end photographs from the [Free Exercise DB](https://github.com/yuhonas/free-exercise-db), crossfaded so you can see both positions of the lift. All 101 exercises and all 26 warm-up and stretch drills are mapped, and the ramp-up set shows the photograph of the actual exercise you are about to do. Images are served from jsDelivr, retried from GitHub if the CDN fails, linked rather than copied into this repo, and cached by the service worker the first time you view them so they still show with no signal. A drawn figure renders underneath and stays visible until both photos arrive, so a slow connection or being offline shows the drawing rather than a blank frame — Settings has a live check telling you which is happening. A handful of movements have no exact entry in the photo library (bird dog, hollow hold, Cossack squat and similar); those show the closest relative and the sheet says so explicitly.

**Warm-up and stretching are compulsory.** Both are phases of the session rather than optional extras, and the summary reports whether you finished them.

The warm-up follows RAMP — Raise, Activate, Mobilise, Potentiate. Six or seven minutes: raise your temperature, switch on the muscles you are about to load, move the joints through the ranges this session needs, then a light ramp-up set of the day's first exercise, which the app names for you.

The cool-down is static stretching, 30 seconds a hold, per side where it matters, matched to the day. It sits *after* training and never before, because stretching a cold muscle measurably reduces force output for the session that follows, while the same work on warm tissue is where flexibility is actually gained.

**It knows your gear.** Tell Settings your rod weight, your loading ceilings and your smallest plate jumps. The app only ever suggests weights you can actually load, and when you hit the ceiling of what your equipment holds it stops asking for more weight and asks for more reps instead.

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
    media.js          movement -> Free Exercise DB photo mapping
    plans.js          the 3, 4 and 5 day split templates
    muscles.js        muscle groups
  components/
    figure.js         animated demo figure and movement patterns
    guide.js          photo demonstration with drawn fallback
    bodymap.js        interactive front/back muscle chart
    timer.js          rest countdown, audio cues, wake lock
    exercise-sheet.js exercise detail view
  views/              today, player, muscles, history, settings
```

## A note on the training advice

The programming here follows mainstream evidence-based strength and hypertrophy practice: train each muscle at least twice weekly, keep most work in the 5–20 rep range close to but short of failure, rest 2–3 minutes on compounds and 60–90 seconds on isolation work, and add load or reps over time. Warm-ups follow the RAMP model; stretching follows the usual flexibility guidance of 30-second holds done after training rather than before it.

It is a training tool, not medical advice. If you have an injury or a health condition, talk to someone qualified before following any of it.

## Credits

Demonstration photographs come from the [Free Exercise DB](https://github.com/yuhonas/free-exercise-db), which publishes itself as public domain. They are linked from that project rather than redistributed here. Note that the project carries no LICENSE file at its root and the provenance of the photographs has been raised in its issue tracker, so if you fork this, satisfy yourself about the licensing or simply delete `js/data/media.js` — every movement then falls back to the drawn demonstration.
