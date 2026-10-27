// Pure game rules. No React, no storage — so they can be unit-tested.
import { bitesFor, GoalId } from './content';

export const TOTAL_DAYS = 90;
export const HEAD_START_XP = 25; // goal-gradient head start (Kivetz et al. 2006)
export const ALL_CLEAR_BONUS = 20;

export type Quest = { id: string; text: string; xp: number; rating?: boolean };

/** 'missed-shield' marks a missed day covered by a Streak Shield. */
export type DayLog = string[] | 'missed-shield';

export type CharacterChoice = 'male' | 'female';

export type GameState = {
  version: 1;
  goal: GoalId;
  hero: string;
  character: CharacterChoice;
  anchor: string;
  habit: string;
  tiny: string;
  day: number;
  xp: number;
  streak: number;
  shields: number;
  log: Record<number, DayLog>;
  ratings: Record<number, number>;
  bonus: Record<number, true>;
  seenLore: number[];
  demo?: boolean;
};

export type Result = { state: GameState; message?: string };

export function phase(day: number): 1 | 2 | 3 {
  return day <= 30 ? 1 : day <= 60 ? 2 : 3;
}
export const PHASE_NAMES = { 1: 'Spawn Zone', 2: 'The Grind', 3: 'Boss Zone' } as const;

export function questsFor(s: Pick<GameState, 'goal' | 'anchor' | 'habit' | 'tiny'>, day: number): Quest[] {
  const ph = phase(day);
  if (s.goal === 'fitness') {
    const walk = Math.min(10 + Math.floor((day - 1) / 7) * 2, 35);
    const q: Quest[] = [{ id: 'walk', text: `Walk ${walk} minutes`, xp: 10 }];
    if (day % 7 === 2 || day % 7 === 5) q.push({ id: 'str', text: `Bodyweight circuit × ${ph}: squats, push-ups, glute bridges`, xp: 15 });
    else q.push({ id: 'log', text: 'Log what you ate today, one line per meal', xp: 10 });
    q.push({ id: 'sleep', text: 'Lights out on time: aim for 7+ hours', xp: 10 });
    return q;
  }
  const act = ph === 1 ? (s.tiny || s.habit) : s.habit;
  const q: Quest[] = [
    { id: 'do', text: `After I ${s.anchor}, I will ${act}`, xp: 15 },
    { id: 'rate', text: 'How automatic did it feel?', xp: 5, rating: true },
  ];
  if (day % 7 === 0) q.push({ id: 'rev', text: 'Weekly review: did your cue work? Adjust the time or place if not', xp: 10 });
  return q;
}

export function level(xp: number) {
  let L = 1, need = 100, cur = xp;
  while (cur >= need) { cur -= need; L++; need = 100 + (L - 1) * 50; }
  return { level: L, current: cur, needed: need };
}

function doneList(s: GameState, day: number): string[] {
  const l = s.log[day];
  return Array.isArray(l) ? l : [];
}
export function completedToday(s: GameState): string[] { return doneList(s, s.day); }

function withLevelUp(before: number, s: GameState, msg?: string): Result {
  const a = level(before).level, b = level(s.xp).level;
  return { state: s, message: b > a ? `LEVEL UP! You're now LV ${b}` : msg };
}

function applyAllClear(s: GameState): { s: GameState; msg?: string } {
  const qs = questsFor(s, s.day), done = doneList(s, s.day);
  if (qs.every(q => done.includes(q.id)) && !s.bonus[s.day]) {
    return { s: { ...s, xp: s.xp + ALL_CLEAR_BONUS, bonus: { ...s.bonus, [s.day]: true } }, msg: `All quests cleared! +${ALL_CLEAR_BONUS} XP` };
  }
  return { s };
}

export function toggleQuest(s: GameState, id: string): Result {
  const q = questsFor(s, s.day).find(x => x.id === id);
  if (!q || q.rating) return { state: s };
  const before = s.xp, done = doneList(s, s.day);
  const on = done.includes(id);
  let next: GameState = {
    ...s,
    xp: on ? s.xp - q.xp : s.xp + q.xp,
    log: { ...s.log, [s.day]: on ? done.filter(x => x !== id) : [...done, id] },
  };
  if (on) return { state: next };
  const r = applyAllClear(next);
  return withLevelUp(before, r.s, r.msg);
}

export function rateToday(s: GameState, n: number): Result {
  const q = questsFor(s, s.day).find(x => x.rating);
  if (!q) return { state: s };
  const before = s.xp, done = doneList(s, s.day);
  let next: GameState = { ...s, ratings: { ...s.ratings, [s.day]: n } };
  if (!done.includes(q.id)) next = { ...next, xp: next.xp + q.xp, log: { ...next.log, [s.day]: [...done, q.id] } };
  const r = applyAllClear(next);
  return withLevelUp(before, r.s, r.msg);
}

/** Close out the current day and move to the next. One Streak Shield per week covers a single miss (Lally et al. 2010). */
export function advanceDay(s: GameState): Result {
  const lore = currentLore(s);
  const seenLore = lore && !s.seenLore.includes(lore.day) ? [...s.seenLore, lore.day] : s.seenLore;
  const full = questsFor(s, s.day).every(q => doneList(s, s.day).includes(q.id));
  let next: GameState = { ...s, seenLore };
  let message: string;
  if (full) { next.streak = s.streak + 1; message = `Day ${s.day} cleared! Streak ${next.streak}`; }
  else if (s.shields > 0 && s.log[s.day - 1] !== 'missed-shield') {
    next.shields = s.shields - 1;
    next.log = { ...s.log, [s.day]: 'missed-shield' };
    message = "Streak Shield used. One miss won't break a habit.";
  } else { next.streak = 0; message = 'Streak reset. Pick it back up today.'; }
  if (s.day >= TOTAL_DAYS) return { state: next, message: 'Quest complete!' };
  next.day = s.day + 1;
  if (next.day % 7 === 1) next.shields = 1; // weekly refill, max 1
  if (bitesFor(s.goal).some(b => b.day === next.day)) message += ' · New lore unlocked!';
  return { state: next, message };
}

export function currentLore(s: GameState) {
  return bitesFor(s.goal).filter(b => b.day <= s.day).pop();
}

export function newGame(input: { goal: GoalId; hero: string; character?: CharacterChoice; anchor?: string; habit?: string; tiny?: string }): GameState {
  return {
    version: 1, goal: input.goal, hero: input.hero.trim(), character: input.character ?? 'male',
    anchor: (input.anchor ?? '').trim(), habit: (input.habit ?? '').trim(), tiny: (input.tiny ?? '').trim(),
    day: 1, xp: HEAD_START_XP, streak: 0, shields: 1, log: {}, ratings: {}, bonus: {}, seenLore: [],
  };
}

/** A sample run at Day 12 so testers can see the game mid-quest. */
export function demoGame(): GameState {
  let s: GameState = { ...newGame({ goal: 'fitness', hero: 'Wanderer' }), demo: true };
  for (let d = 1; d < 12; d++) {
    if (d === 6) { s = advanceDay(s).state; continue; } // a missed day, covered by a shield
    for (const q of questsFor(s, s.day)) s = toggleQuest(s, q.id).state;
    s = advanceDay(s).state;
  }
  return s;
}
