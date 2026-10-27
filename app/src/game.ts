// Pure game rules. No React, no storage, so they can be unit-tested.
// Engagement design follows docs/ENGAGEMENT.md ("user-authored habit loops").
import { bitesFor, GoalId } from './content';

export const TOTAL_DAYS = 90;
export const WHY_LEVELS = 7;
export const CHECKIN_DAYS = [31, 61];
export const MIN_ID = 'min';

export type Quest = { id: string; text: string; rating?: boolean };
export type CharacterChoice = 'male' | 'female';
export type Difficulty = 'easy' | 'standard' | 'hard';
export type Reminder = { hour: number; minute: number } | null;

/** Per-day record kept on the phone so "days completed" can be measured (docs/ENGAGEMENT.md). */
export type DayRecord = { completed: boolean; minimum: boolean; shielded?: boolean; reminderOn: boolean };

export type GameState = {
  version: 3;
  goal: GoalId;
  hero: string;
  character: CharacterChoice;
  anchor: string;   // "After I ___" — the user's cue, for both goals
  habit: string;    // habit goal only
  tiny: string;     // habit goal only
  difficulty: Difficulty;
  why: string[];
  reminder: Reminder;
  day: number;
  streak: number;
  bestStreak: number;
  shields: number;
  shieldSaves: number;
  log: Record<number, string[]>;          // task ids checked on each day
  ratings: Record<number, number>;
  history: Record<number, DayRecord>;     // closed-out days
  seenLore: number[];
  achievements: Record<string, number>;   // id -> day unlocked
  checkinsDone: number[];
  welcomeBack: boolean;
  finished?: boolean;
  demo?: boolean;
};

export type Result = { state: GameState; message?: string };

export function phase(day: number): 1 | 2 | 3 {
  return day <= 30 ? 1 : day <= 60 ? 2 : 3;
}
export const PHASE_NAMES = { 1: 'Build the base', 2: 'Push through', 3: 'Lock it in' } as const;
export const DIFFICULTY_LABELS: Record<Difficulty, { name: string; fitness: string; habit: string }> = {
  easy: { name: 'Gentle', fitness: 'Start with 5-minute walks', habit: 'Tiny version for 60 days' },
  standard: { name: 'Steady', fitness: 'Start with 10-minute walks', habit: 'Tiny version for 30 days' },
  hard: { name: 'Bold', fitness: 'Start with 15-minute walks', habit: 'Full habit from day 1' },
};

const WALK = { easy: [5, 1, 25], standard: [10, 2, 35], hard: [15, 2, 45] } as const; // start, +per week, cap
const TINY_UNTIL = { easy: 60, standard: 30, hard: 0 } as const;

export function questsFor(s: Pick<GameState, 'goal' | 'habit' | 'tiny' | 'difficulty'>, day: number): Quest[] {
  const ph = phase(day);
  if (s.goal === 'fitness') {
    const [start, step, cap] = WALK[s.difficulty];
    const q: Quest[] = [{ id: 'walk', text: `Walk ${Math.min(start + Math.floor((day - 1) / 7) * step, cap)} minutes` }];
    const rounds = Math.max(1, ph + (s.difficulty === 'hard' ? 1 : 0) - (s.difficulty === 'easy' ? 1 : 0));
    if (day % 7 === 2 || day % 7 === 5) q.push({ id: 'str', text: `Bodyweight circuit × ${rounds}: squats, push-ups, glute bridges` });
    else q.push({ id: 'log', text: 'Log what you ate today, one line per meal' });
    q.push({ id: 'sleep', text: 'Lights out on time: aim for 7+ hours' });
    return q;
  }
  const act = s.tiny && day <= TINY_UNTIL[s.difficulty] ? s.tiny : s.habit;
  const q: Quest[] = [
    { id: 'do', text: act.charAt(0).toUpperCase() + act.slice(1) },
    { id: 'rate', text: 'How automatic did it feel?', rating: true },
  ];
  if (day % 7 === 0) q.push({ id: 'rev', text: 'Weekly review: did your cue work? Adjust the time or place if not' });
  return q;
}

/** The ~2-minute floor that counts as a completed day. No weekly cap (agreed in docs/ENGAGEMENT.md). */
export function minimumFor(s: Pick<GameState, 'goal' | 'habit' | 'tiny'>): string {
  if (s.goal === 'fitness') return 'Walk for 2 minutes';
  return s.tiny ? s.tiny.charAt(0).toUpperCase() + s.tiny.slice(1) : `2 minutes of: ${s.habit}`;
}

/** "1 day", "3 days". */
export function days(n: number): string { return `${n} day${n === 1 ? '' : 's'}`; }

/** False when today's task already is the tiny version, so a separate minimum would repeat it. */
export function minimumAvailable(s: GameState): boolean {
  if (s.goal === 'fitness' || !s.tiny) return true;
  return questsFor(s, s.day)[0].text.toLowerCase() !== s.tiny.toLowerCase();
}

