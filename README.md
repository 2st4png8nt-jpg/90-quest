# 90 Day Quest

Pick a hero, pick a goal, find your why (7 levels deep), then follow a 90-day plan. Each day: one research-backed tip from Pip and a short checklist. Achievements mark milestones.

- `app/` — the Expo (React Native) app for iOS and Android. `npm test` runs the game-rule tests.
- `research/sources.json` — studies the in-app lessons cite, each verified
- `docs/DECISIONS.md`, `docs/DESIGN.md` — product decisions and the research behind the design
- `preview/index.html` — the web build of the app packed into one page (rebuild: `cd app && npx expo export -p web -o dist && python3 tools/build-preview.py dist ../preview/index.html`)
- `art/` — Jon's character sheet and the script that turns it into pixel sprites
- Android test builds: see Releases (built by `.github/workflows/android-apk.yml`)
