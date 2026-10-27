# 90 Day Quest — locked decisions (2026-10-27)

- Name: "90 Day Quest" (renamed from "Level Up" on 2026-10-27).

- Stack: Expo (React Native), iOS + Android. Not publishing yet; test builds only.
- v1 goals: Fitness and New Habit. Debt, savings, studying come later.
- Data: stored on the phone only. No accounts, no bank linking.
- No RPG layer (changed 2026-10-27): no XP or levels. Characters stay; achievements mark milestones. Streak + weekly Streak Shield stay.
- Onboarding: pick hero → pick goal → "find your why" (7 levels deep, Dean Graziosi's format; research basis is self-concordance: Sheldon & Elliot 1999, Koestner 2008, Teixeira et al. 2012) → Day 1.
- Home fits on one screen: hero + status, my why, today's tip, today's list. Journey (map + lessons) and achievements open as sheets.
- Art: pixel art, anime style (shonen-inspired, original characters); male and female hero to choose from. Narrator: "Pip", a playful wisp.
- Readability: Atkinson Hyperlegible for text; pixel font only for logo and level badge.
- Colors: light, research-based palette; see docs/DESIGN.md.
- Monetization: none yet.
- Autonomy: Claude makes calls and logs them here; asks before anything that costs money or can't be undone.
- Research rule: every info bite cites an entry in research/sources.json. No fabricated claims.

- Engagement design: see docs/ENGAGEMENT.md (three-agent research debate, unanimous result).

## Design rules taken from the research
- 90-day plan in three 30-day phases (Lally 2010: median 66 days, range 18-254).
- Onboarding writes an "After I ___, I will ___" plan (Gollwitzer & Sheeran 2006).
- Daily check-off is the core loop (Harkin 2016).
- One Streak Shield per week: a single miss keeps the streak (Lally 2010).
- Phase starts framed as fresh starts (Dai 2014).

## Open items
- Testing on phones: Android APK builds via GitHub Actions (.github/workflows/android-apk.yml) and appears under Releases. iPhone testing needs a free Expo account (Expo Go) later.
- Days currently advance with a tester button; the real calendar-based day rollover comes next.
- Name check for "90 Day Quest" in app stores before publishing.