// ---------- day status ----------
function doneList(s: GameState, day: number): string[] { return s.log[day] ?? []; }
export function completedToday(s: GameState): string[] { return doneList(s, s.day); }
export function minimumToday(s: GameState): boolean { return doneList(s, s.day).includes(MIN_ID); }
export function fullToday(s: GameState): boolean {
  return questsFor(s, s.day).every(q => doneList(s, s.day).includes(q.id));
}
export function dayDoneToday(s: GameState): boolean { return fullToday(s) || minimumToday(s); }

/** Total days completed (full or minimum). Never goes down; the main progress number. */
export function daysDone(s: GameState): number {
  return Object.values(s.history).filter(h => h.completed).length + (!s.finished && dayDoneToday(s) ? 1 : 0);
}
export function minimumShare(s: GameState): number {
  const done = Object.values(s.history).filter(h => h.completed);
  return done.length ? done.filter(h => h.minimum).length / done.length : 0;
}
export function checkinDue(s: GameState): number | null {
  return CHECKIN_DAYS.find(d => s.day === d && !s.checkinsDone.includes(d)) ?? null;
}

// ---------- feedback ----------
/** A specific, informational line from Pip after a check-off, tied to the user's why. */
export function praise(s: GameState): string {
  const n = daysDone(s), why = coreWhy(s);
  if (!dayDoneToday(s)) return 'Logged. One down.';
  const lines = [
    `Day done. That's ${days(n)} you've shown up.`,
    why ? `Done. Another step toward “${shorten(why)}”.` : `Done. ${days(n)} and counting.`,
    `Day done. Same time, same place builds the habit.`,
  ];
  return lines[s.day % lines.length];
}
function shorten(t: string) { return t.length > 48 ? t.slice(0, 46).trimEnd() + '…' : t; }

// ---------- achievements ----------
export type Achievement = { id: string; title: string; detail: string; test: (s: GameState) => boolean; goal?: GoalId };

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'why', title: 'Know Your Why', detail: 'Went all 7 levels deep', test: s => s.why.length >= WHY_LEVELS },
  { id: 'first', title: 'First Step', detail: 'Finished your first day', test: s => daysDone(s) >= 1 },
  { id: 'week', title: 'One Week Strong', detail: '7-day streak', test: s => s.bestStreak >= 7 },
  { id: 'saved', title: 'Expected the Miss', detail: 'A Streak Shield covered a day off', test: s => s.shieldSaves >= 1 },
  { id: 'kept', title: 'Kept Going', detail: 'Did a minimum day instead of skipping', test: s => Object.values(s.history).some(h => h.minimum) || minimumToday(s) },
  { id: 'auto', title: 'On Autopilot', detail: 'Rated your habit 5: fully automatic', goal: 'habit', test: s => Object.values(s.ratings).some(r => r === 5) },
  { id: 'scholar', title: 'Scholar', detail: 'Read 10 of Pip\'s lessons', test: s => s.seenLore.length >= 10 },
  { id: 'thirty', title: 'Thirty Days Done', detail: 'Completed 30 days', test: s => daysDone(s) >= 30 },
  { id: 'comeback', title: 'Comeback', detail: 'Came back after a break', test: s => !s.welcomeBack && Object.values(s.history).some(h => !h.completed) && daysDone(s) > 0 && s.streak >= 3 },
  { id: 'day66', title: 'Day 66', detail: 'Reached the median habit-formation day', test: s => s.day >= 66 },
  { id: 'sixty', title: 'Sixty Days Done', detail: 'Completed 60 days', test: s => daysDone(s) >= 60 },
  { id: 'done', title: 'Quest Complete', detail: 'Reached day 90', test: s => !!s.finished },
];

export function achievementsFor(goal: GoalId) {
  return ACHIEVEMENTS.filter(a => !a.goal || a.goal === goal);
}

function checkAchievements(s: GameState, message?: string): Result {
  const fresh = achievementsFor(s.goal).filter(a => !s.achievements[a.id] && a.test(s));
  if (!fresh.length) return { state: s, message };
  const achievements = { ...s.achievements };
  fresh.forEach(a => (achievements[a.id] = s.day));
  const unlocked = `🏆 ${fresh.map(a => a.title).join(', ')}`;
  return { state: { ...s, achievements }, message: message ? `${message}\n${unlocked}` : unlocked };
}

// ---------- actions ----------
function withLog(s: GameState, list: string[]): GameState {
  return { ...s, log: { ...s.log, [s.day]: list }, welcomeBack: list.length ? false : s.welcomeBack };
}

export function toggleQuest(s: GameState, id: string): Result {
  const q = questsFor(s, s.day).find(x => x.id === id);
  if (!q || q.rating) return { state: s };
  const done = doneList(s, s.day);
  const on = done.includes(id);
  const next = withLog(s, on ? done.filter(x => x !== id) : [...done, id]);
  return on ? { state: next } : checkAchievements(next, praise(next));
}

