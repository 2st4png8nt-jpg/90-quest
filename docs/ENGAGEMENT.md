# Engagement design — result of the research debate (2026-10-27)

Three research agents each defended one view, cited only sources they opened and verified, rebutted each other, and voted until all three accepted one plan.

- **A — Behavior design:** cue + tiny action + instant feedback.
- **B — Self-Determination Theory:** autonomy, competence, relatedness; avoid pressure.
- **C — Feature evidence:** what measurably raises adherence in health apps.

## Agreed philosophy: user-authored habit loops
- **Mechanism (A):** a cue in the user's routine, a small action, immediate feedback, repeated in the same context until it's automatic.
- **Filter (B):** the user writes the cue, task, difficulty and why. No loss, guilt or announced-reward mechanics.
- **Yardstick (C):** completed days, logged on the phone, so each change can be checked.

## Agreed changes
1. **If-then plan in onboarding for both goals** ("After I ___, I will ___"), shown on the task card. *Gollwitzer & Sheeran 2006 (d = .65); Keller et al. 2021.*
2. **One opt-in local notification** at a time the user picks. Informational wording, with the why and the first task. No evening nudge. At day 61 the app *offers* to turn it off and lean on the cue. *Bidargaddi et al. 2018 (+3.9% next-day use, small but randomized); Alkhaldi et al. 2016; Jakob et al. 2022; Stawarz et al. 2015 (reminders alone can stall automaticity).*
3. **Difficulty chosen at setup;** check-ins on days 31 and 61 to revisit the why, adjust difficulty and show the share of minimum days. No daily task swapping, which would break repetition. *Jakob 2022 (personalization); Ntoumanis et al. 2021; Gardner, Lally & Wardle 2012.*
4. **One-tap check-off with haptic feedback** and a specific line from Pip tied to the user's why. "Days done" (never decreases) is the main progress number, above the streak. The 90-cell grid stays. *Michie et al. 2009; Deci, Koestner & Ryan 1999 (positive feedback +0.33).*
5. **Minimum day:** a ~2-minute version that counts as a completed day, with no weekly cap. It shows as "kept going" in a lighter shade, never labeled partial. One miss is expected (Streak Shield). Warm welcome back after a lapse, with no loss language anywhere. *Keller 2021; Lally et al. 2010.*
6. **Achievements stay minor,** in their own sheet. Locked ones show "???" until earned. One optional "share progress" button; no partner flow or leaderboard. *Deci 1999 (unexpected rewards don't undermine motivation); Jakob 2022 (social comparison mixed).*

## Honest limits
- Every effect here is small to moderate and shrinks after programs end (Mazeas et al. 2022; Mönninghoff et al. 2021).
- Nearly half of health-app users drop out (Meyerowitz-Katz et al. 2020).
- No study tested streak wording or the Shield directly; those follow from Lally 2010 and SDT, not from a trial.

## Implementation notes
- The daily notification repeats with a fixed message ("After you [cue]: today's plan is ready. Remember why: …"). Phones can't change a repeating notification's text each day without a background task, so the first task isn't in it yet.
- The per-day log is `history` in `app/src/game.ts`: completed, minimum, shielded, reminder on/off.
- On habit quests, the minimum-day option hides while today's task already is the tiny version, since it would repeat it.
