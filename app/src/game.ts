// Pure game rules. No React, no storage, so they can be unit-tested.
import { bitesFor, GoalId } from './content';

export const TOTAL_DAYS = 90;
export const WHY_LEVELS = 7;

export type Quest = { id: string; text: string; rating?: boolean };
export type CharacterChoice = 'male' | 'female';

/** 'missed-shield' marks a missed day covered by a Streak Shield. */
export type DayLog = string[] | 'missed-shield';

export type GameState = {
  version: 2;
  goal: GoalId;
  hero: string;
  character: CharacterChoice;
  anchor: string;
  habit: string;
  tiny: string;
  why: string[];
  day: number;
  streak: number;
  bestStreak: number;
  shields: number;
  shieldSaves: number;
  log: Record<number, DayLog>;
  ratings: Record<number, number>;
  seenLore: number[];
  achievements: Record<string, number>; // id -> day unlocked
  finished?: boolean;
  demo?: boolean;
};

export type Result = { state: GameState; message?: string };

export function phase(day: number): 1 | 2 | 3 {
  return day <= 30 ? 1 : day <= 60 ? 2 : 3;
}
export const PHASE_NAMES = { 1: 'Build the base', 2: 'Push through', 3: 'Lock it in' } as const;

export function questsFor(s: Pick<GameState, 'goal' | 'anchor' | 'habit' | 'tiny'>, day: number): Quest[] {
  const ph = phase(day);
  if (s.goal === 'fitness') {
    const walk = Math.min(10 + Math.floor((day - 1) / 7) * 2, 35);
    const q: Quest[] = [{ id: 'walk', text: `Walk ${walk} minutes` }];
    if (day % 7 === 2 || day % 7 === 5) q.push({ id: 'str', text: `Bodyweight circuit × ${ph}: squats, push-ups, glute bridges` });
    else q.push({ id: 'log', text: 'Log what you ate today, one line per meal' });
    q.push({ id: 'sleep', text: 'Lights out on time: aim for 7+ hours' });
    return q;
  }
  const act = ph === 1 ? (s.tiny || s.habit) : s.habit;
  const q: Quest[] = [
    { id: 'do', text: `After I ${s.anchor}, I will ${act}` },
    { id: 'rate', text: 'How automatic did it feel?', rating: true },
  ];
  if (day % 7 === 0) q.push({ id: 'rev', text: 'Weekly review: did your cue work? Adjust the time or place if not' });
  return q;
}

// ---------- achievements ----------
export type Achievement = { id: string; title: string; detail: string; test: (s: GameState) => boolean; goal?: GoalId };

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'why', title: 'Know Your Why', detail: 'Went all 7 levels deep', test: s => s.why.length >= WHY_LEVELS },
  { id: 'first', title: 'First Step', detail: 'Cleared every task on a day', test: s => Object.values(s.log).some(l => Array.isArray(l) && l.length > 0) && s.bestStreak >= 1 },
  { id: 'week', title: 'One Week Strong', detail: '7-day streak', test: s => s.bestStreak >= 7 },
  { id: 'saved', title: 'Shielded', detail: 'A Streak Shield saved your streak', test: s => s.shieldSaves >= 1 },
  { id: 'fortnight', title: 'Two Weeks Deep', detail: '14-day streak', test: s => s.bestStreak >= 14 },
  { id: 'auto', title: 'On Autopilot', detail: 'Rated your habit 5 — fully automatic', goal: 'habit', test: s => Object.values(s.ratings).some(r => r === 5) },
  { id: 'scholar', title: 'Scholar', detail: 'Read 10 of Pip\'s lessons', test: s => s.seenLore.length >= 10 },
  { id: 'phase2', title: 'Base Built', detail: 'Reached Day 31', test: s => s.day >= 31 },
  { id: 'iron', title: 'Iron Will', detail: '30-day streak', test: s => s.bestStreak >= 30 },
  { id: 'phase3', title: 'Final Stretch', detail: 'Reached Day 61', test: s => s.day >= 61 },
  { id: 'day66', title: 'Day 66', detail: 'Reached the median habit-formation day', test: s => s.day >= 66 },
  { id: 'done', title: 'Quest Complete', detail: 'Finished all 90 days', test: s => !!s.finished },
];

export function achievementsFor(goal: GoalId) {
  return ACHIEVEMENTS.filter(a => !a.goal || a.goal === goal);
}

/** Unlock any newly earned achievements and describe them for a toast. */
function checkAchievements(s: GameState, message?: string): Result {
  const fresh = achievementsFor(s.goal).filter(a => !s.achievements[a.id] && a.test(s));
  if (!fresh.length) return { state: s, message };
  const achievements = { ...s.achievements };
  fresh.forEach(a => (achievements[a.id] = s.day));
  return { state: { ...s, achievements }, message: `🏆 Achievement: ${fresh.map(a => a.title).join(', ')}` };
}