export function toggleMinimum(s: GameState): Result {
  const done = doneList(s, s.day);
  const on = done.includes(MIN_ID);
  const next = withLog(s, on ? done.filter(x => x !== MIN_ID) : [...done, MIN_ID]);
  return on ? { state: next } : checkAchievements(next, `Kept going. A short day still counts: ${days(daysDone(next))} done.`);
}

export function rateToday(s: GameState, n: number): Result {
  const q = questsFor(s, s.day).find(x => x.rating);
  if (!q) return { state: s };
  const done = doneList(s, s.day);
  let next: GameState = { ...s, ratings: { ...s.ratings, [s.day]: n } };
  if (!done.includes(q.id)) next = withLog(next, [...done, q.id]);
  return checkAchievements(next, praise(next));
}

export function markLoreRead(s: GameState, day: number): Result {
  if (s.seenLore.includes(day)) return { state: s };
  return checkAchievements({ ...s, seenLore: [...s.seenLore, day] });
}

export function setReminder(s: GameState, reminder: Reminder): GameState { return { ...s, reminder }; }
export function setDifficulty(s: GameState, difficulty: Difficulty): GameState { return { ...s, difficulty }; }
export function completeCheckin(s: GameState, day: number): GameState {
  return s.checkinsDone.includes(day) ? s : { ...s, checkinsDone: [...s.checkinsDone, day] };
}
export function dismissWelcome(s: GameState): GameState { return { ...s, welcomeBack: false }; }

/** Close out the current day and move to the next. One Streak Shield per week covers a single miss (Lally et al. 2010). */
export function advanceDay(s: GameState): Result {
  if (s.finished) return { state: s };
  const completed = dayDoneToday(s);
  const record: DayRecord = { completed, minimum: completed && !fullToday(s), reminderOn: !!s.reminder };
  let next: GameState = { ...s, history: { ...s.history, [s.day]: record } };
  let message: string;
  if (completed) {
    next.streak = s.streak + 1;
    next.bestStreak = Math.max(s.bestStreak, next.streak);
    message = `Day ${s.day} done. ${days(daysDone(next))} and counting.`;
  } else if (s.shields > 0 && s.history[s.day - 1]?.completed !== false) {
    next.shields = s.shields - 1;
    next.shieldSaves = s.shieldSaves + 1;
    next.history = { ...next.history, [s.day]: { ...record, shielded: true } };
    message = 'One miss is expected. Your Streak Shield covered it.';
  } else {
    next.streak = 0;
    next.welcomeBack = true;
    message = 'New day. Everything you\'ve done still counts.';
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

export function newGame(input: {
  goal: GoalId; hero: string; character: CharacterChoice; why: string[]; anchor: string;
  difficulty?: Difficulty; habit?: string; tiny?: string; reminder?: Reminder;
}): GameState {
  const s: GameState = {
    version: 3, goal: input.goal, hero: input.hero.trim(), character: input.character,
    anchor: input.anchor.trim(), habit: (input.habit ?? '').trim(), tiny: (input.tiny ?? '').trim(),
    difficulty: input.difficulty ?? 'standard', why: input.why.map(w => w.trim()).filter(Boolean), reminder: input.reminder ?? null,
    day: 1, streak: 0, bestStreak: 0, shields: 1, shieldSaves: 0, log: {}, ratings: {}, history: {}, seenLore: [],
    achievements: {}, checkinsDone: [], welcomeBack: false,
  };
  return checkAchievements(s).state;
}

/** The deepest answer is the core why. */
export function coreWhy(s: Pick<GameState, 'why'>): string {
  return s.why[s.why.length - 1] ?? '';
}

/** "After I ___, I will ___" as shown on the task card. */
export function cueLine(s: GameState): string {
  const what = s.goal === 'fitness' ? "I'll do today's plan" : `I will ${s.tiny && s.day <= TINY_UNTIL[s.difficulty] ? s.tiny : s.habit}`;
  return `After I ${s.anchor}, ${what}`;
}

/** A sample run at Day 12 so testers can see the app mid-quest. */
export function demoGame(): GameState {
  let s: GameState = {
    ...newGame({
      goal: 'fitness', hero: 'Wanderer', character: 'male', anchor: 'drop the kids at school', difficulty: 'standard',
      why: ['Get in shape', 'Have more energy', 'Keep up with my kids', 'Be present for them', 'Give them the dad I wanted', 'Break the cycle in my family', 'So my family is healthier for generations'],
    }),
    demo: true,
  };
  for (let d = 1; d < 12; d++) {
    if (d === 9) s = toggleMinimum(s).state; // a short day
    else if (d !== 6) for (const q of questsFor(s, s.day)) s = toggleQuest(s, q.id).state; // Day 6 missed, covered by a shield
    const lore = currentLore(s);
    if (lore) s = markLoreRead(s, lore.day).state;
    s = advanceDay(s).state;
  }
  return s;
}