// ---------- actions ----------
function doneList(s: GameState, day: number): string[] {
  const l = s.log[day];
  return Array.isArray(l) ? l : [];
}
export function completedToday(s: GameState): string[] { return doneList(s, s.day); }
export function allDoneToday(s: GameState): boolean {
  return questsFor(s, s.day).every(q => doneList(s, s.day).includes(q.id));
}

export function toggleQuest(s: GameState, id: string): Result {
  const q = questsFor(s, s.day).find(x => x.id === id);
  if (!q || q.rating) return { state: s };
  const done = doneList(s, s.day);
  const on = done.includes(id);
  const next = { ...s, log: { ...s.log, [s.day]: on ? done.filter(x => x !== id) : [...done, id] } };
  return { state: next, message: !on && allDoneToday(next) ? 'Today is done. Nice work.' : undefined };
}

export function rateToday(s: GameState, n: number): Result {
  const q = questsFor(s, s.day).find(x => x.rating);
  if (!q) return { state: s };
  const done = doneList(s, s.day);
  let next: GameState = { ...s, ratings: { ...s.ratings, [s.day]: n } };
  if (!done.includes(q.id)) next = { ...next, log: { ...next.log, [s.day]: [...done, q.id] } };
  return checkAchievements(next, allDoneToday(next) ? 'Today is done. Nice work.' : undefined);
}

export function markLoreRead(s: GameState, day: number): Result {
  if (s.seenLore.includes(day)) return { state: s };
  return checkAchievements({ ...s, seenLore: [...s.seenLore, day] });
}

/** Close out the current day and move to the next. One Streak Shield per week covers a single miss (Lally et al. 2010). */
export function advanceDay(s: GameState): Result {
  if (s.finished) return { state: s };
  const full = allDoneToday(s);
  let next: GameState = { ...s };
  let message: string;
  if (full) {
    next.streak = s.streak + 1;
    next.bestStreak = Math.max(s.bestStreak, next.streak);
    message = `Day ${s.day} cleared. Streak: ${next.streak}`;
  } else if (s.shields > 0 && s.log[s.day - 1] !== 'missed-shield') {
    next.shields = s.shields - 1;
    next.shieldSaves = s.shieldSaves + 1;
    next.log = { ...s.log, [s.day]: 'missed-shield' };
    message = "Streak Shield used. One miss won't break a habit.";
  } else {
    next.streak = 0;
    message = 'Streak reset. Pick it back up today.';
  }
  if (s.day >= TOTAL_DAYS) next.finished = true;
  else {
    next.day = s.day + 1;
    if (next.day % 7 === 1) next.shields = 1; // weekly refill, max 1
  }
  return checkAchievements(next, message);
}

export function currentLore(s: GameState) {
  return bitesFor(s.goal).filter(b => b.day <= s.day).pop();
}

export function newGame(input: { goal: GoalId; hero: string; character: CharacterChoice; why: string[]; anchor?: string; habit?: string; tiny?: string }): GameState {
  const s: GameState = {
    version: 2, goal: input.goal, hero: input.hero.trim(), character: input.character,
    anchor: (input.anchor ?? '').trim(), habit: (input.habit ?? '').trim(), tiny: (input.tiny ?? '').trim(),
    why: input.why.map(w => w.trim()).filter(Boolean),
    day: 1, streak: 0, bestStreak: 0, shields: 1, shieldSaves: 0, log: {}, ratings: {}, seenLore: [], achievements: {},
  };
  return checkAchievements(s).state;
}

/** The deepest answer is the core why. */
export function coreWhy(s: Pick<GameState, 'why'>): string {
  return s.why[s.why.length - 1] ?? '';
}

/** A sample run at Day 12 so testers can see the game mid-quest. */
export function demoGame(): GameState {
  let s: GameState = {
    ...newGame({
      goal: 'fitness', hero: 'Wanderer', character: 'male',
      why: ['Get in shape', 'Have more energy', 'Keep up with my kids', 'Be present for them', 'Give them the dad I wanted', 'Break the cycle in my family', 'So my family is healthier for generations'],
    }),
    demo: true,
  };
  for (let d = 1; d < 12; d++) {
    if (d !== 6) for (const q of questsFor(s, s.day)) s = toggleQuest(s, q.id).state; // Day 6 missed, covered by a shield
    const lore = currentLore(s);
    if (lore) s = markLoreRead(s, lore.day).state;
    s = advanceDay(s).state;
  }
  return s;
}
